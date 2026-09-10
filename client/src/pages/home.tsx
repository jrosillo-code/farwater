import { useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { BRAND, THESIS } from "@/lib/brand";
import { DEPARTURES } from "@/lib/departures";
import { DescentShell } from "@/components/descent/shell";
import { OceanScene } from "@/components/descent/ocean-scene";
import { Atlas } from "@/components/descent/atlas";
import { StandardStations } from "@/components/descent/standard-stations";
import { ScrubText } from "@/components/descent/scrub-text";
import { scrollToTarget } from "@/hooks/use-lenis";

// The home page is one descent. Scroll is depth: the page starts at the
// surface and ends forty metres down. A gauge on the left reads the metres
// and doubles as the table of contents; surface light fades in the first
// chapter; contour sheets slide behind everything; and each chapter arrives
// with the same slow, weighted motion. Nothing here is footage, stock or a
// generated picture — the water is drawn live, the type is set in the DOM —
// and the metres are the page's storytelling, not a diving requirement.

const EASE = [0.22, 1, 0.36, 1] as const;

const CHAPTERS = [
  { at: 0, label: "Surface", id: "surface" },
  { at: 0.17, label: "The atlas", id: "atlas" },
  { at: 0.5, label: "The standard", id: "standard" },
  { at: 0.76, label: "Straight with you", id: "straight" },
  { at: 0.92, label: "The bottom", id: "bottom" },
];

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const chartY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const typeY = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const typeOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const raysOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={ref} id="surface" className="relative flex min-h-screen flex-col justify-end overflow-hidden" data-testid="hero">
      <OceanScene chartY={chartY} raysOpacity={raysOpacity} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(7,15,18,.92)]" aria-hidden />

      <motion.div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-40 lg:pl-24" style={{ y: typeY, opacity: typeOpacity }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="coord text-xs text-[var(--teal-bright)]">
          FOUNDING SEASON 2027 — APPLICATIONS OPEN
        </motion.p>
        <h1 className="mt-5 max-w-5xl font-display text-[17vw] font-bold uppercase leading-[0.86] tracking-tight text-[var(--sea-text)] sm:text-8xl md:text-9xl lg:text-[9.5rem]" data-testid="hero-title">
          {["Serious", "water."].map((w, i) => (
            <span key={w} className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.95, delay: 0.15 + i * 0.12, ease: EASE }}>
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: EASE }} className="mt-8 max-w-xl font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)] md:text-xl">
          {THESIS} Small boats, real safety officers, and departures we have dived ourselves before we sell them.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65, ease: EASE }} className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/departures" className="rounded-sm bg-[var(--teal-bright)] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]" data-testid="hero-cta-departures">
            View departures
          </Link>
          <Link href="/apply" className="rounded-sm border border-[var(--sea-line)] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-text)] transition-colors hover:border-[var(--teal-bright)] hover:text-[var(--teal-bright)]" data-testid="hero-cta-apply">
            Apply
          </Link>
        </motion.div>
      </motion.div>

      {/* waterline: the slate as instrument text, and the invitation to sink */}
      <div className="relative border-t border-[var(--sea-line)] bg-[rgba(7,15,18,.5)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-2 px-6 py-4 lg:pl-24">
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            {DEPARTURES.map((d) => (
              <span key={d.id} className="coord text-[11px] text-[var(--sea-text-dim)]">
                <span className="text-[var(--teal-bright)]">{d.code}</span> {d.place.toUpperCase()} · {d.window}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { const el = document.getElementById("atlas"); if (el) scrollToTarget(el, 0); }}
            className="coord flex items-center gap-2 rounded-sm text-[10px] text-[var(--teal-bright)] transition-colors hover:text-[var(--sea-text)]"
            data-testid="descend-hint"
          >
            DESCEND
            <span className="descend-hint inline-block" aria-hidden>↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Straight() {
  return (
    <section id="straight" className="relative px-6 py-32 lg:pl-24" data-testid="section-straight">
      <div className="mx-auto max-w-3xl">
        <p className="coord text-xs text-[var(--teal-bright)]">STRAIGHT WITH YOU</p>
        <ScrubText
          data-testid="straight-text"
          className="mt-6 font-body text-2xl italic leading-relaxed text-[var(--sea-text)] md:text-3xl lg:text-4xl"
          text={`${BRAND} is new. There is no client wall, no highlight reel, no invented history — there is a slate of four waters, established local operators under our safety layer, and two founders who answer every application themselves. The first eight guns on each boat won't join a brand. They'll help set its standard.`}
        />
        <p className="coord mt-10 text-xs text-[var(--sea-text-dim)]">JACOBO ROSILLO · ELLIOT CHUNG — ANN ARBOR, MICHIGAN</p>
      </div>
    </section>
  );
}

// The bottom: the descent ends where the application begins.
function Bottom() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const numY = useTransform(scrollYProgress, [0, 1], ["12%", "-6%"]);
  return (
    <section ref={ref} id="bottom" className="relative flex min-h-screen items-center overflow-hidden border-t border-[var(--sea-line)] px-6 lg:pl-24" data-testid="section-apply">
      <motion.span aria-hidden style={{ y: numY }} className="numeral-ghost pointer-events-none absolute right-[-2vw] top-1/2 -translate-y-1/2 select-none font-display text-[34vw] font-bold leading-none lg:text-[22vw]">
        40
      </motion.span>
      <div className="relative mx-auto w-full max-w-6xl py-24">
        <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20% 0px" }} transition={{ duration: 0.8, ease: EASE }}>
          <p className="coord text-xs text-[var(--signal)]">−40 m · THE BOTTOM</p>
          <h2 className="mt-4 font-display text-6xl font-bold uppercase leading-[0.88] tracking-tight text-[var(--sea-text)] md:text-8xl lg:text-9xl" style={{ textWrap: "balance" }}>
            Eight guns a boat.
          </h2>
          <p className="mt-6 max-w-lg font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)] md:text-xl">
            That's the real limit, not scarcity theater. Apply, and a founder calls you — about the water, your depth, and whether this is your year.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/apply" className="rounded-sm bg-[var(--teal-bright)] px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]" data-testid="cta-apply-band">
              Apply for a departure
            </Link>
            <button type="button" onClick={() => scrollToTarget(0, 0)} className="coord rounded-sm text-[11px] text-[var(--sea-text-dim)] transition-colors hover:text-[var(--sea-text)]" data-testid="surface-link">
              ↑ BACK TO THE SURFACE
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <DescentShell chapters={CHAPTERS} snow={110}>
      <Hero />
      <Atlas />
      <StandardStations />
      <Straight />
      <Bottom />
    </DescentShell>
  );
}
