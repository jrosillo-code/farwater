// Email via Resend's REST API — founder pings + applicant confirmations.
// Fully optional: without RESEND_API_KEY every call is a silent no-op, so the
// site never depends on mail to function.
//
// Env:
//   RESEND_API_KEY  — from resend.com (free tier)
//   NOTIFY_EMAIL    — founders' inbox for signup/application pings
//   FROM_EMAIL      — verified sender, e.g. "FARWATER <hello@yourdomain.com>".
//                     Defaults to Resend's onboarding sender, which can only
//                     deliver to the account owner — set a real one to make
//                     applicant confirmations reach strangers.

const API = "https://api.resend.com/emails";

async function send(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "FARWATER <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) console.error("mail: resend responded", res.status, await res.text());
  } catch (err) {
    console.error("mail: send failed", err);
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const shell = (body: string) => `
  <div style="background:#0d181c;padding:40px 16px;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;border:1px solid rgba(61,182,191,.5);padding:32px;color:#dbe7e5;">
      <p style="margin:0 0 24px;font-family:monospace;font-size:11px;letter-spacing:.3em;color:#3db6bf;">FARWATER</p>
      ${body}
      <p style="margin:32px 0 0;border-top:1px dashed rgba(61,182,191,.4);padding-top:16px;font-size:12px;font-style:italic;color:#8aa3a0;">
        Serious water.
      </p>
    </div>
  </div>`;

export function notifyFounders(subject: string, lines: Record<string, string>): void {
  const to = process.env.NOTIFY_EMAIL ?? "";
  const rows = Object.entries(lines)
    .map(([k, v]) => `<p style="margin:0 0 12px;"><span style="font-family:monospace;font-size:11px;letter-spacing:.2em;color:#3db6bf;">${esc(k.toUpperCase())}</span><br/>${esc(v).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  void send(to, subject, shell(rows));
}

export function confirmApplicant(email: string, name: string): void {
  void send(
    email,
    "Application received — FARWATER",
    shell(`
      <p style="margin:0 0 16px;font-size:22px;font-weight:bold;">Received, ${esc(name)}.</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#b8c8c5;">
        Your application to the founding season is in. Both founders read every
        application themselves — no automated filters, no form replies.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#b8c8c5;">
        If the water fits, one of us calls you directly to plan the week — and to
        talk honestly about depth, certification and conditions.
      </p>`)
  );
}
