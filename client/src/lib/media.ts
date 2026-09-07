// Curated media — researched from Pexels (free license, no attribution
// required, hotlink-friendly CDN; the hero section already streams Pexels
// video the same way). Keys mirror the original attached_assets filenames so
// swapping any entry for an owned/local asset later is a one-line change.
const img = (id: number, w = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const MEDIA: Record<string, string> = {
  // ── pillars / mood ──
  "stock_images/aerial_view_mountain_771f3480.jpg": img(12315223), // Matterhorn in clouds at sunrise
  "stock_images/desert_dunes_morocco_5d629ce9.jpg": img(30757346), // Sahara dunes, Morocco
  "stock_images/tropical_ocean_islan_60d51698.jpg": img(29464869), // island + blue ocean
  "stock_images/jungle_rainforest_ad_8a15559b.jpg": img(88819),    // sunlit jungle

  // ── months ──
  "stock_images/snowy_mountain_winte_26197a98.jpg": img(1287145),  // Jan — alpenglow peak + moon
  "stock_images/romantic_beach_sunse_fb4170bc.jpg": img(32267913), // Feb — overwater sunset
  "stock_images/cherry_blossom_sprin_ce39e7dd.jpg": img(31071545), // Mar — Fuji + blossoms
  "stock_images/safari_africa_wildli_d17fb7a3.jpg": img(17820390), // Apr — lions on safari
  "stock_images/european_mediterrane_f935b582.jpg": img(19990859), // May — Positano + flowers
  "stock_images/tropical_island_para_84d2ed84.jpg": img(30447886), // Jun — tropical aerial
  "stock_images/greek_islands_summer_22f53eea.jpg": img(16511642), // Jul — Oia aerial
  "stock_images/northern_lights_icel_d2b45ee2.jpg": img(32154420), // Aug — Kirkjufell aurora
  "stock_images/vineyard_wine_harves_76199fdc.jpg": img(5370804),  // Sep — vast vineyard
  "stock_images/himalayan_mountains__62bd3e7d.jpg": img(20839121), // Oct — Everest
  "stock_images/botswana_safari_wild_39131197.jpg": img(5985284),  // Nov — savanna elephants
  "stock_images/tropical_beach_holid_19b1ca0f.jpg": img(30973624), // Dec — Maldives beach

  // ── destinations / detail pages ──
  "stock_images/amalfi_coast_italy_c_47120d19.jpg": img(32501472),
  "stock_images/bora_bora_overwater__19cf39a1.jpg": img(1287455),
  "stock_images/fiji_tropical_island_eaaf756d.jpg": img(14222326),
  "stock_images/iceland_northern_lig_5d791936.jpg": img(17214262),
  "stock_images/japan_cherry_blossom_64792caa.jpg": img(15109259), // Chureito pagoda + Fuji
  "stock_images/maldives_overwater_b_99c5bf07.jpg": img(28843967),
  "stock_images/morocco_desert_camel_16c0ed18.jpg": img(30710173), // camel caravan
  "stock_images/nepal_himalayas_moun_9d8b4f66.jpg": img(29228180), // Annapurna
  "stock_images/patagonia_glacier_mo_1c0f2ef7.jpg": img(25067987), // Torres del Paine
  "stock_images/swiss_alps_mountain__e0f0ff3f.jpg": img(15086273), // Matterhorn sunset
  "stock_images/tanzania_safari_elep_7d56a0d1.jpg": img(5985284),
  "stock_images/tuscany_vineyard_win_ab92a196.jpg": img(27659795), // cypress hills

  // ── mission pages ──
  "stock_images/conservation_wildlif_d0bedb1b.jpg": img(20839121), // Everest — the wild places we commit to protect
  "stock_images/local_community_cult_d6accc8e.jpg": img(5275480),  // eagle hunters on horseback
  "stock_images/sustainable_eco-frie_cb0317fc.jpg": img(23515065), // lush rainforest

  // ── adventure stills ──
  "sebastian-boring-8zD7rs8UpxU-unsplash_1764990946831.jpg": img(34584160), // alpine sunrise
  "sebastian-boring-8zD7rs8UpxU-unsplash_1764996645593.jpg": img(21533323), // Torres del Paine park

  // ── expedition films ──
  "kazakhstan-web.mp4": "/videos/kazakhstan-web.mp4", // canyon river aerial, no people (self-hosted)
  "kyrgyzstan-web.mp4": "/videos/kyrgyzstan-web.mp4", // green mountain river aerial (self-hosted)
  "mongolia-web.mp4": "/videos/gobi-web.mp4", // dune drone — Gobi mood, no people (self-hosted)
  "adventure-web.mp4": "/videos/adventure-web.mp4", // real brand footage
  "bhutan-web.mp4": "/videos/himalaya-web.mp4", // Ladakh Himalaya drone — Thunder Dragon mood (self-hosted)
  "expeditions-hero-web.mp4": "/videos/himalaya-web.mp4", // Himalaya ridge drone — transformation, 60fps (self-hosted)
  "12004059_1920_1080_30fps_1765009552268.mp4": "/videos/12004059.mp4", // real brand footage
  "14862479-hd_1920_1080_60fps_1765009387935.mp4": "/videos/nepal-web.mp4", // self-hosted
};

// ── Phone-sized encodes ─────────────────────────────────────────────────────
// Every clip ships twice. The originals are 1080p at roughly 2 Mbps, which is
// right for a desktop hero and absurd on a 390px-wide screen — where
// object-cover discards most of each frame before anyone sees it. The `-m`
// variants are 720p at crf 28 and land between a tenth and a fifth of the
// bytes: the difference between a hero that is simply there and one that keeps
// you waiting on cellular.
//
// Decided once, at module load, deliberately. A visitor is not going to change
// device mid-session, and re-deciding per render would risk swapping the src
// out from under an element that is already playing.
export const COMPACT_MEDIA =
  typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches;

/** The right encode of `src` for this device — untouched on desktop. */
export function videoSrc(src: string): string {
  return COMPACT_MEDIA && src.endsWith(".mp4") ? src.replace(/\.mp4$/, "-m.mp4") : src;
}

// Matching first-frame stills (CI-extracted) so every ambient video fades in
// from its own scene instead of a black rectangle while it buffers. Keyed by
// the DESKTOP path, so look posters up before calling videoSrc().
export const VIDEO_POSTERS: Record<string, string> = {
  "/videos/gobi-web.mp4": "/images/gobi-poster.jpg",
  "/videos/kazakhstan-web.mp4": "/images/kazakhstan-web-poster.jpg",
  "/videos/kyrgyzstan-web.mp4": "/images/kyrgyzstan-web-poster.jpg",
  "/videos/himalaya-web.mp4": "/images/himalaya-web-poster.jpg",
  "/videos/nepal-web.mp4": "/images/nepal-web-poster.jpg",
  "/videos/adventure-web.mp4": "/images/adventure-web-poster.jpg",
  "/videos/12004059.mp4": "/images/indonesia-web-poster.jpg",
  "/films-hero-video.mp4": "/images/films-hero-poster.jpg",
};
