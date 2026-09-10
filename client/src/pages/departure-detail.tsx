import { useRef } from "react";
import { Link, useParams } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { DescentShell } from "@/components/descent/shell";
import { SeaChart } from "@/components/sea-chart";
import { ScrubText } from "@/components/descent/scrub-text";
import { SeasonTicks } from "@/components/descent/slate-rail";
import { SoundingChart } from "@/components/descent/sounding-chart";
import { WaterSignature } from "@/components/descent/water-signature";
import { departureById, STATUS_LABEL, parseCoords, type Departure } from "@/lib/departures";

// One dossier template, every departure, read off departures.ts. The header
// sinks under the reader; an instrument panel with the season, the species
// and the honest working-depth band stays pinned; the day's rhythm draws
// itself as a line; and the "straight" paragraph — the honest caveat — is the
// slowest, brightest thing on the page, because it is the most important.

const CHAPTERS = [
  { at: 0, label: "The dossier" },
  { at: 0.2, label: "The water" },
  { at: 0.42, label: "The rhythm" },
  { at: 0.64, label: "Requirements" },
  { at: 0.82, label: "Straight with you" },
];

const STATUS_CLASS: Record<string, string> = {
  open: "border-[var(--teal-bright)]/60 text-[var(--teal-bright)]",
  forming: "border-[var(--sea-text)]/30 text-[var(--sea-text)]/70",
  scouting: "border-[var(--signal)]/70 text-[var(--signal)]",
};

function Kicker({ children, signal = false }: { children: React.ReactNode; signal?: boolean }) {
  return <h2 className={`coord text-xs ${signal ? "text-[var(--signal)]" : "text-[var(--teal-bright)]"}`}>{children}</h2>;
}

// The working band on a 0–40 m scale: where this departure actually hunts.
function DepthBand({ depth }: { depth?: [number, number] }) {
  const MAX = 40;
  return (
    <div data-testid="depth-band">
      <p className="coord text-[10px] text-[var(--sea-text-dim)]">WORKING DEPTH</p>
      <div className="mt-3 flex gap-4">
        <div className="relative h-40 w-px bg-[var(--sea-line)]">
          {[0, 10, 20, 30, 40].map((m) => (
            <span key={m} className="coord absolute left-3 -translate-y-1/2 whitespace-nowrap text-[9px] text-[var(--sea-text-dim)]" style={{ top: `${(m / MAX) * 100}%` }}>
              −{m} m
            </span>
          ))}
          {depth && (
            <motion.span
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-[-3px] w-[7px] origin-top bg-[var(--teal-bright)]"
              style={{ top: `${(depth[0] / MAX) * 100}%`, height: `${((depth[1] - depth[0]) / MAX) * 100}%` }}
            />
          )}
        </div>
        <div className="flex flex-col justify-center pl-8">
          {depth ? (
            <>
              <span className="font-display text-3xl font-bold text-[var(--sea-text)]">−{depth[0]}<span className="text-[var(--sea-text-dim)]"> to </span>−{depth[1]} m</span>
              <span className="coord mt-1 text-[10px] text-[var(--sea-text-dim)]">HONEST RANGE, NOT A RECORD</span>
            </>
          ) : (
            <>
              <span className="font-display text-2xl font-bold text-[var(--signal)]">Unverified</span>
              <span className="coord mt-1 text-[10px] text-[var(--sea-text-dim)]">WE HAVEN'T DIVED IT YET</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ d }: { d: Departure }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const chartY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const typeY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  return (
    <section ref={ref} className="relative flex min-h-[88vh] flex-col justify-end overflow-hidden" data-testid="dossier-header">
      <motion.div className="absolute inset-0" style={{ y: chartY }}>
        <WaterSignature seed={d.coords} className="absolute inset-0 h-[130%] w-full" strength={0.9} />
        <SeaChart className="absolute inset-0 h-[130%] w-full opacity-60" lines={9} depthScale={false} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(7,15,18,.92)]" />
      <motion.div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-40 lg:pl-24" style={{ y: typeY, opacity: fade }}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="coord text-sm text-[var(--teal-bright)]">{d.code}</span>
          <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${STATUS_CLASS[d.status]}`}>{STATUS_LABEL[d.status]}</span>
        </div>
        <h1 className="mt-5 font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight text-[var(--sea-text)] sm:text-7xl md:text-8xl xl:text-9xl" style={{ textWrap: "balance" }} data-testid="dossier-title">
          {d.title.split(" ").map((w, i, arr) => (
            <span key={i}>
              <span className="inline-block overflow-hidden align-top">
                <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.05 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
                  {w}
                </motion.span>
              </span>
              {i < arr.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p className="coord mt-4 text-sm text-[var(--sea-text-dim)]">{d.place.toUpperCase()}, {d.country.toUpperCase()} · {d.coords}</p>
        <p className="mt-5 max-w-xl font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)] md:text-xl">{d.tagline}</p>
      </motion.div>
      <div className="relative border-t border-[var(--sea-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-2 px-6 py-4 lg:pl-24">
          <span className="coord text-[11px] text-[var(--sea-text-dim)]">{d.window}</span>
          <span className="coord text-[11px] text-[var(--sea-text-dim)]">{d.days} DAYS</span>
          <span className="coord text-[11px] text-[var(--sea-text-dim)]">{d.guns} GUNS</span>
          <span className="coord text-[11px] text-[var(--teal-bright)]">
            {d.from ? `FROM ${d.from} / GUN` : d.status === "scouting" ? "NOT BOOKABLE" : "TERMS WITH ACCEPTED APPLICANTS"}
          </span>
        </div>
      </div>
    </section>
  );
}

function Rhythm({ d }: { d: Departure }) {
  const ref = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  return (
    <section data-testid="section-rhythm">
      <Kicker>{d.status === "scouting" ? "The plan" : "The rhythm of a day"}</Kicker>
      <ul ref={ref} className="relative mt-6 space-y-7 pl-8">
        <span className="absolute left-[3px] top-1 h-[calc(100%-0.5rem)] w-px bg-[var(--sea-line)]" aria-hidden />
        <motion.span className="absolute left-[3px] top-1 h-[calc(100%-0.5rem)] w-px origin-top bg-[var(--teal-bright)]" style={{ scaleY: scrollYProgress }} aria-hidden />
        {d.rhythm.map((line, i) => {
          const [head, ...rest] = line.split(" — ");
          const tail = rest.join(" — ");
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <span className="absolute -left-8 top-2 h-[7px] w-[7px] -translate-x-[0px] rotate-45 border border-[var(--teal-bright)] bg-[var(--sea-ink)]" aria-hidden />
              {tail ? (
                <>
                  <span className="coord block text-[11px] text-[var(--teal-bright)]">{head.toUpperCase()}</span>
                  <p className="mt-1 font-body text-lg leading-relaxed text-[var(--sea-text)]/85">{tail}</p>
                </>
              ) : (
                <p className="font-body text-lg leading-relaxed text-[var(--sea-text)]/85">{line}</p>
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

function Missing() {
  return (
    <DescentShell chapters={[{ at: 0, label: "Off the chart" }]} footer={false} chat={false}>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <SoundingChart points={[]} className="absolute inset-y-0 left-0 right-0 h-full opacity-60 lg:left-20" />
        <div className="relative">
          <p className="coord text-xs text-[var(--signal)]">POSITION UNKNOWN</p>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase tracking-tight text-[var(--sea-text)] md:text-7xl">No departure at these coordinates.</h1>
          <Link href="/departures" className="mt-10 inline-block rounded-sm border border-[var(--teal-bright)] px-8 py-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--teal-bright)] transition-colors hover:bg-[var(--teal-bright)] hover:text-[var(--sea-ink)]">
            Back to the slate
          </Link>
        </div>
      </section>
    </DescentShell>
  );
}

export default function DepartureDetail() {
  const { id } = useParams<{ id: string }>();
  const d = departureById(id ?? "");
  if (!d) return <Missing />;
  const scouting = d.status === "scouting";
  const c = parseCoords(d.coords);

  return (
    <DescentShell chapters={CHAPTERS}>
      <Header d={d} />
      <div className="mx-auto max-w-6xl px-6 lg:pl-24">
        <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_300px]">
          <div className="space-y-24">
            <section data-testid="section-water">
              <Kicker>The water</Kicker>
              <ScrubText className="mt-5 font-body text-2xl leading-relaxed text-[var(--sea-text)] md:text-3xl" text={d.overview} data-testid="water-text" />
              <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-[var(--sea-text-dim)]">{d.water}</p>
            </section>

            <Rhythm d={d} />

            <section data-testid="section-requirements">
              <Kicker>Requirements</Kicker>
              <ul className="mt-6 divide-y divide-[var(--sea-line)] border-y border-[var(--sea-line)]">
                {d.requirements.map((req, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                    className="grid gap-3 py-4 sm:grid-cols-[48px_1fr]"
                  >
                    <span className="coord text-[11px] text-[var(--teal-bright)]">R{String(i + 1).padStart(2, "0")}</span>
                    <p className="font-body text-lg leading-relaxed text-[var(--sea-text)]/85">{req}</p>
                  </motion.li>
                ))}
              </ul>
            </section>

            <section className="border border-[var(--signal)]/50 bg-[rgba(212,89,10,.05)] p-7 md:p-9" data-testid="section-straight">
              <Kicker signal>Straight with you</Kicker>
              <ScrubText className="mt-5 font-body text-xl italic leading-relaxed text-[var(--sea-text)] md:text-2xl" text={d.straight} data-testid="straight-text" />
            </section>
          </div>

          <aside className="h-fit space-y-8 border border-[var(--sea-line)] bg-[rgba(18,32,38,.7)] p-6 backdrop-blur-sm lg:sticky lg:top-28" data-testid="instrument-panel">
            <div className="relative h-32 overflow-hidden border border-[var(--sea-line)]">
              <SoundingChart points={c ? [{ id: d.id, lat: c.lat, lon: c.lon, label: d.code }] : []} active={d.id} className="absolute inset-0 h-full w-full" strength={0.9} sweep={false} labels={false} />
            </div>
            <div>
              <p className="coord text-[10px] text-[var(--sea-text-dim)]">SEASON</p>
              <div className="mt-3"><SeasonTicks months={d.months} /></div>
            </div>
            <DepthBand depth={d.depth} />
            <div>
              <p className="coord text-[10px] text-[var(--sea-text-dim)]">TARGET SPECIES</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.species.map((s) => (
                  <span key={s} className="rounded-sm border border-[var(--sea-line)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--sea-text-dim)]">{s}</span>
                ))}
              </div>
            </div>
            <div className="space-y-2 border-t border-[var(--sea-line)] pt-5">
              <p className="coord text-[11px] text-[var(--sea-text-dim)]">WINDOW — {d.window}</p>
              <p className="coord text-[11px] text-[var(--sea-text-dim)]">BOAT — {d.guns} GUNS MAX</p>
              <p className="coord text-[11px] text-[var(--sea-text-dim)]">LENGTH — {d.days} DAYS</p>
              {d.from && <p className="coord text-[11px] text-[var(--sea-text)]">RATE — FROM {d.from}</p>}
            </div>
            {scouting ? (
              <Link href="/apply" className="block rounded-sm border border-[var(--signal)]/70 py-3 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--signal)] transition-colors hover:bg-[var(--signal)]/10" data-testid="cta-scout-list">
                Join the list — see the scout film first
              </Link>
            ) : (
              <Link href={`/apply?departure=${d.id}`} className="block rounded-sm bg-[var(--teal-bright)] py-3 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]" data-testid="cta-apply-detail">
                {d.status === "open" ? "Apply for this departure" : "Apply — hear terms first"}
              </Link>
            )}
          </aside>
        </div>

        <div className="mb-24 mt-20 border-t border-[var(--sea-line)] pt-8">
          <Link href="/departures" className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--sea-text-dim)] transition-colors hover:text-[var(--sea-text)]" data-testid="link-back-slate">
            ← All departures
          </Link>
        </div>
      </div>
    </DescentShell>
  );
}
