import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// A spearfisher's reticle for a cursor, on devices that have a cursor. It
// trails the pointer on a spring and opens over anything you can act on.
// The native cursor is hidden only while the reticle is mounted and active.
export function Reticle() {
  const [on, setOn] = useState(false);
  const [hot, setHot] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 32, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 420, damping: 32, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setOn(true);
    document.documentElement.classList.add("has-reticle");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      setHot(!!t?.closest("a, button, [role=button], input, textarea, select, label"));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-reticle");
    };
  }, [x, y]);

  if (!on) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] -translate-x-1/2 -translate-y-1/2"
      style={{ x: sx, y: sy }}
      data-testid="reticle"
    >
      <motion.div
        animate={{ width: hot ? 44 : 26, height: hot ? 44 : 26, opacity: hot ? 1 : 0.85 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="relative -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--teal-bright)]"
      >
        <span className="absolute left-1/2 top-0 h-[5px] w-px -translate-x-1/2 bg-[var(--teal-bright)]" />
        <span className="absolute bottom-0 left-1/2 h-[5px] w-px -translate-x-1/2 bg-[var(--teal-bright)]" />
        <span className="absolute left-0 top-1/2 h-px w-[5px] -translate-y-1/2 bg-[var(--teal-bright)]" />
        <span className="absolute right-0 top-1/2 h-px w-[5px] -translate-y-1/2 bg-[var(--teal-bright)]" />
        <span className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--teal-bright)]" />
      </motion.div>
    </motion.div>
  );
}
