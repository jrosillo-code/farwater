import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getContactStatuses, setContactStatus } from "./storage";
import { notifyFounders, confirmApplicant } from "./mail";
import { insertSubscriberSchema, insertContactSchema, insertPageViewSchema, insertAnalyticsEventSchema } from "../shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// The concierge speaks the OpenAI wire protocol, but the provider is
// configurable — so it can run on the free tiers of Groq or Google Gemini
// (no card, no preloaded credits) through their OpenAI-compatible endpoints.
// Set AI_API_KEY and the provider is auto-detected from the key shape
// (gsk_… = Groq, AIza… = Gemini); override with AI_BASE_URL/AI_MODEL if
// needed. Lazy + guarded: with no key the server still boots and /api/chat
// degrades to a friendly 503.
let aiClient: OpenAI | null = null;
let aiModel = "gpt-4o-mini";
let aiFallbacks: string[] = [];
function getAI(): { client: OpenAI; model: string; fallbacks: string[] } | null {
  const apiKey =
    process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey || apiKey === "_DUMMY_API_KEY_") return null;
  if (!aiClient) {
    let baseURL = process.env.AI_BASE_URL;
    let model = process.env.AI_MODEL;
    if (!baseURL && apiKey.startsWith("gsk_")) {
      baseURL = "https://api.groq.com/openai/v1";
      model ??= "llama-3.3-70b-versatile";
      // Groq retires models with little notice; these are tried in order
      // when the configured model comes back model_not_found/decommissioned.
      aiFallbacks = ["llama-3.1-8b-instant", "openai/gpt-oss-20b"];
    } else if (!baseURL && apiKey.startsWith("AIza")) {
      baseURL = "https://generativelanguage.googleapis.com/v1beta/openai/";
      model ??= "gemini-2.0-flash";
      aiFallbacks = ["gemini-2.5-flash", "gemini-1.5-flash"];
    }
    aiClient = new OpenAI({ apiKey, baseURL: baseURL || undefined });
    aiModel = model ?? "gpt-4o-mini";
  }
  return { client: aiClient, model: aiModel, fallbacks: aiFallbacks };
}

function isModelError(err: unknown): boolean {
  const e = err as { status?: number; message?: string };
  return (e.status === 400 || e.status === 404 || e.status === 422) && /model/i.test(e.message ?? "");
}

// Admin-only reads (waitlist, contact messages, analytics) — these hold
// personal data and must never be public. Locked with ADMIN_SECRET: requests
// need an `x-admin-key` header (or ?key= for quick browser checks). With no
// ADMIN_SECRET configured they're locked entirely, never open by default.
function requireAdmin(req: { headers: Record<string, unknown>; query: Record<string, unknown> }, res: {
  status: (code: number) => { json: (body: unknown) => unknown };
}): boolean {
  const secret = process.env.ADMIN_SECRET;
  const provided = (req.headers["x-admin-key"] as string) ?? (req.query.key as string);
  if (!secret || !provided || provided !== secret) {
    res.status(secret ? 401 : 503).json({
      message: secret ? "Unauthorized" : "Admin access is not configured.",
    });
    return false;
  }
  return true;
}

// Tiny in-memory rate limiter (per serverless instance): enough to stop
// casual abuse of the write endpoints without any external dependency.
const hits = new Map<string, number[]>();
function rateLimit(req: { headers: Record<string, unknown> }, key: string, max: number, windowMs = 60_000): boolean {
  const ip = String(req.headers["x-forwarded-for"] ?? "local").split(",")[0].trim();
  const k = `${key}:${ip}`;
  const now = Date.now();
  const arr = (hits.get(k) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  hits.set(k, arr);
  if (hits.size > 5000) hits.clear(); // bound memory
  return true;
}

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});
const chatBodySchema = z.object({ messages: z.array(chatMessageSchema).min(1).max(20) });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/subscribe", async (req, res) => {
    try {
      if (!rateLimit(req, "sub", 6)) return res.status(429).json({ message: "Too many attempts — try again in a minute." });
      if (typeof req.body?.email === "string") req.body.email = req.body.email.trim().toLowerCase();
      const validatedData = insertSubscriberSchema.parse(req.body);
      
      const existingSubscriber = await storage.getSubscriberByEmail(validatedData.email);
      if (existingSubscriber) {
        return res.status(400).json({ 
          message: "This email is already on our waitlist!" 
        });
      }
      
      const subscriber = await storage.createSubscriber(validatedData);
      notifyFounders("New list signup — FARWATER", { email: subscriber.email });
      res.status(201).json({ 
        message: "Successfully joined the waitlist!",
        subscriber: { id: subscriber.id, email: subscriber.email }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid email address" 
        });
      }
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.get("/api/subscribers", async (req, res) => {
    if (!requireAdmin(req as never, res)) return;
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json({ subscribers, count: subscribers.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      if (!rateLimit(req, "contact", 6)) return res.status(429).json({ message: "Too many attempts — try again in a minute." });
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContactSubmission(validatedData);
      notifyFounders(`New ${validatedData.inquiryType} message — FARWATER`, {
        name: validatedData.name,
        email: validatedData.email,
        type: validatedData.inquiryType,
        message: validatedData.message,
      });
      if (validatedData.inquiryType === "expedition") {
        confirmApplicant(validatedData.email, validatedData.name);
      }
      res.status(201).json({ 
        message: "Your message has been sent! We'll be in touch soon.",
        contact: { id: contact.id }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid form data" 
        });
      }
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    if (!requireAdmin(req as never, res)) return;
    try {
      const contacts = await storage.getAllContactSubmissions();
      const statuses = await getContactStatuses();
      res.json({ contacts, count: contacts.length, statuses });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  const statusSchema = z.object({ status: z.enum(["new", "reviewed", "accepted", "declined"]) });
  app.patch("/api/contacts/:id/status", async (req, res) => {
    if (!requireAdmin(req as never, res)) return;
    try {
      const { status } = statusSchema.parse(req.body);
      await setContactStatus(req.params.id, status);
      res.json({ ok: true });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid status" });
      res.status(503).json({
        message: "Status column missing — run supabase-status.sql in the Supabase SQL editor once.",
      });
    }
  });

  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const validatedData = insertPageViewSchema.parse(req.body);
      await storage.createPageView(validatedData);
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data" });
      }
      res.status(500).json({ message: "Failed to track page view" });
    }
  });

  app.post("/api/analytics/event", async (req, res) => {
    try {
      const validatedData = insertAnalyticsEventSchema.parse(req.body);
      await storage.createAnalyticsEvent(validatedData);
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data" });
      }
      res.status(500).json({ message: "Failed to track event" });
    }
  });

  app.get("/api/analytics/summary", async (req, res) => {
    if (!requireAdmin(req as never, res)) return;
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          message: "The concierge is offline right now — please use the contact form.",
        });
      }
      if (!rateLimit(req, "chat", 12)) return res.status(429).json({ message: "The concierge needs a moment — try again shortly." });
      const { messages } = chatBodySchema.parse(req.body);

      const systemPrompt = `You are the FARWATER deckhand — the site assistant for FARWATER, an expedition spearfishing and sportfishing company founded by Jacobo Rosillo and Elliot Chung at the University of Michigan. FARWATER takes small groups (6-8 divers max per boat) to remote, barely fished waters, built on established local operators with a published safety standard layered on top.

What is real today (never invent beyond this):
- FW-001 The Cortez Crossing — Baja California Sur, Mexico. 7 days, 8 guns, from $8,500, window Jun-Oct 2027. Applications open.
- FW-003 The Ninth Island — Azores, Portugal. 7 days, 6 guns, from $9,200, window Jul-Aug 2027. Applications open.
- FW-002 The Azuero Line — Panama. 8 days, forming; terms go to applicants first. Split spear/rod week — rod-only guests welcome.
- SCOUT-01 The Doggie Belt — Vanuatu. A self-funded scouting expedition, NOT bookable; nothing there is for sale until the founders have dived it.
- The Standard (published safety rulebook): recognized freedive certification required to hunt, one-up-one-down buddy protocol, a named professional safety lead in the water, written evacuation plans before sale, DAN-level coverage required, weather has the last word.
- This is FARWATER's first commercial season and the site says so plainly. No invented history, no client testimonials yet.

Style: concise, dry, straight — a competent deckhand, not a salesman. Two short paragraphs at most. Answer safety questions seriously. Send interested visitors to the Apply page; never promise acceptance, exact dates, or anything not listed above.`;

      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.slice(-10),
      ];

      // Walk the model list: if the configured model has been retired by the
      // provider, fall through to a known-live one and remember the winner.
      const candidates = [ai.model, ...ai.fallbacks.filter((m) => m !== ai.model)];
      let lastError: unknown = null;
      for (const model of candidates) {
        try {
          const completion = await ai.client.chat.completions.create({
            model,
            max_tokens: 350,
            messages: chatMessages,
          });
          aiModel = model;
          return res.json({ message: completion.choices[0].message.content });
        } catch (err) {
          lastError = err;
          const e = err as { status?: number; message?: string };
          console.error(`Chat error (model=${model}, status=${e.status ?? "?"}):`, e.message ?? err);
          if (!isModelError(err)) break;
        }
      }
      const status = (lastError as { status?: number })?.status;
      res.status(status === 429 ? 429 : 500).json({
        message:
          status === 429
            ? "The concierge is at capacity for a moment — try again shortly."
            : "The concierge hit a snag. Try once more, or reach us through Request Access.",
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "The concierge hit a snag. Try once more, or reach us through Request Access." });
    }
  });

  return httpServer;
}
