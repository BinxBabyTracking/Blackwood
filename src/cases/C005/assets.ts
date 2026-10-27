import { painted } from "@/art/painted";
import { FACE_SHAPES, type AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for Case C005. Every image and sound the case uses is
 * referenced here by key and nowhere else. Placeholders live under
 * public/cases/C005/ (npm run assets:placeholders -- C005). C005 is painted in
 * a medieval manuscript style of its own (art/manifest.json, style "c005"),
 * so nothing is borrowed from the agency's noir paintings.
 */
const base = "/cases/C005";

const locations = ["chamber", "book_room", "scriptorium", "church", "cloister", "passage", "abbot_chamber", "cellar", "gatehouse", "mill", "manor", "muniments", "infirmary", "tower"];
const characters = ["edmund", "abbot", "matthias", "thomas", "peter", "anselm", "agnes", "simon", "william", "margery", "roland", "geoffrey", "alice", "archdeacon"];
/** Objects that appear with events, drawn over the scene. */
const objects = ["folded_letter", "finding"];
const evidence = Array.from({ length: 32 }, (_, i) => `e${String(i + 1).padStart(2, "0")}`);
/** Detail paintings for the manuscript comparison. Optional: a passage shows its words alone until painted. */
const comparison = ["seal_old", "seal_forged", "leaf_old", "leaf_forged", "ink_old", "ink_forged", "hand_old", "hand_forged"];

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
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/C005/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
  },
};

/** Which generated image replaces which asset key, once painted. */
const PAINTED: Record<string, string> = {
  ...Object.fromEntries(locations.map((l) => [`loc.${l}`, `c005_loc_${l}`])),
  ...Object.fromEntries(characters.map((c) => [`char.${c}`, `c005_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `c005_ev_${e}`])),
  ...Object.fromEntries(objects.map((o) => [`obj.${o}`, `c005_obj_${o}`])),
};

/** People and objects drawn over C005's painted scenes (hotspot `art` keys). Only present once painted. */
const OVERLAYS = [
  "obj_commission", "obj_journal", "obj_lectern", "obj_bellstrip", "obj_door", "obj_cloak", "obj_saltbin",
  "figure_thomas", "figure_anselm", "figure_peter", "figure_abbot", "figure_matthias", "figure_margery", "figure_william",
  "figure_alice", "figure_roland", "figure_geoffrey", "figure_agnes", "figure_simon",
];

/** Built again when Admin makes a new painting live (see refreshArt in the registry). */
export const buildAssets = (): AssetManifest => ({
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
    ...Object.fromEntries(OVERLAYS.flatMap((k) => (art(`c005_${k}`) ? [[`art.${k}`, art(`c005_${k}`)!]] : []))),
    ...Object.fromEntries(comparison.flatMap((k) => (art(`c005_cmp_${k}`) ? [[`cmp.${k}`, art(`c005_cmp_${k}`)!]] : []))),
    // Talking portraits: face.<person>.<shape>, made on Admin as edits of the portrait, present only once painted.
    // The resting frame is the portrait itself.
    ...Object.fromEntries(
      characters.flatMap((c) => {
        const frames = FACE_SHAPES.flatMap((sh) => (art(`c005_face_${c}_${sh}`) ? [[`face.${c}.${sh}`, art(`c005_face_${c}_${sh}`)!]] : []));
        const portrait = art(`c005_portrait_${c}`);
        return frames.length && portrait ? [[`face.${c}.rest`, portrait], ...frames] : frames;
      }),
    ),
    // The case's own interface paintings: the map, the journal and satchel in the corner, the walk between places.
    ...Object.fromEntries(["map", "obj_notebook", "obj_evidence_bag", "travel_walk"].flatMap((k) => (art(`c005_${k}`) ? [[`ui.${k}`, art(`c005_${k}`)!]] : []))),
  },
  audio: placeholders.audio,
});

export const assets = buildAssets();
