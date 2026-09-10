import { useEffect, useRef } from "react";

// Light from the surface: a few soft shafts that sway slowly and lose
// themselves a third of the way down the frame. Drawn additively on one
// canvas, capped at 2× pixel density, paused offscreen; a single still frame
// under prefers-reduced-motion.
export function LightRays({ className = "", count = 6, strength = 1 }: { className?: string; count?: number; strength?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = true, onScreen = true;
    const rays = Array.from({ length: count }, (_, i) => ({
      x: 0.12 + (i / Math.max(1, count - 1)) * 0.76 + (Math.sin(i * 7.3) * 0.04),
      width: 0.05 + ((i * 37) % 10) / 100,
      speed: 0.05 + ((i * 13) % 7) / 100,
      phase: i * 1.9,
      alpha: 0.10 + ((i * 29) % 5) / 40,
    }));
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const time = t / 1000;
      for (const r of rays) {
        const sway = Math.sin(time * r.speed + r.phase) * 0.06;
        const topX = r.x * w + sway * w * 0.3;
        const botX = topX + w * (0.12 + sway);
        const half = r.width * w;
        const g = ctx.createLinearGradient(0, 0, 0, h * 0.8);
        g.addColorStop(0, `rgba(61,182,191,${(r.alpha * strength).toFixed(3)})`);
        g.addColorStop(0.35, `rgba(61,182,191,${(r.alpha * 0.5 * strength).toFixed(3)})`);
        g.addColorStop(1, "rgba(61,182,191,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(topX - half * 0.5, -10);
        ctx.lineTo(topX + half * 0.5, -10);
        ctx.lineTo(botX + half * 1.6, h * 0.85);
        ctx.lineTo(botX - half * 1.6, h * 0.85);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    const loop = (t: number) => {
      raf = 0;
      if (!running || !onScreen || document.visibilityState !== "visible") return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && running && onScreen && !reduced) raf = requestAnimationFrame(loop); };
    resize(); draw(3000); kick();
    const ro = new ResizeObserver(() => { resize(); draw(3000); kick(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); });
    io.observe(canvas);
    document.addEventListener("visibilitychange", kick);
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", kick);
    };
  }, [count, strength]);
  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} data-testid="light-rays" />;
}
