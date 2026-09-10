import { useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { DescentShell, Marquee } from "@/components/descent/shell";
import { ScrubText } from "@/components/descent/scrub-text";
import { SeaChart } from "@/components/sea-chart";
import { ContourMark } from "@/components/shared-header";
import { BRAND } from "@/lib/brand";
import { DEPARTURES } from "@/lib/departures";

// About: the name, the creed, the two people. Ordered the way a stranger
// would ask — what is this word, what do you believe, who are you — with
// the word itself set as large as the screen allows, and the creed reading
// itself at scroll speed.

const CHAPTERS = [
  { at: 0, label: "The name" },
  { at: 0.28, label: "The creed" },
  { at: 0.56, label: "The founders" },
  { at: 0.86, label: "Where this goes" },
];

function Name() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const chartY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const letters = BRAND.split("");
  return (
    <section ref={ref} className="relative flex min-h-screen flex-col justify-end overflow-hidden" data-testid="section-name">
      <motion.div className="absolute inset-0" style={{ y: chartY }}>
        <SeaChart className="absolute inset-0 h-[130%] w-full" lines={14} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(7,15,18,.92)]" />
      <motion.div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-40 lg:pl-24" style={{ y: wordY, opacity: fade }}>
        <p className="coord text-xs text-[var(--teal-bright)]">THE NAME</p>
        <h1 className="mt-6 flex font-display text-[13.5vw] font-bold uppercase leading-none tracking-[0.06em] text-[var(--sea-text)] md:text-[11vw]" aria-label={BRAND} data-testid="name-word">
          {letters.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}>
                {ch}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }} className="mt-10 grid gap-6 md:grid-cols-2">
          <p className="font-body text-lg leading-relaxed text-[var(--sea-text-dim)]">
            An old sailor's word more than a dictionary's: <em className="text-[var(--sea-text)]">far water</em> is the water past the last reliable chart — beyond the shipping lanes, past where the charter fleets turn back. Not deep water for its own sake; <em className="text-[var(--sea-text)]">distant</em> water, the kind you earn with days of travel and a reason to be there.
          </p>
          <p className="font-body text-lg leading-relaxed text-[var(--sea-text-dim)]">
            That is the whole thesis in one word. The fish that end arguments live where almost nobody hunts, and getting ordinary, serious divers to that water — safely, honestly, on small boats — is the company.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Creed() {
  return (
    <section className="px-6 py-28 lg:pl-24" data-testid="section-creed">
      <div className="mx-auto max-w-6xl">
        <p className="coord text-xs text-[var(--teal-bright)]">THE CREED</p>
        <ScrubText
          data-testid="creed-text"
          className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--sea-text)] md:text-7xl lg:text-8xl"
          text="If the charter fleet already anchors there, it isn't far water."
        />
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6 }} className="font-body text-lg leading-relaxed text-[var(--sea-text)]/85">
            We are not a booking site and not a lodge with a logo. {BRAND} runs a small number of expedition departures a year — spearfishing first, serious sportfishing alongside — in waters chosen because they are remote, alive, and almost unhunted. Every departure is built on an established local operator, with our safety standard and our film crew layered on top.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: 0.1 }} className="font-body text-lg leading-relaxed text-[var(--sea-text)]/85">
            Luxury here means the parts that matter: the right boat, the right guide, food worth coming back to, and a plan for the worst day — not marble bathrooms. The indulgence is the water itself.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

const FOUNDERS = [
  { name: "Elliot Chung", role: "The Waterman", lines: "The niche is his: a lifelong fisherman and spearo who knows the species, the seasons, and the difference between a good operator and a brochure. Elliot charts the slate — which waters, which months, which boats — and co-leads departures in the water." },
  { name: "Jacobo Rosillo", role: "The Operator", lines: "Builds the machine around the diving: the operator relationships, the safety protocol, the film pipeline, and this site. Jacobo runs the application calls and makes sure that what the page promises is what the week delivers." },
] as const;

function Founders() {
  return (
    <section className="border-t border-[var(--sea-line)] px-6 py-28 lg:pl-24" data-testid="section-founders">
      <div className="mx-auto max-w-6xl">
        <p className="coord text-xs text-[var(--teal-bright)]">THE FOUNDERS</p>
        <h2 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--sea-text)] md:text-7xl" style={{ textWrap: "balance" }}>
          Two of us, both in the water
        </h2>
        <p className="coord mt-4 text-xs text-[var(--sea-text-dim)]">UNIVERSITY OF MICHIGAN · ANN ARBOR · 42.2780° N, 83.7382° W</p>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {FOUNDERS.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group relative border border-[var(--sea-line)] bg-[rgba(18,32,38,.6)] p-7 transition-colors hover:border-[var(--teal-bright)] md:p-9"
              data-testid={`founder-${f.name.split(" ")[0].toLowerCase()}`}
            >
              {/* the portrait slot is a drawn contour, not a stock face: the
                  real portraits arrive with the scout film */}
              <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-[var(--sea-line)] transition-colors group-hover:border-[var(--teal-bright)]/60">
                <div className="text-center">
                  <ContourMark className="mx-auto h-14 w-14 text-[var(--teal-bright)] opacity-70 transition-opacity group-hover:opacity-100" />
                  <p className="coord mt-4 text-[10px] text-[var(--sea-text-dim)]">PORTRAIT ARRIVES WITH THE SCOUT FILM</p>
                </div>
              </div>
              <p className="coord mt-7 text-[10px] text-[var(--teal-bright)]">{f.role.toUpperCase()}</p>
              <h3 className="mt-2 font-display text-4xl font-bold uppercase leading-none tracking-tight text-[var(--sea-text)]">{f.name}</h3>
              <p className="mt-5 font-body text-base leading-relaxed text-[var(--sea-text-dim)] md:text-lg">{f.lines}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl font-body italic leading-relaxed text-[var(--sea-text-dim)]">
          Nothing on this site will ever be stock imagery standing in for water we haven't touched. The portraits and the founding film arrive with the first scout footage.
        </p>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="border-t border-[var(--sea-line)] px-6 py-28 lg:pl-24" data-testid="section-close">
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl">
        <p className="coord text-xs text-[var(--teal-bright)]">WHERE THIS GOES</p>
        <p className="mt-6 font-body text-2xl italic leading-relaxed text-[var(--sea-text)] md:text-3xl">
          A company you can measure: the standard is published, the slate is priced, the scout list is public, and the Ledger keeps the score. If that reads like your kind of operation, the water is waiting.
        </p>
        <Link href="/apply" className="mt-10 inline-block rounded-sm bg-[var(--teal-bright)] px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]" data-testid="cta-apply-about">
          Apply for a departure
        </Link>
      </motion.div>
    </section>
  );
}

export default function About() {
  const waters = DEPARTURES.map((d) => `${d.place.toUpperCase()} · ${d.coords}`);
  return (
    <DescentShell chapters={CHAPTERS}>
      <Name />
      <Marquee items={["ANN ARBOR · 42.2780° N, 83.7382° W", ...waters]} />
      <Creed />
      <Founders />
      <Close />
    </DescentShell>
  );
}
