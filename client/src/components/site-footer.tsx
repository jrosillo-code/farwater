import { Link } from "wouter";
import { BRAND, TAGLINE, THESIS } from "@/lib/brand";
import { ContourMark } from "@/components/shared-header";
import { SeaChart } from "@/components/sea-chart";

// The footer is the site's one other stretch of dark water: the chart motif
// returns quietly behind the links, closing every page at depth.
export function SiteFooter() {
  return (
    <footer className="sea relative overflow-hidden" data-testid="footer">
      <SeaChart className="absolute inset-0 h-full w-full opacity-40" lines={8} depthScale={false} strength={0.6} />
      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <ContourMark className="h-8 w-8 text-[var(--teal-bright)]" />
              <span className="font-display text-2xl font-bold tracking-[0.22em]">{BRAND}</span>
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--teal-bright)]">{TAGLINE}</p>
            <p className="mt-4 max-w-xs font-body text-sm italic leading-relaxed text-dim">{THESIS}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <div className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--teal-bright)]">The Water</div>
              <ul className="mt-4 space-y-2.5 font-body text-sm text-dim">
                <li><Link href="/departures" className="inline-block py-0.5 transition-colors hover:text-[var(--sea-text)]">Departures</Link></li>
                <li><Link href="/standard" className="inline-block py-0.5 transition-colors hover:text-[var(--sea-text)]">The Standard</Link></li>
                <li><Link href="/ledger" className="inline-block py-0.5 transition-colors hover:text-[var(--sea-text)]">The Ledger</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--teal-bright)]">The Company</div>
              <ul className="mt-4 space-y-2.5 font-body text-sm text-dim">
                <li><Link href="/about" className="inline-block py-0.5 transition-colors hover:text-[var(--sea-text)]">About</Link></li>
                <li><Link href="/apply" className="inline-block py-0.5 transition-colors hover:text-[var(--sea-text)]">Apply</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--teal-bright)]">Fine Print</div>
              <ul className="mt-4 space-y-2.5 font-body text-sm text-dim">
                <li><Link href="/privacy" className="inline-block py-0.5 transition-colors hover:text-[var(--sea-text)]">Privacy</Link></li>
                <li><Link href="/terms" className="inline-block py-0.5 transition-colors hover:text-[var(--sea-text)]">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[var(--sea-line)] pt-6 md:flex-row">
          <p className="font-mono text-[11px] tracking-[0.15em] text-dim">
            © {new Date().getFullYear()} {BRAND}. ALL RIGHTS RESERVED.
          </p>
          <p className="coord text-[11px] text-dim">42.2780° N, 83.7382° W — founded at Michigan</p>
        </div>
      </div>
    </footer>
  );
}
