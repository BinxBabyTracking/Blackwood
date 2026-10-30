import { painted } from "@/art/painted";
import { FACE_SHAPES, type AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for HALLOW001, The Thirteenth Guest. Every image and
 * sound the case uses is referenced here by key and nowhere else. Placeholders
 * live under public/cases/HALLOW001/ (npm run assets:placeholders -- HALLOW001).
 * Paintings are art/manifest.json ids prefixed `hallow001_`, style "hallow001".
 */
const base = "/cases/HALLOW001";

const locations = [
  "morning_room",
  "entrance_hall",
  "dining_room",
  "library",
  "conservatory",
  "upstairs_corridor",
  "study",
  "study_open",
  "guest_wing",
  "attic",
  "wine_cellar",
  "service_corridor",
  "servants_stair",
  "greenhouse",
  "garden_maze",
  "carriage_house",
  "carriage_house_open",
  "gatehouse",
];
const characters = ["ambrose", "annabel", "crane", "josie", "constance", "felix", "penrose", "harriet", "amos", "bridget", "beatrice", "byrne", "iris", "wren", "mahoney", "reyes"];
/** Scene objects that appear with events, drawn over the background. */
const objects = ["labfolder", "report_folder"];
const evidence = Array.from({ length: 38 }, (_, i) => `HE${String(i + 1).padStart(3, "0")}`);

/** Painted artwork written by scripts/import-art.mjs or made live on Admin. Anything not painted yet keeps its placeholder. */
const art = (id: string) => painted[id]?.url ?? null;

const placeholders: AssetManifest = {
  images: {
    ...Object.fromEntries(locations.map((k) => [`loc.${k}`, `${base}/locations/${k}.svg`])),
    ...Object.fromEntries(characters.map((k) => [`char.${k}`, `${base}/characters/${k}.svg`])),
    ...Object.fromEntries(evidence.map((k) => [`ev.${k}`, `${base}/evidence/${k.toLowerCase()}.svg`])),
    ...Object.fromEntries(objects.map((k) => [`obj.${k}`, `${base}/objects/${k}.svg`])),
    "obj.final_report": `${base}/objects/report_folder.svg`,
  },
  audio: {
    // Music and room sound, made on the Admin page and served from storage (see soundtrack.ts).
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/HALLOW001/${t.key}`])),
    // Officer Reyes's first statements are voiced with the character voices on request.
    "tape.wren": null,
    "tape.felix": null,
    "tape.amos": null,
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
  },
};

/** Which generated image replaces which asset key, once painted. */
const PAINTED: Record<string, string> = {
  ...Object.fromEntries(locations.map((l) => [`loc.${l}`, `hallow001_loc_${l}`])),
  ...Object.fromEntries(characters.map((c) => [`char.${c}`, `hallow001_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `hallow001_ev_${e.toLowerCase()}`])),
  ...Object.fromEntries(objects.map((o) => [`obj.${o}`, `hallow001_obj_${o}`])),
  // The final report is Blackwood's own folder, as in C001.
  "obj.final_report": "c001_obj_report_folder",
};

/** People drawn in person in the scenes (hotspot `art` keys, see locations.ts). */
const FIGURES = ["crane", "josie", "constance", "felix", "penrose", "harriet", "amos", "bridget", "beatrice", "byrne", "iris", "wren"];

/** People and objects drawn over the painted scenes (hotspot `art` keys), by painting id. Only present once painted. */
const OVERLAYS: Record<string, string> = {
  obj_casefile: "hallow001_obj_casefile",
  ...Object.fromEntries(FIGURES.map((p) => [`figure_${p}`, `hallow001_figure_${p}`])),
};

/** Interface paintings: the estate plan, the notebook, the phone and the walk. */
const UI: Record<string, string> = {
  map: "hallow001_map",
  obj_notebook: "hallow001_obj_notebook",
  obj_evidence_bag: "hallow001_obj_evidence_bag",
  obj_phone: "hallow001_obj_phone",
  obj_casefile: "hallow001_obj_casefile",
};

/** People with a talking portrait: their portrait plus six frames (docs/artwork-studio.md). */
const TALKERS = ["crane", "josie", "constance", "felix", "penrose", "harriet", "amos", "bridget", "beatrice", "byrne", "iris", "wren", "mahoney"];
/** Which image is each mouth shape. The portrait itself is the closed mouth. */
const FRAME: Record<string, (p: string) => string> = {
  rest: (p) => `hallow001_portrait_${p}`,
  slight: (p) => `hallow001_${p}_mouth_open_slight`,
  ah: (p) => `hallow001_${p}_mouth_ah`,
  ee: (p) => `hallow001_${p}_mouth_ee`,
  oh: (p) => `hallow001_${p}_mouth_oh`,
  oo: (p) => `hallow001_${p}_mouth_oo`,
  f: (p) => `hallow001_${p}_mouth_f`,
  blink: (p) => `hallow001_${p}_blink`,
};

/** Built again when Admin makes a new painting live (see refreshArt in the registry). */
export const buildAssets = (): AssetManifest => ({
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
    ...Object.fromEntries(Object.entries(OVERLAYS).flatMap(([k, id]) => (art(id) ? [[`art.${k}`, art(id)!]] : []))),
    ...Object.fromEntries(Object.entries(UI).flatMap(([k, id]) => (art(id) ? [[`ui.${k}`, art(id)!]] : []))),
    // Talking portraits: face.<person>.<shape>, present only once painted.
    ...Object.fromEntries(TALKERS.flatMap((c) => FACE_SHAPES.flatMap((sh) => (art(FRAME[sh](c)) ? [[`face.${c}.${sh}`, art(FRAME[sh](c))!]] : [])))),
  },
  audio: placeholders.audio,
});

export const assets = buildAssets();
