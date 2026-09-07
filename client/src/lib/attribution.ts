// First-touch attribution, captured once per session: where the visitor came
// from and any utm_* params on the landing URL. Attached silently to
// applications so the Ops Room funnel can be read per channel.
const KEY = "farwater-attribution";

export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v;
    });
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        referrer: document.referrer || "direct",
        landing: window.location.pathname,
        ...(Object.keys(utm).length ? { utm } : {}),
      })
    );
  } catch {
    // storage unavailable — attribution is best-effort
  }
}

export function attributionLine(): string {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return "";
    const a = JSON.parse(raw) as { referrer?: string; landing?: string; utm?: Record<string, string> };
    const parts = [`referrer: ${a.referrer ?? "direct"}`, `landing: ${a.landing ?? "/"}`];
    if (a.utm) parts.push(Object.entries(a.utm).map(([k, v]) => `${k}=${v}`).join(" "));
    return parts.join(" | ");
  } catch {
    return "";
  }
}
