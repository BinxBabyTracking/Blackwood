import type { AssetManifest } from "@/game/engine/types";

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

export const assets: AssetManifest = {
  images: {
    ...Object.fromEntries(locations.map((k) => [`loc.${k}`, `${base}/locations/${k}.svg`])),
    ...Object.fromEntries(characters.map((k) => [`char.${k}`, `${base}/characters/${k}.svg`])),
    ...Object.fromEntries(evidence.map((k) => [`ev.${k}`, `${base}/evidence/${k}.svg`])),
    ...Object.fromEntries(objects.map((k) => [`obj.${k}`, `${base}/objects/${k}.svg`])),
  },
  audio: {
    "amb.office": null,
    "amb.whitmore": null,
    "amb.diner": null,
    "amb.garage": null,
    "rec.margaret": null,
    "rec.daniel": null,
    "rec.robert": null,
    "rec.patricia": null,
  },
};
