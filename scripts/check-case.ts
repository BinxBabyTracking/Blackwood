/**
 * Validates a case definition and plays it through to the end with the real
 * engine. Run: npm run check:case -- C001
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadCase } from "../src/game/registry";
import { newState, reduce, project } from "../src/game/engine/engine";
import type { CaseDefinition, GameAction, InvestigationState } from "../src/game/engine/types";

const id = process.argv[2] ?? "C001";
const def = loadCase(id) as CaseDefinition;
if (!def) throw new Error(`No case ${id}`);
const problems: string[] = [];

// ---- static checks ----
const evIds = new Set(def.evidence.map((e) => e.id));
const charIds = new Set(def.characters.map((c) => c.id));
const locIds = new Set(def.locations.map((l) => l.id));
const qIds = new Set(def.questions.map((q) => q.id));
for (const [k, url] of Object.entries(def.assets.images)) if (!existsSync(join("public", url))) problems.push(`missing asset file ${k} -> ${url}`);
const keys = new Set(Object.keys(def.assets.images));
for (const e of def.evidence) if (!keys.has(e.image)) problems.push(`evidence ${e.id} image key ${e.image}`);
for (const c of def.characters) if (!keys.has(c.portrait)) problems.push(`portrait ${c.id}`);
for (const l of def.locations) {
  const bgs = typeof l.background === "string" ? [l.background] : Object.values(l.background.states);
  for (const b of bgs) if (!keys.has(b)) problems.push(`background ${l.id} ${b}`);
  for (const h of l.hotspots) {
    const it = h.interaction;
    if (it.type === "inspect" && it.evidence && !evIds.has(it.evidence)) problems.push(`hotspot ${h.id} evidence ${it.evidence}`);
    if (it.type === "talk" && !charIds.has(it.characterId)) problems.push(`hotspot ${h.id} char`);
    if (it.type === "travel" && !locIds.has(it.locationId)) problems.push(`hotspot ${h.id} travel`);
  }
}
for (const d of def.deductions) for (const pair of d.connections) for (const x of pair) if (!evIds.has(x) && !charIds.has(x)) problems.push(`deduction ${d.id} item ${x}`);
const json = JSON.stringify(def);
for (const m of json.matchAll(/"asked":"([^"]+)"/g)) if (!qIds.has(m[1])) problems.push(`condition references unknown question ${m[1]}`);
const flagsSet = new Set([...json.matchAll(/"setFlag":"([^"]+)"/g)].map((m) => m[1]).concat(["casefile_read", "case_closed"]));
for (const m of json.matchAll(/"flag":"([^"]+)"/g)) if (!flagsSet.has(m[1])) problems.push(`flag never set: ${m[1]}`);

// ---- playthrough ----
let s: InvestigationState = newState(def, 0);
let t = 1000;
const run = (a: GameAction) => {
  const r = reduce(def, s, a, (t += 5000));
  s = r.state;
  return r.outcome;
};
const hot = (hid: string) => run({ type: "hotspot", hotspotId: hid });
const ask = (q: string) => run({ type: "ask", questionId: q });
const collect = (e: string) => run({ type: "collect", evidenceId: e });
const go = (l: string) => run({ type: "travel", locationId: l });

run({ type: "dismissIntro" });
// Cannot cheat-collect before discovery
try { collect("E05"); problems.push("collected E05 without discovering it"); } catch {}
run({ type: "readDocument", documentId: "casefile" });
collect("E06"); collect("E12");
hot("office_recorder");
go("living_room");
for (const h of ["lr_chair", "lr_glass", "lr_ledger", "lr_drawer", "lr_sideboard"]) hot(h);
for (const e of ["E07", "E02", "E03", "E08"]) collect(e);
hot("lr_to_kitchen");
for (const h of ["k_window", "k_door", "k_calendar"]) hot(h);
for (const e of ["E01", "E10", "E09"]) collect(e);
go("margaret_house");
run({ type: "talk", characterId: "margaret" });
ask("margaret_evening"); ask("margaret_eleanor_mood"); ask("margaret_daniel");
if (s.events.includes("RE01")) problems.push("RE01 fired while at Margaret's");
go("daniel_apartment");
if (!s.events.includes("RE01")) problems.push("RE01 did not fire after leaving Margaret's");
hot("da_coats_a");
run({ type: "talk", characterId: "daniel" });
ask("daniel_evening"); ask("daniel_hand");
if (!s.evidence.includes("E14")) problems.push("E14 not given");
if (s.env.daniel_apartment === "B") problems.push("RE02 fired while in apartment");
go("diner");
if (s.env.daniel_apartment !== "B") problems.push("RE02 did not fire");
run({ type: "talk", characterId: "rosa" });
ask("rosa_saturday"); ask("rosa_customer");
hot("d_spike"); hot("d_schedule"); collect("E04"); collect("E13");
go("patricia_office");
ask("patricia_evening"); ask("patricia_money");
if (!s.events.includes("RE03")) problems.push("RE03 did not fire");
go("robert_garage"); ask("robert_evening"); ask("robert_cars");
go("daniel_apartment"); hot("da_coats_b");
go("office");
const call = run({ type: "answerCall", callId: "call_margaret_sedan" });
if (call.kind !== "call") problems.push("call not answered");
run({ type: "placeCall", callId: "call_bennett_lab" });
run({ type: "placeCall", callId: "call_bennett_jacket" });
for (const d of ["lab_report", "jacket_recovered", "patricia_envelope"]) run({ type: "openDelivery", deliveryId: d });
for (const e of ["E11", "E05", "E15"]) collect(e);
if (s.evidence.length !== 15) problems.push(`collected ${s.evidence.length}/15: missing ${[...evIds].filter((e) => !s.evidence.includes(e))}`);

// board
const pins = ["E01", "E10", "E02", "E11", "E14", "E03", "E15", "E04", "E13", "E06", "E07", "E05", "E09", "E08", "E12", "daniel"];
pins.forEach((p, i) => run({ type: "boardAdd", itemId: p, x: (i * 7) % 90, y: (i * 13) % 90 }));
const wrong = run({ type: "connect", a: "E01", b: "E05" });
if (wrong.kind === "deduction") problems.push("wrong connection produced a deduction");
run({ type: "disconnect", a: "E01", b: "E05" });
for (const [a, b] of [["E01", "E10"], ["E02", "E11"], ["E14", "E11"], ["E03", "E15"], ["E09", "E03"], ["E04", "E13"], ["E05", "E11"], ["E06", "E07"]]) {
  const o = run({ type: "connect", a, b });
  if (o.kind !== "deduction") problems.push(`no deduction for ${a}-${b}`);
}
if (s.deductions.length !== def.deductions.length) problems.push(`deductions ${s.deductions.length}/${def.deductions.length}`);

// conclusion
const bad = run({ type: "submitConclusion", theory: { culprit: "robert", motive: "debt", weapon: "poker", location: "kitchen", evidence: ["E01"] } });
if (bad.kind !== "verdict" || bad.correct) problems.push("wrong theory accepted");
const weak = run({ type: "submitConclusion", theory: { culprit: "daniel", motive: "embezzlement", weapon: "knife", location: "living_room", evidence: ["E01"] } });
if (weak.kind !== "verdict" || weak.correct) problems.push("under-supported theory accepted");
const good = run({ type: "submitConclusion", theory: { culprit: "daniel", motive: "embezzlement", weapon: "knife", location: "living_room", evidence: ["E11", "E14", "E03", "E13", "E01"] } });
if (good.kind !== "verdict" || !good.correct) problems.push("correct theory rejected");

// view must not leak restricted content
const view = JSON.stringify(project(def, newState(def)));
for (const secret of ["embezzlement\",\"weapon", "evidenceGroups", "D_HAND", "Type B", "Saturday, 11:20 PM"]) if (view.includes(secret)) problems.push(`initial view leaks ${secret}`);

console.log(`${id}: ${def.evidence.length} evidence, ${def.locations.length} locations, ${def.questions.length} questions, ${def.deductions.length} deductions`);
console.log(`playthrough: status=${s.status} attempts=${s.attempts} events=${s.events.join(",")} active=${s.activeSeconds}s`);
if (problems.length) {
  console.error("PROBLEMS:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("All checks passed.");
