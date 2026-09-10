import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { DescentShell, PageHead } from "@/components/descent/shell";
import { ApplicationFlow } from "@/components/application-flow";
import { BRAND } from "@/lib/brand";

const GeneralContactForm = lazy(() => import("@/components/general-contact-form"));

// Apply: the application flow front and center, honest FAQ under it, and the
// general-inquiry form folded away for press and partners.

const CHAPTERS = [
  { at: 0, label: "Apply" },
  { at: 0.5, label: "Questions" },
  { at: 0.9, label: "Everything else" },
];

const FAQ = [
  { q: "What does a departure cost?", a: "The founding rates are on each departure page — from $8,500 for Baja, $9,200 for the Azores. That covers the full hosted week: boats, guides, the safety lead, lodging, food, and the film crew. Flights, gear, and insurance are yours." },
  { q: "How good a diver do I need to be?", a: "Certified, and honestly comfortable at the working depths listed on each page — 15 m for Baja, 20 m for the Azores. You do not need to be a record chaser; you need to be truthful on the application call, because the safety plan is built on what you tell us." },
  { q: "I fish but don't dive. Is there a place for me?", a: "Yes — the Panama departure is built as a split gun-and-rod week, and every departure can host a rod-only partner. No freedive certification needed to stay on the boat." },
  { q: "How does selection work?", a: "Both founders read every application, then the promising ones get a call. We are selecting for water sense and honesty about ability, not résumés or follower counts. Eight guns a boat means we say no more than we say yes." },
  { q: "Why should I trust a first-season company in a dangerous sport?", a: "You shouldn't on our word alone — which is why the safety standard is published in full, the operators under each departure are established professionals, a named safety lead co-runs every week, and the water we haven't proven yet is marked 'scouting' and not for sale." },
] as const;

function FaqSection() {
  return (
    <section className="mx-auto mt-28 max-w-6xl lg:grid lg:grid-cols-12 lg:gap-10" data-testid="section-faq">
      <div className="lg:col-span-4">
        <p className="coord text-xs text-[var(--teal-bright)]">QUESTIONS</p>
        <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--sea-text)] md:text-5xl" style={{ textWrap: "balance" }}>
          Answered straight.
        </h2>
      </div>
      <div className="mt-8 divide-y divide-[var(--sea-line)] border-y border-[var(--sea-line)] lg:col-span-8 lg:mt-0">
        {FAQ.map((item, i) => (
          <details key={i} className="group py-5" data-testid={`faq-${i + 1}`}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden">
              <span className="flex items-baseline gap-4">
                <span className="coord text-[11px] text-[var(--teal-bright)]">Q{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-xl font-bold uppercase tracking-tight text-[var(--sea-text)] md:text-2xl">{item.q}</span>
              </span>
              <span className="shrink-0 font-mono text-xl text-[var(--teal-bright)] transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 max-w-2xl pl-12 font-body text-base leading-relaxed text-[var(--sea-text-dim)] md:text-lg">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function Apply() {
  const [showGeneral, setShowGeneral] = useState(false);
  return (
    <DescentShell chapters={CHAPTERS}>
      <div className="px-6 pb-24 pt-36 lg:pl-36">
        <div className="mx-auto max-w-7xl">
          <PageHead kicker="Founding season" title="Apply for a departure" className="mb-14">
            <p className="mt-6 max-w-xl font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)] md:text-xl">
              Eight guns a boat and a founder on every call. Tell us who you are and what water you're
              ready for — honestly. That's the whole trick.
            </p>
          </PageHead>

          <ApplicationFlow />

          <FaqSection />

          <div className="mt-24 text-center" data-testid="section-general">
            <button
              onClick={() => setShowGeneral((s) => !s)}
              className="coord text-xs text-[var(--sea-text-dim)] transition-colors hover:text-[var(--sea-text)]"
              data-testid="button-toggle-general"
            >
              {showGeneral ? "HIDE GENERAL INQUIRIES" : "PRESS, OPERATORS, PARTNERSHIPS OR SOMETHING ELSE →"}
            </button>
            {showGeneral && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-8 max-w-xl border border-[var(--sea-line)] bg-[rgba(18,32,38,.6)] p-6 text-left md:p-8">
                <Suspense fallback={<p className="coord animate-pulse text-center text-xs text-[var(--teal-bright)]/70">{BRAND}</p>}>
                  <GeneralContactForm />
                </Suspense>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DescentShell>
  );
}
