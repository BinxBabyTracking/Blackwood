import { painted } from "@/art/painted";
import { FACE_SHAPES, type AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for S01 C04, The Informant. Every image and sound the
 * case uses is referenced here by key and nowhere else. Placeholders live
 * under public/cases/S001C04/ (npm run assets:placeholders -- S001C04).
 *
 * Paintings are art/pending/S001C04.json ids prefixed `s001c04_`, style
 * "s001". The hub is C003's Pittsburgh field office, so the office painting,
 * its desk objects, Bennett's portrait and the interface paintings (other than
 * the map) are borrowed from C003, as S01 C01 does. Dr. Lockhart is S01 C01's
 * Lockhart; Julian Rourke and Det. Nadia Collins are S01 C02's: their
 * portraits are borrowed (C02's keep their placeholders until painted).
 */
const base = "/cases/S001C04";

const locations = [
  "office",
  "cafe",
  "apt_building",
  "claire_apt",
  "records_center",
  "corbett_home",
  "clearwater",
  "prentiss_apt",
  "storage",
  "safe_house",
  "tate_office",
  "holding_house",
  "police",
];
const characters = ["donovan", "tate", "rourke", "lockhart", "castell", "prentiss", "patel", "corbett", "halvorsen", "collins", "harris", "lang", "bennett"];
/** Scene objects drawn over the background as sprites (desk deliveries, the note at the café, the rolling board). */
const objects = ["report_folder", "archive_folder", "police_envelope", "property_envelope", "cafe_envelope", "rolling_board"];
const evidence = Array.from({ length: 42 }, (_, i) => `E${String(i + 1).padStart(3, "0")}`);

/** Painted artwork written by scripts/import-art.mjs. Anything not painted yet keeps its placeholder. */
const art = (id: string) => painted[id]?.url ?? null;

const placeholders: AssetManifest = {
  images: {
    ...Object.fromEntries(locations.map((k) => [`loc.${k}`, `${base}/locations/${k}.svg`])),
    ...Object.fromEntries(characters.map((k) => [`char.${k}`, `${base}/characters/${k}.svg`])),
    ...Object.fromEntries(evidence.map((k) => [`ev.${k}`, `${base}/evidence/${k.toLowerCase()}.svg`])),
    ...Object.fromEntries(objects.map((k) => [`obj.${k}`, `${base}/objects/${k}.svg`])),
  },
  audio: {
    // Music and room sound, made on the Admin page and served from storage (see soundtrack.ts).
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/S001C04/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
  },
};

/** Borrowed: the same Pittsburgh office and Bennett (C003), Lockhart (S01 C01), Rourke and Collins (S01 C02), and the series' rolling board. */
const SHARED: Record<string, string> = {
  "loc.office": "c003_loc_office",
  "char.bennett": "c003_portrait_bennett",
  "char.lockhart": "s001c01_portrait_lockhart",
  "char.rourke": "s001c02_portrait_rourke",
  "char.collins": "s001c02_portrait_collins",
  // The series' rolling board: one painting for every S001 case.
  "obj.rolling_board": "s001_obj_rolling_board",
};

/** Which generated image replaces which asset key, once painted. */
const PAINTED: Record<string, string> = {
  ...Object.fromEntries(locations.filter((l) => !SHARED[`loc.${l}`]).map((l) => [`loc.${l}`, `s001c04_loc_${l}`])),
  ...Object.fromEntries(characters.filter((c) => !SHARED[`char.${c}`]).map((c) => [`char.${c}`, `s001c04_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `s001c04_ev_${e.toLowerCase()}`])),
  ...Object.fromEntries(objects.filter((o) => !SHARED[`obj.${o}`]).map((o) => [`obj.${o}`, `s001c04_obj_${o}`])),
  ...SHARED,
};

/** People and objects drawn over the painted scenes (hotspot `art` keys), by painting id. Only present once painted. */
const OVERLAYS: Record<string, string> = {
  obj_notebook: "c003_obj_notebook",
  obj_mailtray: "c003_obj_mailtray",
  obj_deskphone: "c003_obj_deskphone",
  ...Object.fromEntries(["donovan", "tate", "castell", "prentiss", "patel", "corbett", "halvorsen", "harris", "lang"].map((p) => [`figure_${p}`, `s001c04_figure_${p}`])),
};

/** Interface paintings: the case's own map; the rest borrowed from C003. */
const UI: Record<string, string> = {
  map: "s001c04_map",
  ...Object.fromEntries(["obj_notebook", "obj_evidence_bag", "obj_phone", "travel_drive_far", "travel_drive_near", "travel_drive_car", "travel_walk"].map((k) => [k, `c003_${k}`])),
};

/** People with a talking portrait: their portrait plus six frames (see docs/artwork-studio.md). Borrowed people keep their own case's frames. */
const TALKERS = ["donovan", "tate", "rourke", "lockhart", "castell", "prentiss", "patel", "corbett", "halvorsen", "collins", "harris", "lang", "bennett"];
const PREFIX: Record<string, string> = { bennett: "c003", lockhart: "s001c01", rourke: "s001c02", collins: "s001c02" };
const prefix = (p: string) => PREFIX[p] ?? "s001c04";
/** Which image is each mouth shape. The portrait itself is the closed mouth. */
const FRAME: Record<string, (p: string) => string> = {
  rest: (p) => `${prefix(p)}_portrait_${p}`,
  slight: (p) => `${prefix(p)}_${p}_mouth_open_slight`,
  ah: (p) => `${prefix(p)}_${p}_mouth_ah`,
  ee: (p) => `${prefix(p)}_${p}_mouth_ee`,
  oh: (p) => `${prefix(p)}_${p}_mouth_oh`,
  oo: (p) => `${prefix(p)}_${p}_mouth_oo`,
  f: (p) => `${prefix(p)}_${p}_mouth_f`,
  blink: (p) => `${prefix(p)}_${p}_blink`,
};

/** Built again when Admin makes a new painting live (see refreshArt in the registry). */
export const buildAssets = (): AssetManifest => ({
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
    ...Object.fromEntries(Object.entries(OVERLAYS).flatMap(([k, id]) => (art(id) ? [[`art.${k}`, art(id)!]] : []))),
    ...Object.fromEntries(Object.entries(UI).flatMap(([k, id]) => (art(id) ? [[`ui.${k}`, art(id)!]] : []))),
    // Talking portraits (scripts/build-faces.py): face.<person>.<shape>, present only once painted.
    ...Object.fromEntries(TALKERS.flatMap((c) => FACE_SHAPES.flatMap((sh) => (art(FRAME[sh](c)) ? [[`face.${c}.${sh}`, art(FRAME[sh](c))!]] : [])))),
  },
  audio: placeholders.audio,
});

export const assets = buildAssets();
