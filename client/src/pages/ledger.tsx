import { motion } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";

// The Ledger: promises vs. delivered, in public. For a company selling trust
// in a dangerous sport, keeping score openly is the strongest feature the
// site has. Rows are updated by hand as reality moves — including the misses.

const ROWS = [
  { text: "Safety standard published before the first paying departure", status: "Done — read it in full", kind: "active" },
  { text: "FW-001 Baja run at the published standard", status: "Booking for the 2027 window", kind: "progress" },
  { text: "FW-003 Azores run at the published standard", status: "Booking for the 2027 window", kind: "progress" },
  { text: "Panama operator block and pricing confirmed", status: "In negotiation — terms to applicants first", kind: "progress" },
  { text: "Vanuatu scouted before a single dollar is taken for it", status: "Scout in planning, self-funded", kind: "pending" },
  { text: "Every departure filmed; every film shows the real week", status: "Begins with the first scout", kind: "pending" },
  { text: "Founders reading and calling every application personally", status: "Active now", kind: "active" },
  { text: "Incidents and near-misses reported on this page", status: "Zero departures run — nothing to report yet", kind: "pending" },
] as const;

const KIND_STYLES: Record<string, string> = {
  active: "border-primary/60 text-primary",
  progress: "border-foreground/30 text-foreground/80",
  pending: "border-muted-foreground/40 text-muted-foreground",
};

export default function Ledger() {
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="solid" />
      <main className="pb-24 pt-32">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">Accountability</p>
            <h1 className="mb-6 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">The Ledger</h1>
            <p className="font-body text-lg italic leading-relaxed text-muted-foreground">
              What we've promised and where it stands, updated as the founding seasons unfold —
              including the parts that don't go to plan. If something slips, it gets written
              here, not quietly deleted.
            </p>
          </motion.div>

          <div className="divide-y divide-border border-y border-border">
            {ROWS.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="flex flex-col gap-2 py-5 md:flex-row md:items-center md:justify-between md:gap-6"
                data-testid={`ledger-row-${i + 1}`}
              >
                <div className="flex items-baseline gap-4">
                  <span className="coord text-[11px] text-primary/70">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-base font-semibold text-foreground md:text-lg">{row.text}</p>
                </div>
                <span
                  className={`w-fit shrink-0 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${KIND_STYLES[row.kind]}`}
                >
                  {row.status}
                </span>
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-center font-body text-sm italic leading-relaxed text-muted-foreground">
            Last reviewed at founding — this page changes when reality does.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
