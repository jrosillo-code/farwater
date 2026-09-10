import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { SoundingChart } from "@/components/descent/sounding-chart";
import { WaterSignature } from "@/components/descent/water-signature";
import { SeasonTicks } from "@/components/descent/slate-rail";
import { DEPARTURES, STATUS_LABEL, parseCoords, type Departure } from "@/lib/departures";

// The expedition atlas: the plotting sheet with the four founding waters,
// and an editorial panel for whichever one is selected. Choosing a water
// lights its blip, draws a locator line east to the panel, and brings the
// departure in — title, generated chart motif, season, capacity, status,
// price when there is one, and the way into the full dossier. The selector
// is a row of real buttons (arrow keys move between them), so nothing here
// depends on hovering. On phones the chips sit above a short sheet and the
// panel stacks beneath.

const STATUS_CLASS: Record<string, string> = {
  open: "border-[var(--teal-bright)]/60 text-[var(--teal-bright)]",
  forming: "border-[var(--sea-text)]/30 text-[var(--sea-text)]/70",
  scouting: "border-[var(--signal)]/70 text-[var(--signal)]",
};

const EASE = [0.22, 1, 0.36, 1] as const;

function Panel({ d, n, i }: { d: Departure; n: number; i: number }) {
  const scouting = d.status === "scouting";
  return (
    <motion.article
      key={d.id}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex h-full flex-col"
      data-testid={`atlas-panel-${d.id}`}
      aria-live="polite"
    >
      <div className="relative aspect-[16/9] overflow-hidden border border-[var(--sea-line)]">
        <motion.div initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }} className="absolute inset-0">
          <WaterSignature seed={d.coords} className="absolute inset-0 h-full w-full" />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
          <span className="coord text-[9px] text-[var(--sea-text-dim)]">GENERATED CHART MOTIF · NOT A PHOTOGRAPH</span>
          <span className="coord text-[10px] text-[var(--teal-bright)]">{d.coords}</span>
        </div>
        <span className="coord absolute left-3 top-3 text-[10px] text-[var(--sea-text-dim)]">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="coord text-[11px] text-[var(--teal-bright)]">{d.code}</span>
        <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${STATUS_CLASS[d.status]}`} data-testid="atlas-status">
          {STATUS_LABEL[d.status]}
        </span>
      </div>
      <h3 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight text-[var(--sea-text)] md:text-5xl xl:text-6xl" style={{ textWrap: "balance" }} data-testid="atlas-title">
        {d.title}
      </h3>
      <p className="coord mt-3 text-xs text-[var(--sea-text-dim)]">{d.place.toUpperCase()}, {d.country.toUpperCase()}</p>
      <p className="mt-4 max-w-md font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)]">{d.tagline}</p>
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--sea-line)] pt-5 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-3">
          <dt className="coord text-[9px] text-[var(--sea-text-dim)]">SEASON</dt>
          <dd className="mt-2"><SeasonTicks months={d.months} /></dd>
        </div>
        <div><dt className="coord text-[9px] text-[var(--sea-text-dim)]">WINDOW</dt><dd className="coord mt-1 text-[11px] text-[var(--sea-text)]">{d.window}</dd></div>
        <div><dt className="coord text-[9px] text-[var(--sea-text-dim)]">CAPACITY</dt><dd className="coord mt-1 text-[11px] text-[var(--sea-text)]">{d.guns} GUNS · {d.days} DAYS</dd></div>
        <div>
          <dt className="coord text-[9px] text-[var(--sea-text-dim)]">RATE</dt>
          <dd className={`coord mt-1 text-[11px] ${d.from ? "text-[var(--sea-text)]" : "text-[var(--signal)]"}`} data-testid="atlas-rate">
            {d.from ? `FROM ${d.from}` : scouting ? "NOT BOOKABLE" : "TERMS SOON"}
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
        <Link
          href={`/departure/${d.id}`}
          className="rounded-sm bg-[var(--teal-bright)] px-7 py-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]"
          data-testid="atlas-open"
        >
          Open the dossier
        </Link>
        <span className="coord text-[10px] text-[var(--sea-text-dim)]">
          {d.species.slice(0, 3).join(" · ").toUpperCase()}
        </span>
      </div>
    </motion.article>
  );
}

export function Atlas() {
  const [active, setActive] = useState(DEPARTURES[0].id);
  const listRef = useRef<HTMLDivElement>(null);
  const points = useMemo(
    () => DEPARTURES.flatMap((d) => { const c = parseCoords(d.coords); return c ? [{ id: d.id, lat: c.lat, lon: c.lon, label: d.code }] : []; }),
    [],
  );
  const idx = Math.max(0, DEPARTURES.findIndex((d) => d.id === active));
  const current = DEPARTURES[idx];

  // arrow keys walk the selector like a radio group
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>("button"));
      const from = Math.max(0, buttons.indexOf(document.activeElement as HTMLButtonElement));
      let next = from;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (from + 1) % DEPARTURES.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (from - 1 + DEPARTURES.length) % DEPARTURES.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = DEPARTURES.length - 1;
      setActive(DEPARTURES[next].id);
      buttons[next]?.focus();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="atlas" className="relative px-6 py-24 lg:pl-24 lg:py-32" data-testid="atlas">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="coord text-xs text-[var(--teal-bright)]">THE ATLAS · FOUR FOUNDING WATERS</p>
            <h2 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight text-[var(--sea-text)] md:text-7xl" style={{ textWrap: "balance" }}>
              Four waters. Twenty-two guns a year.
            </h2>
          </div>
          <Link href="/departures" className="coord text-xs text-[var(--teal-bright)] transition-colors hover:text-[var(--sea-text)]" data-testid="link-all-departures">
            FULL SLATE →
          </Link>
        </motion.div>

        {/* selector: real buttons, arrow-key walkable */}
        <div ref={listRef} role="group" aria-label="Choose a water" className="mt-10 flex flex-wrap gap-2" data-testid="atlas-selector">
          {DEPARTURES.map((d, i) => {
            const on = d.id === active;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActive(d.id)}
                aria-pressed={on}
                className={`flex items-center gap-3 rounded-sm border px-4 py-2.5 text-left transition-colors ${
                  on ? "border-[var(--teal-bright)] bg-[rgba(61,182,191,.08)]" : "border-[var(--sea-line)] hover:border-[var(--sea-text-dim)]"
                }`}
                data-testid={`atlas-pick-${d.id}`}
              >
                <span className={`h-1.5 w-1.5 rotate-45 ${on ? "bg-[var(--teal-bright)]" : "border border-[var(--sea-text-dim)]"}`} aria-hidden />
                <span className="coord text-[10px] text-[var(--sea-text-dim)]">{String(i + 1).padStart(2, "0")}</span>
                <span className={`font-display text-sm font-bold uppercase tracking-[0.12em] ${on ? "text-[var(--sea-text)]" : "text-[var(--sea-text-dim)]"}`}>{d.place}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="relative h-[52vw] max-h-[24rem] overflow-hidden border border-[var(--sea-line)] lg:sticky lg:top-28 lg:h-[62vh] lg:max-h-none">
              <SoundingChart points={points} active={active} locator className="absolute inset-0 h-full w-full" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <span className="coord text-[10px] text-[var(--sea-text-dim)]">ACTIVE WATER</span>
                <span className="coord text-[11px] text-[var(--teal-bright)]" data-testid="atlas-active">{current.code}</span>
              </div>
            </div>
          </div>
          <div className="min-h-[34rem] lg:col-span-5">
            <AnimatePresence mode="wait" initial={false}>
              <Panel key={current.id} d={current} n={DEPARTURES.length} i={idx} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
