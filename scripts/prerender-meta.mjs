// Post-build step: emit one static HTML file per departure with correct
// <title> and Open Graph tags baked in. Crawlers that never run JavaScript
// (most link unfurlers) otherwise see only the site-wide defaults.
//
// Each page is written as departure/<id>/index.html — Vercel serves
// directory indexes from the filesystem before the SPA rewrite kicks in,
// and the file still loads the normal bundle so routing behaves as before.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist", "public");
const BASE = "https://farwater.vercel.app";

const DEPARTURES = [
  { id: "cortez-crossing", code: "FW-001", title: "The Cortez Crossing", country: "Mexico", desc: "Seven days of expedition spearfishing in Baja California Sur — yellowtail, wahoo and yellowfin on the far side of the Sea of Cortez. Eight guns, founding rates." },
  { id: "azuero-line", code: "FW-002", title: "The Azuero Line", country: "Panama", desc: "Eight days on Panama's tuna coast — cubera in the white water, yellowfin outside, roosterfish on the rod days. Forming for the 2028 dry season." },
  { id: "ninth-island", code: "FW-003", title: "The Ninth Island", country: "Portugal", desc: "Mid-Atlantic amberjack and wahoo over the volcanic banks of the Azores. Six guns, high-summer window, serious water." },
  { id: "doggie-belt", code: "SCOUT-01", title: "The Doggie Belt", country: "Vanuatu", desc: "Dogtooth tuna on the Pacific reef passes — a self-funded scouting expedition, filmed and unbookable until we've dived it ourselves." },
];

const template = readFileSync(join(outDir, "index.html"), "utf8");

const setMeta = (html, attr, name, content) =>
  html.replace(
    new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`),
    `$1${content}$2`
  );

for (const d of DEPARTURES) {
  const title = `${d.title} — ${d.code}, ${d.country} — FARWATER`;
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  for (const [name, content] of [
    ["og:title", title],
    ["og:description", d.desc],
    ["og:url", `${BASE}/departure/${d.id}`],
  ]) {
    html = setMeta(html, "property", name, content);
  }
  for (const [name, content] of [
    ["description", d.desc],
    ["twitter:title", title],
    ["twitter:description", d.desc],
  ]) {
    html = setMeta(html, "name", name, content);
  }
  mkdirSync(join(outDir, "departure", d.id), { recursive: true });
  writeFileSync(join(outDir, "departure", d.id, "index.html"), html);
  console.log(`prerendered departure/${d.id}/index.html`);
}
