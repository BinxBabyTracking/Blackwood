import { painted } from "@/art/painted";
import { FACE_SHAPES, type AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for Case C003. Every image and sound the case uses is
 * referenced here by key and nowhere else. Placeholders live under
 * public/cases/C003/ (npm run assets:placeholders -- C003). C003 is set in
 * 2018 and has its own painted style and its own office (art/manifest.json,
 * style "c003"), so nothing is borrowed from C001's paintings.
 */
const base = "/cases/C003";

/** Scene paintings. The Marsh house has a second painting for the night of October 29 (door open, lamp down). */
const locations = ["office", "alder_street", "police", "harts", "kowalski_house", "marsh_house", "marsh_house_after", "voss_office", "bell_garage", "shaw_yard", "annex", "riverside", "lab"];
const characters = ["rachel", "vivian", "graham", "lena", "cross", "reed", "voss", "bell", "shaw", "owen", "bennett", "jenna", "ethan", "caller"];
/** Scene objects that appear or change with events, drawn over the background. */
const objects = ["labfolder", "report_folder", "unit4"];
const evidence = Array.from({ length: 32 }, (_, i) => `e${String(i + 1).padStart(2, "0")}`);

/** Painted artwork written by scripts/import-art.mjs. Anything not painted yet keeps its placeholder. */
const art = (id: string) => painted[id]?.url ?? null;

const placeholders: AssetManifest = {
  images: {
    ...Object.fromEntries(locations.map((k) => [`loc.${k}`, `${base}/locations/${k}.svg`])),
    ...Object.fromEntries(characters.map((k) => [`char.${k}`, `${base}/characters/${k}.svg`])),
    ...Object.fromEntries(evidence.map((k) => [`ev.${k}`, `${base}/evidence/${k}.svg`])),
    ...Object.fromEntries(objects.map((k) => [`obj.${k}`, `${base}/objects/${k}.svg`])),
  },
  audio: {
    // Music and room sound, made on the Admin page and served from storage (see soundtrack.ts).
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/C003/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
    "rec.vivian1": null,
    "rec.lena1": null,
  },
};

/** Which generated image replaces which asset key, once painted. */
const PAINTED: Record<string, string> = {
  ...Object.fromEntries(locations.map((l) => [`loc.${l}`, `c003_loc_${l}`])),
  ...Object.fromEntries(characters.map((c) => [`char.${c}`, `c003_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `c003_ev_${e}`])),
  ...Object.fromEntries(objects.map((o) => [`obj.${o}`, `c003_obj_${o}`])),
};

/** People and objects drawn over C003's painted scenes (hotspot `art` keys). Only present once painted. */
const OVERLAYS = [
  "obj_casefile", "obj_laptop", "obj_notebook", "obj_mailtray", "obj_deskphone",
  "figure_rachel", "figure_vivian", "figure_graham", "figure_lena", "figure_cross", "figure_reed", "figure_voss", "figure_bell", "figure_bell_custody", "figure_shaw", "figure_owen",
  "obj_envelope",
];

/** People with a talking portrait: their portrait plus six frames (see docs/artwork-studio.md). */
const TALKERS = ["rachel", "vivian", "graham", "lena", "cross", "reed", "voss", "bell", "shaw", "owen", "bennett"];
/** Which image is each mouth shape. The portrait itself is the closed mouth. */
const FRAME: Record<string, (p: string) => string> = {
  rest: (p) => `c003_portrait_${p}`,
  slight: (p) => `c003_${p}_mouth_open_slight`,
  ah: (p) => `c003_${p}_mouth_ah`,
  ee: (p) => `c003_${p}_mouth_ee`,
  oh: (p) => `c003_${p}_mouth_oh`,
  oo: (p) => `c003_${p}_mouth_oo`,
  f: (p) => `c003_${p}_mouth_f`,
  blink: (p) => `c003_${p}_blink`,
};

/** Built again when Admin makes a new painting live (see refreshArt in the registry). */
export const buildAssets = (): AssetManifest => ({
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
    ...Object.fromEntries(OVERLAYS.flatMap((k) => (art(`c003_${k}`) ? [[`art.${k}`, art(`c003_${k}`)!]] : []))),
    // Interface paintings of its own: the map, the corner objects, and the drive and walk between places.
    ...Object.fromEntries(["map", "obj_notebook", "obj_evidence_bag", "obj_phone", "travel_drive_far", "travel_drive_near", "travel_drive_car", "travel_walk"].flatMap((k) => (art(`c003_${k}`) ? [[`ui.${k}`, art(`c003_${k}`)!]] : []))),
    // Talking portraits (scripts/build-faces.py): face.<person>.<shape>, present only once painted.
    ...Object.fromEntries(TALKERS.flatMap((c) => FACE_SHAPES.flatMap((sh) => (art(FRAME[sh](c)) ? [[`face.${c}.${sh}`, art(FRAME[sh](c))!]] : [])))),
  },
  audio: placeholders.audio,
});

export const assets = buildAssets();
