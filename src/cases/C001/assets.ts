import { painted } from "@/art/painted";
import type { AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for Case C001. Every image and sound the case uses is
 * referenced here by key and nowhere else. To install final artwork, replace
 * the files under public/cases/C001/ (same names) or point a key at a new URL.
 * Audio entries stay null until a recording exists; the game hides playback
 * controls for null audio.
 */
const base = "/cases/C001";

const locations = [
  "office",
  "living_room",
  "kitchen",
  "diner",
  "daniel_apartment_a",
  "daniel_apartment_b",
  "margaret_house",
  "robert_garage",
  "patricia_office",
];
const characters = ["eleanor", "margaret", "daniel", "robert", "patricia", "bennett", "rosa"];
/** Scene objects that appear or change with events, drawn over the background. */
const objects = ["envelope_sealed", "envelope_open", "evidence_bag", "evidence_bag_open", "report_folder"];
const evidence = Array.from({ length: 15 }, (_, i) => `e${String(i + 1).padStart(2, "0")}`);

/** Painted artwork written by scripts/generate-art.mjs. Anything not generated yet keeps its placeholder. */
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
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/C001/${t.key}`])),
    // Travel scenes. Null means the game synthesizes the sound; point these at recordings to replace it.
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
    "rec.margaret": null,
    "rec.daniel": null,
    "rec.robert": null,
    "rec.patricia": null,
  },
};

/** Which generated image replaces which asset key: scenes, portraits, evidence close-ups and desk items. */
const PAINTED: Record<string, string> = {
  "loc.office": "c001_loc_office",
  "loc.living_room": "c001_loc_living_room",
  "loc.kitchen": "c001_loc_kitchen",
  "loc.diner": "c001_loc_diner",
  // Both states of the apartment share one painted room; what changes is drawn as objects.
  "loc.daniel_apartment_a": "c001_loc_daniel_apartment",
  "loc.daniel_apartment_b": "c001_loc_daniel_apartment",
  "loc.margaret_house": "c001_loc_margaret_house",
  "loc.robert_garage": "c001_loc_robert_garage",
  "loc.patricia_office": "c001_loc_patricia_office",
  ...Object.fromEntries(characters.map((c) => [`char.${c}`, `c001_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `c001_ev_${e}`])),
  ...Object.fromEntries(objects.map((o) => [`obj.${o}`, `c001_obj_${o}`])),
};

/** People and objects drawn over a painted scene (hotspot `art` keys). Only present once generated. */
const OVERLAYS = [
  "figure_margaret", "figure_daniel", "figure_robert", "figure_patricia", "figure_rosa",
  "obj_casefile", "obj_labfolder", "obj_phone", "obj_notebook", "obj_recorder", "obj_mailtray",
  "obj_chair", "obj_glass", "obj_ledger", "obj_diary", "obj_knives", "obj_rack", "obj_spike",
  "obj_coatrack_jacket", "obj_coatrack_empty", "obj_wastebasket", "obj_firstaid", "obj_ashtray", "obj_suitcase",
  "obj_photo", "obj_cat", "obj_adder",
];

/** Built again when Admin makes a new painting live (see refreshArt in the registry). */
export const buildAssets = (): AssetManifest => ({
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
    ...Object.fromEntries(OVERLAYS.flatMap((k) => (art(`c001_${k}`) ? [[`art.${k}`, art(`c001_${k}`)!]] : []))),
  },
  audio: placeholders.audio,
});

export const assets = buildAssets();
