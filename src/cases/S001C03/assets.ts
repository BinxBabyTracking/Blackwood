import { painted } from "@/art/painted";
import { FACE_SHAPES, type AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for S01 C03, Dead Freight. Every image and sound the
 * case uses is referenced here by key and nowhere else. Placeholders live
 * under public/cases/S001C03/ (npm run assets:placeholders -- S001C03).
 *
 * Paintings are art/pending/S001C03.json ids prefixed `s001c03_`, style
 * "s001". The hub is C003's Pittsburgh field office, so the office painting,
 * its desk objects, Bennett's portrait and the interface paintings (other than
 * the map) are borrowed from C003, as S01 C01 does. Adrian Holt is S01 C01's
 * Holt and Julian Rourke is S01 C02's Rourke: their portraits are borrowed
 * (Rourke's keeps its placeholder until C02's painting exists).
 */
const base = "/cases/S001C03";

const locations = [
  "office",
  "terminal_gate",
  "staging",
  "verification",
  "gear_building",
  "security",
  "navarro_home",
  "gaffney_office",
  "kane_office",
  "kane_office_searched",
  "fisk_yard",
  "accounting",
  "police",
  "riverside",
];
const characters = ["hector", "marisol", "gaffney", "kane", "fisk", "rourke", "holt", "lindqvist", "malone", "sullivan", "whitaker", "walsh", "bennett"];
/** Scene objects drawn over the background as sprites (desk deliveries, scene states, the rolling board). */
const objects = ["labfolder", "report_folder", "envelope_sealed", "envelope_open", "police_envelope", "rolling_board", "search_team", "safe_open", "locker_door_open", "notebook_rag"];
const evidence = Array.from({ length: 40 }, (_, i) => `E${String(i + 1).padStart(3, "0")}`);

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
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/S001C03/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
  },
};

/** Borrowed: the same Pittsburgh office and Bennett (C003), Holt (S01 C01), Rourke (S01 C02), and the series' rolling board. */
const SHARED: Record<string, string> = {
  "loc.office": "c003_loc_office",
  "char.bennett": "c003_portrait_bennett",
  "char.holt": "s001c01_portrait_holt",
  "char.rourke": "s001c02_portrait_rourke",
  // The series' rolling board: one painting for every S001 case.
  "obj.rolling_board": "s001_obj_rolling_board",
};

/** Which generated image replaces which asset key, once painted. */
const PAINTED: Record<string, string> = {
  ...Object.fromEntries(locations.filter((l) => !SHARED[`loc.${l}`]).map((l) => [`loc.${l}`, `s001c03_loc_${l}`])),
  ...Object.fromEntries(characters.filter((c) => !SHARED[`char.${c}`]).map((c) => [`char.${c}`, `s001c03_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `s001c03_ev_${e.toLowerCase()}`])),
  ...Object.fromEntries(objects.filter((o) => !SHARED[`obj.${o}`]).map((o) => [`obj.${o}`, `s001c03_obj_${o}`])),
  ...SHARED,
};

/** People and objects drawn over the painted scenes (hotspot `art` keys), by painting id. Only present once painted. */
const OVERLAYS: Record<string, string> = {
  obj_casefile: "s001c03_obj_casefile",
  obj_fisk_truck: "s001c03_obj_fisk_truck",
  obj_notebook: "c003_obj_notebook",
  obj_mailtray: "c003_obj_mailtray",
  obj_deskphone: "c003_obj_deskphone",
  ...Object.fromEntries(["marisol", "gaffney", "kane", "fisk", "lindqvist", "malone", "sullivan", "whitaker", "walsh"].map((p) => [`figure_${p}`, `s001c03_figure_${p}`])),
};

/** Interface paintings: the case's own map; the rest borrowed from C003's western Pennsylvania. */
const UI: Record<string, string> = {
  map: "s001c03_map",
  ...Object.fromEntries(["obj_notebook", "obj_evidence_bag", "obj_phone", "travel_drive_far", "travel_drive_near", "travel_drive_car", "travel_walk"].map((k) => [k, `c003_${k}`])),
};

/** People with a talking portrait: their portrait plus six frames (see docs/artwork-studio.md). Borrowed people keep their own case's frames. */
const TALKERS = ["marisol", "gaffney", "kane", "fisk", "rourke", "holt", "lindqvist", "malone", "sullivan", "whitaker", "walsh", "bennett"];
const PREFIX: Record<string, string> = { bennett: "c003", holt: "s001c01", rourke: "s001c02" };
const prefix = (p: string) => PREFIX[p] ?? "s001c03";
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
