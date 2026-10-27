import { painted } from "@/art/painted";
import { FACE_SHAPES, type AssetManifest } from "@/game/engine/types";
import { RECOVERED } from "./evidence";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for S01 C06, The Architect. Every image and sound the
 * case uses is referenced here by key and nowhere else. Placeholders live
 * under public/cases/S001C06/ (npm run assets:placeholders -- S001C06).
 *
 * Paintings are art ids prefixed `s001c06_`, style "s001" (new entries in
 * art/pending/S001C06.json). The hub is C003's Pittsburgh field office, as in
 * S01 C01, so the office painting, its desk objects, Bennett's portrait and the
 * interface paintings (other than the map) are borrowed from C003. Recurring
 * people keep the portrait of the S001 case they first appeared in, and the
 * recovered records (R01 to R17) share the painting of the original item.
 */
const base = "/cases/S001C06";

const locations = [
  "office",
  "sayer_home",
  "records_center",
  "meridian_hq",
  "sayer_office",
  "oduya_office",
  "safe_apartment",
  "transit",
  "ridge_property",
  "lockhart_foundation",
  "marchetti_office",
  "pike_office",
  "financial_archive",
  "exam_facility",
  "nypd",
  "fbi",
  "storage_office",
  "interview_room",
];
const characters = ["sayer", "lockhart", "marchetti", "pike", "donovan", "holt", "rourke", "kane", "chen", "ames", "wexler", "caruso", "quinlan", "corbett", "oduya", "bennett"];
/** Scene objects that appear with events, drawn over the background. */
const objects = ["labfolder", "report_folder", "letter", "recovery_folder", "subpoena_box", "reconstruction", "rolling_board"];
const evidence = Array.from({ length: 60 }, (_, i) => `E${String(i + 1).padStart(3, "0")}`);
const recovered = RECOVERED.map((e) => e.id);

/** Painted artwork written by scripts/import-art.mjs. Anything not painted yet keeps its placeholder. */
const art = (id: string) => painted[id]?.url ?? null;

const placeholders: AssetManifest = {
  images: {
    ...Object.fromEntries(locations.map((k) => [`loc.${k}`, `${base}/locations/${k}.svg`])),
    ...Object.fromEntries(characters.map((k) => [`char.${k}`, `${base}/characters/${k}.svg`])),
    ...Object.fromEntries([...evidence, ...recovered].map((k) => [`ev.${k}`, `${base}/evidence/${k.toLowerCase()}.svg`])),
    ...Object.fromEntries(objects.map((k) => [`obj.${k}`, `${base}/objects/${k}.svg`])),
  },
  audio: {
    // Music and room sound, made on the Admin page and served from storage (see soundtrack.ts).
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/S001C06/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
  },
};

/**
 * Where each person's portrait was first painted: the case prefix and the
 * person's id there. New to this case: sayer, pike, oduya.
 */
const PORTRAIT_FROM: Record<string, [string, string]> = {
  bennett: ["c003", "bennett"],
  holt: ["s001c01", "holt"],
  lockhart: ["s001c01", "lockhart"],
  ames: ["s001c01", "ames"],
  rourke: ["s001c02", "rourke"],
  chen: ["s001c02", "chen"],
  quinlan: ["s001c02", "quinlan"],
  kane: ["s001c03", "kane"],
  corbett: ["s001c04", "corbett"],
  marchetti: ["s001c05", "marchetti"],
  wexler: ["s001c05", "wexler"],
  caruso: ["s001c05", "caruso"],
  donovan: ["s001c04", "donovan"],
};
const from = (p: string): [string, string] => PORTRAIT_FROM[p] ?? ["s001c06", p];

/** The original painting of each recovered record: R01 is S001-C01-E029, so "s001c01_ev_e029". */
const RECOVERED_ART: Record<string, string> = Object.fromEntries(
  RECOVERED.map((e) => {
    const m = /^S(\d{3})-C(\d{2})-(E\d{3})$/.exec(e.canonical!)!;
    return [`ev.${e.id}`, `s${m[1]}c${m[2]}_ev_${m[3].toLowerCase()}`];
  }),
);

/** Borrowed: the same Pittsburgh office as C003 and S01 C01, earlier portraits, the original records' paintings. */
const SHARED: Record<string, string> = {
  "loc.office": "c003_loc_office",
  // The series' rolling board: one painting for every S001 case.
  "obj.rolling_board": "s001_obj_rolling_board",
  ...Object.fromEntries(characters.filter((c) => PORTRAIT_FROM[c]).map((c) => [`char.${c}`, `${from(c)[0]}_portrait_${from(c)[1]}`])),
  ...RECOVERED_ART,
};

/** Which generated image replaces which asset key, once painted. */
const PAINTED: Record<string, string> = {
  ...Object.fromEntries(locations.filter((l) => !SHARED[`loc.${l}`]).map((l) => [`loc.${l}`, `s001c06_loc_${l}`])),
  ...Object.fromEntries(characters.filter((c) => !SHARED[`char.${c}`]).map((c) => [`char.${c}`, `s001c06_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `s001c06_ev_${e.toLowerCase()}`])),
  ...Object.fromEntries(objects.filter((o) => !SHARED[`obj.${o}`]).map((o) => [`obj.${o}`, `s001c06_obj_${o}`])),
  ...SHARED,
};

/** People shown standing in the scenes (hotspot `art` keys), painted for this case. */
const FIGURES = ["sayer", "lockhart", "marchetti", "pike", "donovan", "chen", "ames", "caruso", "quinlan", "oduya"];

/** People and objects drawn over the painted scenes (hotspot `art` keys), by painting id. Only present once painted. */
const OVERLAYS: Record<string, string> = {
  obj_casefile: "s001c06_obj_casefile",
  obj_notebook: "c003_obj_notebook",
  obj_mailtray: "c003_obj_mailtray",
  obj_deskphone: "c003_obj_deskphone",
  ...Object.fromEntries(FIGURES.map((p) => [`figure_${p}`, `s001c06_figure_${p}`])),
};

/** Interface paintings: the case's own map; the rest borrowed from C003's western Pennsylvania. */
const UI: Record<string, string> = {
  map: "s001c06_map",
  ...Object.fromEntries(["obj_notebook", "obj_evidence_bag", "obj_phone", "travel_drive_far", "travel_drive_near", "travel_drive_car", "travel_walk"].map((k) => [k, `c003_${k}`])),
};

/** People with a talking portrait: their portrait plus six frames (see docs/artwork-studio.md), from the case that painted the portrait. */
const TALKERS = characters;
/** Which image is each mouth shape. The portrait itself is the closed mouth. */
const FRAME: Record<string, (p: string) => string> = {
  rest: (p) => `${from(p)[0]}_portrait_${from(p)[1]}`,
  slight: (p) => `${from(p)[0]}_${from(p)[1]}_mouth_open_slight`,
  ah: (p) => `${from(p)[0]}_${from(p)[1]}_mouth_ah`,
  ee: (p) => `${from(p)[0]}_${from(p)[1]}_mouth_ee`,
  oh: (p) => `${from(p)[0]}_${from(p)[1]}_mouth_oh`,
  oo: (p) => `${from(p)[0]}_${from(p)[1]}_mouth_oo`,
  f: (p) => `${from(p)[0]}_${from(p)[1]}_mouth_f`,
  blink: (p) => `${from(p)[0]}_${from(p)[1]}_blink`,
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
