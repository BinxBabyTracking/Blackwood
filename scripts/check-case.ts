/**
 * Validates a case definition and plays it through to the end with the real
 * engine. Run: npm run check:case -- C001
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadCase } from "../src/game/registry";
import { newState, normalizeState, reduce, project, spokenLine, questionOpen } from "../src/game/engine/engine";
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
hot("office_labreport"); collect("E11");
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
ask("margaret_evening");
if (s.eventStates.RE01) problems.push("RE01 left locked before Margaret's initial interview was complete");
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
const initial = [...evIds].filter((e) => e !== "E05" && e !== "E15");
const missingInitial = initial.filter((e) => !s.evidence.includes(e));
if (missingInitial.length) problems.push(`initially discoverable evidence not collected: ${missingInitial}`);

// RE03 becomes available after Patricia's financial answer
go("patricia_office");
run({ type: "talk", characterId: "patricia" });
try { ask("patricia_money"); problems.push("follow-up question asked before it was unlocked"); } catch {}
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
if (bennett.kind !== "conversation" || bennett.medium !== "telephone" || !bennett.questions.some((x) => x.id === "bennett_jacket")) problems.push("Bennett telephone interview missing the jacket request");
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
if (s.evidence.length !== 15) problems.push(`collected ${s.evidence.length}/15: missing ${[...evIds].filter((e) => !s.evidence.includes(e))}`);

// every evidence item has exactly one scene hotspot, document or delivery that reveals it
for (const e of evIds) {
  const sources = def.locations.flatMap((l) => l.hotspots).filter((h) => h.interaction.type === "inspect" && h.interaction.evidence === e).length
    + def.documents.filter((d) => d.evidence.includes(e)).length + def.deliveries.filter((d) => d.evidence.includes(e)).length;
  if (sources < 1) problems.push(`${e} has no discovery source`);
}
// assigned locations from the Step 4 brief
const assigned: Record<string, string[]> = { office: ["E11", "E12"], living_room: ["E02", "E03", "E07", "E08", "E09"], kitchen: ["E01", "E06", "E10"], diner: ["E04", "E13"], daniel_apartment: ["E14"] };
for (const [locId, ids] of Object.entries(assigned)) for (const id of ids) if (def.evidence.find((e) => e.id === id)?.sourceLocationId !== locId) problems.push(`${id} not assigned to ${locId}`);
for (const id of ["E01","E02","E03","E04","E06","E07","E08","E09","E10","E11","E13","E14"]) {
  const d = s.discoveries[id];
  const want = def.evidence.find((e) => e.id === id)!.sourceLocationId;
  if (!d || d.locationId !== want) problems.push(`${id} discovered at ${d?.locationId} instead of ${want}`);
}

// board
const pins = ["E01", "E10", "E02", "E11", "E14", "E03", "E15", "E04", "E13", "E06", "E07", "E05", "E09", "E08", "E12", "daniel"];
pins.forEach((p, i) => run({ type: "boardAdd", itemId: p, x: (i * 7) % 90, y: (i * 13) % 90 }));
const wrong = run({ type: "connect", a: "E01", b: "E05" });
if (wrong.kind === "deduction") problems.push("wrong connection produced a deduction");
run({ type: "disconnect", a: "E01", b: "E05" });
for (const [a, b] of [["E01", "E10"], ["E02", "E11"], ["E14", "E11"], ["E03", "E15"], ["E09", "E03"], ["E04", "E13"], ["E05", "E11"], ["E06", "E07"]]) {
  const had = s.deductions.length;
  const o = run({ type: "connect", a, b });
  if (o.kind !== "deduction" && !(a === "E02" && had)) problems.push(`no deduction for ${a}-${b}`);
}
if (s.deductions.length !== def.deductions.length) problems.push(`deductions ${s.deductions.length}/${def.deductions.length}`);

// conclusion
const bad = run({ type: "submitConclusion", theory: { culprit: "robert", motive: "debt", weapon: "poker", location: "kitchen", evidence: ["E01"] } });
if (bad.kind !== "verdict" || bad.correct) problems.push("wrong theory accepted");
const weak = run({ type: "submitConclusion", theory: { culprit: "daniel", motive: "embezzlement", weapon: "knife", location: "living_room", evidence: ["E01"] } });
if (weak.kind !== "verdict" || weak.correct) problems.push("under-supported theory accepted");
const good = run({ type: "submitConclusion", theory: { culprit: "daniel", motive: "embezzlement", weapon: "knife", location: "living_room", evidence: ["E11", "E14", "E03", "E13", "E01"] } });
if (good.kind !== "verdict" || !good.correct) problems.push("correct theory rejected");

// interview record and voices
const pv = project(def, s);
const dan = pv.interviews.find((i) => i.characterId === "daniel");
if (!dan || dan.transcript.length < 4) problems.push("Daniel's transcript missing from the notebook view");
if (!pv.interviews.every((i) => ["margaret", "daniel", "robert", "patricia", "bennett", "rosa"].includes(i.characterId))) problems.push("unexpected interview");
if (!s.contradictions.includes("X_LINDA")) problems.push(`contradiction X_LINDA not recorded: ${s.contradictions}`);
if (s.demeanor.daniel === "composed") problems.push("Daniel's manner never changed");
const firstDanielLine = (s.conversations.daniel ?? []).findIndex((l) => l.speaker === "daniel");
const sp = spokenLine(def, s, { kind: "conversation", id: "daniel", n: firstDanielLine });
if (!sp || sp.text !== s.conversations.daniel[firstDanielLine].text || sp.speakerId !== "daniel") problems.push("voice line does not match the subtitle");
if (spokenLine(def, s, { kind: "conversation", id: "daniel", n: 0 })) problems.push("investigator's own line would be voiced");
if (spokenLine(def, newState(def), { kind: "statement", id: "margaret", n: 1 })) problems.push("statement voiced before the case file was read");
if (!spokenLine(def, s, { kind: "statement", id: "margaret", n: 1 })) problems.push("statement line not voiceable");

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
  for (const c of interviewees) {
    const here = { ...f, location: c.locationId ?? f.location };
    const o = reduce(def, here, { type: "talk", characterId: c.id }, 1).outcome;
    if (o.kind !== "conversation" || o.questions.length === 0) problems.push(`${c.id} has no opening questions`);
    if (o.kind === "conversation") {
      const shown = JSON.stringify(o);
      for (const q of def.questions.filter((x) => x.characterId === c.id && !questionOpen(def, here, x))) {
        if (shown.includes(q.prompt)) problems.push(`locked question ${q.id} visible`);
      }
      if (/requires|unlocks|variants|knowledge/.test(shown)) problems.push(`${c.id} conversation leaks rule data`);
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
  if (o.kind !== "conversation" || !o.refusing || o.questions.some((x) => x.id !== "daniel_evening")) problems.push("Daniel's refusal not applied");
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
        const people = def.characters.filter((c) => c.locationId === w.location && def.questions.some((q) => q.characterId === c.id));
        const c = people[rnd(people.length)];
        if (!c) continue;
        const o = W({ type: "talk", characterId: c.id });
        if (o.kind !== "conversation") continue;
        if (o.questions.length && rnd(4)) W({ type: "ask", questionId: o.questions[rnd(o.questions.length)].id });
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
    const A = (a: GameAction) => {
      const r = reduce(def, w, a, 1);
      w = r.state;
      return r.outcome;
    };
    const get = (e: string) => { if (!w.evidence.includes(e)) A({ type: "collect", evidenceId: e }); };
    const at = (l: string) => { if (w.location !== l) A({ type: "travel", locationId: l }); };
    const ask = (id: string) => { if (!w.asked.includes(id)) A({ type: "ask", questionId: id }); };
    A({ type: "dismissIntro" }); A({ type: "readDocument", documentId: "casefile" }); get("E12");
    return { A, get, at, ask, state: () => w };
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
      g.at("office"); g.A({ type: "hotspot", hotspotId: "office_labreport" }); g.get("E11");
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
  if (b1.kind === "conversation" && b1.questions.some((x) => x.id === "bennett_jacket")) problems.push("Bennett offers a jacket search with no reason to ask");
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

// view must not leak restricted content
const view = JSON.stringify(project(def, newState(def)));
for (const secret of ["embezzlement\",\"weapon", "evidenceGroups", "D_HAND", "Type B", "Friday, 11:05 PM", "knowledge", "11:35"]) if (view.includes(secret)) problems.push(`initial view leaks ${secret}`);

console.log(`${id}: ${def.evidence.length} evidence, ${def.locations.length} locations, ${def.questions.length} questions, ${def.deductions.length} deductions`);
console.log(`playthrough: status=${s.status} attempts=${s.attempts} events=${s.events.join(",")} active=${s.activeSeconds}s`);
if (problems.length) {
  console.error("PROBLEMS:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("All checks passed.");
