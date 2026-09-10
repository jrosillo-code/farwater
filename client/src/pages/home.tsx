import { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";
import { SeaChart } from "@/components/sea-chart";
import { Chatbot } from "@/components/chatbot";
import { BRAND, THESIS } from "@/lib/brand";
import { DEPARTURES } from "@/lib/departures";
import { useLenis } from "@/hooks/use-lenis";
import { Opening } from "@/components/descent/opening";
import { MarineSnow } from "@/components/descent/marine-snow";
import { DepthGauge } from "@/components/descent/depth-gauge";
import { SlateRail } from "@/components/descent/slate-rail";
import { StandardStations } from "@/components/descent/standard-stations";
import { ScrubText } from "@/components/descent/scrub-text";
import { Reticle } from "@/components/descent/reticle";
import { Ambience } from "@/components/descent/ambience";

// The home page is one descent. Scroll is depth: the page starts at the
// surface and ends forty metres down, a gauge on the left reads the metres,
// the water darkens, marine snow drifts past, and each chapter pins while it
// has something to say — the slate travelling sideways, the three rules of
// the Standard lit one at a time, the honest paragraph reading itself at the
// pace of your hand. No footage, no stock, no generated pictures: everything
// on the page is drawn live or set in type, because a founding-stage company
// that has not filmed its water yet should not pretend it has.

const CHAPTERS = [
  { at: 0, label: "Surface" },
  { at: 0.12, label: "The slate" },
  { at: 0.5, label: "The standard" },
  { at: 0.8, label: "Straight with you" },
  { at: 0.92, label: "Apply" },
];

function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const chartY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const typeY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const typeOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const raysOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const t0 = ready ? 0 : 1.6;

  return (
    <section ref={ref} className="relative flex min-h-screen flex-col justify-end overflow-hidden" data-testid="hero">
      <motion.div className="absolute inset-0" style={{ y: chartY }}>
        <SeaChart className="absolute inset-0 h-[130%] w-full" lines={16} />
      </motion.div>
      {/* light from the surface, lost in the first thirty metres of scroll */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: raysOpacity,
          background:
            "radial-gradient(70% 60% at 50% -10%, rgba(61,182,191,.28), transparent 60%), linear-gradient(180deg, rgba(61,182,191,.10), transparent 40%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(7,15,18,.9)]" />

      <motion.div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-40 lg:pl-24" style={{ y: typeY, opacity: typeOpacity }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: t0 }}
          className="coord text-xs text-[var(--teal-bright)]"
        >
          FOUNDING SEASON 2027 — APPLICATIONS OPEN
        </motion.p>
        <h1 className="mt-5 max-w-5xl font-display text-[17vw] font-bold uppercase leading-[0.86] tracking-tight text-[var(--sea-text)] sm:text-8xl md:text-9xl lg:text-[9.5rem]" data-testid="hero-title">
          {["Serious", "water."].map((w, i) => (
            <span key={w} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: t0 + 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: t0 + 0.45 }}
          className="mt-8 max-w-xl font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)] md:text-xl"
        >
          {THESIS} Small boats, real safety officers, and departures we have dived ourselves before we sell them.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: t0 + 0.6 }}
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
      </motion.div>

      {/* waterline: the slate as instrument text, and the invitation to sink */}
      <div className="relative border-t border-[var(--sea-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-2 px-6 py-4 lg:pl-24">
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            {DEPARTURES.map((d) => (
              <span key={d.id} className="coord text-[11px] text-[var(--sea-text-dim)]">
                <span className="text-[var(--teal-bright)]">{d.code}</span> {d.place.toUpperCase()} · {d.window}
              </span>
            ))}
          </div>
          <span className="coord flex items-center gap-2 text-[10px] text-[var(--teal-bright)]" data-testid="descend-hint">
            DESCEND
            <span className="descend-hint inline-block" aria-hidden>↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function Straight() {
  return (
    <section className="relative px-6 py-32 lg:pl-24" data-testid="section-straight">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--teal-bright)]">Straight with you</p>
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

function ApplyBand() {
  return (
    <section className="relative border-t border-[var(--sea-line)] px-6 py-24 lg:pl-24" data-testid="section-apply">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="coord text-xs text-[var(--signal)]">−40 m · BOTTOM</p>
          <h2 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight text-[var(--sea-text)] md:text-7xl" style={{ textWrap: "balance" }}>
            Eight guns a boat.
          </h2>
          <p className="mt-4 max-w-lg font-body italic leading-relaxed text-[var(--sea-text-dim)]">
            That's the real limit, not scarcity theater. Apply, and a founder calls you — about the water, your depth, and whether this is your year.
          </p>
        </div>
        <Link
          href="/apply"
          className="shrink-0 rounded-sm bg-[var(--teal-bright)] px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]"
          data-testid="cta-apply-band"
        >
          Apply for a departure
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const [ready, setReady] = useState(false);
  useLenis(true);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  // the water darkens with depth: ink at the surface, near-black at the bottom
  const water = useTransform(progress, [0, 0.55, 1], ["#0d181c", "#081215", "#03080a"]);

  return (
    <motion.div className="sea relative min-h-screen" style={{ backgroundColor: water }} data-testid="descent">
      <Opening onDone={() => setReady(true)} />
      <Reticle />
      <MarineSnow />
      <DepthGauge progress={progress} chapters={CHAPTERS} />
      <Ambience />
      <SharedHeader variant="sea" />
      <main className="relative z-[2]">
        <Hero ready={ready} />
        <SlateRail />
        <StandardStations />
        <Straight />
        <ApplyBand />
      </main>
      <SiteFooter />
      <Chatbot />
    </motion.div>
  );
}
