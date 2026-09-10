import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";

// The Standard as three stations on the way down. The section pins, a line
// draws downward with your scroll, and each rule lights when the needle
// reaches it. The rules are the site's real argument, so they get the page's
// slowest chapter.
export const RULES = [
  { n: "01", depth: "−12 m", title: "We dove it first", body: "No departure is sold before a founder has been in that water with the operator who will run it. The scout on the slate is what that looks like in practice." },
  { n: "02", depth: "−18 m", title: "One up, one down", body: "Buddy protocol on every drop, a dedicated safety diver in the water, and a professional co-lead on every founding departure. Depth claims get checked on the application call, not discovered at sea." },
  { n: "03", depth: "−24 m", title: "The evacuation plan is written before the invoice", body: "Every departure carries a named medical evacuation plan and requires DAN-level dive coverage. If we can't write the plan, we don't run the trip — that's why some waters stay 'scouting'." },
] as const;

function Kicker() {
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--teal-bright)]">The Standard</p>
      <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--sea-text)] md:text-5xl lg:text-6xl" style={{ textWrap: "balance" }}>
        The sport has a body count. Our answer is a rulebook.
      </h2>
    </>
  );
}

export function StandardStations() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 640px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return wide && !reduced ? <Pinned /> : <Stacked />;
}

function Pinned() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const n = RULES.length;
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    setActive((p) => (p === i ? p : i));
  });
  const line = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);
  const rule = RULES[active];

  return (
    <section ref={ref} className="relative" style={{ height: `${n * 100 + 100}vh` }} data-testid="section-standard" data-standard-mode="pinned">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-10 px-6 pl-24">
          <div className="col-span-5">
            <Kicker />
            <Link href="/standard" className="mt-8 inline-block font-mono text-xs uppercase tracking-[0.2em] text-[var(--teal-bright)] transition-colors hover:text-[var(--sea-text)]" data-testid="link-standard-full">
              The full standard, published →
            </Link>
          </div>
          <div className="col-span-1 flex justify-center">
            <div className="relative h-[60vh] w-px bg-[var(--sea-line)]">
              <motion.div className="absolute inset-x-0 top-0 origin-top bg-[var(--teal-bright)]" style={{ scaleY: line, height: "100%" }} />
              {RULES.map((r, i) => (
                <span
                  key={r.n}
                  className={`absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-colors duration-500 ${i <= active ? "border-[var(--teal-bright)] bg-[var(--teal-bright)]" : "border-[var(--sea-text-dim)] bg-[var(--sea-ink)]"}`}
                  style={{ top: `${((i + 0.5) / n) * 100}%` }}
                />
              ))}
            </div>
          </div>
          <div className="col-span-6 relative h-[60vh]">
            {RULES.map((r, i) => (
              <motion.div
                key={r.n}
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : i < active ? -18 : 18 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden={i !== active}
                className="absolute inset-0 flex flex-col justify-center"
                data-testid={i === active ? "station-active" : undefined}
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-7xl font-bold text-[var(--teal-bright)] xl:text-8xl">{r.n}</span>
                  <span className="coord text-xs text-[var(--signal)]">{r.depth}</span>
                </div>
                <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-[1] tracking-tight text-[var(--sea-text)] xl:text-4xl" style={{ textWrap: "balance" }}>
                  {r.title}
                </h3>
                <p className="mt-5 max-w-lg font-body text-base leading-relaxed text-[var(--sea-text-dim)] xl:text-lg">{r.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">{rule.title}</span>
    </section>
  );
}

function Stacked() {
  return (
    <section className="relative px-6 py-20" data-testid="section-standard" data-standard-mode="stacked">
      <div className="mx-auto max-w-6xl">
        <Kicker />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {RULES.map((r) => (
            <div key={r.n} className="border-t border-[var(--sea-line)] pt-5">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-[var(--teal-bright)]">{r.n}</span>
                <span className="coord text-[11px] text-[var(--signal)]">{r.depth}</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-[var(--sea-text)]">{r.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[var(--sea-text-dim)]">{r.body}</p>
            </div>
          ))}
        </div>
        <Link href="/standard" className="mt-10 inline-block font-mono text-xs uppercase tracking-[0.2em] text-[var(--teal-bright)] transition-colors hover:text-[var(--sea-text)]" data-testid="link-standard-full">
          The full standard, published →
        </Link>
      </div>
    </section>
  );
}
