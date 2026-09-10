import { useEffect } from "react";
import Lenis from "lenis";

// Inertial scrolling for the descent. Native scroll stays the source of truth
// (Lenis drives window.scrollTo each frame), so every scroll-linked motion
// value on the page still reads the real position. Off under reduced motion.
let current: Lenis | null = null;

export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      if (current === lenis) current = null;
    };
  }, [enabled]);
}

/** Scroll to an element or offset through Lenis when it is running, natively otherwise. */
export function scrollToTarget(target: HTMLElement | number, offset = -64) {
  if (current) {
    current.scrollTo(target, { offset, duration: 1.1 });
    return;
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + offset;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}
