import { painted } from "@/art/painted";
import type { AssetManifest } from "@/game/engine/types";
import { EVIDENCE_IDS } from "./evidence";
import { LOCATION_IDS } from "./locations";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for CHR001, The Christmas That Never Happened. Every
 * image and sound the case uses is referenced here by key. Placeholders live
 * under public/cases/CHR001/ (npm run assets:placeholders -- CHR001).
 * Paintings are art/manifest.json ids prefixed `chr001_`, style "chr001"; the
 * walkable rooms and their Meshy models are in its `rooms` (art/WALKABLE.md).
 */
const base = "/cases/CHR001";

const characters = ["aldric", "garrick", "mira", "pip", "santa", "mrsclaus", "marigold", "vell", "quill", "glint", "corwin", "dasha", "bertram", "juniper", "guard"];

const art = (id: string) => painted[id]?.url ?? null;

const placeholders: AssetManifest = {
  images: {
    ...Object.fromEntries(LOCATION_IDS.map((k) => [`loc.${k}`, `${base}/locations/${k}.svg`])),
    ...Object.fromEntries(characters.map((k) => [`char.${k}`, `${base}/characters/${k}.svg`])),
    ...Object.fromEntries(EVIDENCE_IDS.map((k) => [`ev.${k}`, `${base}/evidence/${k.toLowerCase()}.svg`])),
    "obj.final_report": `${base}/objects/report_folder.svg`,
  },
  audio: {
    // Music, room sound and sound effects, made on the Admin page and served from storage (see soundtrack.ts).
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/CHR001/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
  },
};

const PAINTED: Record<string, string> = {
  ...Object.fromEntries(characters.map((c) => [`char.${c}`, `chr001_portrait_${c}`])),
  ...Object.fromEntries(EVIDENCE_IDS.map((e) => [`ev.${e}`, `chr001_ev_${e.toLowerCase()}`])),
};

/** Built again when Admin makes a new painting live (see refreshArt in the registry). */
export const buildAssets = (): AssetManifest => ({
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
  },
  audio: placeholders.audio,
});

export const assets = buildAssets();
