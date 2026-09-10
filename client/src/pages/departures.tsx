import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { DescentShell, PageHead, Marquee } from "@/components/descent/shell";
import { SoundingChart } from "@/components/descent/sounding-chart";
import { SeasonTicks } from "@/components/descent/slate-rail";
import { DEPARTURES, STATUS_LABEL, parseCoords } from "@/lib/departures";

// The slate as a chart table. The plotting sheet pins on the right; the
// departures sail past on the left, and whichever row is under the reader
// lights its blip on the sheet. The scouting entry stays unpriced on
// purpose — showing what we won't sell yet is the loudest safety claim here.

const CHAPTERS = [
  { at: 0, label: "The chart" },
  { at: 0.14, label: "The slate" },
  { at: 0.86, label: "Apply" },
];

const STATUS_CLASS: Record<string, string> = {
  open: "border-[var(--teal-bright)]/60 text-[var(--teal-bright)]",
  forming: "border-[var(--sea-text)]/30 text-[var(--sea-text)]/70",
  scouting: "border-[var(--signal)]/60 text-[var(--signal)]",
};

export default function Departures() {
  const [active, setActive] = useState<string | null>(DEPARTURES[0].id);
  const rowsRef = useRef<HTMLDivElement>(null);
  const points = useMemo(
    () => DEPARTURES.flatMap((d) => { const c = parseCoords(d.coords); return c ? [{ id: d.id, lat: c.lat, lon: c.lon, label: d.code }] : []; }),
    [],
  );

  // the row crossing the middle of the viewport is the live one
  useEffect(() => {
    const rows = rowsRef.current?.querySelectorAll<HTMLElement>("[data-row]");
    if (!rows?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.getAttribute("data-row"));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  const strip = DEPARTURES.map((d) => `${d.code} · ${d.place.toUpperCase()} · ${d.coords} · ${d.window}`);

  return (
    <DescentShell chapters={CHAPTERS}>
      <section className="px-6 pb-10 pt-36 lg:pl-36">
        <div className="mx-auto max-w-7xl">
          <PageHead kicker="The founding slate" title="Departures">
            <p className="mt-6 max-w-2xl font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)] md:text-xl">
              Three commercial waters and one scout. Seven to ten days each, six to eight guns a boat,
              one professional safety lead in the water on every one. Pricing is on the page — if a
              number isn't, the departure isn't for sale yet.
            </p>
          </PageHead>
        </div>
      </section>
      <Marquee items={strip} />

      <section className="px-6 lg:pl-36" data-testid="chart-table">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          {/* the sheet: pinned on wide screens, a block above the rows on phones */}
          <div className="order-first lg:order-last">
            <div className="lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-11.5rem)] lg:flex-col lg:gap-4">
              <div className="relative h-[52vw] max-h-[28rem] w-full overflow-hidden border border-[var(--sea-line)] lg:h-auto lg:max-h-none lg:flex-1">
                <SoundingChart points={points} active={active} className="absolute inset-0 h-full w-full" />
              </div>
              {/* the active water's instrument line, following the rows */}
              {(() => {
                const a = DEPARTURES.find((d) => d.id === active) ?? DEPARTURES[0];
                return (
                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border border-[var(--sea-line)] bg-[rgba(18,32,38,.6)] p-5 lg:mt-0" data-testid="chart-panel">
                    <div className="col-span-2 flex items-baseline justify-between">
                      <span className="coord text-[10px] text-[var(--sea-text-dim)]">ACTIVE WATER</span>
                      <span className="coord text-[11px] text-[var(--teal-bright)]" data-testid="chart-active">{a.code}</span>
                    </div>
                    <p className="col-span-2 font-display text-2xl font-bold uppercase leading-none tracking-tight text-[var(--sea-text)]">{a.title}</p>
                    <span className="coord text-[10px] text-[var(--sea-text-dim)]">{a.coords}</span>
                    <span className="coord text-right text-[10px] text-[var(--sea-text-dim)]">{a.window}</span>
                    <span className="coord text-[10px] text-[var(--sea-text-dim)]">{a.days} DAYS · {a.guns} GUNS</span>
                    <span className="coord text-right text-[10px] text-[var(--sea-text-dim)]">{a.depth ? `−${a.depth[0]} TO −${a.depth[1]} m` : "DEPTH UNVERIFIED"}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          <div ref={rowsRef} className="py-6 lg:py-12">
            {DEPARTURES.map((d, i) => {
              const scouting = d.status === "scouting";
              const hot = active === d.id;
              return (
                <motion.div
                  key={d.id}
                  data-row={d.id}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setActive(d.id)}
                  className="flex min-h-[60vh] items-center border-t border-[var(--sea-line)] py-10 last:border-b lg:min-h-[72vh]"
                >
                  <Link href={`/departure/${d.id}`} className="group block w-full" data-testid={`row-departure-${d.id}`}>
                    <div className="flex items-center gap-4">
                      <span className={`h-2 w-2 rotate-45 ${hot ? "blip bg-[var(--teal-bright)]" : "border border-[var(--sea-text-dim)]"}`} aria-hidden />
                      <span className="coord text-[11px] text-[var(--teal-bright)]">{d.code}</span>
                      <span className="coord text-[10px] text-[var(--sea-text-dim)]">{String(i + 1).padStart(2, "0")} / {String(DEPARTURES.length).padStart(2, "0")}</span>
                      <span className={`ml-auto rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${STATUS_CLASS[d.status]}`}>
                        {STATUS_LABEL[d.status]}
                      </span>
                    </div>
                    <h2
                      className={`mt-5 font-display text-5xl font-bold uppercase leading-[0.92] tracking-tight transition-colors md:text-6xl xl:text-7xl ${
                        scouting ? "text-[var(--sea-text)]/75" : "text-[var(--sea-text)] group-hover:text-[var(--teal-bright)]"
                      }`}
                      style={{ textWrap: "balance" }}
                    >
                      {d.title}
                    </h2>
                    <p className="coord mt-3 text-xs text-[var(--sea-text-dim)]">
                      {d.place.toUpperCase()}, {d.country.toUpperCase()} · {d.coords}
                    </p>
                    <p className="mt-5 max-w-xl font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)]">{d.tagline}</p>
                    <div className="mt-7 grid gap-5 border-t border-[var(--sea-line)] pt-5 sm:grid-cols-[auto_1fr] sm:items-center">
                      <SeasonTicks months={d.months} />
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
                        <span className="coord text-[11px] text-[var(--sea-text-dim)]">{d.window}</span>
                        <span className="coord text-[11px] text-[var(--sea-text-dim)]">{d.days} DAYS · {d.guns} GUNS</span>
                        <span className="coord text-[11px] text-[var(--sea-text-dim)]">
                          {d.depth ? `WORKING −${d.depth[0]} TO −${d.depth[1]} m` : "DEPTH UNVERIFIED"}
                        </span>
                        {d.from ? (
                          <span className="coord text-[11px] text-[var(--sea-text)]">FROM {d.from}</span>
                        ) : (
                          <span className="coord text-[11px] text-[var(--signal)]">{scouting ? "NOT BOOKABLE" : "TERMS SOON"}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.species.map((s) => (
                        <span key={s} className="rounded-sm border border-[var(--sea-line)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--sea-text-dim)]">
                          {s}
                        </span>
                      ))}
                    </div>
                    <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-[var(--teal-bright)] opacity-0 transition-opacity group-hover:opacity-100">
                      Open the dossier →
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:pl-36" data-testid="section-apply">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl border border-[var(--sea-line)] bg-[rgba(18,32,38,.6)] p-8 text-center md:p-10"
        >
          <p className="font-body italic leading-relaxed text-[var(--sea-text-dim)]">
            Season bars show when each water fishes: tall teal is peak, short teal is workable, faint
            is off-season. Dates inside each window are set with the confirmed guns — the current and
            the operator decide them, not a brochure.
          </p>
          <Link
            href="/apply"
            className="mt-7 inline-block rounded-sm bg-[var(--teal-bright)] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]"
            data-testid="cta-apply-departures"
          >
            Apply for a departure
          </Link>
        </motion.div>
      </section>
    </DescentShell>
  );
}
