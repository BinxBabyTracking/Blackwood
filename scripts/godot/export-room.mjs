// Exports the website's walkable rooms (src/game/walk/*.ts) for the Godot client:
//  - writes each room as JSON to godot/data/<file>.json, with asset paths rewritten to res://
//  - copies every picture and model the room uses into godot/rooms/
//  - removes the mesh quantization from the models (Godot can't import KHR_mesh_quantization)
//  - copies the case's paintings (portraits, evidence, map) into godot/art/
// Usage (from the repo root): node scripts/godot/export-room.mjs
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";

const ROOMS = [
  ["c001-office", "C001_OFFICE"],
  ["c001-house", "C001_HOUSE"],
  ["c001-diner", "C001_DINER"],
  ["c001-apartment", "C001_DANIEL_APARTMENT"],
  ["c001-margaret", "C001_MARGARET_HOUSE"],
  ["c001-garage", "C001_GARAGE"],
  ["c001-bank", "C001_BANK"],
];
const CASE_ART = /^c001_(ev_|portrait_|map|cover|obj_|loc_|figure_)/;

const glbs = new Set();
const copyAsset = (p) => {
  const src = `public${p}`;
  const dst = `godot${p}`;
  if (!existsSync(src)) return console.warn("missing", src);
  mkdirSync(dirname(dst), { recursive: true });
  if (!existsSync(dst)) {
    copyFileSync(src, dst);
    if (dst.endsWith(".glb")) glbs.add(dst);
  }
};

for (const [file, name] of ROOMS) {
  const src = readFileSync(`src/game/walk/${file}.ts`, "utf8");
  const start = src.indexOf(`export const ${name}`);
  const room = JSON.parse(src.slice(src.indexOf("{", src.indexOf("=", start)), src.lastIndexOf("}") + 1));
  const walk = (v) => {
    if (typeof v === "string" && v.startsWith("/rooms/")) {
      copyAsset(v);
      return "res:/" + v;
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  mkdirSync("godot/data", { recursive: true });
  writeFileSync(`godot/data/${file.replace(/-/g, "_")}.json`, JSON.stringify(walk(room), null, 1) + "\n");
  console.log("wrote", `godot/data/${file.replace(/-/g, "_")}.json`);
}

for (const g of glbs) {
  execFileSync("npx", ["-y", "@gltf-transform/cli@4", "dequantize", g, g], { stdio: "ignore" });
  console.log("dequantized", g);
}

mkdirSync("godot/art", { recursive: true });
for (const f of readdirSync("public/art")) if (CASE_ART.test(f)) copyFileSync(`public/art/${f}`, `godot/art/${f}`);
console.log("copied case art");
