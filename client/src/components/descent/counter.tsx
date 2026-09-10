import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

// A number that counts up the first time it is seen. Zero-padded so the
// digits never reflow; instant under reduced motion.
export function Counter({ to, pad = 2, className = "", duration = 1.4 }: { to: number; pad?: number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!inView || reduced) { if (reduced) setN(to); return; }
    const c = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, duration, reduced]);
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {String(n).padStart(pad, "0")}
    </span>
  );
}
