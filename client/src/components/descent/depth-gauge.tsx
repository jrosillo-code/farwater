import { useState } from "react";
import { motion, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";

// The page's instrument: a depth gauge pinned to the left edge. Page progress
// is read as metres — the whole home page is one descent from the surface to
// forty metres — and the chapter you are in is named beside the needle. On
// phones it collapses to a single readout in the corner.
export interface Chapter { at: number; label: string }

export const MAX_DEPTH = 40;

export function DepthGauge({ progress: raw, chapters }: { progress: MotionValue<number>; chapters: Chapter[] }) {
  const [metres, setMetres] = useState(0);
  const [chapter, setChapter] = useState(chapters[0]?.label ?? "");
  // a page too short to scroll is the surface, not the bottom
  const progress = useTransform(raw, (v) => (document.documentElement.scrollHeight - window.innerHeight < 80 ? 0 : v));
  const needleTop = useTransform(progress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(progress, "change", (v) => {
    const m = Math.round(v * MAX_DEPTH * 10) / 10;
    setMetres((prev) => (prev === m ? prev : m));
    let label = chapters[0]?.label ?? "";
    for (const c of chapters) if (v >= c.at) label = c.label;
    setChapter((prev) => (prev === label ? prev : label));
  });

  const readout = metres <= 0 ? "0.0 m" : `−${metres.toFixed(1)} m`;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-y-0 left-0 z-30 hidden w-16 flex-col items-center justify-center lg:flex"
        aria-hidden
        data-testid="depth-gauge"
      >
        <div className="relative h-[58vh] w-px bg-[var(--sea-line)]">
          {Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              className="absolute left-0 h-px bg-[var(--sea-text-dim)]"
              style={{ top: `${(i / 8) * 100}%`, width: i % 2 === 0 ? 10 : 5, opacity: i % 2 === 0 ? 0.7 : 0.35 }}
            />
          ))}
          {chapters.map((c) => (
            <span
              key={c.label}
              className="absolute left-0 h-1.5 w-1.5 -translate-x-[2px] -translate-y-1/2 rotate-45 border border-[var(--teal-bright)]"
              style={{ top: `${c.at * 100}%`, opacity: 0.8 }}
            />
          ))}
          <motion.div className="absolute left-0 -translate-y-1/2" style={{ top: needleTop }}>
            <span className="block h-[2px] w-4 bg-[var(--teal-bright)]" />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap">
              <span className="coord block text-[11px] text-[var(--sea-text)]" data-testid="depth-readout">{readout}</span>
              <span className="coord block text-[9px] uppercase text-[var(--teal-bright)]" data-testid="depth-chapter">{chapter}</span>
            </span>
          </motion.div>
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-5 right-24 z-30 lg:hidden" aria-hidden>
        <span className="coord rounded-sm border border-[var(--sea-line)] bg-[rgba(13,24,28,.7)] px-2 py-1 text-[10px] text-[var(--sea-text)] backdrop-blur">
          {readout}
        </span>
      </div>
    </>
  );
}
