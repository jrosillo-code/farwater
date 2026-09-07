import { useEffect, useRef } from "react";

// The signature visual: a living bathymetric chart. Depth contours drawn on
// ink, drifting slowly, with a depth scale down the left edge — the hero of a
// company that hunts water reads as an instrument, not a brochure.
//
// This is also an honesty decision. We own no expedition footage yet, and a
// founding-stage brand pretending with stock video would break the same rule
// Askyan holds (no invented press, no borrowed imagery passed off as ours).
// The chart is generated, needs no network, and gets replaced clip by clip as
// real film comes back from the water (media pipeline in .github/workflows).
//
// Perf: one canvas, ~12 polylines/frame, paused when offscreen and when the
// tab is hidden; static single frame under prefers-reduced-motion.

interface SeaChartProps {
  className?: string;
  /** Line count — more reads deeper. */
  lines?: number;
  /** Show the −10 m / −20 m … scale down the left edge. */
  depthScale?: boolean;
  /** Overall stroke alpha, for quieter background uses. */
  strength?: number;
}

export function SeaChart({ className = "", lines = 12, depthScale = true, strength = 1 }: SeaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let onScreen = true;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Each contour is a sum of three slow sines with per-line phase, so lines
    // undulate independently but never cross chaotically.
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;
      for (let i = 0; i < lines; i++) {
        const depth = (i + 1) / lines; // 0 shallow → 1 deep
        const baseY = h * (0.14 + 0.78 * depth);
        const amp = 6 + 18 * depth;
        const alpha = (0.5 - 0.34 * depth) * strength;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y =
            baseY +
            Math.sin(x * 0.004 + time * 0.22 + i * 1.7) * amp +
            Math.sin(x * 0.011 - time * 0.16 + i * 0.9) * amp * 0.4 +
            Math.sin(x * 0.0021 + time * 0.09 + i * 2.3) * amp * 0.7;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(61, 182, 191, ${alpha.toFixed(3)})`;
        ctx.lineWidth = i % 4 === 0 ? 1.4 : 0.8; // every 4th contour is an index line
        ctx.stroke();
      }
      if (depthScale) {
        ctx.font = "10px 'IBM Plex Mono', monospace";
        ctx.fillStyle = `rgba(138, 163, 160, ${0.65 * strength})`;
        ctx.textBaseline = "middle";
        const marks = [10, 20, 30, 40];
        for (const m of marks) {
          const y = h * (0.14 + 0.78 * (m / 45));
          ctx.fillText(`−${m} m`, 14, y);
          ctx.fillRect(0, y, 8, 1);
        }
      }
    };

    const loop = (t: number) => {
      raf = 0;
      if (!running || !onScreen || document.visibilityState !== "visible") return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && running && onScreen && !reduced) raf = requestAnimationFrame(loop);
    };

    resize();
    draw(reduced ? 4200 : 0); // always paint the first frame — the page at rest
    kick();

    const ro = new ResizeObserver(() => {
      resize();
      draw(4200);
      kick();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      kick();
    });
    io.observe(canvas);
    const onVis = () => kick();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [lines, depthScale, strength]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
