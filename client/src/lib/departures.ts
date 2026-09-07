// The founding slate. One file is the whole catalogue: the list page, the
// detail pages, the application flow and search all read from here, so a
// departure exists exactly once. Honesty rules carried over from the sibling
// company: no invented history, no fake scarcity — eight guns per departure
// is the real boat limit, and anything unverified says so.

export type DepartureStatus = "open" | "forming" | "scouting";

export interface Departure {
  id: string;
  code: string;
  title: string;
  place: string;
  country: string;
  coords: string;
  status: DepartureStatus;
  window: string;
  days: number;
  guns: number;
  from?: string; // founding rate; absent while forming/scouting
  species: string[];
  tagline: string;
  /** Month indexes (0–11) — drawn on the season chart. */
  months: { on: number[]; peak: number[] };
  overview: string;
  water: string;
  rhythm: string[];
  requirements: string[];
  straight: string; // the honest paragraph — what we can and can't claim yet
}

export const DEPARTURES: Departure[] = [
  {
    id: "cortez-crossing",
    code: "FW-001",
    title: "The Cortez Crossing",
    place: "Baja California Sur",
    country: "Mexico",
    coords: "24.1426° N, 110.3128° W",
    status: "open",
    window: "JUN — OCT 2027",
    days: 7,
    guns: 8,
    from: "$8,500",
    species: ["Yellowtail", "Wahoo", "Yellowfin tuna", "Pargo"],
    tagline: "Cousteau called it the world's aquarium. We fish the far side of it.",
    months: { on: [4, 9, 10], peak: [5, 6, 7, 8] },
    overview:
      "Seven days out of Baja Sur with a proven local operation: panga runs at first light to offshore seamounts and current lines, two hunting sessions a day built around bait and tide, evenings back at a private camp on the Cortez side. This is the founding departure — the water every serious bluewater hunter should start with, run to a standard most have never seen it at.",
    water:
      "Working depths 10–25 m over structure and blue water. Warm season brings the pelagics up the ridge: yellowtail on the high spots, wahoo on the edges, and the chance of a real yellowfin any day the current runs. Visibility swings with the plankton — honest range 8–30 m.",
    rhythm: [
      "05:30 — coffee, brief, bait report. On the water before the light gets hard.",
      "Morning session — structure hunting on the marks while the current is right.",
      "Midday — back for food and shade; film review from the morning's cameras.",
      "Afternoon session — blue water drifts on the chum line.",
      "Evening — the day's fish cooked properly, next day planned like a small briefing.",
    ],
    requirements: [
      "Recognized freedive certification (PFI, FII or Molchanovs L1 minimum) — or complete our partnered course before departure",
      "Comfortable working 15 m repeatedly",
      "DAN or equivalent dive-evacuation coverage (required, checked)",
      "Own gun and wetsuit preferred; quality loaner gear arranged on request",
    ],
    straight:
      "Straight with you: this is our first commercial departure. The boat, camp and local guides are an established operation with years on this water; the Farwater layer — hosting, safety protocol, filming — is what we add, and a named professional co-leads the week. Eight guns, first season pricing, and you will be on camera helping us prove the standard.",
  },
  {
    id: "azuero-line",
    code: "FW-002",
    title: "The Azuero Line",
    place: "Azuero Peninsula",
    country: "Panama",
    coords: "7.4106° N, 80.1745° W",
    status: "forming",
    window: "JAN — APR 2028",
    days: 8,
    guns: 8,
    species: ["Cubera snapper", "Yellowfin tuna", "Roosterfish", "Amberjack"],
    tagline: "Where the Tuna Coast drops off the map.",
    months: { on: [3, 4, 5, 6, 7, 8, 11], peak: [0, 1, 2] },
    overview:
      "Eight days on Panama's Pacific shoulder, where the Azuero Peninsula pushes into the tuna highway. Cubera in the white water, yellowfin outside, roosterfish for the rod-and-reel days — a two-discipline week by design, split between gun and rod as conditions call it.",
    water:
      "Rock structure and current seams close to shore, blue water minutes out. Dry-season glass-off mornings, working depths 8–20 m inshore. The cubera hunt is close, violent and personal; the tuna work is patience and lungs.",
    rhythm: [
      "Split program daily: spear or rod by conditions, never by schedule.",
      "Inshore mornings on the rock lines; offshore afternoons when the birds show.",
      "One layday mid-week — surf, rest, or back out if the bite demands it.",
    ],
    requirements: [
      "Freedive certification for gun days (same standard as every departure)",
      "No certification needed for rod-only guests — this is the departure to bring the crossover partner",
      "DAN or equivalent coverage",
    ],
    straight:
      "Forming, not open: we are finalizing the operator block and pricing for the 2028 dry season. Apply now and you hear terms first, before it goes on this page.",
  },
  {
    id: "ninth-island",
    code: "FW-003",
    title: "The Ninth Island",
    place: "Azores",
    country: "Portugal",
    coords: "38.7216° N, 27.2206° W",
    status: "open",
    window: "JUL — AUG 2027",
    days: 7,
    guns: 6,
    from: "$9,200",
    species: ["Amberjack", "Wahoo", "Barracuda", "Bonito"],
    tagline: "Mid-Atlantic volcanoes, water the color of bottle glass.",
    months: { on: [5, 8], peak: [6, 7] },
    overview:
      "Seven days in the Azores high summer: volcanic banks rising from real ocean, big Atlantic amberjack on the marks, wahoo running the temperature breaks. European bluewater at its most serious, with the quietest coastline in the Atlantic to come home to each night.",
    water:
      "Deep clear Atlantic over volcanic structure — banks topping out at 15–30 m, visibility that can hit 40 m on the right day, and weather that decides the program daily. This is a departure for divers who like their water with consequences.",
    rhythm: [
      "Weather brief at dawn — the Atlantic sets the day, we choose from what it allows.",
      "Bank sessions on the marks when the window is open.",
      "Lee-shore reef days when it isn't — smaller fish, absurd visibility.",
      "Evenings in a village that has fished these banks for five hundred years.",
    ],
    requirements: [
      "Freedive certification, and honest comfort at 20 m — the banks start deep",
      "Six guns, not eight: smaller boat, tighter team",
      "DAN or equivalent coverage",
    ],
    straight:
      "Same honesty as FW-001: first season, established local skipper, our standard layered on top, professional co-lead in the water. The Azores will humble a spearo who overstates his depth — the application call is where we make sure it doesn't.",
  },
  {
    id: "doggie-belt",
    code: "SCOUT-01",
    title: "The Doggie Belt",
    place: "Efate & outer reefs",
    country: "Vanuatu",
    coords: "17.7404° S, 168.3210° E",
    status: "scouting",
    window: "SEP — DEC · year TBD",
    days: 10,
    guns: 6,
    species: ["Dogtooth tuna", "Wahoo", "Giant trevally"],
    tagline: "The fish that ends arguments. The season we build toward.",
    months: { on: [8, 11], peak: [9, 10] },
    overview:
      "Dogtooth tuna on the Pacific reef passes — the apex trip of this sport, and the one we refuse to sell before we have run it ourselves. SCOUT-01 is exactly what it says: a scouting expedition, self-funded, filmed, to build the operator relationships and safety picture a commercial departure needs.",
    water:
      "Reef passes and drop-offs, serious current, serious fish. Doggie water is unforgiving of shortcuts, which is why this page will not take your money yet.",
    rhythm: ["Published when it's real. The scout film will show you everything, including what went wrong."],
    requirements: ["Not bookable. Join the list and you'll see the scout film before anyone else."],
    straight:
      "Nothing here is for sale. When a Vanuatu departure opens, it will be because we dove it first, know its moods, and have the evacuation plan written. That is the whole company in one sentence.",
  },
];

export const OPEN_DEPARTURES = DEPARTURES.filter((d) => d.status !== "scouting");

export function departureById(id: string): Departure | undefined {
  return DEPARTURES.find((d) => d.id === id);
}

export const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export const STATUS_LABEL: Record<DepartureStatus, string> = {
  open: "Applications open",
  forming: "Forming — terms soon",
  scouting: "In scouting — not bookable",
};
