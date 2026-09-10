import { useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { DescentShell, PageHead } from "@/components/descent/shell";
import { ScrubText } from "@/components/descent/scrub-text";
import { Counter } from "@/components/descent/counter";
import { RuleDiagram } from "@/components/descent/rule-diagrams";

// The Standard: the safety rulebook, published in full before the first
// paying departure. In a sport that kills experienced divers every year this
// page is the product, so it gets the site's biggest type: each rule walks
// past under a giant outlined numeral that sinks at its own speed.

const CHAPTERS = [
  { at: 0, label: "Why" },
  { at: 0.12, label: "What we hold to" },
  { at: 0.72, label: "What we ask" },
  { at: 0.92, label: "Apply" },
];

const OURS = [
  { n: "01", title: "We dove it first", body: "No water is sold before a founder has dived it with the operator who will run it. New waters enter the slate as scouts — self-funded, filmed, unbookable — and graduate only when we know the currents, the operator, and the failure modes personally." },
  { n: "02", title: "A named safety lead, in the water", body: "Every founding departure carries a professional freedive safety lead whose name you get before you pay. Their word beats the founders' on any in-water call, including calling a day off with fish still biting." },
  { n: "03", title: "One up, one down — no exceptions", body: "Buddy protocol on every drop of every session. Nobody hunts alone, nobody extends a dive because the wahoo showed up, and surface intervals are enforced at twice bottom time or better." },
  { n: "04", title: "The evacuation plan is written before the invoice", body: "Each departure has a written medical evacuation plan — nearest chamber, transport, comms — completed before applications open. If we can't write a plan we believe, the departure doesn't run. That is why Vanuatu is still a scout." },
  { n: "05", title: "Small boats, forever", body: "Six to eight guns per departure is a safety ratio, not a marketing device. Scaling this company means more departures, never more people per boat." },
  { n: "06", title: "Weather has the last word", body: "The program flexes to the ocean, not the itinerary. Lost days to weather are stated as a real possibility on every departure page, and no refund pressure will put a boat out in conditions the safety lead has refused." },
] as const;

const YOURS = [
  "A recognized freediving certification (PFI, FII, Molchanovs or equivalent) — or completion of our partnered course before departure. No certification, no gun in the water.",
  "Honest depth. Tell us your comfortable working depth, not your best-ever; the application call is where we check, kindly, that the water fits the diver.",
  "DAN or equivalent dive-accident and evacuation coverage, verified before departure. It is inexpensive and non-negotiable.",
  "The safety lead's calls are final — on dive time, depth, conditions, and ending a session. Guests who fight that lose the water, not the fee.",
  "No breath-hold diving after alcohol, and honest disclosure of medical conditions that matter at depth. Both are between you and the safety lead, in confidence.",
] as const;

function Rule({ rule, i }: { rule: (typeof OURS)[number]; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);
  const flip = i % 2 === 1;
  return (
    <section ref={ref} className="relative flex min-h-[78vh] items-center overflow-hidden border-t border-[var(--sea-line)]" data-testid={`standard-rule-${rule.n}`}>
      <motion.span
        aria-hidden
        style={{ y: ghostY }}
        className={`numeral-ghost pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-display text-[38vw] font-bold leading-none lg:text-[26vw] ${flip ? "right-[-2vw]" : "left-[-2vw]"}`}
      >
        {rule.n}
      </motion.span>
      <div className={`relative mx-auto grid w-full max-w-6xl gap-6 px-6 py-20 lg:grid-cols-12 lg:pl-24`}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`lg:col-span-7 ${flip ? "lg:col-start-1" : "lg:col-start-6"}`}
        >
          <div className="flex items-end justify-between gap-6">
            <p className="coord text-xs text-[var(--signal)]">RULE {rule.n} OF {String(OURS.length).padStart(2, "0")}</p>
            <RuleDiagram n={rule.n} className="h-20 w-32 shrink-0" />
          </div>
          <h3 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--sea-text)] md:text-6xl" style={{ textWrap: "balance" }}>
            {rule.title}
          </h3>
          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-[var(--sea-text-dim)] md:text-xl">{rule.body}</p>
        </motion.div>
      </div>
    </section>
  );
}

function Asks() {
  const ref = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 50%"] });
  return (
    <section className="border-t border-[var(--sea-line)] px-6 py-24 lg:pl-24" data-testid="section-asks">
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p className="coord text-xs text-[var(--teal-bright)]">WHAT WE ASK OF YOU</p>
          <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--sea-text)] md:text-5xl" style={{ textWrap: "balance" }}>
            Five things, none negotiable.
          </h2>
        </div>
        <ul ref={ref} className="relative mt-10 space-y-8 pl-10 lg:col-span-8 lg:mt-0">
          <span className="absolute left-[3px] top-2 h-[calc(100%-1rem)] w-px bg-[var(--sea-line)]" aria-hidden />
          <motion.span className="absolute left-[3px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-[var(--teal-bright)]" style={{ scaleY: scrollYProgress }} aria-hidden />
          {YOURS.map((line, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <span className="absolute -left-10 top-2.5 h-[7px] w-[7px] rotate-45 border border-[var(--teal-bright)] bg-[var(--sea-ink)]" aria-hidden />
              <span className="coord block text-[11px] text-[var(--teal-bright)]">ASK {String(i + 1).padStart(2, "0")}</span>
              <p className="mt-1 font-body text-lg leading-relaxed text-[var(--sea-text)]/85 md:text-xl">{line}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function Standard() {
  return (
    <DescentShell chapters={CHAPTERS}>
      <section className="px-6 pb-16 pt-36 lg:pl-24">
        <div className="mx-auto max-w-6xl">
          <PageHead kicker="Published before our first season" title="The Standard" />
          <ScrubText
            data-testid="standard-intro"
            className="mt-10 max-w-3xl font-body text-2xl italic leading-relaxed text-[var(--sea-text)] md:text-3xl"
            text="Bluewater hunting is the most beautiful sport we know, and it kills experienced divers every year — mostly to shallow-water blackout, mostly diving alone or under-safetied. We publish the rulebook first, so you can hold us to it."
          />
          <div className="mt-14 grid grid-cols-3 gap-6 border-y border-[var(--sea-line)] py-8" data-testid="standard-counts">
            {[
              { n: OURS.length, label: "Rules we hold to" },
              { n: YOURS.length, label: "Asks of you" },
              { n: 0, label: "Departures run so far" },
            ].map((c) => (
              <div key={c.label}>
                <Counter to={c.n} className="font-display text-5xl font-bold text-[var(--teal-bright)] md:text-7xl" />
                <p className="coord mt-2 text-[10px] text-[var(--sea-text-dim)]">{c.label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div data-testid="section-rules">
        {OURS.map((rule, i) => (
          <Rule key={rule.n} rule={rule} i={i} />
        ))}
      </div>

      <Asks />

      <section className="border-t border-[var(--sea-line)] px-6 py-24 lg:pl-24" data-testid="section-close">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl"
        >
          <p className="font-body text-xl italic leading-relaxed text-[var(--sea-text-dim)] md:text-2xl">
            None of this page is a track record yet — it is the standard we set before taking anyone's
            money, and the founding departures are where it gets proven. When we fall short of it, the
            honest account goes in{" "}
            <Link href="/ledger" className="text-[var(--teal-bright)] underline-offset-4 hover:underline">the Ledger</Link>, not in the trash.
          </p>
          <Link
            href="/apply"
            className="mt-8 inline-block rounded-sm bg-[var(--teal-bright)] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)] transition-colors hover:bg-[var(--sea-text)]"
            data-testid="cta-apply-standard"
          >
            Apply under this standard
          </Link>
        </motion.div>
      </section>
    </DescentShell>
  );
}
