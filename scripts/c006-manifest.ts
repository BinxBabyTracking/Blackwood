/**
 * C006 design checks for the evidence manifest and the deduction matrix,
 * runnable before the rest of the case exists, and the readable manifest.
 *
 *   npx tsx --conditions=react-server scripts/c006-manifest.ts           checks
 *   npx tsx --conditions=react-server scripts/c006-manifest.ts --doc     checks, then prints the manifest as Markdown
 */
import { evidence } from "../src/cases/C006/evidence";
import { MANIFEST, OTHER_ROLES } from "../src/cases/C006/manifest";
import { DEDUCTIONS } from "../src/cases/C006/deductions";
import { chapters, objectives } from "../src/cases/C006/chapters";
import type { Condition } from "../src/game/engine/types";

/** The 30 locations and 15 interviewable people C006 is being built with (Phases 6 and 7). */
export const C006_LOCATIONS: Record<string, string> = {
  office: "L01 Blackwood Field Office",
  mill_gate: "L02 Hollow Creek Steel: East Gate",
  tool_crib: "L03 Tool Crib 4",
  shop_floor: "L04 East Mill Shop Floor",
  admin_building: "L05 West End Administration Building",
  maint_office: "L06 Former Maintenance Office",
  loading_yard: "L07 West End Loading Yard and Gallery B",
  lasko_home: "L08 Lasko Family Home",
  reeves_auto: "L09 Reeves Auto Repair",
  police: "L10 Hollow Creek Police Department",
  forensic: "L11 County Forensic Office",
  newspaper: "L12 The Mon Valley Record",
  borough: "L13 Borough Municipal Records",
  regulatory: "L14 County Regulatory Archive",
  union_hall: "L15 Steelworkers Local 2177 Hall",
  sutter_home: "L16 Sutter House",
  storage: "L17 Creekside Self Storage, Unit 14",
  stroud_office: "L18 Stroud Riverfront Development",
  trent_office: "L19 Trent Protective Services",
  greer_home: "L20 Greer House",
  laurel_road: "L21 Laurel Hollow Road",
  camp: "L22 The Camp",
  medical_station: "L23 Former Mill Medical Station",
  corso_photo: "L24 Corso Photo and Frame",
  sloan_home: "L25 Sloan House",
  pierce_home: "L26 Pierce House",
  river_gate: "L27 West End Gate and River Ramp",
  courthouse: "L28 County Courthouse Records",
  rail_building: "L29 Abandoned Rail Service Building",
  mill_reconstruction: "L30 East Mill: The Reconstruction",
};
export const C006_PEOPLE = ["sarah", "wade", "stroud", "trent", "glenn", "len", "evelyn", "ray", "earl", "rebecca", "andrew", "mitchell", "brooks", "jessica", "karen"];

const problems: string[] = [];
const warn: string[] = [];
const ids = evidence.map((e) => e.id);
const want = Array.from({ length: 100 }, (_, i) => `E${String(i + 1).padStart(3, "0")}`);

if (evidence.length !== 100) problems.push(`expected 100 evidence items, found ${evidence.length}`);
for (const id of want) if (!ids.includes(id)) problems.push(`missing evidence ${id}`);
if (new Set(ids).size !== ids.length) problems.push("duplicate evidence ids");
ids.forEach((id, i) => id !== want[i] && problems.push(`evidence out of order at ${i}: ${id}`));

const BRITISH = /\b(colour|grey|neighbour|cheque|jewellery|kerb|centre|favour|labour|honour|organise|realise|travelled|metre|tyre|programme|licence)\b/i;
for (const e of evidence) {
  const text = [e.title, e.description, e.inspection, e.discovery, ...(e.readAloud ?? []).map((r) => r.text)].join(" ");
  if (text.includes("\u2014")) problems.push(`${e.id} uses an em dash`);
  if (BRITISH.test(text)) problems.push(`${e.id} uses a British spelling: ${text.match(BRITISH)![0]}`);
  if (/to be supplied|lorem|TODO|TBD/i.test(text)) problems.push(`${e.id} has placeholder text`);
  if (e.inspection.length < 250) problems.push(`${e.id} inspection text is too thin (${e.inspection.length} chars)`);
  if (!C006_LOCATIONS[e.sourceLocationId]) problems.push(`${e.id} is in unknown location ${e.sourceLocationId}`);
  for (const c of e.characters) if (!C006_PEOPLE.includes(c)) problems.push(`${e.id} names unknown person ${c}`);
  for (const r of e.related) if (!ids.includes(r)) problems.push(`${e.id} relates to unknown ${r}`);
  if (e.image !== `ev.${e.id.toLowerCase()}`) problems.push(`${e.id} image key should be ev.${e.id.toLowerCase()}`);
}

// Manifest agrees with the evidence.
const meta = new Map(MANIFEST.map((m) => [m.id, m]));
if (MANIFEST.length !== 100 || meta.size !== 100) problems.push(`manifest has ${MANIFEST.length} entries (${meta.size} unique)`);
for (const id of want) if (!meta.has(id)) problems.push(`manifest missing ${id}`);
for (const m of MANIFEST) {
  if (!ids.includes(m.id)) problems.push(`manifest names unknown ${m.id}`);
  if (m.chapter < 1 || m.chapter > 6) problems.push(`${m.id} has chapter ${m.chapter}`);
  if (m.prompt.includes("\u2014") || m.unlock.includes("\u2014")) problems.push(`${m.id} manifest uses an em dash`);
}

// Deduction matrix.
const ded = DEDUCTIONS.map((x) => x.def);
const dmeta = new Map(DEDUCTIONS.map((x) => [x.def.id, x.meta]));
const dids = ded.map((x) => x.id);
const wantD = Array.from({ length: 35 }, (_, i) => `D${String(i + 1).padStart(2, "0")}`);
if (ded.length !== 35) problems.push(`expected 35 deductions, found ${ded.length}`);
wantD.forEach((id, i) => dids[i] !== id && problems.push(`deduction ${i + 1} should be ${id}, is ${dids[i]}`));
const chains: Record<string, string[]> = { A: wantD.slice(0, 5), B: wantD.slice(5, 10), C: wantD.slice(10, 15), D: wantD.slice(15, 20), E: wantD.slice(20, 25), F: wantD.slice(25, 30), G: wantD.slice(30, 35) };
for (const [chain, list] of Object.entries(chains)) for (const id of list) if (dmeta.get(id)?.chain !== chain) problems.push(`${id} should be in chain ${chain}`);

function deps(c: Condition | undefined, out: { d: string[]; chapter: number }) {
  if (!c) return out;
  if ("all" in c) c.all.forEach((x) => deps(x, out));
  else if ("any" in c) c.any.forEach((x) => deps(x, out));
  else if ("deduction" in c) out.d.push(c.deduction);
  else if ("chapter" in c) out.chapter = Math.max(out.chapter, c.chapter);
  return out;
}
const itemChapter = (id: string) => (C006_PEOPLE.includes(id) ? 1 : meta.get(id)?.chapter ?? 99);
const reachable = new Map<string, number>(); // deduction -> earliest chapter it can be made
for (const x of ded) {
  const m = dmeta.get(x.id)!;
  const text = `${x.title} ${x.text}`;
  if (text.includes("\u2014")) problems.push(`${x.id} uses an em dash`);
  if (x.connections.length < 2 && x.id !== "D35") warn.push(`${x.id} has only one connection pair`);
  const pairChapters = x.connections.map(([a, b]) => {
    for (const i of [a, b]) if (!ids.includes(i) && !C006_PEOPLE.includes(i)) problems.push(`${x.id} connects unknown item ${i}`);
    if (a === b) problems.push(`${x.id} connects ${a} to itself`);
    return Math.max(itemChapter(a), itemChapter(b));
  });
  const early = Math.min(...pairChapters);
  x.connections.forEach(([a, b], i) => {
    if (pairChapters[i] > m.chapter) problems.push(`${x.id} (chapter ${m.chapter}) pair ${a} + ${b} needs evidence from chapter ${pairChapters[i]}`);
  });
  const r = deps(x.requires, { d: [], chapter: 1 });
  for (const dep of r.d) {
    if (!dids.includes(dep)) problems.push(`${x.id} requires unknown ${dep}`);
    if (dids.indexOf(dep) >= dids.indexOf(x.id)) problems.push(`${x.id} requires ${dep}, which is not earlier (possible cycle)`);
  }
  const depChapter = Math.max(1, ...r.d.map((dd) => reachable.get(dd) ?? 99));
  const at = Math.max(early, r.chapter, depChapter);
  reachable.set(x.id, at);
  if (at > m.chapter) problems.push(`${x.id} belongs to chapter ${m.chapter} but cannot be made before chapter ${at}`);
  if (pairChapters.some((c) => c > 6)) problems.push(`${x.id} uses evidence with no chapter`);
}

// Chapters: every objective refers to real things, and can be done within its chapter.
function refs(c: Condition | undefined, out: { ev: string[]; d: string[] } = { ev: [], d: [] }) {
  if (!c) return out;
  if ("all" in c) c.all.forEach((x) => refs(x, out));
  else if ("any" in c) c.any.forEach((x) => refs(x, out));
  else if ("not" in c) refs(c.not, out);
  else if ("hasEvidence" in c) out.ev.push(c.hasEvidence);
  else if ("deduction" in c) out.d.push(c.deduction);
  return out;
}
if (chapters.length !== 6) problems.push(`expected 6 chapters, found ${chapters.length}`);
for (const ch of chapters) {
  for (const oid of [...ch.objectives, ...(ch.optional ?? [])]) {
    const o = objectives.find((x) => x.id === oid);
    if (!o) {
      problems.push(`chapter ${ch.number} lists unknown objective ${oid}`);
      continue;
    }
    const r = refs(o.done);
    for (const e of r.ev) if ((meta.get(e)?.chapter ?? 99) > ch.number) problems.push(`objective ${oid} (chapter ${ch.number}) needs ${e}, found only in chapter ${meta.get(e)?.chapter}`);
    for (const dd of r.d) if ((reachable.get(dd) ?? 99) > ch.number) problems.push(`objective ${oid} (chapter ${ch.number}) needs ${dd}, reachable only in chapter ${reachable.get(dd)}`);
  }
  for (const s of [ch.title, ch.intro, ch.conclusion, ch.summary]) if (s.includes("\u2014")) problems.push(`chapter ${ch.number} uses an em dash`);
}
for (const o of objectives) if (!chapters.some((ch) => ch.objectives.includes(o.id) || ch.optional?.includes(o.id))) problems.push(`objective ${o.id} is in no chapter`);
for (const dd of Object.keys(Object.fromEntries(dmeta))) {
  const m = dmeta.get(dd)!;
  if (m.required && !objectives.some((o) => refs(o.done).d.includes(dd)) && !ded.some((x) => deps(x.requires, { d: [], chapter: 1 }).d.includes(dd))) warn.push(`${dd} is required but no objective or deduction needs it`);
}

// Every evidence item contributes: a deduction, or a named role in the report or timelines (set in later phases).
const used = new Set(ded.flatMap((x) => x.connections.flat()));
const unused = want.filter((id) => !used.has(id) && !OTHER_ROLES[id]);
for (const id of Object.keys(OTHER_ROLES)) if (used.has(id)) warn.push(`${id} has an other role but is also in a deduction`);
if (unused.length) warn.push(`${unused.length} items are in no deduction (report, timeline or interview roles): ${unused.join(", ")}`);
for (const id of unused) if (meta.get(id)?.critical) warn.push(`${id} is marked critical but is in no deduction`);

// Every location holds at least something, or is a route.
const ROUTES = new Set(["mill_gate"]);
for (const loc of Object.keys(C006_LOCATIONS)) {
  if (!ROUTES.has(loc) && !evidence.some((e) => e.sourceLocationId === loc) && !["sloan_home"].includes(loc)) warn.push(`no evidence at ${loc}`);
}

if (process.argv.includes("--doc")) printDoc();
for (const w of warn) console.warn(`note: ${w}`);
if (problems.length) {
  console.error(`C006 manifest checks failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.error(`C006 manifest checks passed: ${evidence.length} evidence, ${ded.length} deductions.`);

function printDoc() {
  const byEv = new Map<string, string[]>();
  for (const x of ded) for (const [a, b] of x.connections) for (const i of [a, b]) byEv.set(i, [...new Set([...(byEv.get(i) ?? []), x.id])]);
  const name = (id: string) => evidence.find((e) => e.id === id)?.title ?? id;
  const out: string[] = [];
  out.push("# C006 Evidence Manifest and Deduction Matrix", "");
  out.push("Generated from `src/cases/C006/` by `scripts/c006-manifest.ts --doc`. Every item's full player-visible text is in the code (`evidence/`); this manifest gives the design facts and the opening of each document.", "");
  out.push("## Deduction matrix", "");
  out.push("| ID | Chain | Ch. | Title | Any one of these connections | Also needs | Required | Unlocks |", "| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const x of ded) {
    const m = dmeta.get(x.id)!;
    const r = deps(x.requires, { d: [], chapter: 1 });
    const needs = [...r.d, ...(r.chapter > 1 ? [`chapter ${r.chapter}`] : [])].join(", ") || "";
    out.push(`| ${x.id} | ${m.chain} | ${m.chapter} | ${x.title} | ${x.connections.map(([a, b]) => `${a} + ${b}`).join("; ")} | ${needs} | ${m.required ? "Yes" : "Supporting"} | ${m.unlocks} |`);
  }
  out.push("", "Conclusions, as the notebook records them:", "");
  for (const x of ded) out.push(`- **${x.id} ${x.title}.** ${x.text}`);
  const groups: Record<string, string> = { A: "Group A: Emily's disappearance (E001 to E020)", B: "Group B: the 1996 accident (E021 to E040)", C: "Group C: Glenn Sutter's murder (E041 to E060)", D: "Group D: Len Greer's abduction (E061 to E080)", E: "Group E: final connections (E081 to E100)" };
  for (const g of Object.keys(groups)) {
    out.push("", `## ${groups[g]}`, "");
    for (const m of MANIFEST.filter((x) => x.group === g)) {
      const e = evidence.find((x) => x.id === m.id)!;
      out.push(`### ${e.id} ${e.title}`, "");
      out.push(`- **Type:** ${m.type}. **${m.critical ? "Critical" : "Supporting"}.** **Chapter ${m.chapter}.**`);
      out.push(`- **Found:** ${C006_LOCATIONS[e.sourceLocationId]}, by ${m.via}. ${m.unlock}`);
      out.push(`- **Provenance:** ${m.provenance}`);
      out.push(`- **People:** ${e.characters.join(", ") || "none"}. **Related:** ${e.related.map((r) => `${r} ${name(r)}`).join("; ")}.`);
      out.push(`- **Deductions:** ${(byEv.get(e.id) ?? []).join(", ") || "none"}.${OTHER_ROLES[e.id] ? ` ${OTHER_ROLES[e.id]}` : ""}`);
      out.push(`- **Notebook entry:** ${e.description}`);
      if (m.limits) out.push(`- **Limits:** ${m.limits}`);
      out.push(`- **Image (ev.${e.id.toLowerCase()}, 1024x1024):** ${m.prompt}`);
      const first = e.inspection.split("\n\n").slice(0, 2).join(" ");
      out.push(`- **Document opens:** ${first.length > 420 ? `${first.slice(0, 420).replace(/\s\S*$/, "")}...` : first}`, "");
    }
  }
  console.log(out.join("\n"));
}
