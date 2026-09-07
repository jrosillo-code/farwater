import { Link } from "wouter";
import { motion } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";
import { SeasonStrip } from "@/components/season-strip";
import { DEPARTURES, STATUS_LABEL } from "@/lib/departures";

// The slate, in full: every departure as a chart row rather than a brochure
// card. The scouting entry stays on the page unpriced on purpose — showing
// what we won't sell yet is the loudest safety claim on the site.

export default function Departures() {
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="solid" />
      <main className="pb-24 pt-32">
        <div className="mx-auto max-w-5xl px-6">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">The founding slate</p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-tight text-foreground md:text-6xl">
              Departures
            </h1>
            <p className="mt-5 max-w-2xl font-body text-lg italic leading-relaxed text-muted-foreground">
              Three commercial waters and one scout. Seven to ten days each, six to eight guns
              a boat, one professional safety lead in the water on every one. Pricing is on the
              page — if a number isn't, the departure isn't for sale yet.
            </p>
          </motion.header>

          <div className="mt-12 space-y-6">
            {DEPARTURES.map((d, i) => {
              const scouting = d.status === "scouting";
              const inner = (
                <div
                  className={`rounded-md border p-6 transition-colors md:p-8 ${
                    scouting
                      ? "border-[var(--signal)]/30 bg-card"
                      : "border-card-border bg-card group-hover:border-primary/60"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className="coord text-xs text-primary">{d.code}</span>
                    <span
                      className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${
                        d.status === "open"
                          ? "border-primary/50 text-primary"
                          : d.status === "forming"
                            ? "border-foreground/25 text-foreground/70"
                            : "border-[var(--signal)]/50 text-[var(--signal)]"
                      }`}
                    >
                      {STATUS_LABEL[d.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                    <h2 className={`font-display text-3xl font-bold uppercase tracking-tight md:text-4xl ${scouting ? "text-foreground/80" : "text-foreground group-hover:text-primary"} transition-colors`}>
                      {d.title}
                    </h2>
                    <span className="coord text-xs text-muted-foreground">
                      {d.place.toUpperCase()}, {d.country.toUpperCase()} · {d.coords}
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl font-body italic leading-relaxed text-muted-foreground">{d.tagline}</p>
                  <div className="mt-6 grid gap-6 border-t border-border pt-5 sm:grid-cols-[auto_1fr] sm:items-center">
                    <SeasonStrip months={d.months} />
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 sm:justify-end">
                      <span className="coord text-[11px] text-muted-foreground">{d.window}</span>
                      <span className="coord text-[11px] text-muted-foreground">{d.days} DAYS · {d.guns} GUNS</span>
                      {d.from ? (
                        <span className="coord text-[11px] text-foreground">FROM {d.from}</span>
                      ) : (
                        <span className="coord text-[11px] text-muted-foreground">{scouting ? "NOT BOOKABLE" : "TERMS SOON"}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.05 }}
                >
                  <Link href={`/departure/${d.id}`} className="group block" data-testid={`row-departure-${d.id}`}>
                    {inner}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 rounded-md border border-border bg-muted/40 p-6 text-center md:p-8"
          >
            <p className="font-body italic leading-relaxed text-muted-foreground">
              Season bars show when each water fishes: tall teal is peak, short teal is workable,
              faint is off-season. Dates inside each window are set with the confirmed guns —
              the current and the operator decide them, not a brochure.
            </p>
            <Link
              href="/apply"
              className="mt-6 inline-block rounded-sm bg-primary px-8 py-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
              data-testid="cta-apply-departures"
            >
              Apply for a departure
            </Link>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
