import generated from "@/art/generated.json";
import type { AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for Case C004. Every image and sound the case uses is
 * referenced here by key and nowhere else. Placeholders live under
 * public/cases/C004/ (npm run assets:placeholders -- C004). C004 is set in
 * Chicago in 1927 and has its own painted style (art/manifest.json, style
 * "c004") and its own 1927 office, so nothing is borrowed from the other cases.
 */
const base = "/cases/C004";

const locations = [
  "office", "studio_a", "control_room", "storage", "station_office", "workshop", "blue_lantern", "mercer_apartment", "vale_house", "police",
  "warehouse_gate", "boardinghouse", "wh_storeroom", "wh_tally", "wh_riverdoor", "wells_bridge", "wh_night_gate",
];
const characters = ["louise", "victor", "henry", "samuel", "clara", "russo", "rose", "keene", "agnes", "frankie", "arthur", "sal", "augie", "stranger"];
/** Scene objects that appear or change with events, drawn over the background. */
const objects = ["labfolder", "report_folder", "envelope_sealed", "envelope_open"];
const evidence = Array.from({ length: 28 }, (_, i) => `e${String(i + 1).padStart(2, "0")}`);

/** Painted artwork written by scripts/import-art.mjs. Anything not painted yet keeps its placeholder. */
const painted = (generated as { images: Record<string, { url: string }> }).images;
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
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/C004/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
    // The police stenographer's cylinders are voiced from the transcripts.
    "rec.victor": null,
    "rec.samuel": null,
  },
};

/** Which generated image replaces which asset key, once painted. */
const PAINTED: Record<string, string> = {
  ...Object.fromEntries(locations.map((l) => [`loc.${l}`, `c004_loc_${l}`])),
  ...Object.fromEntries(characters.map((c) => [`char.${c}`, `c004_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `c004_ev_${e}`])),
  ...Object.fromEntries(objects.map((o) => [`obj.${o}`, `c004_obj_${o}`])),
};

/** People and objects drawn over C004's painted scenes (hotspot `art` keys). Only present once painted. */
const OVERLAYS = [
  "obj_casefile", "obj_notebook", "obj_mailtray", "obj_phone",
  "figure_louise", "figure_victor", "figure_victor_custody", "figure_henry", "figure_samuel", "figure_clara", "figure_russo", "figure_rose", "figure_keene", "figure_agnes", "figure_frankie",
];

export const assets: AssetManifest = {
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
    ...Object.fromEntries(OVERLAYS.flatMap((k) => (art(`c004_${k}`) ? [[`art.${k}`, art(`c004_${k}`)!]] : []))),
  },
  audio: placeholders.audio,
};
