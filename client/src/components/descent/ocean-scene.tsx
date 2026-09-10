import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { SeaChart } from "@/components/sea-chart";
import { LightRays } from "@/components/descent/light-rays";

// The hero's water, in layers: far contours, surface light, near contours.
// Each layer answers the pointer at a different rate, so the scene has depth
// without a single photograph in it — which is the honest choice for a
// company that has not filmed its water yet. Type sits above all of it and
// never moves with the pointer. Scroll-linked values come from the parent
// (the chart sinks, the light fades) so the hero and the page share one
// motion system.
interface Props {
  chartY: MotionValue<string>;
  raysOpacity: MotionValue<number>;
}

export function OceanScene({ chartY, raysOpacity }: Props) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 40, damping: 18, mass: 0.6 });
  const farX = useTransform(sx, (v) => v * -10);
  const farY = useTransform(sy, (v) => v * -6);
  const nearX = useTransform(sx, (v) => v * 26);
  const nearY = useTransform(sy, (v) => v * 14);
  const rayX = useTransform(sx, (v) => v * 8);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const move = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * 2);
      py.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    const leave = () => { px.set(0); py.set(0); };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [px, py]);

  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ y: chartY }} aria-hidden data-testid="ocean-scene">
      <motion.div className="absolute -inset-8" style={{ x: farX, y: farY }}>
        <SeaChart className="absolute inset-0 h-[130%] w-full" lines={9} depthScale={false} strength={0.55} />
      </motion.div>
      <motion.div className="absolute inset-0" style={{ opacity: raysOpacity, x: rayX }}>
        <LightRays className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(70% 55% at 50% -12%, rgba(61,182,191,.22), transparent 62%)" }} />
      </motion.div>
      <motion.div className="absolute -inset-10" style={{ x: nearX, y: nearY }}>
        <SeaChart className="absolute inset-0 h-[130%] w-full" lines={7} strength={0.9} />
      </motion.div>
    </motion.div>
  );
}
