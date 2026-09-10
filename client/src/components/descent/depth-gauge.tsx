import { useEffect, useState } from "react";
import { motion, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import { scrollToTarget } from "@/hooks/use-lenis";

// The page's instrument and its table of contents. Page progress is read as
// metres — every page is one descent from the surface to forty — and each
// chapter is a mark on the scale you can press to go there. The metres are a
// storytelling device for the page, not a diving requirement. On phones the
// gauge collapses to a single readout in the corner.
export interface Chapter { at: number; label: string; id?: string }

export const MAX_DEPTH = 40;

export function DepthGauge({ progress: raw, chapters: given }: { progress: MotionValue<number>; chapters: Chapter[] }) {
  const [metres, setMetres] = useState(0);
  const [active, setActive] = useState(0);
  // chapters with an id are measured from the page itself, so the marks on
  // the scale sit exactly where the sections start whatever the viewport
  const [chapters, setChapters] = useState(given);
  useEffect(() => {
    const measure = () => {
      const travel = document.documentElement.scrollHeight - window.innerHeight;
      if (travel < 80) return;
      setChapters(given.map((c) => {
        const el = c.id ? document.getElementById(c.id) : null;
        if (!el) return c;
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { ...c, at: Math.min(1, Math.max(0, (top - 24) / travel)) };
      }));
    };
    measure();
    const t = window.setTimeout(measure, 900);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => { window.clearTimeout(t); ro.disconnect(); };
  }, [given]);
  // a page too short to scroll is the surface, not the bottom
  const progress = useTransform(raw, (v) => (document.documentElement.scrollHeight - window.innerHeight < 80 ? 0 : v));
  const needleTop = useTransform(progress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(progress, "change", (v) => {
    const m = Math.round(v * MAX_DEPTH * 10) / 10;
    setMetres((prev) => (prev === m ? prev : m));
    let i = 0;
    chapters.forEach((c, k) => { if (v >= c.at - 0.005) i = k; });
    setActive((prev) => (prev === i ? prev : i));
  });

  const go = (c: Chapter) => {
    const el = c.id ? document.getElementById(c.id) : null;
    if (el) scrollToTarget(el, 0);
    else scrollToTarget(c.at * (document.documentElement.scrollHeight - window.innerHeight));
  };

  const readout = metres <= 0 ? "0.0 m" : `−${metres.toFixed(1)} m`;
  const chapter = chapters[active]?.label ?? "";

  return (
    <>
      <nav
        className="gauge pointer-events-none fixed inset-y-0 left-0 z-30 hidden w-16 flex-col items-center justify-center lg:flex"
        aria-label="Depth · sections"
        data-testid="depth-gauge"
      >
        <div className="relative h-[58vh] w-px bg-[var(--sea-line)]">
          {Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute left-0 h-px bg-[var(--sea-text-dim)]"
              style={{ top: `${(i / 8) * 100}%`, width: i % 2 === 0 ? 10 : 5, opacity: i % 2 === 0 ? 0.7 : 0.35 }}
            />
          ))}
          {chapters.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={() => go(c)}
              aria-label={`Go to ${c.label}`}
              aria-current={i === active ? "location" : undefined}
              className="group pointer-events-auto absolute left-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-sm p-1.5 outline-none"
              style={{ top: `${c.at * 100}%` }}
              data-testid={`gauge-chapter-${i}`}
            >
              <span className={`block h-1.5 w-1.5 rotate-45 border transition-colors ${i <= active ? "border-[var(--teal-bright)] bg-[var(--teal-bright)]" : "border-[var(--teal-bright)]/70"}`} />
              <span className="coord pointer-events-none absolute left-6 whitespace-nowrap text-[9px] uppercase text-[var(--sea-text)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {c.label}
              </span>
            </button>
          ))}
          <motion.div className="pointer-events-none absolute left-0 -translate-y-1/2" style={{ top: needleTop }} aria-hidden>
            <span className="block h-[2px] w-4 bg-[var(--teal-bright)]" />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap">
              <span className="coord block text-[11px] text-[var(--sea-text)]" data-testid="depth-readout">{readout}</span>
              <span className="gauge-chapter coord block text-[9px] uppercase text-[var(--teal-bright)] transition-opacity" data-testid="depth-chapter">{chapter}</span>
            </span>
          </motion.div>
        </div>
        <span className="sr-only" aria-live="polite">{chapter}</span>
      </nav>
      <div className="pointer-events-none fixed bottom-5 right-24 z-30 lg:hidden" aria-hidden>
        <span className="coord rounded-sm border border-[var(--sea-line)] bg-[rgba(13,24,28,.7)] px-2 py-1 text-[10px] text-[var(--sea-text)] backdrop-blur">
          {readout}
        </span>
      </div>
    </>
  );
}
