import { motion } from "framer-motion";
import { DescentShell, PageHead } from "@/components/descent/shell";
import { Counter } from "@/components/descent/counter";

// The Ledger: promises vs. delivered, in public. For a company selling trust
// in a dangerous sport, keeping score openly is the strongest feature the
// site has. Rows are updated by hand as reality moves — including the misses.

const CHAPTERS = [
  { at: 0, label: "The ledger" },
  { at: 0.25, label: "The score" },
];

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

const KIND: Record<string, { pill: string; dot: string; label: string }> = {
  active: { pill: "border-[var(--teal-bright)]/60 text-[var(--teal-bright)]", dot: "blip bg-[var(--teal-bright)]", label: "Kept" },
  progress: { pill: "border-[var(--sea-text)]/30 text-[var(--sea-text)]/80", dot: "border border-[var(--sea-text)]/60", label: "In progress" },
  pending: { pill: "border-[var(--sea-text-dim)]/40 text-[var(--sea-text-dim)]", dot: "border border-[var(--sea-text-dim)]/60", label: "Not yet" },
};

export default function Ledger() {
  const count = (k: string) => ROWS.filter((r) => r.kind === k).length;
  return (
    <DescentShell chapters={CHAPTERS}>
      <section className="px-6 pb-12 pt-36 lg:pl-24">
        <div className="mx-auto max-w-6xl">
          <PageHead kicker="Accountability" title="The Ledger">
            <p className="mt-6 max-w-2xl font-body text-lg italic leading-relaxed text-[var(--sea-text-dim)] md:text-xl">
              What we've promised and where it stands, updated as the founding seasons unfold — including
              the parts that don't go to plan. If something slips, it gets written here, not quietly deleted.
            </p>
          </PageHead>
          <div className="mt-14 grid grid-cols-3 gap-6 border-y border-[var(--sea-line)] py-8" data-testid="ledger-score">
            {(["active", "progress", "pending"] as const).map((k) => (
              <div key={k}>
                <Counter to={count(k)} className={`font-display text-5xl font-bold md:text-7xl ${k === "active" ? "text-[var(--teal-bright)]" : "text-[var(--sea-text)]"}`} />
                <p className="coord mt-2 text-[10px] text-[var(--sea-text-dim)]">{KIND[k].label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 lg:pl-24">
        <div className="mx-auto max-w-6xl divide-y divide-[var(--sea-line)] border-b border-[var(--sea-line)]">
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              className="grid gap-3 py-7 md:grid-cols-[72px_1fr_auto] md:items-center md:gap-8"
              data-testid={`ledger-row-${i + 1}`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rotate-45 ${KIND[row.kind].dot}`} aria-hidden />
                <span className="coord text-[11px] text-[var(--teal-bright)]">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-[var(--sea-text)] md:text-3xl" style={{ textWrap: "balance" }}>
                {row.text}
              </p>
              <span className={`w-fit rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${KIND[row.kind].pill}`}>{row.status}</span>
            </motion.div>
          ))}
        </div>
        <p className="coord mx-auto mt-10 max-w-6xl text-[11px] text-[var(--sea-text-dim)]">LAST REVIEWED AT FOUNDING — THIS PAGE CHANGES WHEN REALITY DOES.</p>
      </section>
    </DescentShell>
  );
}
