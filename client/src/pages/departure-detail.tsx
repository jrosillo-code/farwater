import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";
import { SeaChart } from "@/components/sea-chart";
import { SeasonStrip } from "@/components/season-strip";
import { departureById, STATUS_LABEL } from "@/lib/departures";

// One template, every departure: a dossier read off departures.ts. The
// "straight" paragraph renders in the signal color — the honest caveat is
// styled as the most important line on the page, because it is.

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.55 },
} as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{children}</h2>
  );
}

export default function DepartureDetail() {
  const { id } = useParams<{ id: string }>();
  const d = departureById(id ?? "");

  if (!d) {
    return (
      <div className="min-h-screen bg-background">
        <SharedHeader variant="solid" />
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="coord text-xs text-[var(--signal)]">POSITION UNKNOWN</p>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-foreground">
            No departure at these coordinates.
          </h1>
          <Link
            href="/departures"
            className="mt-8 rounded-sm border border-primary px-8 py-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Back to the slate
          </Link>
        </main>
      </div>
    );
  }

  const scouting = d.status === "scouting";

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="chart" />
      <main className="pb-24">
        {/* dossier header on dark water */}
        <section className="sea relative overflow-hidden">
          <SeaChart className="absolute inset-0 h-full w-full opacity-60" lines={11} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(13,24,28,.85)]" />
          <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-36">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              <div className="flex flex-wrap items-center gap-4">
                <span className="coord text-sm text-[var(--teal-bright)]">{d.code}</span>
                <span
                  className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${
                    d.status === "open"
                      ? "border-[var(--teal-bright)]/60 text-[var(--teal-bright)]"
                      : d.status === "forming"
                        ? "border-[var(--sea-text-dim)]/60 text-[var(--sea-text-dim)]"
                        : "border-[var(--signal)]/70 text-[var(--signal)]"
                  }`}
                >
                  {STATUS_LABEL[d.status]}
                </span>
              </div>
              <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
                {d.title}
              </h1>
              <p className="coord mt-3 text-sm text-dim">
                {d.place.toUpperCase()}, {d.country.toUpperCase()} · {d.coords}
              </p>
              <p className="mt-5 max-w-xl font-body text-lg italic leading-relaxed text-dim">{d.tagline}</p>
            </motion.div>
          </div>
          <div className="relative border-t border-[var(--sea-line)]">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-10 gap-y-2 px-6 py-4">
              <span className="coord text-[11px] text-dim">{d.window}</span>
              <span className="coord text-[11px] text-dim">{d.days} DAYS</span>
              <span className="coord text-[11px] text-dim">{d.guns} GUNS</span>
              <span className="coord text-[11px] text-[var(--teal-bright)]">
                {d.from ? `FROM ${d.from} / GUN` : scouting ? "NOT BOOKABLE" : "TERMS WITH ACCEPTED APPLICANTS"}
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6">
          <div className="mt-16 grid gap-14 md:grid-cols-[1fr_280px]">
            <div className="space-y-14">
              <motion.section {...reveal}>
                <SectionTitle>The water</SectionTitle>
                <p className="mt-4 font-body text-lg leading-relaxed text-foreground/85">{d.overview}</p>
                <p className="mt-4 font-body leading-relaxed text-muted-foreground">{d.water}</p>
              </motion.section>

              <motion.section {...reveal}>
                <SectionTitle>{scouting ? "The plan" : "The rhythm of a day"}</SectionTitle>
                <ul className="mt-5 space-y-3">
                  {d.rhythm.map((line, i) => (
                    <li key={i} className="flex gap-4 border-l-2 border-primary/30 pl-4">
                      <p className="font-body leading-relaxed text-foreground/80">{line}</p>
                    </li>
                  ))}
                </ul>
              </motion.section>

              <motion.section {...reveal}>
                <SectionTitle>Requirements</SectionTitle>
                <ul className="mt-5 space-y-3">
                  {d.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="coord mt-1 text-[10px] text-primary">▸</span>
                      <p className="font-body leading-relaxed text-foreground/80">{req}</p>
                    </li>
                  ))}
                </ul>
              </motion.section>

              <motion.section {...reveal} className="rounded-md border border-[var(--signal)]/40 bg-card p-6 md:p-7">
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--signal)]">Straight with you</h2>
                <p className="mt-4 font-body italic leading-relaxed text-foreground/85">{d.straight}</p>
              </motion.section>
            </div>

            <motion.aside {...reveal} className="h-fit space-y-8 rounded-md border border-card-border bg-card p-6 md:sticky md:top-28">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Season</p>
                <SeasonStrip months={d.months} className="mt-3" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Target species</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.species.map((s) => (
                    <span key={s} className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 border-t border-border pt-5">
                <p className="coord text-[11px] text-muted-foreground">WINDOW — {d.window}</p>
                <p className="coord text-[11px] text-muted-foreground">BOAT — {d.guns} GUNS MAX</p>
                <p className="coord text-[11px] text-muted-foreground">LENGTH — {d.days} DAYS</p>
                {d.from && <p className="coord text-[11px] text-foreground">RATE — FROM {d.from}</p>}
              </div>
              {scouting ? (
                <Link
                  href="/apply"
                  className="block rounded-sm border border-[var(--signal)]/60 py-3 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--signal)] transition-colors hover:bg-[var(--signal)]/10"
                  data-testid="cta-scout-list"
                >
                  Join the list — see the scout film first
                </Link>
              ) : (
                <Link
                  href={`/apply?departure=${d.id}`}
                  className="block rounded-sm bg-primary py-3 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
                  data-testid="cta-apply-detail"
                >
                  {d.status === "open" ? "Apply for this departure" : "Apply — hear terms first"}
                </Link>
              )}
            </motion.aside>
          </div>

          <motion.div {...reveal} className="mt-16 border-t border-border pt-8">
            <Link
              href="/departures"
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              data-testid="link-back-slate"
            >
              ← All departures
            </Link>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
