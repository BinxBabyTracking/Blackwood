/**
 * C002's reference playthrough for the case checker: plays A Short Trip from
 * Ruth's visit to a closed case with the real engine, checking the order the
 * story must keep (Laura only after her release, Gordon only once found, the
 * time jump to Oak Terrace, Gordon moving to the station after his arrest),
 * that each piece of evidence arrives one way, and that the report standard
 * holds. Run through: npm run check:case -- C002
 */
import { newState, normalizeState, project, reduce, interviewCandidates, characterLocation } from "../src/game/engine/engine";
import { check } from "../src/game/engine/rules";
import { bestMatch } from "../src/game/engine/matcher";
import { questionsLeft } from "../src/game/engine/questions";
import type { CaseDefinition, GameAction, InvestigationState } from "../src/game/engine/types";

/** Everyday phrasings and the authored answer each should reach. */
export const C002_MATCH: [string, string, string | null][] = [
  ["tom", "What happened that night?", "tom_night"],
  ["tom", "Why didn't you call the police right away?", "tom_delay"],
  ["tom", "Why did you take two thousand dollars out of the bank?", "tom_money"],
  ["tom", "How did he get into the house?", "tom_door"],
  ["tom", "Were there other men with him?", "tom_others"],
  ["tom", "Did you get a blood test?", "tom_blood"],
  ["tom", "What did the ransom letter say?", "tom_letter"],
  ["tom", "What did the man look like?", "tom_man"],
  ["laura", "Where did he keep you?", "laura_held"],
  ["laura", "How long were you driving?", "laura_drive"],
  ["laura", "How many people were there?", "laura_men"],
  ["laura", "Can I have the goggles?", "laura_goggles"],
  ["laura", "How did you get home?", "laura_release"],
  ["laura", "What did the room smell like?", "laura_room"],
  ["ferris", "Can I see Tom's statement?", "ferris_statement"],
  ["ferris", "Did he pass the polygraph?", "ferris_polygraph"],
  ["ferris", "Was there any sign of a break-in?", "ferris_entry"],
  ["ferris", "What's your theory about the case?", "ferris_case"],
  ["nora", "Did anyone call you?", "nora_calls"],
  ["nora", "What came in the mail?", "nora_package"],
  ["nora", "Do you think there's really a crew?", "nora_crew"],
  ["howard", "Did you see anything that night?", "howard_night"],
  ["howard", "What did the van look like?", "howard_van"],
  ["howard", "Did you get the license plate?", "howard_plate"],
  ["ruth", "When did you last talk to Laura?", "ruth_last"],
  ["ruth", "Why did you hire us?", "ruth_hire"],
  ["bennett", "Can you send the glasses to the lab?", "bennett_send_glasses"],
  ["gordon", "Where were you on October 9th?", "gordon_week"],
  ["gordon", "What do you do for a living?", "gordon_who"],
  ["tom", "What's your favorite movie?", null],
  ["howard", "Do you like baseball?", null],
];

export function checkC002(def: CaseDefinition, problems: string[]) {
  const expect = (ok: unknown, msg: string) => {
    if (!ok) problems.push(msg);
  };
  let s: InvestigationState = newState(def, 0);
  let t = 1000;
  const run = (a: GameAction) => {
    const r = reduce(def, s, a, (t += 5000));
    s = r.state;
    return r.outcome;
  };
  const hot = (h: string) => run({ type: "hotspot", hotspotId: h });
  const collect = (e: string) => run({ type: "collect", evidenceId: e });
  const go = (l: string) => run({ type: "travel", locationId: l });
  const talk = (c: string) => run({ type: "talk", characterId: c });
  const ask = (q: string) => {
    const qd = def.questions.find((x) => x.id === q);
    if (!qd) throw new Error(`unknown question ${q}`);
    talk(qd.characterId);
    return run({ type: "ask", questionId: q });
  };
  const look = (h: string) => {
    const o = hot(h);
    if (o.kind === "inspect" && o.evidence && !s.evidence.includes(o.evidence.id)) collect(o.evidence.id);
    return o;
  };
  const known = () => project(def, s).characters.map((c) => c.id);
  const answer = (callId: string) => {
    if (s.location !== "office") go("office");
    expect(s.pendingCalls.includes(callId), `${callId} did not ring in the office`);
    return run({ type: "answerCall", callId });
  };
  const open = (deliveryId: string) => {
    if (s.location !== "office") go("office");
    expect(s.pendingDeliveries.includes(deliveryId), `${deliveryId} not on the desk`);
    const o = run({ type: "openDelivery", deliveryId });
    if (o.kind === "delivery") for (const e of o.evidence) if (!s.evidence.includes(e.id)) collect(e.id);
    return o;
  };
  const connect = (a: string, b: string, want: string) => {
    run({ type: "boardAdd", itemId: a, x: 10, y: 10 });
    run({ type: "boardAdd", itemId: b, x: 30, y: 30 });
    run({ type: "connect", a, b });
    expect(s.deductions.includes(want), `${a} + ${b} did not give ${want}`);
  };
  const waitForLab = () => {
    t += 181_000;
    run({ type: "checkLabs" });
  };

  // ---- the start: Tuesday, 11 AM ----
  run({ type: "dismissIntro" });
  try { collect("E09"); problems.push("collected E09 before it was delivered"); } catch {}
  run({ type: "readDocument", documentId: "casefile" });
  const start = project(def, s);
  for (const hidden of ["gordon", "diane", "nora", "howard"]) expect(!known().includes(hidden), `${hidden} is listed at the start`);
  expect(known().includes("laura") && known().includes("tom"), "Laura and Tom should be in the case file");
  for (const secret of ["cabin14", "tamarack_store", "moss_house", "courier"]) expect(!start.map.some((m) => m.id === secret), `${secret} is on the map at the start`);
  expect(!start.conclusion.choices.find((c) => c.id === "culprit")!.options.some((o) => o.id === "gordon"), "Gordon Pell is a report option before he is found");
  expect(!JSON.stringify(start).match(/Pell|Tamarack|Oak Terrace|Cabin 14/), "the opening view names a later place or person");
  try { go("ruth_apartment"); talk("laura"); problems.push("Laura could be interviewed before her release"); } catch {}
  go("office");
  expect(!start.location.hotspots.some((h) => h.id.startsWith("office_lab_")), "lab results on the desk before anything was sent");

  // ---- 418 Elm Street ----
  go("hale_bedroom");
  look("hb_underbed");
  look("hb_glasses");
  expect(s.evidence.includes("E01") && s.evidence.includes("E02"), "bedroom evidence not collected");
  go("hale_kitchen");
  look("hk_letter");
  look("hk_slip");
  ask("tom_night");
  ask("tom_others");
  ask("tom_door");
  ask("tom_blood");
  expect(s.evidence.includes("E03") && s.discoveries.E03?.via === "dialogue", "Tom did not hand over his blood screen");
  expect(s.eventStates.RE01 === "available", `RE01 should wait for the office, is ${s.eventStates.RE01}`);
  expect(!s.pendingCalls.length, "the telephone rang away from the office");
  go("elm_street");
  expect(known().includes("howard"), "Howard not listed once seen on his porch");
  ask("howard_night");
  ask("howard_plate");
  expect(s.evidence.includes("E06"), "Howard did not hand over his note");

  // ---- the lab: real time ----
  go("office");
  expect(interviewCandidates(def, s, "bennett").some((x) => x.id === "bennett_send_glasses"), "Bennett cannot be asked to send the glasses");
  ask("bennett_send_glasses");
  expect(s.labs.glasses && !s.labs.glasses.done, "glasses not sent to the lab");
  expect(!s.pendingDeliveries.includes("lab_glasses"), "lab results came back at once");
  waitForLab();
  expect(s.labs.glasses?.done && s.pendingDeliveries.includes("lab_glasses"), "lab results did not arrive when their time was up");
  open("lab_glasses");
  expect(s.evidence.includes("E23"), "E23 not collected from the lab folder");

  // ---- RE01: the Courier ----
  expect(s.eventStates.RE01 === "active", `RE01 should be ringing, is ${s.eventStates.RE01}`);
  answer("call_nora");
  expect(s.eventStates.RE01 === "completed", "RE01 not completed");
  expect(known().includes("nora") && project(def, s).map.some((m) => m.id === "courier" && m.available), "the Courier did not open after Nora's call");

  // ---- the police ----
  go("police_station");
  ask("ferris_case");
  ask("ferris_statement");
  ask("ferris_polygraph");
  expect(s.evidence.includes("E05") && s.evidence.includes("E21"), "Ferris did not hand over the statement and polygraph");
  expect(s.contradictions.includes("X_PATROL"), "Ferris's missing witness not recorded");

  // ---- the Courier, and RE02 ----
  go("courier");
  look("cr_letter");
  look("cr_cassette");
  ask("nora_package");
  expect(s.eventStates.RE02 === undefined, "RE02 before Nora mentioned the calls");
  ask("nora_calls");
  expect(s.eventStates.RE02 === "available", `RE02 should be waiting, is ${s.eventStates.RE02}`);
  go("office");
  answer("call_bennett_trace");
  open("trace");
  expect(s.evidence.includes("E09") && s.eventStates.RE02 === "completed", "trace not delivered or RE02 not completed");
  expect(project(def, s).map.some((m) => m.id === "tamarack_store" && m.available), "Tamarack Lake did not open with the trace");

  // ---- RE03: Laura comes home ----
  expect(s.eventStates.RE03 === "active", `RE03 should be ringing, is ${s.eventStates.RE03}`);
  answer("call_ruth_laura");
  expect(s.flags.includes("laura_home"), "Laura is not home after Ruth's call");
  go("ruth_apartment");
  ask("ruth_return");
  ask("laura_held");
  ask("laura_men");
  ask("laura_goggles");
  expect(s.evidence.includes("E12") && s.evidence.includes("E13"), "Laura did not hand over her statement and the goggles");

  // ---- RE04: the hoax story ----
  expect(s.eventStates.RE04 === "available", `RE04 should be waiting, is ${s.eventStates.RE04}`);
  go("office");
  open("paper");
  answer("call_nora_letter2");
  expect(s.evidence.includes("E11") && s.eventStates.RE04 === "completed", "RE04 not completed");
  go("courier");
  ask("nora_letter2");
  expect(s.evidence.includes("E10"), "Nora did not hand over the second letter");

  // ---- Tamarack Lake ----
  go("tamarack_store");
  expect(!known().includes("gordon"), "Gordon listed before his name was found");
  look("ts_board");
  look("ts_ledger");
  expect(known().includes("gordon"), "Gordon not listed once his card and ledger were found");
  expect(project(def, s).conclusion.choices.find((c) => c.id === "culprit")!.options.some((o) => o.id === "gordon"), "Gordon not offered on the report once found");
  go("cabin14");
  look("cb_van");
  look("cb_window");
  ask("gordon_who");
  ask("gordon_week");
  ask("gordon_van");
  ask("gordon_gas");
  expect(s.contradictions.includes("X_VAN"), "the van contradiction was not recorded");
  expect(s.contradictions.includes("X_GENERATOR"), "the gas contradiction was not recorded");

  // ---- the board ----
  {
    // A pair that proves nothing gives nothing.
    const before = s.deductions.length;
    run({ type: "boardAdd", itemId: "E01", x: 10, y: 10 });
    run({ type: "boardAdd", itemId: "E21", x: 30, y: 30 });
    run({ type: "connect", a: "E01", b: "E21" });
    expect(s.deductions.length === before, "a wrong connection produced a deduction");
  }
  connect("E23", "E03", "D1");
  connect("E04", "E22", "D2");
  connect("E06", "E01", "D3");
  connect("E08", "E07", "D4");
  connect("E08", "E09", "D5");
  connect("E12", "E07", "D6");
  connect("E11", "E03", "D7");

  // ---- RE05: three weeks later ----
  expect(s.eventStates.RE05 === "available", `RE05 should be waiting, is ${s.eventStates.RE05}`);
  expect(!known().includes("diane"), "Diane listed before Oak Terrace");
  go("office");
  answer("call_bennett_oak");
  open("oak_report");
  expect(s.evidence.includes("E16") && known().includes("diane"), "Oak Terrace not delivered");
  go("moss_house");
  ask("diane_night");
  ask("diane_pager");
  connect("E16", "E12", "D8");

  // ---- the pager, and RE06 ----
  go("office");
  ask("bennett_pager");
  expect(s.evidence.includes("E17") && s.discoveries.E17?.via === "dialogue", "Bennett did not hand over the pager record");
  connect("E17", "E14", "D9");
  expect(s.eventStates.RE06 === "active", `RE06 should be ringing, is ${s.eventStates.RE06}`);
  const gordonDef = def.characters.find((c) => c.id === "gordon")!;
  expect(characterLocation(gordonDef, s) === "cabin14", "Gordon moved before his arrest");
  answer("call_bennett_arrest");
  expect(characterLocation(gordonDef, s) === "police_station", "Gordon did not move to the station after his arrest");
  open("search");
  expect(s.evidence.includes("E18") && s.evidence.includes("E20"), "search inventory and cassette transcript not delivered");
  go("cabin14");
  expect(!project(def, s).location.hotspots.some((h) => h.id === "cb_gordon"), "Gordon still at his door after his arrest");
  try { talk("gordon"); problems.push("Gordon could be interviewed at the cabin after his arrest"); } catch {}
  go("police_station");
  expect(project(def, s).location.hotspots.some((h) => h.id === "ps_gordon"), "Gordon not shown at the station");
  ask("gordon_head");
  ask("ferris_gordon");

  // ---- the typewriter ----
  go("office");
  ask("bennett_send_typewriter");
  waitForLab();
  open("lab_typewriter");
  expect(s.evidence.includes("E19"), "E19 not collected from the lab folder");
  connect("E19", "E04", "D10");
  connect("E20", "E05", "D11");
  expect(s.deductions.length === def.deductions.length, `deductions ${s.deductions.length}/${def.deductions.length}`);
  expect(s.evidence.length === def.evidence.length, `collected ${s.evidence.length}/${def.evidence.length}: missing ${def.evidence.map((e) => e.id).filter((e) => !s.evidence.includes(e))}`);
  for (const e of s.evidence) expect(s.evidence.filter((x) => x === e).length === 1, `${e} collected twice`);
  expect(s.events.length === 6 && new Set(s.events).size === 6, `events: ${s.events}`);
  expect(project(def, s).developments.every((d) => d.status === "Resolved"), "a development is still open");

  // ---- each item arrives one way ----
  const via: Record<string, string> = {
    E01: "scene", E02: "scene", E04: "scene", E07: "scene", E08: "scene", E14: "scene", E15: "scene", E22: "scene",
    E03: "dialogue", E05: "dialogue", E06: "dialogue", E10: "dialogue", E12: "dialogue", E13: "dialogue", E17: "dialogue", E21: "dialogue",
    E09: "delivery", E11: "delivery", E16: "delivery", E18: "delivery", E19: "delivery", E20: "delivery", E23: "delivery",
  };
  for (const [e, how] of Object.entries(via)) expect(s.discoveries[e]?.via === how, `${e} arrived by ${s.discoveries[e]?.via}, expected ${how}`);

  // ---- the report ----
  expect(check(def.reportAvailable, s), "report not available");
  const blank = reduce(def, newState(def), { type: "dismissIntro" }, 1).state;
  expect(!check(def.reportAvailable, blank), "report available at the start");
  const tomTheory = run({ type: "submitConclusion", theory: { culprit: "tom", motive: "quarrel", weapon: "tom_drove", location: "garage", evidence: ["E05", "E22", "E21", "E04"] } });
  expect(tomTheory.kind === "verdict" && !tomTheory.correct, "the hoax theory was accepted");
  const noLink = run({ type: "submitConclusion", theory: { culprit: "gordon", motive: "ransom", weapon: "night_entry", location: "cabin14", evidence: ["E03", "E23", "E12", "E14"] } });
  expect(noLink.kind === "verdict" && !noLink.correct, "a report with nothing tying Gordon to the crime was accepted");
  const good = run({ type: "submitConclusion", theory: { culprit: "gordon", motive: "ransom", weapon: "night_entry", location: "cabin14", evidence: ["E23", "E03", "E12", "E17", "E19", "E18"] }, investigator: "Sam Calloway" });
  expect(good.kind === "verdict" && good.correct, `correct report rejected: ${good.kind === "verdict" ? good.note : good.kind}`);
  expect(s.status === "closed", "case not closed");
  const closed = project(def, s);
  expect(closed.closure && closed.closure.reconstruction.length === def.solution.resolution.reconstruction.length, "closure not shown");
  expect(closed.conclusion.header.some((h) => h.value === "Laura Kessler"), "report header not from the case");
  const reloaded = normalizeState(def, JSON.parse(JSON.stringify(s)));
  expect(reloaded.status === "closed" && reloaded.evidence.length === def.evidence.length, "completion lost on reload");

  // ---- the playthrough fits inside the question limits ----
  for (const c of def.characters) {
    const used = s.asked.filter((id) => def.questions.find((q) => q.id === id)?.characterId === c.id).length + s.presented.filter((k) => k.startsWith(`${c.id}:`)).length;
    const cap = questionsLeft(def, newState(def, 0), c.id);
    const granted = (def.reinterviews ?? []).filter((g) => g.characterId === c.id).reduce((n, g) => n + (g.questions ?? 5), 0);
    if (cap !== null && used > cap + granted) problems.push(`the reference playthrough needs ${used} questions with ${c.name}`);
  }

  // ---- every question can be reached, and nothing is offered too early ----
  const fresh = reduce(def, reduce(def, newState(def), { type: "dismissIntro" }, 1).state, { type: "readDocument", documentId: "casefile" }, 2).state;
  const early = (cid: string) => interviewCandidates(def, { ...fresh, location: characterLocation(def.characters.find((c) => c.id === cid)!, fresh) ?? fresh.location }, cid).map((q) => q.id);
  for (const qid of ["tom_tape_found", "tom_gordon", "ferris_typewriter", "ferris_gordon", "bennett_pager", "bennett_plate_full", "bennett_send_typewriter"]) {
    const cid = def.questions.find((q) => q.id === qid)!.characterId;
    expect(!early(cid).includes(qid), `${qid} offered at the start`);
  }
  const unasked = def.questions.filter((q) => !q.repeatable && !s.asked.includes(q.id) && !interviewCandidates(def, { ...s, status: "active", location: characterLocation(def.characters.find((c) => c.id === q.characterId)!, s) ?? s.location }, q.characterId).some((x) => x.id === q.id));
  for (const q of unasked) problems.push(`question ${q.id} can never be asked`);

  // ---- matcher on everyday phrasings ----
  let hits = 0;
  for (const [cid, text, want] of C002_MATCH) if (bestMatch(text, def.questions.filter((d) => d.characterId === cid)) === want) hits++;
  if (hits / C002_MATCH.length < 0.9) problems.push(`matcher accuracy ${hits}/${C002_MATCH.length}`);

  // ---- the opening view must not leak restricted content ----
  const view = JSON.stringify(project(def, newState(def)));
  for (const secret of ["\"standard\"", "linkToSuspect", "knowledge", "reconstruction", "District Attorney", "Gordon", "Cabin 14", "Tamarack"]) if (view.includes(secret)) problems.push(`initial view leaks ${secret}`);

  console.log(`C002: ${def.evidence.length} evidence, ${def.locations.length} locations, ${def.questions.length} questions, ${def.deductions.length} deductions`);
  console.log(`playthrough: status=${s.status} attempts=${s.attempts} events=${s.events.join(",")} matcher=${hits}/${C002_MATCH.length}`);
}
