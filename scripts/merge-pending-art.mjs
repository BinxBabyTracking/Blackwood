// Merges art/pending/<CASE>.json (written while a case is built) into
// art/manifest.json: new images are appended after the case's existing ones
// (or at the end), new people descriptions added. Existing ids are left alone.
// Then the pending file is removed.
//
//   node scripts/merge-pending-art.mjs S001C03
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const caseId = process.argv[2];
if (!caseId) throw new Error("usage: node scripts/merge-pending-art.mjs <CASE>");
const pendingPath = `art/pending/${caseId}.json`;
if (!existsSync(pendingPath)) throw new Error(`${pendingPath} not found`);

const manifest = JSON.parse(readFileSync("art/manifest.json", "utf8"));
const pending = JSON.parse(readFileSync(pendingPath, "utf8"));
const images = Array.isArray(pending) ? pending : (pending.images ?? []);
const people = Array.isArray(pending) ? {} : (pending.people ?? {});

const have = new Set(manifest.images.map((i) => i.id));
const prefix = `${caseId.toLowerCase()}_`;
let added = 0;
for (const img of images) {
  if (!img?.id || have.has(img.id)) continue;
  if (!img.id.startsWith(prefix) && !img.id.startsWith("s001_")) throw new Error(`${img.id} is not a ${caseId} image`);
  if (/[–—]/.test(JSON.stringify(img))) throw new Error(`${img.id} has an em or en dash`);
  const last = manifest.images.findLastIndex((i) => i.id.startsWith(prefix));
  manifest.images.splice(last === -1 ? manifest.images.length : last + 1, 0, img);
  have.add(img.id);
  added++;
}
let peopleAdded = 0;
manifest.people ??= {};
for (const [k, v] of Object.entries(people)) {
  if (k in manifest.people) {
    if (manifest.people[k] !== v) console.warn(`people.${k} already describes someone else; kept the existing one. Check the case's character id.`);
    continue;
  }
  manifest.people[k] = v;
  peopleAdded++;
}
writeFileSync("art/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
rmSync(pendingPath);
console.log(`${caseId}: ${added} images and ${peopleAdded} people added to art/manifest.json`);
