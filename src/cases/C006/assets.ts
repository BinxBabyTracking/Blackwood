import { painted } from "@/art/painted";
import { FACE_SHAPES, type AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for Case C006. Every image and sound the case uses is
 * referenced here by key and nowhere else. Placeholders live under
 * public/cases/C006/ (npm run assets:placeholders -- C006). C006 has its own
 * contemporary painted style (art/manifest.json, style "c006").
 */
const base = "/cases/C006";

export const LOCATIONS = [
  "office", "mill_gate", "tool_crib", "shop_floor", "admin_building", "maint_office", "loading_yard", "lasko_home", "reeves_auto", "police",
  "forensic", "newspaper", "borough", "regulatory", "union_hall", "sutter_home", "storage", "stroud_office", "trent_office", "greer_home",
  "laurel_road", "camp", "medical_station", "corso_photo", "sloan_home", "pierce_home", "river_gate", "courthouse", "rail_building", "mill_reconstruction",
];
export const CHARACTERS = ["emily", "sarah", "wade", "stroud", "trent", "glenn", "len", "evelyn", "ray", "earl", "rebecca", "andrew", "mitchell", "brooks", "jessica", "karen", "granger", "caller"];
const objects = ["labfolder"];
const evidence = Array.from({ length: 100 }, (_, i) => `e${String(i + 1).padStart(3, "0")}`);

const art = (id: string) => painted[id]?.url ?? null;

const placeholders: AssetManifest = {
  images: {
    ...Object.fromEntries(LOCATIONS.map((k) => [`loc.${k}`, `${base}/locations/${k}.svg`])),
    ...Object.fromEntries(CHARACTERS.map((k) => [`char.${k}`, `${base}/characters/${k}.svg`])),
    ...Object.fromEntries(evidence.map((k) => [`ev.${k}`, `${base}/evidence/${k}.svg`])),
    ...Object.fromEntries(objects.map((k) => [`obj.${k}`, `${base}/objects/${k}.svg`])),
  },
  audio: {
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/C006/${t.key}`])),
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
    "rec.wade96": null,
    "rec.rebecca96": null,
    "audio.e040": null,
  },
};

const PAINTED: Record<string, string> = {
  ...Object.fromEntries(LOCATIONS.map((l) => [`loc.${l}`, `c006_loc_${l}`])),
  ...Object.fromEntries(CHARACTERS.map((c) => [`char.${c}`, `c006_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `c006_ev_${e}`])),
  ...Object.fromEntries(objects.map((o) => [`obj.${o}`, `c006_obj_${o}`])),
};

/** Built again when Admin makes a new painting live (see refreshArt in the registry). */
export const buildAssets = (): AssetManifest => ({
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
    ...Object.fromEntries(
      CHARACTERS.flatMap((c) => {
        const frames = FACE_SHAPES.flatMap((sh) => (art(`c006_face_${c}_${sh}`) ? [[`face.${c}.${sh}`, art(`c006_face_${c}_${sh}`)!]] : []));
        const portrait = art(`c006_portrait_${c}`);
        return frames.length && portrait ? [[`face.${c}.rest`, portrait], ...frames] : frames;
      }),
    ),
    ...Object.fromEntries(["map", "obj_notebook", "obj_evidence_bag", "travel_walk", "travel_drive"].flatMap((k) => (art(`c006_${k}`) ? [[`ui.${k}`, art(`c006_${k}`)!]] : []))),
  },
  audio: placeholders.audio,
});

export const assets = buildAssets();
