import { useEffect, useRef } from "react";

// Marine snow: the particulate that drifts past a diver on the way down. A
// fixed canvas behind the page; particles rise faster the faster you scroll,
// which is what sinking looks like from inside a mask. One draw loop, paused
// offscreen and when the tab is hidden; a single still frame under
// prefers-reduced-motion.
export function MarineSnow({ count = 110 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = true;
    let lastY = window.scrollY, vel = 0;

    type P = { x: number; y: number; r: number; s: number; a: number; drift: number };
    let ps: P[] = [];
    const seed = () => {
      ps = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.9,
        s: 0.08 + Math.random() * 0.35,
        a: 0.12 + Math.random() * 0.4,
        drift: (Math.random() - 0.5) * 0.25,
      }));
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!ps.length) seed();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgb(219,231,229)";
      for (const p of ps) {
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const step = () => {
      const y = window.scrollY;
      vel += ((y - lastY) - vel) * 0.12; // smoothed scroll velocity, px/frame
      lastY = y;
      const lift = Math.max(-6, Math.min(6, vel * 0.06));
      for (const p of ps) {
        p.y -= p.s + lift * (0.5 + p.r * 0.5);
        p.x += p.drift;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        else if (p.y > h + 4) { p.y = -4; p.x = Math.random() * w; }
        if (p.x < -4) p.x = w + 4;
        else if (p.x > w + 4) p.x = -4;
      }
    };
    const loop = () => {
      raf = 0;
      if (!running || document.visibilityState !== "visible") return;
      step();
      draw();
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && running && !reduced) raf = requestAnimationFrame(loop); };

    resize();
    draw();
    kick();
    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(canvas);
    document.addEventListener("visibilitychange", kick);
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", kick);
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[1] h-full w-full" data-testid="marine-snow" />;
}
