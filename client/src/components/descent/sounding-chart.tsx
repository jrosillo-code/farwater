import { useEffect, useRef } from "react";

// The plotting sheet: an equirectangular world drawn as instrument ink —
// graticule every fifteen degrees, the equator and the tropics as index
// lines, the founding waters as blips joined by a dashed route, and a sweep
// that pings each blip as it passes. Generated live; no map tiles, no
// coastline data fetched, nothing borrowed. Static under reduced motion.

export interface Blip { id: string; lat: number; lon: number; label: string }

interface Props {
  points: Blip[];
  active?: string | null;
  className?: string;
  /** Alpha multiplier for quiet background uses. */
  strength?: number;
  sweep?: boolean;
  /** Index-line labels, degree ticks and the sheet title — off for tiny instances. */
  labels?: boolean;
}

export function SoundingChart({ points, active = null, className = "", strength = 1, sweep = true, labels = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = true, onScreen = true;
    const pings: { x: number; y: number; born: number }[] = [];
    const lastPing = new Map<string, number>();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    // fit lon −180..180 × lat −65..65 into the canvas, centred
    const proj = () => {
      const s = Math.min(w / 360, h / 130) * 0.94;
      const ox = (w - 360 * s) / 2, oy = (h - 130 * s) / 2;
      return (lat: number, lon: number) => ({ x: ox + (lon + 180) * s, y: oy + (65 - lat) * s });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const P = proj();
      const teal = (a: number) => `rgba(61,182,191,${(a * strength).toFixed(3)})`;
      const dim = (a: number) => `rgba(138,163,160,${(a * strength).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      // graticule
      for (let lon = -180; lon <= 180; lon += 15) {
        const a = P(65, lon), b = P(-65, lon);
        ctx.strokeStyle = teal(lon % 45 === 0 ? 0.2 : 0.09);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 15) {
        const a = P(lat, -180), b = P(lat, 180);
        ctx.strokeStyle = teal(lat % 45 === 0 ? 0.2 : 0.09);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // index lines with labels
      ctx.font = "9px 'IBM Plex Mono', monospace";
      ctx.textBaseline = "bottom";
      ctx.setLineDash([4, 6]);
      for (const [lat, label] of [[0, "EQUATOR"], [23.44, "TROPIC OF CANCER"], [-23.44, "TROPIC OF CAPRICORN"]] as const) {
        const a = P(lat, -180), b = P(lat, 180);
        ctx.strokeStyle = dim(0.5);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        if (labels) { ctx.fillStyle = dim(0.75); ctx.fillText(label, a.x + 8, a.y - 3); }
      }
      ctx.setLineDash([]);
      // frame
      const tl = P(65, -180), br = P(-65, 180);
      ctx.strokeStyle = teal(0.35);
      ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
      // degree ticks along the bottom edge
      ctx.fillStyle = dim(0.7);
      ctx.textBaseline = "top";
      if (labels) for (let lon = -180; lon <= 180; lon += 45) {
        const p = P(-65, lon);
        ctx.fillRect(p.x, p.y, 1, 6);
        ctx.fillText(`${Math.abs(lon)}°${lon < 0 ? "W" : lon > 0 ? "E" : ""}`, p.x + 3, p.y + 8);
      }
      // route
      if (points.length > 1) {
        ctx.setLineDash([2, 7]);
        ctx.strokeStyle = teal(0.45);
        ctx.beginPath();
        points.forEach((pt, i) => { const p = P(pt.lat, pt.lon); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // sweep from the sheet's centre
      const cx = (tl.x + br.x) / 2, cy = (tl.y + br.y) / 2;
      const ang = ((t / 7000) % 1) * Math.PI * 2;
      if (sweep && !reduced) {
        const R = Math.hypot(br.x - tl.x, br.y - tl.y);
        ctx.save();
        ctx.beginPath(); ctx.rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y); ctx.clip();
        const g = ctx.createConicGradient(ang - 0.9, cx, cy);
        g.addColorStop(0, "rgba(61,182,191,0)");
        g.addColorStop(0.14, `rgba(61,182,191,${0.12 * strength})`);
        g.addColorStop(0.1401, "rgba(61,182,191,0)");
        g.addColorStop(1, "rgba(61,182,191,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = teal(0.5);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); ctx.stroke();
        ctx.restore();
        // ping any blip the sweep just crossed
        for (const pt of points) {
          const p = P(pt.lat, pt.lon);
          const pa = Math.atan2(p.y - cy, p.x - cx);
          let d = ang - ((pa + Math.PI * 2) % (Math.PI * 2));
          d = ((d % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          if (d < 0.05 && t - (lastPing.get(pt.id) ?? -1e9) > 3000) { pings.push({ x: p.x, y: p.y, born: t }); lastPing.set(pt.id, t); }
        }
      }
      // pings
      for (let i = pings.length - 1; i >= 0; i--) {
        const k = (t - pings[i].born) / 1800;
        if (k >= 1) { pings.splice(i, 1); continue; }
        ctx.strokeStyle = teal(0.6 * (1 - k));
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(pings[i].x, pings[i].y, 4 + k * 26, 0, Math.PI * 2); ctx.stroke();
      }
      // blips
      ctx.textBaseline = "middle";
      ctx.font = "10px 'IBM Plex Mono', monospace";
      for (const pt of points) {
        const p = P(pt.lat, pt.lon);
        const hot = activeRef.current === pt.id;
        const r = hot ? 5 : 3.5;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = hot ? teal(1) : "rgba(13,24,28,1)";
        ctx.strokeStyle = teal(hot ? 1 : 0.85);
        ctx.lineWidth = 1.2;
        ctx.fillRect(-r, -r, r * 2, r * 2); ctx.strokeRect(-r, -r, r * 2, r * 2);
        ctx.restore();
        if (hot) { ctx.strokeStyle = teal(0.5); ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = hot ? `rgba(219,231,229,${strength})` : dim(0.9);
        // labels flip to the west of a blip that sits near the sheet's east edge
        const tw = ctx.measureText(pt.label).width;
        if (p.x + 12 + tw > br.x - 4) { ctx.textAlign = "right"; ctx.fillText(pt.label, p.x - 10, p.y - 1); ctx.textAlign = "left"; }
        else ctx.fillText(pt.label, p.x + 10, p.y - 1);
      }
      if (labels) {
        ctx.font = "9px 'IBM Plex Mono', monospace";
        ctx.fillStyle = dim(0.6);
        ctx.textBaseline = "alphabetic";
        ctx.fillText("PLOTTING SHEET · EQUIRECTANGULAR · FOUNDING WATERS", tl.x, tl.y - 6);
      }
    };

    const loop = (t: number) => {
      raf = 0;
      if (!running || !onScreen || document.visibilityState !== "visible") return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && running && onScreen && !reduced) raf = requestAnimationFrame(loop); };
    redrawRef.current = () => draw(performance.now());
    resize(); draw(1200); kick();
    const ro = new ResizeObserver(() => { resize(); draw(1200); kick(); });
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
  }, [points, strength, sweep, labels]);

  // a hover or scroll that changes the active blip repaints at once, so the
  // still frame under reduced motion is never stale
  useEffect(() => { redrawRef.current(); }, [active]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} data-testid="sounding-chart" />;
}
