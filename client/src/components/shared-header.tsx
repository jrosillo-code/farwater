import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND, TAGLINE } from "@/lib/brand";

// One header for the whole site. Over the dark hero it renders in sea-glass
// text on nothing; the moment the page scrolls it settles onto chart paper.
// No dropdowns — four destinations and an apply button is the entire map.

const NAV = [
  { href: "/departures", label: "Departures" },
  { href: "/standard", label: "The Standard" },
  { href: "/about", label: "About" },
  { href: "/ledger", label: "Ledger" },
] as const;

export function ContourMark({ className = "h-7 w-7" }: { className?: string }) {
  // Three depth contours and a strike-line: the wordmark's glyph, drawn
  // inline so it inherits currentColor in both light and sea contexts.
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <path d="M3 10c5 0 6 3.5 11 3.5S22 10 27 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 17c5 0 6 3.5 11 3.5S22 17 27 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".62" />
      <path d="M3 24c5 0 6 3.5 11 3.5S22 24 27 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".32" />
      <path d="M23 4 9 30" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".85" />
    </svg>
  );
}

interface SharedHeaderProps {
  /** "chart" floats over a dark .sea hero until scroll; "solid" is always paper;
   *  "sea" stays in sea-glass for a page that is dark water top to bottom. */
  variant?: "chart" | "solid" | "sea";
}

export function SharedHeader({ variant = "solid" }: SharedHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 40);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => setMenuOpen(false), [location]);
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [menuOpen]);

  const overSea = (variant === "chart" && !scrolled && !menuOpen) || (variant === "sea" && !menuOpen);
  const shell =
    variant === "sea" && scrolled && !menuOpen
      ? "bg-[rgba(13,24,28,.82)] backdrop-blur-md border-b border-[var(--sea-line)]"
      : overSea
        ? "bg-transparent"
        : "bg-background/95 backdrop-blur-md max-md:backdrop-blur-none max-md:bg-background border-b border-border";
  const ink = overSea ? "text-[var(--sea-text)]" : "text-foreground";
  const dim = overSea
    ? "text-[var(--sea-text-dim)] hover:text-[var(--sea-text)]"
    : "text-muted-foreground hover:text-foreground";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${shell}`}
      data-testid="header"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className={`flex items-center gap-2.5 ${ink}`} data-testid="link-logo">
          <ContourMark className={`h-7 w-7 ${overSea ? "text-[var(--teal-bright)]" : "text-primary"}`} />
          <span className="font-display text-xl font-bold tracking-[0.22em]">{BRAND}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = location === item.href || (item.href === "/departures" && location.startsWith("/departure"));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`font-display text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                  active ? ink : dim
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/apply"
            className={`rounded-sm px-5 py-2 font-display text-[13px] font-bold uppercase tracking-[0.18em] transition-colors ${
              overSea
                ? "bg-[var(--teal-bright)] text-[var(--sea-ink)] hover:bg-[var(--sea-text)]"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
            data-testid="button-apply-cta"
          >
            Apply
          </Link>
        </nav>

        <button
          className={`p-2 md:hidden ${ink}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          data-testid="button-mobile-menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* The menu on phones: a full sheet of water, links surfacing in order. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 top-[64px] z-40 flex flex-col bg-[rgba(13,24,28,.96)] backdrop-blur-md md:hidden"
            data-testid="mobile-menu"
          >
            <nav className="flex flex-1 flex-col justify-center gap-1 px-8" aria-label="Primary mobile">
              {NAV.map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
                  <Link
                    href={item.href}
                    className="flex items-baseline gap-4 border-b border-[var(--sea-line)] py-4 font-display text-4xl font-bold uppercase tracking-tight text-[var(--sea-text)] transition-colors hover:text-[var(--teal-bright)]"
                    data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <span className="coord text-[10px] text-[var(--teal-bright)]">{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, delay: 0.05 + NAV.length * 0.06, ease: [0.22, 1, 0.36, 1] }}>
                <Link
                  href="/apply"
                  className="mt-6 block rounded-sm bg-[var(--teal-bright)] py-3.5 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--sea-ink)]"
                  data-testid="button-mobile-apply"
                >
                  Apply for a departure
                </Link>
              </motion.div>
            </nav>
            <p className="coord px-8 pb-8 text-[10px] text-[var(--sea-text-dim)]">{BRAND} · {TAGLINE.toUpperCase()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
