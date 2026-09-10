import { type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { SharedHeader } from "@/components/shared-header";
import { SiteFooter } from "@/components/site-footer";
import { Chatbot } from "@/components/chatbot";
import { useLenis } from "@/hooks/use-lenis";
import { MarineSnow } from "@/components/descent/marine-snow";
import { DepthGauge, type Chapter } from "@/components/descent/depth-gauge";
import { DepthLayers } from "@/components/descent/depth-layers";
import { Reticle } from "@/components/descent/reticle";
import { Ambience } from "@/components/descent/ambience";

// One shell for every page of the descent: inertial scroll, the reticle,
// contour layers that slide behind the page, marine snow, the depth gauge
// reading this page's chapters (and jumping to them), the sound switch,
// water that darkens with depth, and the sea-glass header. Pages bring
// their chapters and their content. There is no enter screen: the page is
// the opening.

interface ShellProps {
  chapters: Chapter[];
  children: ReactNode;
  snow?: number;
  footer?: boolean;
  chat?: boolean;
  layers?: boolean;
  className?: string;
}

export function DescentShell({ chapters, children, snow = 80, footer = true, chat = true, layers = true, className = "" }: ShellProps) {
  useLenis(true);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  const water = useTransform(progress, [0, 0.55, 1], ["#0d181c", "#081215", "#03080a"]);

  return (
    <motion.div className={`sea relative min-h-screen ${className}`} style={{ backgroundColor: water }} data-testid="descent">
      {layers && <DepthLayers progress={progress} />}
      <Reticle />
      <MarineSnow count={snow} />
      <DepthGauge progress={progress} chapters={chapters} />
      <Ambience />
      <SharedHeader variant="sea" />
      <main className="relative z-[2]">{children}</main>
      {footer && <SiteFooter />}
      {chat && <Chatbot />}
    </motion.div>
  );
}

/** Kicker + headline pair used at the top of every inner page. */
export function PageHead({ kicker, title, children, className = "" }: { kicker: string; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <p className="coord text-xs text-[var(--teal-bright)]">{kicker.toUpperCase()}</p>
      <h1 className="mt-4 font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight text-[var(--sea-text)] sm:text-7xl md:text-8xl" style={{ textWrap: "balance" }}>
        {title}
      </h1>
      {children}
    </motion.header>
  );
}

/** A band of instrument text sailing past — coordinates, codes, windows. */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`marquee border-y border-[var(--sea-line)] py-3 ${className}`} aria-hidden data-testid="marquee">
      <div className="marquee-track">
        {row.map((it, i) => (
          <span key={i} className="coord text-[11px] text-[var(--sea-text-dim)]">
            <span className="text-[var(--teal-bright)]">◆</span>&nbsp;&nbsp;{it}
          </span>
        ))}
      </div>
    </div>
  );
}
