import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";
import { ApplicationFlow } from "@/components/application-flow";
import { BRAND } from "@/lib/brand";

const GeneralContactForm = lazy(() => import("@/components/general-contact-form"));

// Apply: the application flow front and center, honest FAQ under it, and the
// general-inquiry form folded away for press and partners.

const FAQ = [
  {
    q: "What does a departure cost?",
    a: "The founding rates are on each departure page — from $8,500 for Baja, $9,200 for the Azores. That covers the full hosted week: boats, guides, the safety lead, lodging, food, and the film crew. Flights, gear, and insurance are yours.",
  },
  {
    q: "How good a diver do I need to be?",
    a: "Certified, and honestly comfortable at the working depths listed on each page — 15 m for Baja, 20 m for the Azores. You do not need to be a record chaser; you need to be truthful on the application call, because the safety plan is built on what you tell us.",
  },
  {
    q: "I fish but don't dive. Is there a place for me?",
    a: "Yes — the Panama departure is built as a split gun-and-rod week, and every departure can host a rod-only partner. No freedive certification needed to stay on the boat.",
  },
  {
    q: "How does selection work?",
    a: "Both founders read every application, then the promising ones get a call. We are selecting for water sense and honesty about ability, not résumés or follower counts. Eight guns a boat means we say no more than we say yes.",
  },
  {
    q: "Why should I trust a first-season company in a dangerous sport?",
    a: "You shouldn't on our word alone — which is why the safety standard is published in full, the operators under each departure are established professionals, a named safety lead co-runs every week, and the water we haven't proven yet is marked 'scouting' and not for sale.",
  },
] as const;

function FaqSection() {
  return (
    <section className="mx-auto mt-24 max-w-2xl" data-testid="section-faq">
      <h2 className="mb-8 text-center font-display text-2xl font-bold uppercase tracking-tight text-foreground">
        Questions, answered straight
      </h2>
      <div className="divide-y divide-border border-y border-border">
        {FAQ.map((item, i) => (
          <details key={i} className="group py-4" data-testid={`faq-${i + 1}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="shrink-0 font-mono text-primary transition-transform duration-200 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function Apply() {
  const [showGeneral, setShowGeneral] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="solid" />
      <main className="pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">Founding season</p>
            <h1 className="mb-4 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Apply for a departure
            </h1>
            <p className="mx-auto max-w-xl font-body text-lg italic text-muted-foreground">
              Eight guns a boat and a founder on every call. Tell us who you are and what water
              you're ready for — honestly. That's the whole trick.
            </p>
          </motion.div>

          <ApplicationFlow />

          <FaqSection />

          <div className="mt-20 text-center">
            <button
              onClick={() => setShowGeneral((s) => !s)}
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              data-testid="button-toggle-general"
            >
              {showGeneral ? "Hide general inquiries" : "Press, operators, partnerships or something else →"}
            </button>
            {showGeneral && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-8 max-w-xl rounded-md border border-border bg-card p-6 text-left md:p-8"
              >
                <Suspense
                  fallback={
                    <p className="animate-pulse text-center font-mono text-xs uppercase tracking-[0.3em] text-primary/70">
                      {BRAND}
                    </p>
                  }
                >
                  <GeneralContactForm />
                </Suspense>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
