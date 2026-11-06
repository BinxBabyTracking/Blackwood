// Writes a walkable room (src/game/walk/*.ts) as JSON for the Godot client, with asset paths
// rewritten to res://. Usage: node scripts/godot/export-room.mjs c001-office C001_OFFICE
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const [file, name] = process.argv.slice(2);
const src = readFileSync(`src/game/walk/${file}.ts`, "utf8");
const start = src.indexOf(`export const ${name}`);
const json = src.slice(src.indexOf("{", src.indexOf("=", start)), src.lastIndexOf("}") + 1);
const room = JSON.parse(json);
let out = JSON.stringify(room, null, 1)
  .replaceAll('"/rooms/c001-bank/models/phone.glb"', '"/rooms/c001-office/models/phone.glb"')
  .replace(/"\/rooms\//g, '"res://rooms/');
mkdirSync("godot/data", { recursive: true });
writeFileSync(`godot/data/${file.replace(/-/g, "_")}.json`, out + "\n");
console.log("wrote", `godot/data/${file.replace(/-/g, "_")}.json`);
