import { useEffect, useRef } from "react";

// A departure's "photograph", honestly: a generated bathymetric motif seeded
// by its coordinates — concentric contours around a seamount, a drop-off
// shading to ink, soundings scattered like a survey. Every water gets a
// distinct, repeatable figure without a single borrowed image. Drawn once;
// under reduced motion it stays still, otherwise it drifts very slowly.
function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function WaterSignature({ seed, className = "", strength = 1 }: { seed: string; className?: string; strength?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let hash = 0;
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    let w = 0, h = 0, dpr = 1, raf = 0, running = true, onScreen = true;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      const rnd = seeded(hash);
      ctx.clearRect(0, 0, w, h);
      const cx = w * (0.3 + rnd() * 0.4), cy = h * (0.35 + rnd() * 0.3);
      const rings = 9 + Math.floor(rnd() * 5);
      const lobes = 3 + Math.floor(rnd() * 3);
      const rot = rnd() * Math.PI * 2;
      const time = t / 1000;
      // drop-off shading
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.9);
      g.addColorStop(0, `rgba(61,182,191,${0.16 * strength})`);
      g.addColorStop(0.35, `rgba(14,124,134,${0.08 * strength})`);
      g.addColorStop(1, "rgba(3,8,10,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // contours
      for (let r = 1; r <= rings; r++) {
        const base = (r / rings) * Math.max(w, h) * 0.62;
        const wob = 0.06 + rnd() * 0.12;
        const ph = rnd() * Math.PI * 2;
        const alpha = (0.55 - (r / rings) * 0.4) * strength;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
          const rr = base * (1 + wob * Math.sin(lobes * a + ph + rot) + 0.03 * Math.sin(7 * a + time * 0.15 + r));
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.72;
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(61,182,191,${alpha.toFixed(3)})`;
        ctx.lineWidth = r % 3 === 0 ? 1.3 : 0.7;
        ctx.stroke();
      }
      // soundings
      ctx.font = "9px 'IBM Plex Mono', monospace";
      ctx.fillStyle = `rgba(138,163,160,${0.7 * strength})`;
      const n = 10 + Math.floor(rnd() * 10);
      for (let i = 0; i < n; i++) {
        const x = rnd() * w, y = rnd() * h;
        const d = Math.round(6 + Math.hypot((x - cx) / w, (y - cy) / h) * 60 + rnd() * 6);
        ctx.fillText(String(d), x, y);
      }
    };
    const loop = (t: number) => {
      raf = 0;
      if (!running || !onScreen || document.visibilityState !== "visible") return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && running && onScreen && !reduced) raf = requestAnimationFrame(loop); };
    resize(); draw(0); kick();
    const ro = new ResizeObserver(() => { resize(); draw(0); kick(); });
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
  }, [seed, strength]);
  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} data-testid="water-signature" />;
}
