import { Link } from "wouter";
import { motion } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";
import { SeaChart } from "@/components/sea-chart";
import { SeasonStrip } from "@/components/season-strip";
import { Chatbot } from "@/components/chatbot";
import { BRAND, THESIS } from "@/lib/brand";
import { DEPARTURES, STATUS_LABEL } from "@/lib/departures";

// The landing page as a chart table: dark water above (hero on the living
// bathymetric chart), paper below (the slate, the standard, the honest
// paragraph, the apply line). No stock footage anywhere — a founding-stage
// company that owns no film yet doesn't pretend it does.

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6 },
} as const;

function Hero() {
  return (
    <section className="sea relative flex min-h-[92vh] flex-col justify-center overflow-hidden">
      <SeaChart className="absolute inset-0 h-full w-full" lines={14} />
      {/* darken the lower water so the type sits on calm ink */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(13,24,28,.88)]" />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="coord text-xs text-[var(--teal-bright)]"
        >
          FOUNDING SEASON 2027 — APPLICATIONS OPEN
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="mt-5 max-w-4xl font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl"
        >
          Serious water.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.26 }}
          className="mt-6 max-w-xl font-body text-lg italic leading-relaxed text-dim md:text-xl"
        >
          {THESIS} Small boats, real safety officers, and departures we have dived
          ourselves before we sell them.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/departures"
            className="rounded-sm bg-[var(--teal-bright)] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]"
            data-testid="hero-cta-departures"
          >
            View departures
          </Link>
          <Link
            href="/standard"
            className="rounded-sm border border-[var(--sea-line)] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-text)] transition-colors hover:border-[var(--teal-bright)] hover:text-[var(--teal-bright)]"
            data-testid="hero-cta-standard"
          >
            Read the standard
          </Link>
        </motion.div>
      </div>
      {/* instrument strip along the hero's waterline */}
      <div className="relative border-t border-[var(--sea-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-2 px-6 py-4">
          {DEPARTURES.map((d) => (
            <span key={d.id} className="coord text-[11px] text-dim">
              <span className="text-[var(--teal-bright)]">{d.code}</span> {d.place.toUpperCase()} · {d.window}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Slate() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24" id="departures">
      <motion.div {...reveal} className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">The founding slate</p>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            Four waters. Twenty-two guns a year.
          </h2>
        </div>
        <Link
          href="/departures"
          className="font-mono text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-foreground"
          data-testid="link-all-departures"
        >
          Full slate →
        </Link>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2">
        {DEPARTURES.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: (i % 2) * 0.08 }}
          >
            <Link
              href={`/departure/${d.id}`}
              className="group flex h-full flex-col rounded-md border border-card-border bg-card p-6 transition-colors hover:border-primary/60 md:p-7"
              data-testid={`card-departure-${d.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="coord text-[11px] text-primary">{d.code}</span>
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
              <h3 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary">
                {d.title}
              </h3>
              <p className="coord mt-1 text-xs text-muted-foreground">
                {d.place.toUpperCase()}, {d.country.toUpperCase()} · {d.coords}
              </p>
              <p className="mt-4 font-body italic leading-relaxed text-muted-foreground">{d.tagline}</p>
              <div className="mt-auto pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                  <SeasonStrip months={d.months} />
                  <div className="coord text-[11px] text-muted-foreground">
                    {d.days} DAYS · {d.guns} GUNS{d.from ? ` · FROM ${d.from}` : ""}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.species.map((s) => (
                    <span key={s} className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const RULES = [
  {
    n: "01",
    title: "We dove it first",
    body: "No departure is sold before a founder has been in that water with the operator who will run it. The Vanuatu scout on the slate is what that looks like in practice.",
  },
  {
    n: "02",
    title: "One up, one down",
    body: "Buddy protocol on every drop, a dedicated safety diver in the water, and a professional co-lead on every founding departure. Depth claims get checked on the application call, not discovered at sea.",
  },
  {
    n: "03",
    title: "The evacuation plan is written before the invoice",
    body: "Every departure carries a named medical evacuation plan and requires DAN-level dive coverage. If we can't write the plan, we don't run the trip — that's why some waters stay 'scouting'.",
  },
] as const;

function StandardBand() {
  return (
    <section className="sea relative overflow-hidden">
      <SeaChart className="absolute inset-0 h-full w-full opacity-30" lines={9} depthScale={false} strength={0.7} />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <motion.div {...reveal}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--teal-bright)]">The Standard</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
            The sport has a body count. Our answer is a rulebook.
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {RULES.map((r, i) => (
            <motion.div
              key={r.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="border-t border-[var(--sea-line)] pt-5"
            >
              <span className="coord text-xs text-[var(--signal)]">{r.n}</span>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight">{r.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-dim">{r.body}</p>
            </motion.div>
          ))}
        </div>
        <motion.div {...reveal} className="mt-12">
          <Link
            href="/standard"
            className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--teal-bright)] transition-colors hover:text-[var(--sea-text)]"
            data-testid="link-standard-full"
          >
            The full standard, published →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Straight() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <motion.div {...reveal}>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Straight with you</p>
        <p className="mt-6 font-body text-xl italic leading-relaxed text-foreground/85 md:text-2xl">
          {BRAND} is new. There is no client wall, no highlight reel, no invented history —
          there is a slate of four waters, established local operators under our safety layer,
          and two founders who answer every application themselves. The first eight guns on
          each boat won't join a brand. They'll help set its standard.
        </p>
        <p className="coord mt-8 text-xs text-muted-foreground">
          JACOBO ROSILLO · ELLIOT CHUNG — ANN ARBOR, MICHIGAN
        </p>
      </motion.div>
    </section>
  );
}

function ApplyBand() {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <motion.div {...reveal} className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Eight guns a boat.
            </h2>
            <p className="mt-3 max-w-lg font-body italic leading-relaxed text-muted-foreground">
              That's the real limit, not scarcity theater. Apply, and a founder calls you —
              about the water, your depth, and whether this is your year.
            </p>
          </div>
          <Link
            href="/apply"
            className="shrink-0 rounded-sm bg-primary px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
            data-testid="cta-apply-band"
          >
            Apply for a departure
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="chart" />
      <main>
        <Hero />
        <Slate />
        <StandardBand />
        <Straight />
        <ApplyBand />
      </main>
      <SiteFooter />
      <Chatbot />
    </div>
  );
}
