import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BRAND } from "@/lib/brand";

// The surface. A short opening the first time you arrive in a session: the
// contour mark draws itself, the wordmark surfaces letter by letter, then the
// whole sheet of water lifts and the page is underneath. About a second and
// a half; skipped entirely under reduced motion and on return visits.
const KEY = "fw-opened";

export function Opening({ onDone }: { onDone?: () => void }) {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return !reduced && sessionStorage.getItem(KEY) !== "1"; } catch { return !reduced; }
  });

  useEffect(() => {
    if (!show) { onDone?.(); return; }
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      setShow(false);
      try { sessionStorage.setItem(KEY, "1"); } catch { /* private mode */ }
    }, 1700);
    return () => {
      window.clearTimeout(t);
      root.style.overflow = prev;
    };
  }, [show, onDone]);

  const letters = BRAND.split("");
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          key="opening"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[var(--sea-ink)]"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] } }}
          data-testid="opening"
        >
          <svg viewBox="0 0 32 32" fill="none" className="h-16 w-16 text-[var(--teal-bright)]" aria-hidden>
            {[10, 17, 24].map((y, i) => (
              <motion.path
                key={y}
                d={`M3 ${y}c5 0 6 3.5 11 3.5S22 ${y} 27 ${y}`}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity={[1, 0.62, 0.32][i]}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: "easeOut" }}
              />
            ))}
            <motion.path
              d="M23 4 9 30"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity=".85"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.55, ease: "easeOut" }}
            />
          </svg>
          <p className="mt-6 flex font-display text-2xl font-bold tracking-[0.3em] text-[var(--sea-text)]" aria-label={BRAND}>
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.045 }}
              >
                {ch}
              </motion.span>
            ))}
          </p>
          <motion.p
            className="coord mt-3 text-[10px] text-[var(--sea-text-dim)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
          >
            SURFACE · 0.0 m
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
