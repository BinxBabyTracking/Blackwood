import { painted } from "@/art/painted";
import { FACE_SHAPES, type AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for S01 C02, Room 614. Every image and sound the
 * case uses is referenced here by key and nowhere else. Placeholders live
 * under public/cases/S001C02/ (npm run assets:placeholders -- S001C02).
 *
 * Paintings are art/manifest.json ids prefixed `s001c02_`, style "s001"
 * (entries pending in art/pending/S001C02.json). The hub is C003's Pittsburgh
 * field office, so the office painting, its desk objects, Bennett's portrait
 * and the interface paintings (other than the map) are borrowed from C003, and
 * the rolling board is the series' shared painting, as in S01 C01.
 */
const base = "/cases/S001C02";

const locations = [
  "office",
  "lobby",
  "corridor_6",
  "room_614",
  "security_office",
  "service_corridor",
  "loading_dock",
  "eastbridge",
  "chen_office",
  "meridian_hq",
  "kestrel",
  "kestrel_searched",
  "holding_property",
  "holding_property_cleared",
  "holding_room",
];
const characters = ["jonathan", "natalie", "rourke", "lyons", "hurst", "chen", "grant", "wallace", "monroe", "okoye", "collins", "quinlan", "bennett"];
/** Scene objects that appear with events, drawn over the background. */
const objects = ["labfolder", "fbi_folder", "security_envelope", "courier_sealed", "courier_open", "fbi_envelope", "report_folder", "rolling_board"];
const evidence = Array.from({ length: 36 }, (_, i) => `E${String(i + 1).padStart(3, "0")}`);

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
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/S001C02/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
  },
};

/** Borrowed: C003's Pittsburgh office and Bennett, and the series' rolling board. */
const SHARED: Record<string, string> = {
  "loc.office": "c003_loc_office",
  "char.bennett": "c003_portrait_bennett",
  // The series' rolling board: one painting for every S001 case.
  "obj.rolling_board": "s001_obj_rolling_board",
};

/** Which generated image replaces which asset key, once painted. */
const PAINTED: Record<string, string> = {
  ...Object.fromEntries(locations.filter((l) => !SHARED[`loc.${l}`]).map((l) => [`loc.${l}`, `s001c02_loc_${l}`])),
  ...Object.fromEntries(characters.filter((c) => !SHARED[`char.${c}`]).map((c) => [`char.${c}`, `s001c02_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `s001c02_ev_${e.toLowerCase()}`])),
  ...Object.fromEntries(objects.filter((o) => !SHARED[`obj.${o}`]).map((o) => [`obj.${o}`, `s001c02_obj_${o}`])),
  ...SHARED,
};

/** People in the scenes (figures). Bennett is only ever on the phone. */
const FIGURES = ["jonathan", "natalie", "rourke", "lyons", "hurst", "chen", "grant", "wallace", "monroe", "okoye", "collins", "quinlan"];

/** People and objects drawn over the painted scenes (hotspot `art` keys), by painting id. Only present once painted. */
const OVERLAYS: Record<string, string> = {
  obj_casefile: "s001c02_obj_casefile",
  obj_van: "s001c02_obj_van",
  obj_notebook: "c003_obj_notebook",
  obj_mailtray: "c003_obj_mailtray",
  obj_deskphone: "c003_obj_deskphone",
  ...Object.fromEntries(FIGURES.map((p) => [`figure_${p}`, `s001c02_figure_${p}`])),
};

/** Interface paintings: the case's own map; the rest borrowed from C003. */
const UI: Record<string, string> = {
  map: "s001c02_map",
  ...Object.fromEntries(["obj_notebook", "obj_evidence_bag", "obj_phone", "travel_drive_far", "travel_drive_near", "travel_drive_car", "travel_walk"].map((k) => [k, `c003_${k}`])),
};

/** People with a talking portrait: their portrait plus six frames (see docs/artwork-studio.md). Bennett's are C003's. */
const TALKERS = characters;
const prefix = (p: string) => (p === "bennett" ? "c003" : "s001c02");
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
