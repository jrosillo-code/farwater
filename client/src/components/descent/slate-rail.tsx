import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { DEPARTURES, MONTH_LETTERS, STATUS_LABEL, type Departure } from "@/lib/departures";

// The founding slate as a rail of chart plates. On a wide screen the section
// pins and the plates travel east as you descend — the same scroll, turned
// sideways for one chapter. On phones and under reduced motion the plates
// simply stack, which is the same information without the theatre.

function SeasonTicks({ months }: { months: Departure["months"] }) {
  return (
    <div className="flex items-end gap-1.5" role="img" aria-label="Season by month">
      {MONTH_LETTERS.map((letter, i) => {
        const peak = months.peak.includes(i);
        const on = months.on.includes(i);
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className="block w-2 rounded-[1px]"
              style={{ height: peak ? 18 : on ? 11 : 5, background: peak ? "var(--teal-bright)" : on ? "rgba(61,182,191,.45)" : "rgba(219,231,229,.14)" }}
            />
            <span className={`font-mono text-[9px] ${peak ? "text-[var(--teal-bright)]" : "text-[var(--sea-text-dim)]"}`}>{letter}</span>
          </div>
        );
      })}
    </div>
  );
}

function Plate({ d, i, n }: { d: Departure; i: number; n: number }) {
  const status =
    d.status === "open"
      ? "border-[var(--teal-bright)]/60 text-[var(--teal-bright)]"
      : d.status === "forming"
        ? "border-[var(--sea-text)]/30 text-[var(--sea-text)]/70"
        : "border-[var(--signal)]/60 text-[var(--signal)]";
  return (
    <Link
      href={`/departure/${d.id}`}
      className="group relative flex h-full w-[82vw] max-w-[40rem] shrink-0 flex-col border border-[var(--sea-line)] bg-[rgba(18,32,38,.72)] p-7 backdrop-blur-sm transition-colors hover:border-[var(--teal-bright)] lg:w-[46vw] lg:p-9"
      data-testid={`plate-${d.id}`}
    >
      <svg viewBox="0 0 200 60" className="pointer-events-none absolute right-6 top-6 h-10 w-32 text-[var(--teal-bright)] opacity-25" aria-hidden>
        {[10, 25, 40].map((y, k) => (
          <path key={y} d={`M0 ${y}c30 0 40 ${12 - k * 3} 70 ${12 - k * 3}s40 -${12 - k * 3} 70 -${12 - k * 3}s40 ${12 - k * 3} 60 ${12 - k * 3}`} fill="none" stroke="currentColor" strokeWidth="1" />
        ))}
      </svg>
      <div className="flex items-start justify-between gap-4">
        <span className="coord text-[11px] text-[var(--teal-bright)]">{d.code}</span>
        <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${status}`}>{STATUS_LABEL[d.status]}</span>
      </div>
      <p className="coord mt-6 text-[10px] text-[var(--sea-text-dim)]">
        {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
      </p>
      <h3 className="mt-2 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--sea-text)] transition-colors group-hover:text-[var(--teal-bright)] md:text-5xl lg:text-6xl">
        {d.title}
      </h3>
      <p className="coord mt-3 text-xs text-[var(--sea-text-dim)]">
        {d.place.toUpperCase()}, {d.country.toUpperCase()} · {d.coords}
      </p>
      <p className="mt-5 max-w-md font-body text-base italic leading-relaxed text-[var(--sea-text-dim)] md:text-lg">{d.tagline}</p>
      <div className="mt-auto pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[var(--sea-line)] pt-4">
          <SeasonTicks months={d.months} />
          <span className="coord text-[11px] text-[var(--sea-text-dim)]">
            {d.window} · {d.days} DAYS · {d.guns} GUNS{d.from ? ` · FROM ${d.from}` : ""}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.species.map((s) => (
            <span key={s} className="rounded-sm border border-[var(--sea-line)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--sea-text-dim)]">
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function Heading() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--teal-bright)]">The founding slate</p>
      <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--sea-text)] md:text-5xl lg:text-6xl" style={{ textWrap: "balance" }}>
        Four waters. Twenty-two guns a year.
      </h2>
      <p className="mt-4 max-w-xs font-body italic leading-relaxed text-[var(--sea-text-dim)]">
        Each plate is a departure we have dived, or are scouting before we sell it. Nothing here is inventory.
      </p>
      <Link href="/departures" className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-[var(--teal-bright)] transition-colors hover:text-[var(--sea-text)]" data-testid="link-all-departures">
        Full slate →
      </Link>
    </div>
  );
}

export function SlateRail() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 600px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return wide && !reduced ? <PinnedRail /> : <StackedRail />;
}

function PinnedRail() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
  const n = DEPARTURES.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      // how far the rail must move for the last plate to end where the first began
      const overflow = track.scrollWidth - (window.innerWidth - track.getBoundingClientRect().left) + 48;
      setTravel(Math.max(0, overflow));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  return (
    <section ref={ref} id="departures" className="relative" style={{ height: `${n * 90 + 100}vh` }} data-testid="section-slate" data-slate-mode="pinned">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto flex w-full max-w-[96rem] items-center gap-10 pl-36 pr-6">
          <div className="relative z-10 w-[20rem] shrink-0">
            <Heading />
          </div>
          {/* the rail is clipped at the heading's edge, so plates slide in
              from the east and out behind the column instead of over it */}
          <div className="relative flex-1 overflow-hidden py-6">
            <motion.div ref={trackRef} style={{ x }} className="flex h-[66vh] max-h-[40rem] gap-6" data-testid="slate-track">
              {DEPARTURES.map((d, i) => (
                <Plate key={d.id} d={d} i={i} n={n} />
              ))}
            </motion.div>
          </div>
        </div>
        <motion.div className="absolute bottom-10 left-36 right-6 h-px origin-left bg-[var(--teal-bright)]" style={{ scaleX: scrollYProgress }} aria-hidden />
        <div className="absolute bottom-10 left-36 right-6 h-px bg-[var(--sea-line)]" aria-hidden />
      </div>
    </section>
  );
}

function StackedRail() {
  const n = DEPARTURES.length;
  return (
    <section id="departures" className="relative px-6 py-20" data-testid="section-slate" data-slate-mode="stacked">
      <div className="mx-auto max-w-6xl">
        <Heading />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {DEPARTURES.map((d, i) => (
            <div key={d.id} className="flex [&>a]:w-full [&>a]:max-w-none">
              <Plate d={d} i={i} n={n} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
