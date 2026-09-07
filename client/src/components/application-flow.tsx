import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAnalytics } from "@/hooks/use-analytics";
import { attributionLine } from "@/lib/attribution";
import { BRAND, SITE_URL } from "@/lib/brand";
import { DEPARTURES, STATUS_LABEL, type Departure } from "@/lib/departures";

// Apply as an application, not a checkout. Three steps — who you are, which
// departure, your water résumé — ending in a deck-slip confirmation. The
// friction is the point: eight guns per boat, and the application call is
// where depth claims get checked.

const UNDECIDED: Departure = {
  id: "undecided",
  code: "000",
  title: "Undecided — put me on the right boat",
  place: "",
  country: "Open water",
  coords: "",
  status: "open",
  window: "",
  days: 0,
  guns: 0,
  species: [],
  tagline: "",
  months: { on: [], peak: [] },
  overview: "",
  water: "",
  rhythm: [],
  requirements: [],
  straight: "",
};

const CHOICES = [...DEPARTURES, UNDECIDED];

interface Applied {
  name: string;
  departure: (typeof CHOICES)[number];
}

function DeckSlip({ applied }: { applied: Applied }) {
  const isUndecided = applied.departure.id === "undecided";
  const [copied, setCopied] = useState(false);
  const shareUrl = isUndecided ? SITE_URL : `${SITE_URL}/departure/${applied.departure.id}`;
  const share = async () => {
    const data = {
      title: BRAND,
      text: isUndecided
        ? `I've applied to the ${BRAND} founding season.`
        : `I've applied to ${BRAND} — ${applied.departure.code}, ${applied.departure.title}.`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {
      return; // user dismissed the share sheet
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — nothing sensible left to do
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, type: "spring" }}
      className="mx-auto max-w-xl"
      data-testid="boarding-pass"
    >
      <div className="rounded-md border border-primary/60 bg-card p-1">
        <div className="rounded-[4px] border border-primary/25 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-primary">{BRAND}</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">Application received</p>
            </div>
            <span className="rounded-sm border border-primary/50 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-primary">
              FOUNDING SEASON
            </span>
          </div>

          <div className="my-6 border-t border-dashed border-primary/30" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">APPLICANT</p>
              <p className="mt-0.5 font-display text-lg text-foreground">{applied.name}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">STATUS</p>
              <p className="mt-0.5 font-display text-lg text-primary">Under review</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">DEPARTURE</p>
              <p className="mt-0.5 font-display text-lg text-foreground">
                {applied.departure.code !== "000" && (
                  <span className="mr-2 font-mono text-sm text-primary">{applied.departure.code}</span>
                )}
                {applied.departure.title}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">ANCHOR</p>
              <p className="coord mt-0.5 text-sm text-foreground/80">{applied.departure.coords || "TO BE CHARTED"}</p>
            </div>
          </div>

          <div className="my-6 border-t border-dashed border-primary/30" />

          <p className="font-body text-sm italic leading-relaxed text-muted-foreground">
            Both founders read every application, and every accepted diver gets a call before
            anything is booked — that call is where we plan the week and check the depth claims.
            No automated replies, no mailing blasts.
          </p>

          <button
            onClick={share}
            className="mt-6 w-full rounded-sm border border-primary/50 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/10"
            data-testid="button-share-pass"
          >
            {copied ? "Link copied" : "Share your deck slip"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const DRAFT_KEY = "farwater-app-draft";

interface Draft {
  step?: number;
  name?: string;
  email?: string;
  departureId?: string | null;
  why?: string;
  experience?: string;
}

function loadDraft(): Draft {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}") as Draft;
  } catch {
    return {};
  }
}

export function ApplicationFlow() {
  // A mis-tap must not cost anyone their "why" paragraph: every field is
  // drafted to sessionStorage and restored on return. A ?departure= query
  // param (from a departure page's apply button) pre-selects the boat.
  const [draft] = useState(loadDraft);
  const preselected = (() => {
    const id = new URLSearchParams(window.location.search).get("departure");
    return id && CHOICES.some((d) => d.id === id) ? id : null;
  })();
  const [step, setStep] = useState(preselected ? 1 : draft.step ?? 0);
  const [name, setName] = useState(draft.name ?? "");
  const [email, setEmail] = useState(draft.email ?? "");
  const [departureId, setDepartureId] = useState<string | null>(preselected ?? draft.departureId ?? null);
  const [why, setWhy] = useState(draft.why ?? "");
  const [experience, setExperience] = useState(draft.experience ?? "");
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Applied | null>(null);
  const { trackContactSubmission } = useAnalytics();

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, name, email, departureId, why, experience }));
    } catch {
      // storage full or blocked — drafts are a convenience, not a requirement
    }
  }, [step, name, email, departureId, why, experience]);

  const departure = CHOICES.find((d) => d.id === departureId) ?? null;

  const mutation = useMutation({
    mutationFn: async () => {
      const dep = departure!;
      const message =
        `[APPLICATION — ${dep.code} · ${dep.title.toUpperCase()}]\n\n` +
        `Why: ${why.trim()}\n\n` +
        `Water résumé: ${experience.trim() || "not given"}` +
        (attributionLine() ? `\n\n[${attributionLine()}]` : "");
      const res = await apiRequest("POST", "/api/contact", {
        name: name.trim(),
        email: email.trim(),
        inquiryType: "expedition",
        message,
      });
      // Also place the applicant on the list; a duplicate is fine.
      void apiRequest("POST", "/api/subscribe", { email: email.trim() }).catch(() => {});
      return res.json();
    },
    onSuccess: () => {
      trackContactSubmission("expedition");
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      setApplied({ name: name.trim(), departure: departure! });
    },
    onError: (e: Error) => setError(e.message || "Something went wrong — try again."),
  });

  if (applied) return <DeckSlip applied={applied} />;

  const validIdentity = () => {
    if (name.trim().length < 2) {
      setStep(0);
      setError("Your name, at least.");
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setStep(0);
      setError("A real email — it's how we reply.");
      return false;
    }
    return true;
  };

  const next = () => {
    setError(null);
    if (step === 0) {
      if (!validIdentity()) return;
      setStep(1);
    } else if (step === 1) {
      if (!departureId) return setError("Choose a departure — or 'Undecided'.");
      if (!validIdentity()) return;
      setStep(2);
    } else {
      if (why.trim().length < 10) return setError("A sentence or two — why this water, why now.");
      if (!validIdentity()) return;
      mutation.mutate();
    }
  };

  const advanceOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      next();
    }
  };

  const stepTitles = ["Who you are", "Which water", "Your résumé"];

  return (
    <div className="mx-auto max-w-2xl" data-testid="application-flow">
      {/* progress */}
      <div className="mb-8 flex items-center gap-2">
        {stepTitles.map((title, i) => (
          <div key={title} className="flex-1">
            <div className={`h-0.5 rounded-full transition-colors duration-500 ${i <= step ? "bg-primary" : "bg-border"}`} />
            <p className={`mt-2 font-mono text-[10px] uppercase tracking-[0.2em] ${i === step ? "text-primary" : "text-muted-foreground"}`}>
              {String(i + 1).padStart(2, "0")}
              <span className={i === step ? "" : "hidden sm:inline"}> — {title}</span>
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35 }}
        >
          {step === 0 && (
            <div className="space-y-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                onKeyDown={advanceOnEnter}
                className="h-12 bg-card"
                data-testid="input-app-name"
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                onKeyDown={advanceOnEnter}
                className="h-12 bg-card"
                data-testid="input-app-email"
              />
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {CHOICES.map((d) => {
                const scouting = d.status === "scouting";
                return (
                  <button
                    key={d.id}
                    onClick={() => !scouting && setDepartureId(d.id)}
                    disabled={scouting}
                    className={`rounded-md border p-4 text-left transition-colors ${
                      scouting
                        ? "cursor-not-allowed border-border bg-muted/50 opacity-60"
                        : departureId === d.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                    } ${d.id === "undecided" ? "sm:col-span-2" : ""}`}
                    data-testid={`pick-${d.id}`}
                  >
                    <span className="font-mono text-[10px] tracking-[0.2em] text-primary">
                      {d.code !== "000" ? d.code : "OPEN"} — {d.country.toUpperCase()}
                      {scouting && <span className="ml-2 text-muted-foreground">{STATUS_LABEL.scouting.toUpperCase()}</span>}
                    </span>
                    <span className="mt-1 block font-display text-lg font-bold text-foreground">{d.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Textarea
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="Why this water, why now? A few honest sentences beat a polished paragraph."
                rows={5}
                className="bg-card"
                data-testid="input-app-why"
              />
              <Input
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Certification & comfortable working depth — e.g. FII Level 2, 18 m (or 'none yet')"
                onKeyDown={advanceOnEnter}
                className="h-12 bg-card"
                data-testid="input-app-experience"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="mt-4 font-body text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => step > 0 && setStep(step - 1)}
          className={`font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
            step > 0 ? "text-muted-foreground hover:text-foreground" : "invisible"
          }`}
          data-testid="button-app-back"
        >
          Back
        </button>
        <Button
          onClick={next}
          disabled={mutation.isPending}
          className="px-8 font-display tracking-wide"
          data-testid="button-app-next"
        >
          {mutation.isPending ? "Sending…" : step === 2 ? "Submit application" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
