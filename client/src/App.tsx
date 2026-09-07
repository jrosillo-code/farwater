import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePageTracking } from "@/hooks/use-analytics";
import { captureAttribution } from "@/lib/attribution";
import { MotionConfig } from "framer-motion";
import { BRAND } from "@/lib/brand";

import Home from "@/pages/home";

// Route-level code splitting: the landing page loads instantly; every other
// page arrives as its own chunk on first visit.
const Departures = lazy(() => import("@/pages/departures"));
const DepartureDetail = lazy(() => import("@/pages/departure-detail"));
const Standard = lazy(() => import("@/pages/standard"));
const About = lazy(() => import("@/pages/about"));
const Apply = lazy(() => import("@/pages/apply"));
const Ledger = lazy(() => import("@/pages/ledger"));
const NotFound = lazy(() => import("@/pages/not-found"));
const PrivacyPage = lazy(() => import("@/pages/legal").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("@/pages/legal").then((m) => ({ default: m.TermsPage })));
const AdminPage = lazy(() => import("@/pages/admin"));

// Quiet, on-brand loading state between chunks — held back for a beat so a
// chunk that arrives in 80ms never flashes a loading screen.
function RouteFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 180);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <span className="animate-pulse font-display text-xs uppercase tracking-[0.4em] text-primary/70">
        {BRAND}
      </span>
    </div>
  );
}

// Every lazy route, keyed by the path that reaches it. Same import specifiers
// as the lazy() calls above, so Vite resolves them to the same chunks and a
// prefetch genuinely warms the thing the click will need.
const ROUTE_CHUNKS: Record<string, () => Promise<unknown>> = {
  "/departures": () => import("@/pages/departures"),
  "/standard": () => import("@/pages/standard"),
  "/about": () => import("@/pages/about"),
  "/apply": () => import("@/pages/apply"),
  "/ledger": () => import("@/pages/ledger"),
  "/privacy": () => import("@/pages/legal"),
  "/terms": () => import("@/pages/legal"),
};

// Fetch a route's chunk the moment someone shows INTENT to go there — a
// pointer resting on the link, or a finger landing on it — rather than when
// they commit. One delegated listener covers every link on the site.
function usePrefetchOnIntent() {
  useEffect(() => {
    const warmed = new Set<string>();
    const onIntent = (e: Event) => {
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a[href^='/']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const path = (anchor.getAttribute("href") ?? "").split(/[?#]/)[0];
      if (!path || warmed.has(path)) return;
      const load = path.startsWith("/departure/")
        ? () => import("@/pages/departure-detail")
        : ROUTE_CHUNKS[path];
      if (!load) return;
      warmed.add(path);
      void load().catch(() => warmed.delete(path));
    };
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("touchstart", onIntent, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("touchstart", onIntent);
    };
  }, []);
}

// One scroll policy for the whole app:
// - back/forward returns you to the exact spot you left
// - links with a #hash land smoothly on that section, even across pages
// - ordinary forward navigation starts at the top, instantly
const scrollPositions = new Map<string, number>();

function entryKey(): string | undefined {
  return (window.history.state as { __scrollKey?: string } | null)?.__scrollKey;
}

function useScrollManager() {
  const [location] = useLocation();
  const prevKey = useRef<string | undefined>(undefined);
  const lastNav = useRef(0);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    // pushState saves the exact offset synchronously, before the lazy route's
    // Suspense fallback collapses the page; the passive scroll listener keeps
    // each entry's last real position current for back/forward. The
    // ignore-window after any navigation keeps restoration scrolls from
    // polluting the saved values.
    const origPush = window.history.pushState.bind(window.history);
    window.history.pushState = ((...args: Parameters<History["pushState"]>) => {
      if (prevKey.current) scrollPositions.set(prevKey.current, window.scrollY);
      lastNav.current = Date.now();
      origPush(...args);
    }) as History["pushState"];
    const onPop = () => {
      lastNav.current = Date.now();
    };
    const onScroll = () => {
      if (Date.now() - lastNav.current < 400) return;
      if (prevKey.current) scrollPositions.set(prevKey.current, window.scrollY);
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.history.pushState = origPush;
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    lastNav.current = Date.now();
    // A key already on this history entry means the browser is traversing
    // (back/forward), not pushing.
    let key = entryKey();
    const isTraversal = key !== undefined;
    if (!key) {
      key = Math.random().toString(36).slice(2);
      window.history.replaceState(
        { ...((window.history.state as object | null) ?? {}), __scrollKey: key },
        ""
      );
    }
    prevKey.current = key;

    const hash = window.location.hash.slice(1);
    let cancelled = false;
    let tries = 90; // ~1.5s of frames for lazy chunks to land

    const attempt = (fn: () => boolean) => {
      const step = () => {
        if (cancelled) return;
        if (!fn() && tries-- > 0) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (isTraversal) {
      const y = scrollPositions.get(key) ?? 0;
      attempt(() => {
        if (y === 0 || document.documentElement.scrollHeight >= y + window.innerHeight) {
          window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
          return true;
        }
        return false;
      });
    } else if (hash) {
      attempt(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return true;
        }
        return false;
      });
    } else {
      // Explicitly instant: two-argument scrollTo(0, 0) inherits the global
      // CSS smooth behavior, which animates every ordinary link click.
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
    return () => {
      cancelled = true;
    };
  }, [location]);
}

const PAGE_TITLES: Record<string, string> = {
  "/": "FARWATER — Serious Water",
  "/departures": "Departures — FARWATER",
  "/standard": "The Standard — FARWATER",
  "/about": "About — FARWATER",
  "/apply": "Apply — FARWATER",
  "/ledger": "The Ledger — FARWATER",
  "/privacy": "Privacy — FARWATER",
  "/terms": "Terms — FARWATER",
  "/admin": "Chart Room — FARWATER",
};
function usePageTitle() {
  const [location] = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[location] ?? "FARWATER — Serious Water";
  }, [location]);
}

function Router() {
  const [location] = useLocation();
  useEffect(() => {
    captureAttribution();
  }, []);
  usePageTracking();
  useScrollManager();
  usePageTitle();
  usePrefetchOnIntent();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:text-foreground focus:outline focus:outline-2 focus:outline-primary"
      >
        Skip to content
      </a>
      <div id="main-content">
        <Suspense fallback={<RouteFallback />}>
          {/* Keyed per location: each page eases in instead of hard-swapping. */}
          <div key={location} className="route-fade">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/departures" component={Departures} />
              <Route path="/departure/:id" component={DepartureDetail} />
              <Route path="/standard" component={Standard} />
              <Route path="/about" component={About} />
              <Route path="/apply" component={Apply} />
              <Route path="/ledger" component={Ledger} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/privacy" component={PrivacyPage} />
              <Route path="/terms" component={TermsPage} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </Suspense>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* One switch for every framer-motion animation on the site: a visitor
          who has asked their OS to reduce motion gets transforms dropped and
          opacity kept, so the site still reads as composed rather than dead. */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
