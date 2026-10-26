import generated from "@/art/generated.json";
import type { AssetManifest } from "@/game/engine/types";
import { SOUNDTRACK } from "./soundtrack";

/**
 * Central asset manifest for Case C002. Every image and sound the case uses is
 * referenced here by key and nowhere else. Placeholders live under
 * public/cases/C002/ (npm run assets:placeholders -- C002). The office is the
 * agency's own office, so its painting, desk objects and room sound are C001's.
 */
const base = "/cases/C002";

const locations = ["office", "hale_bedroom", "hale_kitchen", "elm_street", "police_station", "courier", "ruth_apartment", "tamarack_store", "cabin14", "moss_house"];
const characters = ["laura", "tom", "ruth", "ferris", "nora", "howard", "diane", "gordon", "bennett"];
/** Scene objects that appear or change with events, drawn over the background. */
const objects = ["envelope_sealed", "envelope_open", "evidence_bag", "evidence_bag_open", "report_folder", "newspaper"];
const evidence = Array.from({ length: 23 }, (_, i) => `e${String(i + 1).padStart(2, "0")}`);

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
    ...Object.fromEntries(SOUNDTRACK.map((t) => [t.key, `/api/case-audio/C002/${t.key}`])),
    // Same office as C001.
    "amb.office": "/api/case-audio/C001/amb.office",
    "sfx.travel_drive": null,
    "sfx.travel_walk": null,
    "rec.tom1": null,
    "rec.tom2": null,
  },
};

/** Which generated image replaces which asset key. The office and its desk objects reuse C001's paintings. */
const PAINTED: Record<string, string> = {
  "loc.office": "c001_loc_office",
  "char.bennett": "c001_portrait_bennett",
  "obj.envelope_sealed": "c001_obj_envelope_sealed",
  "obj.envelope_open": "c001_obj_envelope_open",
  "obj.evidence_bag": "c001_obj_evidence_bag",
  "obj.evidence_bag_open": "c001_obj_evidence_bag_open",
  "obj.report_folder": "c001_obj_report_folder",
  "obj.newspaper": "c002_obj_newspaper",
  ...Object.fromEntries(locations.filter((l) => l !== "office").map((l) => [`loc.${l}`, `c002_loc_${l}`])),
  ...Object.fromEntries(characters.filter((c) => c !== "bennett").map((c) => [`char.${c}`, `c002_portrait_${c}`])),
  ...Object.fromEntries(evidence.map((e) => [`ev.${e}`, `c002_ev_${e}`])),
};

/** Office objects drawn over the painted office: C001's paintings. */
const OFFICE_OVERLAYS = ["obj_casefile", "obj_labfolder", "obj_phone", "obj_notebook", "obj_recorder", "obj_mailtray"];
/** People and objects drawn over C002's painted scenes (hotspot `art` keys). Only present once painted. */
const OVERLAYS = [
  "figure_tom", "figure_howard", "figure_ferris", "figure_gordon_custody", "figure_nora", "figure_ruth", "figure_laura", "figure_gordon", "figure_diane",
  "obj_glasses", "obj_letter", "obj_slip",
];

export const assets: AssetManifest = {
  images: {
    ...placeholders.images,
    ...Object.fromEntries(Object.entries(PAINTED).flatMap(([key, id]) => (art(id) ? [[key, art(id)!]] : []))),
    // C002's own version of an office object (Laura's case file) replaces C001's once painted.
    ...Object.fromEntries(OFFICE_OVERLAYS.flatMap((k) => { const u = art(`c002_${k}`) ?? art(`c001_${k}`); return u ? [[`art.${k}`, u]] : []; })),
    ...Object.fromEntries(OVERLAYS.flatMap((k) => (art(`c002_${k}`) ? [[`art.${k}`, art(`c002_${k}`)!]] : []))),
  },
  audio: placeholders.audio,
};
