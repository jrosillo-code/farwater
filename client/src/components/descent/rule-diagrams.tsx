// Briefing diagrams for the Standard: six small line drawings in chart ink,
// one per rule. Geometry only — a surface line, diver marks, a boat, a route —
// so they read as instrument glyphs, not illustration.
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Surface() {
  return <path d="M4 14c8 0 8 4 16 4s8-4 16-4 8 4 16 4 8-4 16-4 8 4 16 4 8-4 16-4" {...stroke} opacity=".6" />;
}
function Diver({ x, y, lead = false }: { x: number; y: number; lead?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="3" {...stroke} fill={lead ? "currentColor" : "none"} />
      <path d={`M${x} ${y + 3}v9M${x - 5} ${y + 7}h10M${x} ${y + 12}l-4 6M${x} ${y + 12}l4 6`} {...stroke} />
    </g>
  );
}

export const RULE_DIAGRAMS: Record<string, () => JSX.Element> = {
  // 01 — we dove it first: a route from the boat to an X, ticked
  "01": () => (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      <Surface />
      <path d="M14 14l6-6h12l4 6" {...stroke} />
      <path d="M22 20c10 14 30 18 46 30 10 8 18 14 30 12" {...stroke} strokeDasharray="3 4" />
      <path d="M90 56l10 10M100 56l-10 10" {...stroke} />
      <path d="M100 24l4 4 8-8" {...stroke} />
    </svg>
  ),
  // 02 — a named safety lead in the water: the filled diver among the others
  "02": () => (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      <Surface />
      <Diver x={30} y={30} />
      <Diver x={60} y={26} lead />
      <Diver x={90} y={32} />
      <circle cx="60" cy="38" r="20" {...stroke} strokeDasharray="2 4" opacity=".7" />
    </svg>
  ),
  // 03 — one up, one down: one at the surface, one below, tied by a line
  "03": () => (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      <Surface />
      <Diver x={40} y={22} />
      <Diver x={80} y={54} />
      <path d="M40 42v14M46 42l34 12" {...stroke} strokeDasharray="2 4" />
      <path d="M8 56h10M8 68h10" {...stroke} opacity=".5" />
      <text x="20" y="59" fontSize="6" fill="currentColor" fontFamily="IBM Plex Mono, monospace" opacity=".7">−15</text>
      <text x="20" y="71" fontSize="6" fill="currentColor" fontFamily="IBM Plex Mono, monospace" opacity=".7">−20</text>
    </svg>
  ),
  // 04 — evacuation plan: boat → shore → chamber, arrows first
  "04": () => (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      <Surface />
      <path d="M10 30l6-6h12l4 6" {...stroke} />
      <path d="M34 28h22M52 24l4 4-4 4" {...stroke} />
      <path d="M60 36l8-10 8 10" {...stroke} />
      <path d="M78 28h18M92 24l4 4-4 4" {...stroke} />
      <rect x="98" y="20" width="16" height="16" {...stroke} />
      <path d="M106 24v8M102 28h8" {...stroke} />
      <text x="12" y="66" fontSize="6" fill="currentColor" fontFamily="IBM Plex Mono, monospace" opacity=".7">WRITTEN BEFORE INVOICE</text>
    </svg>
  ),
  // 05 — small boats forever: eight marks in one hull, never more
  "05": () => (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      <Surface />
      <path d="M18 40h84l-12 20H30z" {...stroke} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={30 + i * 8.6} cy="30" r="2.2" {...stroke} fill="currentColor" />)}
      <text x="24" y="74" fontSize="6" fill="currentColor" fontFamily="IBM Plex Mono, monospace" opacity=".7">8 GUNS MAX · MORE BOATS, NOT MORE PEOPLE</text>
    </svg>
  ),
  // 06 — weather has the last word: wind, and the boat at anchor
  "06": () => (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      <Surface />
      <path d="M10 26h30M14 34h22M18 42h14" {...stroke} opacity=".6" />
      <path d="M70 30l6-6h14l4 6" {...stroke} />
      <path d="M84 36v18M78 50c2 6 10 6 12 0M84 40h-4M84 40h4" {...stroke} />
      <text x="62" y="72" fontSize="6" fill="currentColor" fontFamily="IBM Plex Mono, monospace" opacity=".7">SAFETY LEAD CALLS IT</text>
    </svg>
  ),
};

export function RuleDiagram({ n, className = "" }: { n: string; className?: string }) {
  const D = RULE_DIAGRAMS[n];
  if (!D) return null;
  return (
    <div className={`text-[var(--teal-bright)] ${className}`} data-testid={`rule-diagram-${n}`}>
      <D />
    </div>
  );
}
