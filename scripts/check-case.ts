/**
 * Validates a case definition and plays it through to the end with the real
 * engine. Run: npm run check:case -- C001
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadCase } from "../src/game/registry";
import { newState, normalizeState, reduce, project, spokenLine, questionOpen, interviewCandidates, characterKnowledge, characterLocation } from "../src/game/engine/engine";
import { check } from "../src/game/engine/rules";
import { bestMatch } from "../src/game/engine/matcher";
import { credits, questionsLeft } from "../src/game/engine/questions";
import { CASES as MATCH_CASES } from "./match-eval";
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

// dialogue references
const dedIds = new Set(def.deductions.map((d) => d.id));
for (const q of def.questions) {
  if (!charIds.has(q.characterId)) problems.push(`question ${q.id} unknown character`);
  for (const u of q.unlocks ?? []) if (!qIds.has(u)) problems.push(`question ${q.id} unlocks unknown ${u}`);
  for (const e of q.requiresEvidence ?? []) if (!evIds.has(e)) problems.push(`question ${q.id} requires unknown evidence ${e}`);
  for (const d of q.requiresDeductions ?? []) if (!dedIds.has(d)) problems.push(`question ${q.id} requires unknown deduction ${d}`);
}
for (const m of json.matchAll(/"deduction":"([^"]+)"/g)) if (!dedIds.has(m[1])) problems.push(`condition references unknown deduction ${m[1]}`);
const xIds = new Set(def.contradictions.map((c) => c.id));
for (const m of json.matchAll(/"contradiction":"([^"]+)"/g)) if (!xIds.has(m[1])) problems.push(`condition references unknown contradiction ${m[1]}`);
for (const r of def.reactions) if (!evIds.has(r.evidenceId) || !charIds.has(r.characterId)) problems.push(`reaction ${r.characterId}:${r.evidenceId}`);
// every interviewable character has one consistent, distinct voice
const interviewees = def.characters.filter((c) => def.questions.some((q) => q.characterId === c.id));
const voiceIds = interviewees.map((c) => c.voice?.voiceId);
if (voiceIds.some((v) => !v)) problems.push(`characters without a voice: ${interviewees.filter((c) => !c.voice).map((c) => c.id)}`);
if (new Set(voiceIds).size !== voiceIds.length) problems.push("two characters share a voice");
for (const st of def.statements) for (const l of st.transcript) if (!def.characters.find((c) => c.id === l.speakerId)?.voice) problems.push(`statement ${st.characterId} speaker ${l.speakerId} has no voice`);
for (const st of def.statements) if (!st.officer || !st.tape || !st.recordedAt) problems.push(`statement ${st.characterId} missing metadata`);
if (def.statements.length !== 4) problems.push("expected four police statements");
// house style and no premature solution in anything a character says
const spoken = [
  ...def.questions.flatMap((q) => [q.prompt, ...q.reply, ...(q.variants ?? []).flatMap((v) => v.reply)]),
  ...def.reactions.flatMap((r) => r.reply),
  ...def.statements.flatMap((st) => st.transcript.map((l) => l.text)),
  ...def.calls.flatMap((c) => c.lines),
];
for (const line of spoken) {
  if (line.includes("\u2014")) problems.push(`em dash in dialogue: ${line.slice(0, 60)}`);
  if (/\b(murderer|killed her|he killed|mercer killed|daniel killed)\b/i.test(line)) problems.push(`dialogue may reveal the solution: ${line.slice(0, 80)}`);
}
if (JSON.stringify(def).includes("\u2014")) problems.push("em dash somewhere in case content");

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
collect("E12");
// Nothing from the lab is on the desk at the start: the glass has to be sent first.
if (project(def, s).location.hotspots.some((h) => h.id === "office_labreport" || h.id === "office_labsamples")) problems.push("lab results on the desk before anything was sent");
try { collect("E11"); problems.push("E11 collected before the glass went to the lab"); } catch {}
go("living_room");
for (const h of ["lr_chair", "lr_glass", "lr_ledger", "lr_drawer", "lr_diary", "lr_sideboard"]) hot(h);
for (const e of ["E07", "E02", "E03", "E08", "E09"]) collect(e);
try { collect("E07"); problems.push("E07 collected twice"); } catch {}
if (s.evidence.filter((e) => e === "E07").length !== 1) problems.push("E07 duplicated in evidence list");
const d07 = s.discoveries.E07;
if (!d07 || d07.locationId !== "living_room" || d07.via !== "scene" || d07.sceneState !== "A") problems.push(`E07 discovery not recorded: ${JSON.stringify(d07)}`);
if (!s.notebook.some((n) => n.id === "evidence:E07")) problems.push("E07 missing from notebook");
const v07 = project(def, s).evidence.find((e) => e.id === "E07");
if (v07?.foundAt !== "Eleanor's Living Room" || !v07.collected) problems.push(`E07 view wrong: ${JSON.stringify(v07)}`);
hot("lr_to_kitchen");
for (const h of ["k_window", "k_door", "k_knives", "k_calendar"]) hot(h);
for (const e of ["E01", "E10", "E06"]) collect(e);

// RE01: available after Margaret's first interview, rings only in the office
go("margaret_house");
run({ type: "talk", characterId: "margaret" });
if (s.eventStates.RE01) problems.push("RE01 available before Margaret was interviewed");
ask("margaret_evening");
ask("margaret_departure"); ask("margaret_eleanor_mood"); ask("margaret_daniel");
if (s.eventStates.RE01 !== "available") problems.push(`RE01 should be available, is ${s.eventStates.RE01}`);
if (s.pendingCalls.length) problems.push("the telephone rang away from the office");
if (project(def, s).developments.length) problems.push("an event appears in the notebook before it is presented");

// RE02 initial state: the jacket is there, observable, not collectable
go("daniel_apartment");
const coatsA = hot("da_coats_a");
if (coatsA.kind !== "inspect" || coatsA.evidence) problems.push("jacket on the rack should be an observation, not evidence");
if (!s.flags.includes("saw_jacket")) problems.push("jacket observation not recorded");
for (const reserved of ["E05", "E15"]) {
  try { collect(reserved); problems.push(`${reserved} collectable before its event`); } catch {}
}
hot("da_hand"); collect("E14");
run({ type: "talk", characterId: "daniel" });
ask("daniel_evening"); ask("daniel_hand");
if (s.evidence.filter((e) => e === "E14").length !== 1) problems.push("E14 duplicated by dialogue");
if (s.eventStates.RE02) problems.push("RE02 left locked before any injury, timeline or physical deduction");
go("diner");
if (s.env.daniel_apartment === "B") problems.push("apartment changed without valid conditions");
hot("d_spike"); hot("d_schedule"); collect("E04"); collect("E13");
run({ type: "talk", characterId: "rosa" });
ask("rosa_friday"); ask("rosa_customer");
// Not on hand at the start: the jacket and the torn statement arrive later, and both lab reports wait for the lab.
const initial = [...evIds].filter((e) => !["E05", "E15", "E11", "E16"].includes(e));
const missingInitial = initial.filter((e) => !s.evidence.includes(e));
if (missingInitial.length) problems.push(`initially discoverable evidence not collected: ${missingInitial}`);

// RE03 becomes available after Patricia's financial answer
go("patricia_office");
run({ type: "talk", characterId: "patricia" });
if (questionOpen(def, { ...s, evidence: s.evidence.filter((e) => e !== "E03" && e !== "E08"), asked: s.asked.filter((a) => a !== "margaret_eleanor_mood") }, def.questions.find((q) => q.id === "patricia_money")!)) problems.push("Patricia discusses money before the investigator has seen the accounts");
ask("patricia_evening"); ask("patricia_concerns");
if (s.eventStates.RE03) problems.push("RE03 available before Patricia was asked about money");
ask("patricia_money");
if (s.eventStates.RE03 !== "available") problems.push(`RE03 should be available, is ${s.eventStates.RE03}`);

// Back at the office: both events present at once
go("office");
if (s.eventStates.RE01 !== "active" || !s.pendingCalls.includes("call_margaret_sedan")) problems.push("telephone did not ring on returning to the office");
if (s.eventStates.RE03 !== "active" || !s.pendingDeliveries.includes("patricia_envelope")) problems.push("envelope did not arrive on returning to the office");
const office = project(def, s);
if (!office.location.hotspots.find((h) => h.id === "office_phone")?.attention) problems.push("telephone shows no ringing cue");
const env = office.location.hotspots.find((h) => h.id === "office_envelope");
if (!env?.sprite || !env.attention) problems.push("envelope not drawn on the desk");
// Defer the call: leave and come back; it is still waiting
go("margaret_house"); go("office");
if (!s.pendingCalls.includes("call_margaret_sedan") || s.eventStates.RE01 !== "active") problems.push("deferred call was lost");
if (s.pendingCalls.filter((c) => c === "call_margaret_sedan").length !== 1) problems.push("call queued twice");

// The lab: Bennett sends the glass and offers to get the guests' samples; results take real time.
run({ type: "talk", characterId: "bennett" });
if (!interviewCandidates(def, s, "bennett").some((x) => x.id === "bennett_send_glass")) problems.push("Bennett cannot be asked to send the glass");
if (interviewCandidates(def, s, "bennett").some((x) => x.id === "bennett_samples")) problems.push("guest samples offered before the glass was sent");
const sentGlass = ask("bennett_send_glass");
if (!s.labs.glass || s.labs.glass.done) problems.push("glass not sent to the lab");
if (sentGlass.kind !== "conversation" || !sentGlass.history.at(-1)?.text.includes("samples from the guests")) problems.push("Bennett did not offer the guest samples");
ask("bennett_samples");
if (!s.labs.samples) problems.push("guest samples not sent to the lab");
const labView = project(def, s, t).labs;
if (labView.length !== 2 || labView.some((l) => l.done || l.remainingMs <= 0)) problems.push(`lab countdowns wrong: ${JSON.stringify(labView)}`);
run({ type: "checkLabs" });
if (s.labs.glass.done || s.pendingDeliveries.includes("lab_glass")) problems.push("lab results came back early");
try { collect("E11"); problems.push("E11 collected before the results came back"); } catch {}
t += 180000;
run({ type: "checkLabs" });
if (!s.labs.glass.done || !s.labs.samples.done || !s.pendingDeliveries.includes("lab_glass") || !s.pendingDeliveries.includes("lab_samples")) problems.push("lab results did not arrive when their time was up");
if (!s.messages.some((m) => /lab/i.test(m))) problems.push("no notice that the lab results are in");
for (const [hid, did, eid] of [["office_labreport", "lab_glass", "E11"], ["office_labsamples", "lab_samples", "E16"]]) {
  const folder = hot(hid);
  if (folder.kind !== "delivery" || !folder.sealed) problems.push(`${did} not sealed on the desk`);
  run({ type: "openDelivery", deliveryId: did });
  collect(eid);
}
run({ type: "checkLabs" });
if (s.pendingDeliveries.includes("lab_glass") || s.evidence.filter((e) => e === "E11").length !== 1) problems.push("lab results delivered twice");

// RE02 becomes active once an injury deduction is established elsewhere
run({ type: "boardAdd", itemId: "E02", x: 10, y: 10 }); run({ type: "boardAdd", itemId: "E11", x: 30, y: 10 });
const inj = run({ type: "connect", a: "E02", b: "E11" });
if (inj.kind !== "deduction") problems.push("no D_INJURED");
if (s.eventStates.RE02 !== "active" || s.env.daniel_apartment !== "B") problems.push(`apartment did not change: ${s.eventStates.RE02}`);

// RE03: the sealed envelope, then E15
const sealed = hot("office_envelope");
if (sealed.kind !== "delivery" || !sealed.sealed || sealed.text || sealed.evidence.length) problems.push("sealed envelope revealed its contents");
try { collect("E15"); problems.push("E15 collectable before the envelope was opened"); } catch {}
const opened = run({ type: "openDelivery", deliveryId: "patricia_envelope" });
if (opened.kind !== "delivery" || opened.sealed || !opened.evidence.some((e) => e.id === "E15")) problems.push("opened envelope does not offer E15");
if (s.eventStates.RE03 !== "active") problems.push("RE03 completed before E15 was collected");
collect("E15");
if (s.eventStates.RE03 !== "completed") problems.push("RE03 not completed after collecting E15");
if (project(def, s).location.hotspots.some((h) => h.id === "office_envelope")) problems.push("envelope still on the desk after collecting");

// RE01: answer the call
const call = run({ type: "answerCall", callId: "call_margaret_sedan" });
if (call.kind !== "call") problems.push("call not answered");
if (s.eventStates.RE01 !== "completed") problems.push("RE01 not completed after answering");
try { run({ type: "answerCall", callId: "call_margaret_sedan" }); problems.push("call answered twice"); } catch {}
if (!s.unlockedQuestions.includes("margaret_sedan_more")) problems.push("Margaret's sedan questions not unlocked");
if (!(s.conversations.margaret ?? []).some((l) => l.kind === "call")) problems.push("call not added to Margaret's interview record");

// RE02: notice the change, ask Bennett, open the bag
go("daniel_apartment");
const viewB = project(def, s);
if (viewB.location.hotspots.some((h) => h.id === "da_coats_a") || !viewB.location.hotspots.some((h) => h.id === "da_coats_b")) problems.push("coat rack did not change");
const coatsB = hot("da_coats_b");
if (coatsB.kind !== "inspect" || !coatsB.text.includes("is gone")) problems.push("investigator who saw the jacket does not notice it is gone");
hot("da_suitcase");
if (!s.flags.includes("jacket_missing")) problems.push("jacket_missing not set");
go("patricia_office"); ask("patricia_envelope"); ask("patricia_circled");
go("robert_garage"); ask("robert_evening");
ask("robert_again");
const again2 = run({ type: "ask", questionId: "robert_again" });
if (again2.kind !== "conversation" || !again2.history.at(-1)?.text.startsWith("Look,")) problems.push("Robert did not grow impatient with repetition");
ask("robert_cars");
go("office");
const bennett = run({ type: "talk", characterId: "bennett" });
if (bennett.kind !== "conversation" || bennett.medium !== "telephone" || !interviewCandidates(def, s, "bennett").some((x) => x.id === "bennett_jacket")) problems.push("Bennett telephone interview missing the jacket request");
ask("bennett_jacket");
if (s.evidence.includes("E05")) problems.push("E05 appeared in the inventory without a recovery interaction");
try { collect("E05"); problems.push("E05 collectable before the evidence bag was opened"); } catch {}
if (s.eventStates.RE02 !== "active") problems.push("RE02 completed before recovery was resolved");
const bag = hot("office_evidencebag");
if (bag.kind !== "delivery" || !bag.sealed) problems.push("evidence bag not sealed on the desk");
run({ type: "openDelivery", deliveryId: "jacket_recovered" });
if (s.eventStates.RE02 !== "completed") problems.push("RE02 not completed when the recovery was resolved");
collect("E05");
if (!s.unlockedQuestions.includes("bennett_jacket_where")) problems.push("Bennett follow-up not unlocked by RE02");
const dev = project(def, s).developments;
if (dev.length !== 3 || dev.some((d) => d.status !== "Resolved")) problems.push(`developments: ${JSON.stringify(dev.map((d) => [d.id, d.status]))}`);
if (!dev.find((d) => d.id === "RE01")?.call || !dev.find((d) => d.id === "RE03")?.note || !dev.find((d) => d.id === "RE02")?.evidence.some((e) => e.id === "E05")) problems.push("developments missing transcript, note or evidence");
if (s.events.length !== 3 || new Set(s.events).size !== 3) problems.push("an event repeated");
if (s.evidence.length !== 16) problems.push(`collected ${s.evidence.length}/16: missing ${[...evIds].filter((e) => !s.evidence.includes(e))}`);

// every evidence item has exactly one scene hotspot, document or delivery that reveals it
for (const e of evIds) {
  const sources = def.locations.flatMap((l) => l.hotspots).filter((h) => h.interaction.type === "inspect" && h.interaction.evidence === e).length
    + def.documents.filter((d) => d.evidence.includes(e)).length + def.deliveries.filter((d) => d.evidence.includes(e)).length;
  if (sources < 1) problems.push(`${e} has no discovery source`);
}
// assigned locations from the Step 4 brief
const assigned: Record<string, string[]> = { office: ["E11", "E12", "E16"], living_room: ["E02", "E03", "E07", "E08", "E09"], kitchen: ["E01", "E06", "E10"], diner: ["E04", "E13"], daniel_apartment: ["E14"] };
for (const [locId, ids] of Object.entries(assigned)) for (const id of ids) if (def.evidence.find((e) => e.id === id)?.sourceLocationId !== locId) problems.push(`${id} not assigned to ${locId}`);
for (const id of ["E01","E02","E03","E04","E06","E07","E08","E09","E10","E11","E13","E14"]) {
  const d = s.discoveries[id];
  const want = def.evidence.find((e) => e.id === id)!.sourceLocationId;
  if (!d || d.locationId !== want) problems.push(`${id} discovered at ${d?.locationId} instead of ${want}`);
}

// board
const pins = ["E01", "E10", "E02", "E11", "E16", "E14", "E03", "E15", "E04", "E13", "E06", "E07", "E05", "E09", "E08", "E12", "daniel"];
pins.forEach((p, i) => run({ type: "boardAdd", itemId: p, x: (i * 7) % 90, y: (i * 13) % 90 }));
const wrong = run({ type: "connect", a: "E01", b: "E05" });
if (wrong.kind === "deduction") problems.push("wrong connection produced a deduction");
run({ type: "disconnect", a: "E01", b: "E05" });
for (const [a, b] of [["E01", "E10"], ["E02", "E11"], ["E14", "E16"], ["E03", "E15"], ["E09", "E03"], ["E04", "E13"], ["E05", "E11"], ["E06", "E07"]]) {
  const had = s.deductions.length;
  const o = run({ type: "connect", a, b });
  if (o.kind !== "deduction" && !(a === "E02" && had)) problems.push(`no deduction for ${a}-${b}`);
}
if (s.deductions.length !== def.deductions.length) problems.push(`deductions ${s.deductions.length}/${def.deductions.length}`);

// ---- Step 8: final report and evaluation ----
{
  const T = (culprit: string, motive: string, weapon: string, location: string, evidence: string[]) => ({ culprit, motive, weapon, location, evidence });
  const submit = (st: InvestigationState, t: ReturnType<typeof T>) => reduce(def, st, { type: "submitConclusion", theory: t, investigator: "Sam Calloway" }, 2);
  const right = (ev: string[]) => T("daniel", "financial", "knife", "living_room", ev);
  const rejects = (st: InvestigationState, t: ReturnType<typeof T>, why: string) => {
    try { submit(st, t); problems.push(`accepted a malformed report: ${why}`); } catch {}
  };
  // Not available before meaningful investigation
  try { reduce(def, newState(def), { type: "saveReport", draft: { evidence: [] } }, 1); problems.push("report opened with no investigation"); } catch {}
  if (project(def, newState(def)).conclusion.available) problems.push("report available at the start");
  if (!project(def, s).conclusion.available) problems.push("report not available after investigating");
  // Only legitimately collected evidence, between four and six items, every section answered
  rejects(s, right(["E14", "E03", "E13"]), "three items");
  rejects(s, right(["E01", "E02", "E03", "E04", "E05", "E06", "E07"]), "seven items");
  rejects({ ...s, evidence: s.evidence.filter((e) => e !== "E05") }, right(["E05", "E03", "E13", "E14"]), "uncollected evidence");
  rejects(s, right(["E14", "E14", "E03", "E13"]), "duplicate evidence");
  rejects(s, { ...right(["E14", "E03", "E13", "E15"]), weapon: "spoon" }, "unknown answer id");
  // Drafts are sanitised and survive a reload
  const d = reduce(def, s, { type: "saveReport", draft: { culprit: "robert", motive: "nonsense", evidence: ["E03", "E99", "E03", "E14"] } }, 2).state;
  const dr = normalizeState(def, JSON.parse(JSON.stringify(d))).report.draft;
  if (dr.culprit !== "robert" || dr.motive !== undefined || JSON.stringify(dr.evidence) !== '["E03","E14"]') problems.push(`draft not sanitised or saved: ${JSON.stringify(dr)}`);
  // Wrong, undecided and unsupported reports are returned without revealing the solution
  const solutionText = [def.solution.resolution.accepted, ...def.solution.resolution.reconstruction.map((r) => r.body), ...def.solution.resolution.bennett];
  const returned = (t: ReturnType<typeof T>, label: string, expectNote: RegExp) => {
    const r = submit(s, t);
    if (r.outcome.kind !== "verdict" || r.outcome.correct || r.state.status === "closed") problems.push(`${label}: accepted`);
    else {
      if (!expectNote.test(r.outcome.note)) problems.push(`${label}: unexpected note "${r.outcome.note}"`);
      const shown = JSON.stringify(r.outcome) + JSON.stringify(project(def, r.state));
      if (solutionText.some((x) => shown.includes(x)) || /daniel|mercer|financial|living_room/i.test(r.outcome.note)) problems.push(`${label}: response reveals the solution`);
      if (r.state.attempts !== s.attempts + 1 || r.state.report.submissions.length !== 1) problems.push(`${label}: attempt not recorded`);
    }
    return r.state;
  };
  returned(T("robert", "revenge", "blunt", "kitchen", ["E14", "E03", "E13", "E06"]), "wrong theory", /do not hold together/);
  returned(T("daniel", "financial", "knife", "unknown", ["E14", "E03", "E13", "E15"]), "undecided", /open/);
  returned(right(["E07", "E01", "E10", "E12"]), "correct guess, too little key evidence", /key evidence/);
  returned(right(["E02", "E03", "E01", "E15"]), "correct guess, nothing linking the suspect", /connects the person/);
  const afterWrong = returned(T("patricia", "financial", "knife", "living_room", ["E14", "E03", "E13", "E15"]), "wrong suspect", /do not hold together/);
  // A returned report can be revised, and several different supported reports are accepted
  // Four key items carry a report; two more may be anything, photographs included.
  const withPhoto: InvestigationState = { ...afterWrong, photos: [{ id: "PH_test", hotspotId: "test", locationId: "office", title: "Test", text: "Test", image: "", at: 1 }] };
  for (const ev of [["E14", "E03", "E01", "E15"], ["E04", "E15", "E06", "E03"], ["E05", "E13", "E08", "E02"], ["E11", "E14", "E03", "E13", "E01", "E06"], ["E14", "E03", "E13", "E15", "E07", "PH_test"]]) {
    const r = submit(withPhoto, right(ev));
    if (r.outcome.kind !== "verdict" || !r.outcome.correct || r.state.status !== "closed") problems.push(`supported report rejected: ${ev}`);
  }
  for (const id of ["E02", "E03", "E04", "E05", "E06", "E11", "E13", "E14", "E15"]) {
    if (!def.solution.standard.lines.some((l) => l.anyOf.includes(id))) problems.push(`${id} counts toward no line of support`);
  }
  // Nothing about the resolution is visible or speakable until the case is closed
  if (spokenLine(def, s, { kind: "resolution", id: "bennett", n: 0 })) problems.push("Bennett's conclusion voiceable before closing");
  const openView = JSON.stringify(project(def, s));
  if (solutionText.some((x) => openView.includes(x)) || openView.includes("linkToSuspect")) problems.push("open view leaks the resolution or the standard");
}

// conclusion
const good = run({ type: "submitConclusion", theory: { culprit: "daniel", motive: "financial", weapon: "knife", location: "living_room", evidence: ["E11", "E14", "E03", "E13", "E01"] }, investigator: "Sam Calloway" });
if (good.kind !== "verdict" || !good.correct) problems.push("correct theory rejected");
if (s.report.final?.investigator !== "Sam Calloway" || s.report.final.attempts !== s.attempts) problems.push("final report not recorded");
const closedView = project(def, s);
if (!closedView.closure || closedView.closure.reconstruction.length !== def.solution.resolution.reconstruction.length || !closedView.conclusion.final) problems.push("closure not shown after closing");
if (!spokenLine(def, s, { kind: "resolution", id: "bennett", n: 0 })) problems.push("Bennett's conclusion not voiceable after closing");
try { run({ type: "submitConclusion", theory: { culprit: "daniel", motive: "financial", weapon: "knife", location: "living_room", evidence: ["E11", "E14", "E03"] } }); problems.push("closed case accepted another report"); } catch {}
const reloaded = normalizeState(def, JSON.parse(JSON.stringify(s)));
if (reloaded.status !== "closed" || !reloaded.report.final || reloaded.evidence.length !== 16 || reloaded.deductions.length !== s.deductions.length) problems.push("completion lost on reload");

// saves from before discovery tracking must load without losing progress
const legacy = structuredClone(s) as Partial<InvestigationState>;
delete legacy.discoveries;
const upgraded = normalizeState(def, legacy as InvestigationState);
if (upgraded.evidence.length !== s.evidence.length || !upgraded.discoveries.E07 || upgraded.deductions.length !== s.deductions.length) problems.push("legacy save lost progress on upgrade");

// a save round-trips through JSON with every interview detail intact
const rt = normalizeState(def, JSON.parse(JSON.stringify(s)));
for (const k of ["asked", "unlockedQuestions", "contradictions", "presented"] as const) if (JSON.stringify(rt[k]) !== JSON.stringify(s[k])) problems.push(`${k} not preserved`);
if (JSON.stringify(rt.conversations) !== JSON.stringify(s.conversations)) problems.push("transcripts not preserved");

// ---- unlock rules, from a fresh briefed state ----
{
  let f = newState(def, 0);
  const R = (a: GameAction) => (f = reduce(def, f, a, 1).state);
  R({ type: "dismissIntro" }); R({ type: "readDocument", documentId: "casefile" });
  // every interviewee offers opening questions
  // People who arrive later in the story (a missing person found) are checked once they can be met.
  for (const c of interviewees.filter((x) => check(x.available, f))) {
    const here = { ...f, location: characterLocation(c, f) ?? f.location };
    const o = reduce(def, here, { type: "talk", characterId: c.id }, 1).outcome;
    if (o.kind !== "conversation" || interviewCandidates(def, here, c.id).length === 0) problems.push(`${c.id} has no opening questions`);
    if (o.kind === "conversation") {
      const shown = JSON.stringify(o);
      for (const q of def.questions.filter((x) => x.characterId === c.id && !questionOpen(def, here, x))) {
        if (shown.includes(q.prompt)) problems.push(`locked question ${q.id} visible`);
      }
      if (/requires|unlocks|variants|knowledge|"prompt"|keywords/.test(shown)) problems.push(`${c.id} conversation leaks rule data`);
      for (const q of def.questions.filter((x) => x.characterId === c.id)) if (shown.includes(q.prompt)) problems.push(`authored question ${q.id} sent to the browser`);
    }
  }
  const has = (id: string, st = f) => questionOpen(def, st, def.questions.find((q) => q.id === id)!);
  if (has("margaret_hands")) problems.push("evidence question visible before evidence");
  if (!has("margaret_hands", { ...f, evidence: [...f.evidence, "E14"] })) problems.push("evidence question did not unlock");
  for (const [qid, d] of [["margaret_struggle", "D_STRUGGLE"], ["robert_staged", "D_STAGED"], ["patricia_more", "D_MOTIVE"], ["daniel_alibi_broken", "D_ALIBI"], ["daniel_hand_glass", "D_HAND"], ["patricia_lawyer", "D_LAWYER"]]) {
    if (has(qid)) problems.push(`${qid} visible before ${d}`);
    if (!has(qid, { ...f, deductions: [d] })) problems.push(`${qid} did not unlock with ${d}`);
  }
  // E05 makes Daniel refuse, but his alibi stays on record
  const ref = { ...f, location: "daniel_apartment", flags: [...f.flags, "daniel_lawyered"] };
  const o = reduce(def, ref, { type: "talk", characterId: "daniel" }, 1).outcome;
  if (o.kind !== "conversation" || !o.refusing || interviewCandidates(def, ref, "daniel").some((x) => x.id !== "daniel_evening")) problems.push("Daniel's refusal not applied");
}

// ---- Interview question limits, re-interviews and expense credits ----
{
  let w = newState(def, 0);
  const W = (a: GameAction) => {
    const r = reduce(def, w, a, 1);
    w = r.state;
    return r.outcome;
  };
  const fails = (a: GameAction) => {
    try {
      reduce(def, w, a, 1);
      return false;
    } catch {
      return true;
    }
  };
  const margaret = def.characters.find((c) => c.id === "margaret")!;
  W({ type: "dismissIntro" }); W({ type: "readDocument", documentId: "casefile" }); W({ type: "travel", locationId: "margaret_house" });
  if (questionsLeft(def, w, "margaret") !== 20 || questionsLeft(def, w, "daniel") !== 20) problems.push("characters do not start with 20 questions");
  if (questionsLeft(def, w, "bennett") !== null) problems.push("Bennett should have no question limit");
  W({ type: "talk", characterId: "margaret" });
  if (questionsLeft(def, w, "margaret") !== 20) problems.push("opening an interview cost a question");
  // ask distinct authored answers first, then anything
  const askM = (i: number) => {
    const open = interviewCandidates(def, w, "margaret").filter((q) => !w.asked.includes(q.id));
    const q = open[0];
    return W({ type: "askFree", characterId: "margaret", text: q ? q.prompt : `Question ${i}?`, match: q?.id ?? null });
  };
  for (let i = 1; i <= 10; i++) askM(i);
  if (questionsLeft(def, w, "margaret") !== 10 || questionsLeft(def, w, "daniel") !== 20) problems.push("question balances are not independent");
  for (let i = 11; i <= 14; i++) askM(i);
  if (w.conversations.margaret.some((l) => l.text === margaret.patience!.warn)) problems.push("impatience shown too early");
  askM(15);
  if (!w.conversations.margaret.some((l) => l.text === margaret.patience!.warn)) problems.push("no impatience at question 15");
  for (let i = 16; i <= 19; i++) askM(i);
  const last = askM(20);
  if (last.kind !== "conversation" || last.canAsk || !last.questions.exhausted || w.conversations.margaret.at(-1)!.text !== margaret.patience!.farewell) problems.push("the twentieth question did not end the interview");
  if (!fails({ type: "askFree", characterId: "margaret", text: "One more?" })) problems.push("a question was allowed past the limit");
  if (!fails({ type: "present", characterId: "margaret", evidenceId: w.evidence[0] ?? "E12" }) && w.evidence.length) problems.push("evidence was presented past the limit");
  const before = JSON.stringify(w.budget);
  fails({ type: "askFree", characterId: "robert", text: "Hello?" }); // not here: an error
  if (JSON.stringify(w.budget) !== before) problems.push("a failed question changed the allowance");
  W({ type: "travel", locationId: "office" }); W({ type: "travel", locationId: "margaret_house" }); W({ type: "talk", characterId: "margaret" });
  if (questionsLeft(def, w, "margaret") !== 0) problems.push("leaving and returning reset Margaret's questions");
  if (!w.conversations.margaret.length) problems.push("transcript lost after exhaustion");
  // a re-interview: Daniel's hand gives Margaret five more questions, once
  W({ type: "travel", locationId: "daniel_apartment" });
  const hand = W({ type: "hotspot", hotspotId: "da_hand" });
  if (hand.kind === "inspect" && hand.evidence && !w.evidence.includes("E14")) W({ type: "collect", evidenceId: "E14" });
  if (questionsLeft(def, w, "margaret") !== 5) problems.push(`Daniel's hand did not give Margaret exactly 5 questions (${questionsLeft(def, w, "margaret")})`);
  W({ type: "travel", locationId: "office" }); W({ type: "travel", locationId: "daniel_apartment" });
  if (questionsLeft(def, w, "margaret") !== 5) problems.push("the same evidence granted questions twice");
  // credits: three distinct authored answers make one; replays add nothing; they pool across characters
  const q0 = w.budget!.qualifying.length;
  if (credits(w).earned !== Math.floor(q0 / 3)) problems.push("credits do not follow three answers each");
  W({ type: "talk", characterId: "daniel" });
  const dq = interviewCandidates(def, w, "daniel").find((q) => !w.asked.includes(q.id))!;
  W({ type: "askFree", characterId: "daniel", text: dq.prompt, match: dq.id });
  W({ type: "askFree", characterId: "daniel", text: dq.prompt, match: dq.id });
  if (w.budget!.qualifying.length !== q0 + 1) problems.push("a repeated answer earned credit, or a new one did not");
  // earn enough for an extension by asking new authored answers across people
  for (const [cid, loc] of [["daniel", "daniel_apartment"], ["robert", "robert_garage"], ["patricia", "patricia_office"]] as const) {
    if (credits(w).balance >= 5) break;
    if (w.location !== loc) W({ type: "travel", locationId: loc });
    W({ type: "talk", characterId: cid });
    for (let i = 0; i < 12 && credits(w).balance < 5; i++) {
      const q = interviewCandidates(def, w, cid).find((x) => !w.asked.includes(x.id));
      if (!q || !questionsLeft(def, w, cid)) break;
      W({ type: "askFree", characterId: cid, text: q.prompt, match: q.id });
    }
  }
  if (credits(w).balance < 5) problems.push("could not earn five credits through authored answers");
  else {
    if (w.location !== "robert_garage") W({ type: "travel", locationId: "robert_garage" });
    const rob = questionsLeft(def, w, "robert")!, pat = questionsLeft(def, w, "patricia")!, bal = credits(w).balance;
    W({ type: "extendInterview", characterId: "robert", requestId: "test-1" });
    W({ type: "extendInterview", characterId: "robert", requestId: "test-1" }); // a retry
    if (questionsLeft(def, w, "robert") !== rob + 5 || questionsLeft(def, w, "patricia") !== pat || credits(w).balance !== bal - 5) problems.push("an extension did not give exactly five questions to one person");
    // questions paid for with credits earn nothing
    w.budget!.characters.robert.baseUsed = 20;
    w.budget!.characters.robert.reinterviewUsed = w.budget!.characters.robert.reinterviewGranted;
    const nq = interviewCandidates(def, w, "robert").find((x) => !w.asked.includes(x.id));
    const qn = w.budget!.qualifying.length;
    W({ type: "askFree", characterId: "robert", text: nq?.prompt ?? "Anything else?", match: nq?.id ?? null });
    if (w.budget!.qualifying.length !== qn || w.conversations.robert.filter((l) => l.speaker === "you").at(-1)!.fund !== "bonus") problems.push("a bonus-funded answer earned credit");
  }
  // save and resume keeps everything
  const resumed = normalizeState(def, JSON.parse(JSON.stringify(w)));
  if (JSON.stringify(resumed.budget) !== JSON.stringify(w.budget)) problems.push("save and resume lost the question budget");
  // hardcore: no credits, no free extensions
  w.budget!.mode = "hardcore";
  if (credits(w).earned !== 0) problems.push("hardcore mode earned credits");
  if (!fails({ type: "extendInterview", characterId: "robert", requestId: "test-2" })) problems.push("hardcore mode allowed a free extension");
}

// ---- interviews in any reasonable order: random walks never hit an error ----
for (let seed = 1; seed <= 40; seed++) {
  let x = seed * 9973;
  const rnd = (n: number) => ((x = (x * 1103515245 + 12345) % 2147483648), x % n);
  let w = newState(def, 0);
  const W = (a: GameAction) => {
    const r = reduce(def, w, a, 1);
    w = r.state;
    return r.outcome;
  };
  W({ type: "dismissIntro" }); W({ type: "readDocument", documentId: "casefile" });
  try {
    for (let step = 0; step < 500; step++) {
      const v = project(def, w);
      const roll = rnd(10);
      if (roll < 2) {
        const dest = v.map.filter((m) => m.available && !m.current);
        if (dest.length) W({ type: "travel", locationId: dest[rnd(dest.length)].id });
      } else if (roll < 5) {
        const h = v.location.hotspots[rnd(v.location.hotspots.length)];
        if (h) {
          const o = W({ type: "hotspot", hotspotId: h.id });
          if (o.kind === "inspect" && o.evidence && !w.evidence.includes(o.evidence.id)) W({ type: "collect", evidenceId: o.evidence.id });
          if (o.kind === "panel" && o.panel === "phone" && w.pendingCalls.length) W({ type: "answerCall", callId: w.pendingCalls[0] });
          if (o.kind === "panel" && o.panel === "delivery") for (const d of [...w.pendingDeliveries]) W({ type: "openDelivery", deliveryId: d });
        }
      } else {
        const people = def.characters.filter((c) => characterLocation(c, w) === w.location && check(c.available, w) && def.questions.some((q) => q.characterId === c.id));
        const c = people[rnd(people.length)];
        if (!c) continue;
        const o = W({ type: "talk", characterId: c.id });
        if (o.kind !== "conversation") continue;
        if (questionsLeft(def, w, c.id) === 0) {
          // Out of questions: buy more time when the expense money allows, otherwise move on.
          if (o.questions.extend) W({ type: "extendInterview", characterId: c.id, requestId: `walk-${seed}-${step}` });
          continue;
        }
        const qs = interviewCandidates(def, w, c.id);
        if (qs.length && rnd(4)) W({ type: "askFree", characterId: c.id, text: qs[rnd(qs.length)].prompt, match: qs[rnd(qs.length)].id });
        else if (w.evidence.length) W({ type: "present", characterId: c.id, evidenceId: w.evidence[rnd(w.evidence.length)] });
      }
      if (rnd(6) === 0 && w.evidence.length > 1) {
        // occasionally try a board connection
        const a = w.evidence[rnd(w.evidence.length)], b = w.evidence[rnd(w.evidence.length)];
        if (a !== b) { W({ type: "boardAdd", itemId: a, x: 10, y: 10 }); W({ type: "boardAdd", itemId: b, x: 20, y: 20 }); W({ type: "connect", a, b }); }
      }
    }
  } catch (e) {
    problems.push(`random order seed ${seed} failed: ${(e as Error).message}`);
  }
  for (const [cid, lines] of Object.entries(w.conversations)) {
    lines.forEach((l, n) => {
      if (l.speaker !== "you" && l.speaker !== "cue" && spokenLine(def, w, { kind: "conversation", id: cid, n })?.text !== l.text) problems.push("subtitle mismatch in random walk");
    });
  }
}

// ---- Step 7: events in any order, without unearned knowledge, across saves ----
{
  const fresh = () => {
    let w = newState(def, 0);
    let clock = 1;
    const A = (a: GameAction) => {
      const r = reduce(def, w, a, clock);
      w = r.state;
      return r.outcome;
    };
    const get = (e: string) => { if (!w.evidence.includes(e)) A({ type: "collect", evidenceId: e }); };
    const at = (l: string) => { if (w.location !== l) A({ type: "travel", locationId: l }); };
    const ask = (id: string) => { if (!w.asked.includes(id)) A({ type: "ask", questionId: id }); };
    A({ type: "dismissIntro" }); A({ type: "readDocument", documentId: "casefile" }); get("E12");
    const wait = (ms: number) => { clock += ms; };
    return { A, get, at, ask, wait, state: () => w };
  };
  type G = ReturnType<typeof fresh>;
  const beats: Record<string, (g: G) => void> = {
    RE01: (g) => {
      g.at("margaret_house"); g.A({ type: "talk", characterId: "margaret" }); g.ask("margaret_evening"); g.ask("margaret_departure");
      g.at("office"); g.A({ type: "answerCall", callId: "call_margaret_sedan" }); g.at("margaret_house"); g.ask("margaret_sedan_more");
    },
    RE02: (g) => {
      g.at("daniel_apartment"); g.A({ type: "hotspot", hotspotId: "da_coats_a" }); g.A({ type: "talk", characterId: "daniel" }); g.ask("daniel_evening");
      g.at("living_room"); g.A({ type: "hotspot", hotspotId: "lr_glass" }); g.get("E02");
      g.at("office"); g.A({ type: "talk", characterId: "bennett" }); g.ask("bennett_send_glass"); g.wait(180000); g.A({ type: "checkLabs" });
      g.A({ type: "hotspot", hotspotId: "office_labreport" }); g.A({ type: "openDelivery", deliveryId: "lab_glass" }); g.get("E11");
      g.A({ type: "boardAdd", itemId: "E02", x: 1, y: 1 }); g.A({ type: "boardAdd", itemId: "E11", x: 2, y: 2 }); g.A({ type: "connect", a: "E02", b: "E11" });
      g.at("daniel_apartment"); g.A({ type: "hotspot", hotspotId: "da_coats_b" });
      g.at("office"); g.A({ type: "talk", characterId: "bennett" }); g.ask("bennett_jacket");
      g.A({ type: "hotspot", hotspotId: "office_evidencebag" }); g.A({ type: "openDelivery", deliveryId: "jacket_recovered" }); g.get("E05");
    },
    RE03: (g) => {
      g.at("living_room"); g.A({ type: "hotspot", hotspotId: "lr_ledger" }); g.get("E03");
      g.at("patricia_office"); g.A({ type: "talk", characterId: "patricia" }); g.ask("patricia_evening"); g.ask("patricia_concerns"); g.ask("patricia_money");
      g.at("office"); g.A({ type: "hotspot", hotspotId: "office_envelope" }); g.A({ type: "openDelivery", deliveryId: "patricia_envelope" }); g.get("E15");
    },
  };
  const summaries: string[] = [];
  for (const order of [["RE01", "RE03", "RE02"], ["RE02", "RE01", "RE03"], ["RE03", "RE02", "RE01"]]) {
    const g = fresh();
    try {
      for (const id of order) {
        if (g.state().eventStates[id]) problems.push(`order ${order}: ${id} advanced before its own prerequisites`);
        beats[id](g);
        if (g.state().eventStates[id] !== "completed") problems.push(`order ${order}: ${id} not completed (${g.state().eventStates[id]})`);
      }
    } catch (e) {
      problems.push(`order ${order} failed: ${(e as Error).message}`);
      continue;
    }
    const w = g.state();
    const facts = {
      evidence: [...w.evidence].sort(),
      timeline: w.timeline.map((t) => `${t.time} ${t.text}`).sort(),
      learned: project(def, w).developments.map((d) => `${d.id}:${d.learned.join("|")}`).sort(),
      said: Object.entries(w.conversations).map(([c, l]) => `${c}:${l.filter((x) => x.speaker !== "you").map((x) => x.text).sort().join("|")}`).sort(),
      env: w.env.daniel_apartment,
    };
    summaries.push(JSON.stringify(facts));
  }
  if (new Set(summaries).size !== 1) problems.push("different event orders produced different case facts");

  // Never saw the jacket: the apartment still changes, but nothing is claimed, and Bennett needs another reason.
  const g = fresh();
  g.at("daniel_apartment"); g.A({ type: "talk", characterId: "daniel" }); g.ask("daniel_evening");
  g.at("diner"); for (const h of ["d_spike", "d_schedule"]) g.A({ type: "hotspot", hotspotId: h }); g.get("E04"); g.get("E13");
  g.A({ type: "boardAdd", itemId: "E04", x: 1, y: 1 }); g.A({ type: "boardAdd", itemId: "E13", x: 2, y: 2 }); g.A({ type: "connect", a: "E04", b: "E13" });
  if (g.state().eventStates.RE02 !== "active") problems.push("RE02 should activate from the timeline deduction");
  g.at("daniel_apartment");
  const o = g.A({ type: "hotspot", hotspotId: "da_coats_b" });
  if (o.kind === "inspect" && o.text.includes("gone")) problems.push("claimed the player saw a jacket they never inspected");
  if (g.state().flags.includes("jacket_missing")) problems.push("unearned jacket_missing");
  if (project(def, g.state()).developments.find((d) => d.id === "RE02")?.learned.some((l) => l.includes("you saw"))) problems.push("notebook claims an unseen jacket");
  g.at("office");
  const b1 = g.A({ type: "talk", characterId: "bennett" });
  if (b1.kind === "conversation" && interviewCandidates(def, g.state(), "bennett").some((x) => x.id === "bennett_jacket")) problems.push("Bennett offers a jacket search with no reason to ask");
  g.at("margaret_house"); g.A({ type: "talk", characterId: "margaret" }); g.ask("margaret_evening"); g.ask("margaret_daniel");
  g.at("office"); g.A({ type: "talk", characterId: "bennett" });
  const b2 = g.A({ type: "ask", questionId: "bennett_jacket" });
  if (b2.kind !== "conversation" || !b2.history.some((l) => l.text.includes("Mrs. Ellis"))) problems.push("Bennett's alternate jacket reply not used");

  // Mid-event saves round-trip: a ringing call, a sealed envelope and the changed apartment all survive a reload.
  const m = fresh();
  beats.RE03(m); // completes RE03
  m.at("margaret_house"); m.A({ type: "talk", characterId: "margaret" }); m.ask("margaret_evening"); m.ask("margaret_departure"); m.at("office");
  const mid = normalizeState(def, JSON.parse(JSON.stringify(m.state())));
  if (mid.eventStates.RE01 !== "active" || !mid.pendingCalls.includes("call_margaret_sedan") || mid.eventStates.RE03 !== "completed") problems.push("event states lost on reload");

  // Saves from before the lifecycle: fired events become active and finish normally.
  const old = structuredClone(m.state()) as Partial<InvestigationState>;
  delete old.eventStates;
  const up = normalizeState(def, old as InvestigationState);
  if (up.eventStates.RE01 !== "active" || up.eventStates.RE03 !== "active") problems.push("legacy event states not upgraded");
  const after = reduce(def, up, { type: "answerCall", callId: "call_margaret_sedan" }, 1).state;
  if (after.eventStates.RE01 !== "completed" || after.eventStates.RE03 !== "completed" || after.evidence.length !== up.evidence.length) problems.push("legacy save did not resume its events");

  // Event rules never reach the browser
  const vjson = JSON.stringify(project(def, m.state()));
  for (const secret of ["requiresInterviews", "onActivate", "unlocksQuestions", "eventStates", "D_INJURED"]) if (vjson.includes(secret)) problems.push(`view leaks ${secret}`);
}

// ---- Questions in the player's own words ----
{
  let x = newState(def, 0);
  const X = (a: GameAction) => {
    const r = reduce(def, x, a, 1);
    x = r.state;
    return r.outcome;
  };
  X({ type: "dismissIntro" }); X({ type: "readDocument", documentId: "casefile" }); X({ type: "travel", locationId: "margaret_house" });
  const ask = (text: string) => X({ type: "askFree", characterId: "margaret", text, match: bestMatch(text, interviewCandidates(def, x, "margaret")) });
  const o1 = ask("Did you see anything that night after you went home?");
  if (o1.kind !== "conversation" || !o1.history.some((l) => l.text.includes("late news finished"))) problems.push("free question did not reach Margaret's answer");
  if (o1.kind === "conversation" && o1.history[0].text !== "Did you see anything that night after you went home?") problems.push("transcript does not keep the investigator's own words");
  const o2 = ask("What's your favorite color?");
  if (o2.kind !== "conversation" || !def.characters.find((c) => c.id === "margaret")!.noAnswer!.includes(o2.history.at(-1)!.text)) problems.push("unanswerable question did not get an in-character 'I don't know'");
  // a locked answer cannot be reached by wording, even if the browser claims a match
  X({ type: "askFree", characterId: "margaret", text: "Describe the car you saw after midnight.", match: "margaret_sedan_more" });
  if (x.asked.includes("margaret_sedan_more")) problems.push("locked answer reached through a free question");
  // a composed answer is recorded and voiceable, but cannot be smuggled past a refusal
  X({ type: "askFree", characterId: "margaret", text: "Was Eleanor a good cook?", composed: "She was. Her lemon cake was the best on the street." });
  // (a volunteered fact may follow the answer, so look for the composed line itself)
  const at = x.conversations.margaret.findLastIndex((l) => l.q === "composed");
  const last = x.conversations.margaret[at];
  if (last?.text !== "She was. Her lemon cake was the best on the street." || spokenLine(def, x, { kind: "conversation", id: "margaret", n: at })?.text !== last.text) problems.push("composed answer not recorded or not voiceable");
  X({ type: "askFree", characterId: "margaret", text: "Anything?", composed: "Some \u2014 dash" });
  if (x.conversations.margaret.some((l) => l.text.includes("\u2014"))) problems.push("composed answer kept an em dash");
  // knowledge is gated like the answers
  const facts = characterKnowledge(def, x, "margaret").join(" ");
  if (/sedan|jacaranda|fender/i.test(facts)) problems.push("Margaret's sedan knowledge available before she remembers it");
  const later = { ...x, eventStates: { ...x.eventStates, RE01: "completed" as const } };
  if (!/sedan/.test(characterKnowledge(def, later, "margaret").join(" "))) problems.push("Margaret's sedan knowledge missing after her call");
  if (/killed|murdered|stabbed her|I did it/i.test(def.characters.find((c) => c.id === "daniel")!.knowledge!.map((k) => k.text).join(" "))) problems.push("Daniel's knowledge confesses");
  for (const c of interviewees) if (!c.knowledge?.length || !c.persona || !c.noAnswer?.length) problems.push(`${c.id} lacks knowledge, persona or no-answer lines`);
  // facts used by a composed answer bring their authored entry's effects: Daniel's hand gives E14
  {
    let y = newState(def, 0);
    const Y = (a: GameAction) => (y = reduce(def, y, a, 1).state);
    Y({ type: "dismissIntro" }); Y({ type: "readDocument", documentId: "casefile" }); Y({ type: "travel", locationId: "daniel_apartment" });
    const handFact = def.characters.find((c) => c.id === "daniel")!.knowledge!.findIndex((k) => k.entry === "daniel_hand");
    Y({ type: "askFree", characterId: "daniel", text: "That's a nasty bandage.", composed: "A jar broke in my hand on Saturday morning.", facts: [handFact] });
    if (!y.evidence.includes("E14") || !y.asked.includes("daniel_hand")) problems.push("a composed answer using a fact did not credit its entry");
    // a fact the character does not know yet is ignored
    const before = y.evidence.length;
    const jacketFact = def.characters.find((c) => c.id === "daniel")!.knowledge!.findIndex((k) => /windbreaker/.test(k.text));
    Y({ type: "askFree", characterId: "daniel", text: "Jacket?", composed: "No.", facts: [jacketFact, 999] });
    if (y.evidence.length !== before) problems.push("an unknown fact changed the investigation");
    // offers: Rosa mentions the schedule, a short yes takes it
    Y({ type: "travel", locationId: "diner" });
    Y({ type: "askFree", characterId: "rosa", text: "Were you working Friday?", match: "rosa_friday" });
    Y({ type: "askFree", characterId: "rosa", text: "Yeah, let me see it" });
    if (!y.evidence.includes("E13")) problems.push("a short yes did not take up Rosa's offer of the schedule");
    // volunteering: Rosa brings up the man in the tan jacket when Friday night comes up, and hands over the ticket
    if (!y.asked.includes("rosa_customer") || !y.evidence.includes("E04")) problems.push("Rosa did not volunteer the man in the tan jacket");
  }
  // the built-in matcher on everyday phrasings
  let hits = 0;
  for (const [cid, q, want] of MATCH_CASES) if (bestMatch(q, def.questions.filter((d) => d.characterId === cid)) === want) hits++;
  if (hits / MATCH_CASES.length < 0.9) problems.push(`matcher accuracy ${hits}/${MATCH_CASES.length}`);
}

// the full playthrough fits inside the question limits without paying for anything
for (const c of def.characters) {
  const used = s.asked.filter((id) => def.questions.find((q) => q.id === id)?.characterId === c.id).length + s.presented.filter((k) => k.startsWith(`${c.id}:`)).length;
  const cap = questionsLeft(def, newState(def, 0), c.id);
  const granted = (def.reinterviews ?? []).filter((g) => g.characterId === c.id).reduce((n, g) => n + (g.questions ?? 5), 0);
  if (cap !== null && used > cap + granted) problems.push(`the reference playthrough needs ${used} questions with ${c.name}, more than ${cap} + ${granted}`);
}

// view must not leak restricted content
const view = JSON.stringify(project(def, newState(def)));
for (const secret of ["\"standard\"", "linkToSuspect", "D_HAND", "Type B", "Friday, 11:35 PM", "knowledge", "reconstruction", "District Attorney"]) if (view.includes(secret)) problems.push(`initial view leaks ${secret}`);

console.log(`${id}: ${def.evidence.length} evidence, ${def.locations.length} locations, ${def.questions.length} questions, ${def.deductions.length} deductions`);
console.log(`playthrough: status=${s.status} attempts=${s.attempts} events=${s.events.join(",")} active=${s.activeSeconds}s`);
// ---- Photographs: anything looked at that is not collectable evidence can be photographed and filed ----
{
  let st = reduce(def, newState(def), { type: "dismissIntro" }, 1).state;
  st = { ...st, location: "living_room", flags: [...st.flags, "casefile_read"] };
  const spot = project(def, st).location.hotspots.find((h) => {
    const hd = def.locations.find((l) => l.id === st.location)!.hotspots.find((x) => x.id === h.id)!;
    return hd.interaction.type === "inspect" && !hd.interaction.evidence;
  });
  if (!spot) problems.push("photo: nothing photographable in the first scene");
  else {
    const look = reduce(def, st, { type: "hotspot", hotspotId: spot.id }, 2);
    if (look.outcome.kind !== "inspect" || !look.outcome.photo || look.outcome.photo.taken) problems.push("photo: inspect outcome does not offer a photo");
    st = reduce(def, look.state, { type: "photograph", hotspotId: spot.id }, 3).state;
    const v = project(def, st);
    const ph = v.evidence.find((e) => e.photo);
    if (st.photos.length !== 1 || !ph || !ph.image.startsWith("/api/photo?") || ph.label !== "P1") problems.push(`photo: not filed with the evidence (${JSON.stringify(ph)})`);
    try { reduce(def, st, { type: "photograph", hotspotId: spot.id }, 4); problems.push("photo: same thing photographed twice"); } catch {}
    try { reduce(def, st, { type: "photograph", hotspotId: "nope" }, 4); problems.push("photo: photographed something not here"); } catch {}
    const pinned = reduce(def, st, { type: "boardAdd", itemId: st.photos[0].id, x: 10, y: 10 }, 5).state;
    if (!pinned.board.items.some((i) => i.id === st.photos[0].id)) problems.push("photo: cannot be pinned to the board");
    const noted = reduce(def, st, { type: "saveEvidenceNote", evidenceId: st.photos[0].id, text: "check this" }, 6).state;
    if (noted.evidenceNotes[st.photos[0].id] !== "check this") problems.push("photo: cannot take a note");
    if (normalizeState(def, JSON.parse(JSON.stringify(st))).photos.length !== 1) problems.push("photo: lost on reload");
    if (normalizeState(def, { ...JSON.parse(JSON.stringify(st)), photos: undefined }).photos.length !== 0) problems.push("photo: old saves not upgraded");
  }
}

// ---- Det. Bennett's nudge toward the board ----
if (def.boardHint) {
  const h = def.boardHint;
  const base = reduce(def, newState(def), { type: "dismissIntro" }, 1).state;
  const away = { ...base, location: "diner", evidence: def.evidence.slice(0, h.evidenceCount).map((e) => e.id) };
  const a1 = reduce(def, away, { type: "saveNotes", text: "x" }, 2).state;
  if (a1.pendingCalls.includes(h.callId)) problems.push("board hint rang away from the office");
  if (!a1.messages.some((m) => /Bennett/.test(m))) problems.push("board hint gave no notice in the field");
  const home = reduce(def, { ...a1, location: def.startLocation, messages: [] }, { type: "saveNotes", text: "y" }, 3).state;
  if (!home.pendingCalls.includes(h.callId)) problems.push("board hint did not ring in the office");
  const answered = reduce(def, home, { type: "answerCall", callId: h.callId }, 4).state;
  const again = reduce(def, answered, { type: "saveNotes", text: "z" }, 5).state;
  if (again.pendingCalls.includes(h.callId)) problems.push("board hint rang twice");
  const connected = { ...base, location: def.startLocation, evidence: away.evidence, board: { items: [], connections: [["E01", "E02"]] as [string, string][] } };
  if (reduce(def, connected, { type: "saveNotes", text: "q" }, 6).state.pendingCalls.includes(h.callId)) problems.push("board hint rang for someone already using the board");
  const few = { ...base, location: def.startLocation, evidence: away.evidence.slice(0, h.evidenceCount - 1) };
  if (reduce(def, few, { type: "saveNotes", text: "q" }, 6).state.pendingCalls.includes(h.callId)) problems.push("board hint rang too early");
}

if (problems.length) {
  console.error("PROBLEMS:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("All checks passed.");
