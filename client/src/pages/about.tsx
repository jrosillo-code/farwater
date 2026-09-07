import { Link } from "wouter";
import { motion } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";
import { SeaChart } from "@/components/sea-chart";
import { BRAND } from "@/lib/brand";

// About: the name, the creed, the two people. Ordered the way a stranger
// would ask the questions — what is this word, what do you believe, who are
// you — with the honesty block carrying the close.

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6 },
} as const;

function NameSection() {
  return (
    <section className="sea relative overflow-hidden">
      <SeaChart className="absolute inset-0 h-full w-full opacity-50" lines={12} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(13,24,28,.85)]" />
      <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-36">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--teal-bright)]"
        >
          The name
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 font-display text-6xl font-bold uppercase tracking-[0.08em] sm:text-7xl md:text-8xl"
        >
          {BRAND}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mt-8 max-w-2xl space-y-5"
        >
          <p className="font-body text-lg leading-relaxed text-dim">
            An old sailor's word more than a dictionary's: <em className="text-[var(--sea-text)]">far water</em> is
            the water past the last reliable chart — beyond the shipping lanes, past where the
            charter fleets turn back. Not deep water for its own sake; <em className="text-[var(--sea-text)]">distant</em> water,
            the kind you earn with days of travel and a reason to be there.
          </p>
          <p className="font-body text-lg leading-relaxed text-dim">
            That is the whole thesis in one word. The fish that end arguments live where almost
            nobody hunts, and getting ordinary, serious divers to that water — safely, honestly,
            on small boats — is the company.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Creed() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <motion.div {...reveal}>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">The creed</p>
        <blockquote className="mt-6 font-display text-3xl font-bold uppercase leading-tight tracking-tight text-foreground md:text-4xl">
          “If the charter fleet already anchors there, it isn't far water.”
        </blockquote>
        <div className="mt-8 space-y-5 font-body text-lg leading-relaxed text-foreground/80">
          <p>
            We are not a booking site and not a lodge with a logo. {BRAND} runs a small number
            of expedition departures a year — spearfishing first, serious sportfishing alongside —
            in waters chosen because they are remote, alive, and almost unhunted. Every departure
            is built on an established local operator, with our safety standard and our film crew
            layered on top.
          </p>
          <p>
            Luxury here means the parts that matter: the right boat, the right guide, food worth
            coming back to, and a plan for the worst day — not marble bathrooms. The indulgence
            is the water itself.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

const FOUNDERS = [
  {
    name: "Elliot Chung",
    role: "The Waterman",
    lines:
      "The niche is his: a lifelong fisherman and spearo who knows the species, the seasons, and the difference between a good operator and a brochure. Elliot charts the slate — which waters, which months, which boats — and co-leads departures in the water.",
  },
  {
    name: "Jacobo Rosillo",
    role: "The Operator",
    lines:
      "Builds the machine around the diving: the operator relationships, the safety protocol, the film pipeline, and this site. Jacobo runs the application calls and makes sure that what the page promises is what the week delivers.",
  },
] as const;

function Founders() {
  return (
    <section className="border-t border-border bg-card/60">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <motion.div {...reveal}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">The founders</p>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            Two of us, both in the water
          </h2>
          <p className="coord mt-3 text-xs text-muted-foreground">UNIVERSITY OF MICHIGAN · ANN ARBOR</p>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {FOUNDERS.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="rounded-md border border-card-border bg-card p-6 md:p-7"
              data-testid={`founder-${f.name.split(" ")[0].toLowerCase()}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">{f.role}</p>
              <h3 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground">{f.name}</h3>
              <p className="mt-4 font-body leading-relaxed text-muted-foreground">{f.lines}</p>
            </motion.div>
          ))}
        </div>
        <motion.p {...reveal} className="mt-10 font-body italic leading-relaxed text-muted-foreground">
          Portraits and the founding film arrive with the first scout footage — nothing on this
          site will ever be stock imagery standing in for water we haven't touched.
        </motion.p>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <motion.div {...reveal}>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Where this goes</p>
        <p className="mt-6 font-body text-xl italic leading-relaxed text-foreground/85">
          A company you can measure: the standard is published, the slate is priced, the scout
          list is public, and the Ledger keeps the score. If that reads like your kind of
          operation, the water is waiting.
        </p>
        <Link
          href="/apply"
          className="mt-10 inline-block rounded-sm bg-primary px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
          data-testid="cta-apply-about"
        >
          Apply for a departure
        </Link>
      </motion.div>
    </section>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="chart" />
      <main>
        <NameSection />
        <Creed />
        <Founders />
        <Close />
      </main>
      <SiteFooter />
    </div>
  );
}
