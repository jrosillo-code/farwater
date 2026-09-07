import { useEffect, useState } from "react";
import { SharedHeader } from "@/components/shared-header";

// Private ops room (/admin — unlisted): the site has been collecting
// subscribers, contact messages, and its own analytics since day one, but
// there was no way to see any of it without curling API URLs. Enter the
// ADMIN_SECRET once; it stays in sessionStorage for the tab's lifetime.

interface Subscriber { id: string; email: string }
interface Contact { id: string; name: string; email: string; inquiryType: string; message: string }
interface Summary {
  totalPageViews: number;
  uniquePaths: number;
  totalSubscribers: number;
  totalContacts: number;
  topPages: { path: string; count: number }[];
  recentEvents: { id: string; eventType: string; eventData: string | null; timestamp: string }[];
}

const KEY_STORAGE = "farwater-admin-key";

// Application triage lives in localStorage on the founder's device (no DB
// migration needed for a two-person team). Statuses survive reloads here;
// moving them server-side is a one-column upgrade later.
const STATUS_STORAGE = "farwater-app-statuses";
const STATUSES = ["new", "reviewed", "accepted", "declined"] as const;
type AppStatus = (typeof STATUSES)[number];

function loadStatuses(): Record<string, AppStatus> {
  try {
    return JSON.parse(localStorage.getItem(STATUS_STORAGE) ?? "{}") as Record<string, AppStatus>;
  } catch {
    return {};
  }
}

const STATUS_STYLES: Record<AppStatus, string> = {
  new: "border-primary/60 text-primary",
  reviewed: "border-foreground/30 text-foreground/80",
  accepted: "border-emerald-500/60 text-emerald-400",
  declined: "border-muted-foreground/40 text-muted-foreground",
};

async function fetchJson<T>(path: string, key: string): Promise<T> {
  const res = await fetch(path, { headers: { "x-admin-key": key } });
  if (!res.ok) throw new Error(res.status === 401 ? "Wrong key" : `Failed (${res.status})`);
  return res.json();
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <div className="font-display text-3xl text-foreground tabular-nums">{value}</div>
      <div className="mt-1 font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}

export default function AdminPage() {
  const [key, setKey] = useState<string>(() => sessionStorage.getItem(KEY_STORAGE) ?? "");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subs, setSubs] = useState<Subscriber[] | null>(null);
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>(loadStatuses);
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");

  const [statusHint, setStatusHint] = useState<string | null>(null);

  const setStatus = (id: string, status: AppStatus) => {
    setStatuses((prev) => {
      const next = { ...prev, [id]: status };
      try {
        localStorage.setItem(STATUS_STORAGE, JSON.stringify(next));
      } catch {
        // storage unavailable — filtering still works for this session
      }
      return next;
    });
    void fetch(`/api/contacts/${id}/status`, {
      method: "PATCH",
      headers: { "x-admin-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(async (r) => {
      if (!r.ok) {
        const body = (await r.json().catch(() => null)) as { message?: string } | null;
        setStatusHint(body?.message ?? "Status saved on this device only.");
      } else {
        setStatusHint(null);
      }
    });
  };

  useEffect(() => {
    if (!key) return;
    setError(null);
    Promise.all([
      fetchJson<{ subscribers: Subscriber[] }>("/api/subscribers", key),
      fetchJson<{ contacts: Contact[]; statuses?: Record<string, AppStatus> | null }>("/api/contacts", key),
      fetchJson<Summary>("/api/analytics/summary", key),
    ])
      .then(([s, c, a]) => {
        setSubs(s.subscribers);
        setContacts(c.contacts);
        // Server statuses (once supabase-status.sql has run) win over the
        // local ones; local remains the fallback store.
        if (c.statuses) setStatuses((prev) => ({ ...prev, ...c.statuses }));
        setSummary(a);
        sessionStorage.setItem(KEY_STORAGE, key);
      })
      .catch((e: Error) => {
        setError(e.message);
        if (e.message === "Wrong key") {
          sessionStorage.removeItem(KEY_STORAGE);
          setKey("");
        }
      });
  }, [key]);

  if (!key) {
    return (
      <div className="min-h-screen bg-background">
        <SharedHeader variant="solid" />
        <main className="flex min-h-screen flex-col items-center justify-center px-6">
          <span className="font-display text-xs uppercase tracking-[0.3em] text-primary">Founders only</span>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">The Ops Room</h1>
          <form
            className="mt-8 flex w-full max-w-sm gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) setKey(input.trim());
            }}
          >
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Admin key"
              className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
            <button type="submit" className="rounded-md bg-primary px-5 py-3 font-display text-xs uppercase tracking-widest text-primary-foreground">
              Enter
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="solid" />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-display text-xs uppercase tracking-[0.3em] text-primary">The Ops Room</span>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">Farwater, by the numbers</h1>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem(KEY_STORAGE);
              setKey("");
              setSubs(null);
              setContacts(null);
              setSummary(null);
            }}
            className="font-display text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Lock
          </button>
        </div>

        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

        {summary && (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Waitlist" value={summary.totalSubscribers} />
            <Stat label="Messages" value={summary.totalContacts} />
            <Stat label="Page views" value={summary.totalPageViews} />
            <Stat label="Pages seen" value={summary.uniquePaths} />
          </div>
        )}

        {summary && contacts && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-foreground">Funnel</h2>
            <div className="mt-4 rounded-md border border-border bg-card">
              {(() => {
                const expViews = summary.topPages
                  .filter((pg) => pg.path.startsWith("/departure"))
                  .reduce((acc, pg) => acc + pg.count, 0);
                const applications = contacts.filter((c) => c.inquiryType === "expedition").length;
                const accepted = contacts.filter((c) => (statuses[c.id] ?? "new") === "accepted").length;
                const stages = [
                  { label: "Page views", value: summary.totalPageViews },
                  { label: "Departure pages viewed", value: expViews },
                  { label: "Applications", value: applications },
                  { label: "Accepted", value: accepted },
                ];
                const max = Math.max(1, ...stages.map((st) => st.value));
                return stages.map((st, i) => {
                  const prev = i > 0 ? stages[i - 1].value : 0;
                  const pct = i > 0 && prev > 0 ? Math.round((st.value / prev) * 100) : null;
                  return (
                    <div key={st.label} className="flex items-center gap-4 border-b border-border/50 px-5 py-3 last:border-0">
                      <span className="w-52 shrink-0 font-body text-sm text-foreground/90">{st.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/40">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.max(2, (st.value / max) * 100)}%` }} />
                      </div>
                      <span className="w-24 shrink-0 text-right font-display text-sm tabular-nums text-foreground">
                        {st.value}
                        {pct !== null && <span className="ml-1 text-muted-foreground">({pct}%)</span>}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </section>
        )}

        {subs && (
          <section className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">Waitlist ({subs.length})</h2>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(subs.map((s) => s.email).join("\n"));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="rounded-md border border-border px-3 py-1.5 font-display text-xs uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary"
              >
                {copied ? "Copied" : "Copy all"}
              </button>
            </div>
            <div className="mt-4 max-h-72 overflow-y-auto rounded-md border border-border bg-card">
              {subs.length === 0 && <p className="p-6 text-sm text-muted-foreground">No signups yet — go share the link.</p>}
              {subs.map((s) => (
                <div key={s.id} className="border-b border-border/50 px-5 py-2.5 font-body text-sm text-foreground/90 last:border-0">
                  {s.email}
                </div>
              ))}
            </div>
          </section>
        )}

        {contacts && (
          <section className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-foreground">Messages ({contacts.length})</h2>
              <div className="flex gap-1.5">
                {(["all", ...STATUSES] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f as AppStatus | "all")}
                    className={`rounded-md border px-2.5 py-1 font-display text-[10px] uppercase tracking-widest transition-colors ${
                      statusFilter === f ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {statusHint && <p className="mt-2 font-body text-xs text-primary/80">{statusHint}</p>}
            <div className="mt-4 space-y-3">
              {contacts.length === 0 && (
                <p className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">Nothing yet.</p>
              )}
              {contacts
                .filter((c) => statusFilter === "all" || (statuses[c.id] ?? "new") === statusFilter)
                .map((c) => {
                  const status = statuses[c.id] ?? "new";
                  return (
                    <div key={c.id} className="rounded-md border border-border bg-card p-5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-display font-bold text-foreground">{c.name}</span>
                        <a href={`mailto:${c.email}`} className="font-body text-sm text-primary">{c.email}</a>
                        <span className="rounded-full border border-border px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-muted-foreground">
                          {c.inquiryType}
                        </span>
                        <select
                          value={status}
                          onChange={(e) => setStatus(c.id, e.target.value as AppStatus)}
                          className={`ml-auto rounded-sm border bg-transparent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] outline-none ${STATUS_STYLES[status]}`}
                          data-testid={`status-${c.id}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-card text-foreground">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-3 font-body text-sm leading-relaxed text-foreground/85">{c.message}</p>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {summary && summary.topPages.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-foreground">Most-visited pages</h2>
            <div className="mt-4 rounded-md border border-border bg-card">
              {summary.topPages.map((p) => (
                <div key={p.path} className="flex items-center justify-between border-b border-border/50 px-5 py-2.5 last:border-0">
                  <span className="font-body text-sm text-foreground/90">{p.path}</span>
                  <span className="font-display text-sm tabular-nums text-muted-foreground">{p.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
