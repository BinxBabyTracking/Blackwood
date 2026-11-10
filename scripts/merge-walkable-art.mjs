#!/usr/bin/env node
/*
 * Merges a case's walkable-room art list into art/manifest.json (see art/WALKABLE.md).
 *
 *   node scripts/merge-walkable-art.mjs <file.json> [more.json ...]
 *
 * Each file is { case, look, rooms, images, fixes, notes }. For that case it:
 *  - retires the old flat 2D scene entries (background, panorama, pov, strip, sprite, figure);
 *  - replaces any earlier walkable entries and room records with the file's;
 *  - sets the case's flat look line;
 *  - applies subject fixes to its portraits, evidence and maps;
 *  - lists front, side and back 3D character views (turn) for every person with a portrait.
 * It checks ids, kinds, sizes, room references and wording, and stops on any error.
 *
 *   node scripts/merge-walkable-art.mjs --turns-only <prefix>   (adds just the turnarounds, e.g. for c001)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "art/manifest.json");
const m = JSON.parse(readFileSync(MANIFEST, "utf8"));

const WALK = new Set(["wall", "floor", "ceiling", "trim", "piece", "fixture", "outside", "model"]);
const RETIRED = new Set(["background", "panorama", "pov", "strip", "sprite", "figure"]);
const SIZES = new Set(["1024x1024", "1024x1536", "1536x1024"]);
const ID = /^[a-z0-9_]{2,80}$/;
// Words a British writer would use; the game is in American English.
const BRITISH = /\b(?:(?:colour|grey(?!stone)|centre|metre|favourite|cheque|kerb|tyre|storey|jewellery|aluminium|mould|plough|whilst|neighbour|harbour|honour|labour)\w*|(?:organi|reali|recogni)s(?:e|ed|es|ing|ation))\b/i;

const prefixOf = (c) => c.toLowerCase();
const errors = [];
const warn = [];
const err = (s) => errors.push(s);

function checkText(where, text) {
  if (typeof text !== "string" || !text.trim()) return err(`${where}: empty subject`);
  if (text.includes("—")) err(`${where}: has an em dash`);
  const b = BRITISH.exec(text);
  if (b) warn.push(`${where}: British spelling "${b[0]}"`);
}

function turnsFor(prefix) {
  const people = Object.keys(m.people).filter((k) => (prefix === "c001" ? !k.includes("_") : k.startsWith(`${prefix}_`)));
  const out = [];
  for (const key of people) {
    const name = prefix === "c001" ? key : key.slice(prefix.length + 1);
    const portrait = `${prefix}_portrait_${name}`;
    if (!m.images.some((i) => i.id === portrait)) continue;
    const front = `${prefix}_turn_${name}_front`;
    const base = { kind: "turn", person: key, reference: portrait, style: prefix, room: null };
    out.push(
      { ...base, id: front, subject: "Seen from the front, facing the viewer directly, looking straight ahead, with a calm, neutral expression. Wearing the clothes described above, with shoes that suit them." },
      { ...base, id: `${prefix}_turn_${name}_side`, also: [front], subject: "Seen exactly from the left side, in full profile, facing toward the left edge of the image. The same clothes, shoes and hair as the front view, seen from the side." },
      { ...base, id: `${prefix}_turn_${name}_back`, also: [front], subject: "Seen exactly from behind, facing away from the viewer, the back of the head and hair fully visible. The same clothes, shoes and hair as the front view, seen from the back." },
    );
  }
  return out;
}

function clean(img) {
  const o = { id: img.id, kind: img.kind };
  for (const k of ["style", "person", "reference", "also", "size", "room"]) if (img[k] != null) o[k] = img[k];
  o.subject = img.subject.trim();
  return o;
}

/**
 * Brings the extra fields writers have used to the documented ones (art/WALKABLE.md): a model's height off the
 * floor is elevFt (baseFt, bottomFt and onFt were used too), what it sits on is on (onModel), and patches of ground or
 * floor laid over the main floor are decals (floor.areas and ground were used too).
 */
function normalize(r) {
  const [w] = r.sizeFt ?? [];
  for (const mo of r.models ?? []) {
    for (const k of ["baseFt", "bottomFt", "onFt"]) if (mo[k] != null && mo.elevFt == null) (mo.elevFt = mo[k]), delete mo[k];
    if (mo.onModel != null && mo.on == null) (mo.on = mo.onModel), delete mo.onModel;
  }
  const decals = [...(r.decals ?? [])];
  for (const a of r.floor?.areas ?? []) {
    const [x0, x1] = a.xFt, [z0, z1] = a.zFt;
    decals.push({ image: a.image, atFt: [(x0 + x1) / 2, (z0 + z1) / 2], sizeFt: [x1 - x0, z1 - z0], tileFt: a.tileFt ?? r.floor.tileFt });
  }
  if (r.floor?.areas) delete r.floor.areas;
  for (const g of r.ground ?? []) {
    const [z0, z1] = g.fromFrontFt ?? [0, 0];
    decals.push({ image: g.image, atFt: [w / 2, (z0 + z1) / 2], sizeFt: [w, z1 - z0], tileFt: g.tileFt });
  }
  delete r.ground;
  if (decals.length) r.decals = decals;
}

function mergeCase(file) {
  const errorsBefore = errors.length;
  const f = JSON.parse(readFileSync(file, "utf8"));
  for (const r of f.rooms ?? []) normalize(r);
  const CASE = String(f.case ?? "").toUpperCase();
  if (!CASE) return err(`${file}: no case`);
  const prefix = prefixOf(CASE);
  const mine = (id) => id.startsWith(`${prefix}_`);
  const styleKey = m.styles?.[prefix] ? prefix : prefix.startsWith("s001") && m.styles?.s001 ? "s001" : prefix;

  if (!f.look || typeof f.look !== "string") err(`${CASE}: no look line`);
  else checkText(`${CASE} look`, f.look);

  const images = (f.images ?? []).map((i) => ({ ...i, style: i.style ?? prefix }));
  const ids = new Set();
  for (const i of images) {
    const w = `${CASE} ${i.id}`;
    if (!ID.test(i.id ?? "")) err(`${w}: bad id`);
    if (!mine(i.id)) err(`${w}: id must start with ${prefix}_`);
    if (ids.has(i.id)) err(`${w}: listed twice`);
    ids.add(i.id);
    if (!WALK.has(i.kind)) err(`${w}: kind "${i.kind}" is not a walkable kind`);
    if (i.size && !SIZES.has(i.size)) err(`${w}: size ${i.size}`);
    if (i.size && i.kind !== "piece") warn.push(`${w}: size only applies to pieces; dropped`), delete i.size;
    checkText(w, i.subject);
  }

  // Everything a room names must be a picture in this file (or already in the manifest).
  const known = new Set([...ids, ...m.images.map((i) => i.id)]);
  const roomIds = new Set();
  const named = new Set();
  const need = (room, id, what) => {
    if (!id) return;
    named.add(id);
    if (!known.has(id)) err(`${CASE} room ${room}: ${what} "${id}" is not listed`);
  };
  for (const r of f.rooms ?? []) {
    if (!ID.test(r.id ?? "")) err(`${CASE} room ${r.id}: bad id`);
    if (roomIds.has(r.id)) err(`${CASE} room ${r.id}: listed twice`);
    roomIds.add(r.id);
    r.case = CASE;
    if (!r.name) err(`${CASE} room ${r.id}: no name`);
    if (r.reuse) {
      // A room built once elsewhere, with only this case's own things added.
      for (const side of ["front", "back", "left", "right"]) for (const p of r.extras?.walls?.[side] ?? []) need(r.id, p.image, `${side} piece`);
      for (const mo of r.extras?.models ?? []) need(r.id, mo.image, "model");
      continue;
    }
    const [w, d, h] = r.sizeFt ?? [];
    if (!(w > 0 && d > 0 && (h > 0 || r.type === "exterior"))) err(`${CASE} room ${r.id}: sizeFt must be [width, depth, height]`);
    else if (r.type !== "exterior" && w * d < 110) warn.push(`${CASE} room ${r.id}: only ${w * d} sq ft`);
    need(r.id, r.wall?.image, "wall");
    need(r.id, r.wall?.lower, "lower wall");
    need(r.id, r.floor?.image, "floor");
    need(r.id, r.ceiling?.image, "ceiling");
    for (const t of ["base", "rail", "crown"]) need(r.id, r.trim?.[t]?.image, `${t} trim`);
    for (const fx of r.fixtures ?? []) need(r.id, fx.image, "fixture");
    for (const side of ["front", "back", "left", "right"]) {
      for (const p of r.walls?.[side] ?? []) {
        need(r.id, p.image, `${side} piece`);
        need(r.id, p.outside, `${side} outside`);
        const len = side === "front" || side === "back" ? w : d;
        if (p.image && len && p.fromLeftFt != null && p.widthFt != null && (p.fromLeftFt < 0 || p.fromLeftFt + p.widthFt > len + 0.01)) err(`${CASE} room ${r.id}: ${p.image} runs off the ${side} wall (${len} ft)`);
        if (p.image && h && p.bottomFt != null && p.heightFt != null && p.bottomFt + p.heightFt > h + 0.01) err(`${CASE} room ${r.id}: ${p.image} is taller than the ${side} wall`);
      }
    }
    for (const dc of r.decals ?? []) need(r.id, dc.image, "decal");
    for (const dr of r.doors ?? []) need(r.id, dr.model, "door model");
    for (const mo of r.models ?? []) {
      need(r.id, mo.image, "model");
      const [x, z] = mo.atFt ?? [];
      if (w && d && (x < 0 || x > w || z < 0 || z > d)) (r.type === "exterior" ? warn.push.bind(warn) : err)(`${CASE} room ${r.id}: model ${mo.image} sits outside the room`);
    }
  }
  for (const i of images) {
    if (!i.room) warn.push(`${CASE} ${i.id}: no room`);
    else if (!roomIds.has(i.room)) err(`${CASE} ${i.id}: room "${i.room}" has no room record`);
    if (!named.has(i.id)) warn.push(`${CASE} ${i.id}: listed but no room uses it`);
  }

  const fixes = new Map();
  for (const x of f.fixes ?? []) {
    const img = m.images.find((i) => i.id === x.id);
    if (!img) err(`${CASE} fix ${x.id}: no such image`);
    else if (!["portrait", "evidence", "map"].includes(img.kind)) err(`${CASE} fix ${x.id}: only portraits, evidence and maps are fixed`);
    else (checkText(`${CASE} fix ${x.id}`, x.subject), fixes.set(x.id, x.subject.trim()));
  }

  if (errors.length > errorsBefore) return;
  const before = m.images.filter((i) => mine(i.id)).length;
  const retired = m.images.filter((i) => mine(i.id) && RETIRED.has(i.kind)).length;
  m.images = m.images.filter((i) => !(mine(i.id) && (RETIRED.has(i.kind) || WALK.has(i.kind) || i.kind === "turn")));
  for (const i of m.images) if (fixes.has(i.id)) i.subject = fixes.get(i.id);
  const turns = turnsFor(prefix).map((t) => ({ ...t, style: styleKey === prefix ? prefix : prefix }));
  m.images.push(...images.map((i) => clean({ ...i, style: prefix })), ...turns.map(clean));
  m.looks = { ...(m.looks ?? {}), [prefix]: f.look.trim() };
  m.rooms = [...(m.rooms ?? []).filter((r) => String(r.case).toUpperCase() !== CASE), ...(f.rooms ?? [])];
  const kinds = {};
  for (const i of images) kinds[i.kind] = (kinds[i.kind] ?? 0) + 1;
  console.log(`${CASE}: ${(f.rooms ?? []).length} rooms; retired ${retired} old 2D entries; added ${images.length} (${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(", ")}) and ${turns.length} character views; ${fixes.size} fixes; ${before} -> ${m.images.filter((i) => mine(i.id)).length} entries.`);
}

const args = process.argv.slice(2);
if (args[0] === "--turns-only") {
  const prefix = args[1];
  m.images = m.images.filter((i) => !(i.id.startsWith(`${prefix}_turn_`)));
  const turns = turnsFor(prefix);
  m.images.push(...turns.map(clean));
  console.log(`${prefix}: ${turns.length} character views.`);
} else {
  for (const a of args) mergeCase(a);
}
for (const w of warn) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`${errors.length} error(s); nothing written.`);
  process.exit(1);
}
writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");
