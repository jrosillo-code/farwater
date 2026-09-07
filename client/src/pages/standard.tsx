import { Link } from "wouter";
import { motion } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";

// The Standard: the safety rulebook, published in full before the first
// paying departure. In a sport that kills experienced divers every year,
// this page is the product — everything else on the site rests on it.

const OURS = [
  {
    n: "01",
    title: "We dove it first",
    body: "No water is sold before a founder has dived it with the operator who will run it. New waters enter the slate as scouts — self-funded, filmed, unbookable — and graduate only when we know the currents, the operator, and the failure modes personally.",
  },
  {
    n: "02",
    title: "A named safety lead, in the water",
    body: "Every founding departure carries a professional freedive safety lead whose name you get before you pay. Their word beats the founders' on any in-water call, including calling a day off with fish still biting.",
  },
  {
    n: "03",
    title: "One up, one down — no exceptions",
    body: "Buddy protocol on every drop of every session. Nobody hunts alone, nobody extends a dive because the wahoo showed up, and surface intervals are enforced at twice bottom time or better.",
  },
  {
    n: "04",
    title: "The evacuation plan is written before the invoice",
    body: "Each departure has a written medical evacuation plan — nearest chamber, transport, comms — completed before applications open. If we can't write a plan we believe, the departure doesn't run. That is why Vanuatu is still a scout.",
  },
  {
    n: "05",
    title: "Small boats, forever",
    body: "Six to eight guns per departure is a safety ratio, not a marketing device. Scaling this company means more departures, never more people per boat.",
  },
  {
    n: "06",
    title: "Weather has the last word",
    body: "The program flexes to the ocean, not the itinerary. Lost days to weather are stated as a real possibility on every departure page, and no refund pressure will put a boat out in conditions the safety lead has refused.",
  },
] as const;

const YOURS = [
  "A recognized freediving certification (PFI, FII, Molchanovs or equivalent) — or completion of our partnered course before departure. No certification, no gun in the water.",
  "Honest depth. Tell us your comfortable working depth, not your best-ever; the application call is where we check, kindly, that the water fits the diver.",
  "DAN or equivalent dive-accident and evacuation coverage, verified before departure. It is inexpensive and non-negotiable.",
  "The safety lead's calls are final — on dive time, depth, conditions, and ending a session. Guests who fight that lose the water, not the fee.",
  "No breath-hold diving after alcohol, and honest disclosure of medical conditions that matter at depth. Both are between you and the safety lead, in confidence.",
] as const;

export default function Standard() {
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="solid" />
      <main className="pb-24 pt-32">
        <div className="mx-auto max-w-4xl px-6">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Published before our first season</p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-tight text-foreground md:text-6xl">
              The Standard
            </h1>
            <p className="mt-5 max-w-2xl font-body text-lg italic leading-relaxed text-muted-foreground">
              Bluewater hunting is the most beautiful sport we know, and it kills experienced
              divers every year — mostly to shallow-water blackout, mostly diving alone or
              under-safetied. We publish the rulebook first, so you can hold us to it.
            </p>
          </motion.header>

          <section className="mt-16">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--signal)]"
            >
              What we hold ourselves to
            </motion.h2>
            <div className="mt-6 divide-y divide-border border-y border-border">
              {OURS.map((rule, i) => (
                <motion.div
                  key={rule.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                  className="grid gap-2 py-6 sm:grid-cols-[64px_1fr]"
                  data-testid={`standard-rule-${rule.n}`}
                >
                  <span className="coord text-sm text-[var(--signal)]">{rule.n}</span>
                  <div>
                    <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">{rule.title}</h3>
                    <p className="mt-2 max-w-2xl font-body leading-relaxed text-muted-foreground">{rule.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-primary"
            >
              What we ask of you
            </motion.h2>
            <ul className="mt-6 space-y-4">
              {YOURS.map((line, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className="coord mt-1.5 text-[10px] text-primary">▸</span>
                  <p className="font-body leading-relaxed text-foreground/80">{line}</p>
                </motion.li>
              ))}
            </ul>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mt-16 rounded-md border border-border bg-card p-6 md:p-8"
          >
            <p className="font-body italic leading-relaxed text-muted-foreground">
              None of this page is a track record yet — it is the standard we set before taking
              anyone's money, and the founding departures are where it gets proven. When we fall
              short of it, the honest account goes in{" "}
              <Link href="/ledger" className="text-primary underline-offset-4 hover:underline">the Ledger</Link>,
              not in the trash.
            </p>
            <Link
              href="/apply"
              className="mt-6 inline-block rounded-sm bg-primary px-8 py-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
              data-testid="cta-apply-standard"
            >
              Apply under this standard
            </Link>
          </motion.section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
