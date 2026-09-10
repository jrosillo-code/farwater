import { motion, useTransform, type MotionValue } from "framer-motion";
import { SeaChart } from "@/components/sea-chart";

// Two faint contour sheets fixed behind every page, sliding at different
// rates as the reader sinks — the water itself moving, not the type. Kept
// very quiet (low line counts, low alpha) so the content stays the subject.
export function DepthLayers({ progress }: { progress: MotionValue<number> }) {
  const farY = useTransform(progress, [0, 1], ["0%", "-12%"]);
  const nearY = useTransform(progress, [0, 1], ["0%", "-30%"]);
  const opacity = useTransform(progress, [0, 0.15, 1], [0, 0.6, 0.35]);
  return (
    <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ opacity }} aria-hidden data-testid="depth-layers">
      <motion.div className="absolute inset-x-0 top-0 h-[140%]" style={{ y: farY }}>
        <SeaChart className="absolute inset-0 h-full w-full" lines={6} depthScale={false} strength={0.35} />
      </motion.div>
      <motion.div className="absolute inset-x-0 top-0 h-[160%]" style={{ y: nearY }}>
        <SeaChart className="absolute inset-0 h-full w-full" lines={5} depthScale={false} strength={0.5} />
      </motion.div>
    </motion.div>
  );
}
