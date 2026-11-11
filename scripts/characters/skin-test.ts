/* Tries the skinning on local files: tsx scripts/characters/skin-test.ts base.glb base.kit front.png side.png back.png out.glb */
import { readFileSync, writeFileSync } from "node:fs";
import { skinCharacter } from "../../src/lib/skinning";

const [base, kit, front, side, back, out] = process.argv.slice(2);
const t = Date.now();
skinCharacter({ base: readFileSync(base), kit: readFileSync(kit), front: readFileSync(front), side: readFileSync(side), back: readFileSync(back), name: "Test" }).then((r) => {
  writeFileSync(out, r.glb);
  for (const [k, v] of Object.entries(r.textures)) writeFileSync(out.replace(/\.glb$/, `_${k}.${v[0] === 0x89 ? "png" : "jpg"}`), v);
  console.log(r.report.join("\n"), `\n${(r.glb.length / 1048576).toFixed(1)} MB in ${Date.now() - t} ms`);
});
