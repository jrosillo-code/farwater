import { useEffect, useState } from "react";
import { Link } from "wouter";
import { DescentShell } from "@/components/descent/shell";
import { SoundingChart } from "@/components/descent/sounding-chart";

// Off the chart: an empty plotting sheet, a position that keeps hunting for
// a fix and never gets one, and the way back to known water.
export default function NotFound() {
  const [fix, setFix] = useState("00.0000° N, 000.0000° W");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const lat = (Math.random() * 60).toFixed(4).padStart(7, "0");
      const lon = (Math.random() * 180).toFixed(4).padStart(8, "0");
      setFix(`${lat}° ${Math.random() > 0.5 ? "N" : "S"}, ${lon}° ${Math.random() > 0.5 ? "E" : "W"}`);
    }, 140);
    return () => window.clearInterval(id);
  }, []);
  return (
    <DescentShell chapters={[{ at: 0, label: "Off the chart" }]} footer={false} chat={false} snow={50}>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center" data-testid="not-found">
        <SoundingChart points={[]} className="absolute inset-y-0 left-0 right-0 h-full opacity-70 lg:left-20" />
        <div className="relative">
          <p className="coord text-xs text-[var(--signal)]">NO FIX · SEARCHING <span className="text-[var(--sea-text-dim)]">{fix}</span></p>
          <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight text-[var(--sea-text)] md:text-8xl" style={{ textWrap: "balance" }}>
            No water at this position.
          </h1>
          <p className="mx-auto mt-6 max-w-md font-body text-lg italic text-[var(--sea-text-dim)]">
            Even good charts have blank corners. Let&apos;s get you back to known water.
          </p>
          <Link href="/" className="mt-10 inline-block rounded-sm border border-[var(--teal-bright)] px-8 py-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--teal-bright)] transition-colors hover:bg-[var(--teal-bright)] hover:text-[var(--sea-ink)]">
            Back to the chart
          </Link>
        </div>
      </section>
    </DescentShell>
  );
}
