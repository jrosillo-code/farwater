import { MONTH_LETTERS, type Departure } from "@/lib/departures";

// The season chart: twelve months as instrument ticks. Filled teal = peak,
// hollow teal = fishable, faint = off. Reads the same on paper and on .sea
// sections because every color is explicit.
export function SeasonStrip({ months, className = "" }: { months: Departure["months"]; className?: string }) {
  return (
    <div className={`flex items-end gap-1.5 ${className}`} aria-label="Season by month" role="img">
      {MONTH_LETTERS.map((letter, i) => {
        const peak = months.peak.includes(i);
        const on = months.on.includes(i);
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className="block w-2.5 rounded-[1px] transition-colors"
              style={{
                height: peak ? 18 : on ? 11 : 5,
                background: peak ? "var(--teal)" : on ? "rgba(14,124,134,.45)" : "rgba(20,40,47,.14)",
              }}
            />
            <span className={`font-mono text-[9px] ${peak ? "text-primary" : "text-muted-foreground/70"}`}>{letter}</span>
          </div>
        );
      })}
    </div>
  );
}
