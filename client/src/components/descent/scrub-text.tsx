import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

// A paragraph that reads itself as you scroll: each word brightens in turn as
// the block moves up the viewport, so the honest paragraph is delivered at the
// pace of the reader's hand. Fully lit under reduced motion.
function Word({ word, i, n, progress }: { word: string; i: number; n: number; progress: MotionValue<number> }) {
  const start = i / n;
  const end = Math.min(1, start + 1.6 / n);
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  const reduced = useReducedMotion();
  return (
    <motion.span style={{ opacity: reduced ? 1 : opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}

export function ScrubText({ text, className = "", "data-testid": testId }: { text: string; className?: string; "data-testid"?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(/\s+/);
  return (
    <p ref={ref} className={className} data-testid={testId}>
      {words.map((w, i) => (
        <Word key={i} word={w} i={i} n={words.length} progress={scrollYProgress} />
      ))}
    </p>
  );
}
