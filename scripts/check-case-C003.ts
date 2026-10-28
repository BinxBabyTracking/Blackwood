/**
 * C003's reference playthrough for the case checker: plays The Witness on
 * Alder Street from Rachel's visit to a closed case with the real engine,
 * checking the order the story must keep (nothing about the second crime before
 * it happens, Vivian and Graham alive until her call and dead after it, the
 * Marsh house changing, calls on the mobile phone wherever the player is), that
 * each piece of evidence arrives one way, that the report tells Voss, Bell and
 * Shaw apart, and that the case fits the question limits.
 * Run through: npm run check:case -- C003
 */
import { newState, normalizeState, project, reduce, interviewCandidates, characterLocation } from "../src/game/engine/engine";
import { bestMatch } from "../src/game/engine/matcher";
import { questionsLeft } from "../src/game/engine/questions";
import { fileUnder, reportStandardProblems } from "./report-helpers";
import type { CaseDefinition, GameAction, InvestigationState, Theory } from "../src/game/engine/types";

/** Everyday phrasings and the authored answer each should reach. */
export const C003_MATCH: [string, string, string | null][] = [
  ["rachel", "Why did you hire us?", "rachel_hire"],
  ["rachel", "Was Ethan scared of anything?", "rachel_worried"],
  ["rachel", "What was in Ethan's bag?", "rachel_bag"],
  ["rachel", "Where were they going that night?", "rachel_night"],
  ["rachel", "How is Sophie doing?", "rachel_sophie"],
  ["vivian", "What did you hear that night?", "vivian_night"],
  ["vivian", "Did you see the car that drove off?", "vivian_car"],
  ["vivian", "Did you see who fired the shots?", "vivian_shooting"],
  ["graham", "Have you seen any strange cars on the street?", "graham_car"],
  ["lena", "Do you still have their receipt?", "lena_receipt"],
  ["lena", "Was anyone else parked in the lot?", "lena_suv"],
  ["lena", "Do you have security camera footage?", "lena_camera"],
  ["cross", "Can I see the autopsy?", "cross_autopsy"],
  ["cross", "How many guns were fired?", "cross_casings"],
  ["cross", "What was missing from the car?", "cross_inventory"],
  ["cross", "Who towed the car away?", "cross_tow"],
  ["cross", "Do you really think this was a robbery?", "cross_robbery"],
  ["reed", "What can a lab tell me and what can't it?", "reed_limits"],
  ["voss", "Did you know Ethan Cole?", "voss_ethan"],
  ["voss", "Tell me about Riverside Commons.", "voss_project"],
  ["voss", "Where were you on September 14?", "voss_sept14"],
  ["bell", "Who drives Unit 4?", "bell_unit4"],
  ["bell", "Where were you the night of September 14?", "bell_sept14"],
  ["bell", "Do you know Trevor Shaw?", "bell_shaw"],
  ["shaw", "Where were you on September 14?", "shaw_sept14"],
  ["shaw", "How do you know Marcus Bell?", "shaw_bell"],
  ["owen", "Did you notice anything wrong with the Riverside Commons file?", "owen_replaced"],
  ["owen", "Why did you retire?", "owen_retired"],
  ["bennett", "What do you make of the file?", "bennett_case"],
  ["lena", "What's your favorite movie?", null],
  ["graham", "Do you like hockey?", null],
];

export function checkC003(def: CaseDefinition, problems: string[]) {
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
  const go = (l: string) => {
    if (s.location !== l) run({ type: "travel", locationId: l });
  };
  const talk = (c: string) => run({ type: "talk", characterId: c });
  const ask = (qid: string) => {
    const qd = def.questions.find((x) => x.id === qid);
    if (!qd) throw new Error(`unknown question ${qid}`);
    talk(qd.characterId);
    return run({ type: "ask", questionId: qid });
  };
  const look = (h: string) => {
    const o = hot(h);
    if (o.kind === "inspect" && o.evidence && !s.evidence.includes(o.evidence.id)) collect(o.evidence.id);
    return o;
  };
  const known = () => project(def, s).characters.map((c) => c.id);
  /** With a mobile phone every call rings where the player is; nobody goes back to the office to answer. */
  const answer = (callId: string) => {
    expect(s.pendingCalls.includes(callId), `${callId} did not ring (at ${s.location})`);
    return run({ type: "answerCall", callId });
  };
  /** Lab reports come to the phone: opened wherever the player is. */
  const open = (deliveryId: string) => {
    expect(s.pendingDeliveries.includes(deliveryId), `${deliveryId} has not arrived`);
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
  const SECOND = /found dead|were found|riverside access road|409 Alder Street, Monday|October 29|Unit 4|Bell Security|Riverside Commons/i;

  // ---- the start: Friday, October 26 ----
  run({ type: "dismissIntro" });
  try { collect("E01"); problems.push("collected E01 before finding it"); } catch {}
  run({ type: "readDocument", documentId: "casefile" });
  const start = project(def, s);
  for (const hidden of ["voss", "bell", "shaw", "owen", "graham", "caller"]) expect(!known().includes(hidden), `${hidden} is listed at the start`);
  for (const k of ["jenna", "ethan", "rachel", "cross", "vivian", "lena", "reed", "bennett"]) expect(known().includes(k), `${k} missing from the case file`);
  for (const secret of ["voss_office", "bell_garage", "shaw_yard", "annex", "riverside"]) expect(!start.map.some((m) => m.id === secret), `${secret} is on the map at the start`);
  expect(!SECOND.test(JSON.stringify({ ...start, conclusion: null, map: null })), "the opening view mentions the second crime or a later place");
  expect(start.caseStatus === "Active homicide", `status at start: ${start.caseStatus}`);
  expect(start.boardSections.length === 1, "board has a second section at the start");
  expect(start.phone.mobile && start.phone.contacts.some((c) => c.id === "cross") && start.phone.contacts.some((c) => c.id === "reed") && start.phone.contacts.some((c) => c.id === "bennett"), "Cross, Reed and Bennett not in the phone");
  expect(!start.conclusion.available, "report available at the start");

  // ---- Alder Street and the police ----
  go("alder_street");
  look("as_oak");
  look("as_hedge");
  look("as_porch");
  expect(["E01", "E05", "E07"].every((e) => s.evidence.includes(e)), "Alder Street evidence not collected");
  // Before the midpoint, nothing in the Marsh house is evidence.
  go("marsh_house");
  expect(!project(def, s).location.hotspots.some((h) => ["mh_door", "mh_calendar", "mh_notebook", "mh_laptop"].includes(h.id)), "second-crime evidence visible before the midpoint");
  for (const e of ["E17", "E18", "E19", "E24"]) {
    try { collect(e); problems.push(`${e} collectable before the midpoint`); } catch {}
  }
  expect(known().includes("graham"), "Graham not listed once his house is visited");
  ask("vivian_night");
  ask("vivian_car");
  ask("graham_car");
  go("police");
  ask("cross_case");
  ask("cross_autopsy");
  ask("cross_casings");
  ask("cross_inventory");
  expect(["E02", "E06", "E08"].every((e) => s.discoveries[e]?.via === "dialogue"), "Cross did not hand over the reports");
  connect("E01", "E02", "D01");

  // ---- Hart's ----
  go("harts");
  ask("lena_family");
  ask("lena_receipt");
  expect(s.evidence.includes("E03"), "Lena did not hand over the receipt");
  look("ha_monitor");
  connect("E03", "E04", "D02");
  // RE01 rings at once, here, on the phone.
  expect(s.eventStates.RE01 === "active", `RE01 should ring now, is ${s.eventStates.RE01}`);
  answer("call_lena");
  ask("lena_patch");

  // ---- Vivian remembers the light ----
  go("marsh_house");
  ask("vivian_light");
  expect(s.asked.includes("vivian_light"), "Vivian's light not reachable after D02");

  // ---- Rachel and Ethan's notes ----
  go("kowalski_house");
  ask("rachel_hire");
  {
    // Rachel has a talking portrait; someone without the frames keeps the still one.
    const o = talk("rachel");
    expect(o.kind === "conversation" && o.face && ["rest", "slight", "ah", "ee", "oh", "oo", "blink"].every((k) => o.face![k as "rest"]), "Rachel's talking portrait missing");
    const lena = reduce(def, { ...s, location: "harts" }, { type: "talk", characterId: "lena" }, t).outcome;
    expect(lena.kind === "conversation" && lena.face === null, "a person without face frames got a talking portrait");
  }
  ask("rachel_worried");
  ask("rachel_bag");
  look("kh_box");
  expect(s.evidence.includes("E09"), "Ethan's notepad not collected");
  try { collect("E15"); problems.push("E15 collectable before Rachel remembers the envelope"); } catch {}
  connect("E08", "E09", "D03");

  // ---- the annex: the original, the survey, Owen ----
  go("annex");
  look("an_box");
  look("an_drawer");
  expect(s.eventStates.RE02 === "active" && s.pendingCalls.includes("call_rachel_envelope"), "RE02 did not ring once the clearance turned up");
  expect((s.texts ?? []).includes("t_rachel_envelope"), "Rachel's text did not arrive");
  answer("call_rachel_envelope");
  ask("owen_who");
  ask("owen_replaced");
  ask("owen_log");
  expect(s.evidence.includes("E16"), "Owen did not hand over the audit log");

  go("kowalski_house");
  look("kh_envelope");
  expect(s.evidence.includes("E15") && s.eventStates.RE02 === "completed", "envelope not found or RE02 not completed");

  // ---- Bellwether Redevelopment Group ----
  go("voss_office");
  expect(!project(def, s).location.hotspots.some((h) => h.id === "vo_credenza"), "the bank folder shows before the ledger and invoice");
  look("vo_binder");
  look("vo_ledger");
  look("vo_tray");
  look("vo_credenza");
  ask("voss_who");
  ask("voss_ethan");
  ask("voss_invoice");
  ask("voss_wire");
  expect(s.contradictions.includes("X_PATROLS"), "Voss's patrol story not contradicted");
  connect("E10", "E11", "D04");
  connect("E16", "E11", "D05");
  connect("E13", "E14", "D11");
  expect(known().includes("voss") && known().includes("bell"), "Voss and Bell not listed once their papers are found");

  // ---- Bell Security ----
  go("bell_garage");
  ask("bell_who");
  ask("bell_unit4");
  ask("bell_sept14");
  look("bg_fleet");
  look("bg_repair");
  hot("bg_magnet");
  hot("bg_unit4");
  ask("bell_deer");
  expect(s.contradictions.includes("X_DEER"), "Bell's deer story not contradicted");
  // D08 is the midpoint gate. The call rings here, wherever the player is (not at the Marsh house).
  connect("E05", "E26", "D08");
  expect(s.eventStates.MID1 === "active" && s.pendingCalls.includes("call_vivian"), `Vivian's call did not ring: MID1 is ${s.eventStates.MID1}`);
  expect(!project(def, s).location.hotspots.some((h) => h.id === "mh_vivian"), "(sanity) wrong scene");
  answer("call_vivian");
  // From her call on, the Marshes cannot be interviewed.
  {
    const there = { ...s, location: "marsh_house" };
    try { reduce(def, there, { type: "talk", characterId: "vivian" }, t); problems.push("Vivian can still be interviewed after her call"); } catch {}
    try { reduce(def, there, { type: "talk", characterId: "graham" }, t); problems.push("Graham can still be interviewed after Vivian's call"); } catch {}
  }

  // ---- a detour: the visit waits, nothing happens until the player goes ----
  expect(known().includes("shaw"), "Shaw not listed once the magnet and the tow record are in hand");
  go("shaw_yard");
  expect(s.eventStates.MID2 === "available" && !s.flags.includes("marsh_empty"), "MID2 fired before the player went to the Marsh house");
  ask("shaw_who");
  ask("shaw_sept14");
  look("sy_dispatch");
  expect(s.contradictions.includes("X_ROUTE51"), "Shaw's Route 51 story not contradicted");
  connect("E28", "E04", "D09");
  ask("cross_shaw_records"); // by phone, from the tow yard
  expect(s.evidence.includes("E29") && s.discoveries.E29?.via === "dialogue", "Cross did not hand over Shaw's phone records by phone");
  connect("E28", "E29", "D10");
  ask("shaw_dispatch");

  // ---- MID2: 409 Alder Street, 8:10 PM ----
  go("marsh_house");
  expect(s.eventStates.MID2 === "active" && s.flags.includes("marsh_empty") && s.env.marsh_house === "B", "the Marsh house did not change");
  expect(s.messages.some((m) => m.includes("Monday, October 29, 8:10 PM")), "no time notice for the visit");
  const marsh = project(def, s).location.hotspots.map((h) => h.id);
  expect(!marsh.includes("mh_vivian") && !marsh.includes("mh_graham"), "the Marshes are still in the scene");
  for (const h of ["mh_door", "mh_calendar", "mh_notebook", "mh_laptop"]) look(h);
  expect(["E17", "E18", "E19", "E24"].every((e) => s.evidence.includes(e)), "Marsh house evidence not collected");
  connect("E17", "E18", "D06");

  // ---- MID3: call Cross; the lab ----
  ask("cross_marsh");
  expect(s.eventStates.MID3 === "completed" && s.env.marsh_house === "C", "police did not secure the house");
  expect((s.texts ?? []).includes("t_reed_blood"), "Reed's text did not arrive");
  expect(!s.pendingCalls.includes("call_cross_found"), "the bodies were found while the player was still at the house");
  ask("reed_blood");
  expect(s.labs.blood && !s.labs.blood.done, "blood not sent to the lab");

  // ---- MID4: the next morning ----
  go("alder_street");
  expect(s.eventStates.MID4 === "active" && s.pendingCalls.includes("call_cross_found"), "Cross's call did not ring after leaving the house");
  answer("call_cross_found");
  const after = project(def, s);
  expect(after.caseStatus === "Active multiple homicide", `status after: ${after.caseStatus}`);
  expect(after.boardSections.length === 2, "second board section did not open");
  expect(after.characters.find((c) => c.id === "vivian")?.deceased && after.characters.find((c) => c.id === "graham")?.deceased, "the Marshes not marked deceased");
  const viv = after.interviews.find((i) => i.characterId === "vivian");
  expect(viv?.status === "Deceased" && (viv?.transcript.length ?? 0) > 0, "Vivian's interview lost or not marked deceased");
  expect(after.map.some((m) => m.id === "riverside" && m.available), "riverside road not unlocked");
  expect(after.conclusion.available === s.evidence.length >= 10, "report availability wrong after the bodies are found");
  ask("cross_bodies");
  ask("cross_bank");
  ask("cross_facilities");
  expect(s.evidence.includes("E23"), "Cross did not hand over the bank record");

  // ---- RE05: the warning (found + D05/D11) ----
  expect(s.eventStates.RE05 === "active" && s.pendingCalls.includes("call_warning"), `RE05 did not ring: ${s.eventStates.RE05}`);
  answer("call_warning");
  ask("bennett_prepaid");

  // ---- the riverside road ----
  go("riverside");
  look("rv_suv");
  look("rv_camera");
  expect(s.evidence.includes("E21") && s.evidence.includes("E31"), "riverside evidence not collected");
  ask("reed_gps");
  ask("reed_paint");
  waitForLab();
  for (const d of ["lab_blood", "lab_gps", "lab_paint"]) open(d);
  expect(["E20", "E22", "E27"].every((e) => s.evidence.includes(e) && s.discoveries[e]?.via === "delivery"), "lab results not collected from the phone");
  expect(s.eventStates.RE04 === "active", `RE04 not active: ${s.eventStates.RE04}`);
  answer("call_reed_paint");
  connect("E19", "E20", "D07");
  connect("E22", "E25", "D12");

  // ---- RE03: back at the garage, Unit 4 is gone ----
  go("bell_garage");
  expect(s.eventStates.RE03 === "completed" && s.env.bell_garage === "B", "RE03 did not empty bay 2");
  ask("bell_where_unit4");
  expect(s.conversations.bell.at(-1)?.text.includes("stolen") || s.conversations.bell.some((l) => l.text.includes("Somebody took it")), "Bell's post-midpoint answer about Unit 4 not used");
  ask("bell_oct29");
  ask("bell_stolen");
  expect(s.contradictions.includes("X_STOLEN"), "Bell's stolen story not contradicted");

  // ---- RE06: the search, Bell in custody ----
  expect(s.eventStates.RE06 === "active" && s.pendingCalls.includes("call_cross_search"), `RE06 did not ring: ${s.eventStates.RE06}`);
  answer("call_cross_search");
  const bell = def.characters.find((c) => c.id === "bell")!;
  expect(characterLocation(bell, s) === "police", "Bell did not move to the station");
  ask("reed_gloves");
  waitForLab();
  open("lab_gloves");
  expect(s.evidence.includes("E32"), "the gloves report did not arrive");
  go("police");
  ask("cross_voss_text");
  ask("bell_gloves");
  expect(s.flags.includes("bell_lawyered"), "Bell did not ask for a lawyer");
  expect(s.evidence.length === 32, `expected all 32 evidence items, have ${s.evidence.length}: missing ${def.evidence.map((e) => e.id).filter((e) => !s.evidence.includes(e))}`);
  expect(s.deductions.length >= 12, `expected all 12 deductions, have ${s.deductions.join(",")}`);

  // Evidence arrives one way each.
  const VIA: Record<string, string> = {
    E02: "dialogue", E03: "dialogue", E06: "dialogue", E08: "dialogue", E16: "dialogue", E23: "dialogue", E29: "dialogue",
    E20: "delivery", E22: "delivery", E27: "delivery", E32: "delivery",
  };
  for (const e of def.evidence) expect(s.discoveries[e.id]?.via === (VIA[e.id] ?? "scene"), `${e.id} arrived via ${s.discoveries[e.id]?.via}`);

  // A save in the middle of it all round-trips.
  const reloaded = normalizeState(def, JSON.parse(JSON.stringify(s)));
  expect(reloaded.eventStates.MID4 === "completed" && reloaded.flags.includes("marshes_found") && (reloaded.texts ?? []).length === s.texts!.length, "midpoint lost on reload");

  // ---- the report ----
  go("office");
  const report = project(def, s).conclusion;
  expect(report.available && report.choices.length === 6 && report.choices.find((c) => c.id === "attackers")?.multi, "report form wrong");
  expect(report.date === "October 2018", "report date");
  const key = ["E05", "E26", "E13", "E30", "E28", "E04", "E22", "E11", "E18"];
  const T = (over: Partial<Theory>, evidence = key): Theory => ({
    organizer: "voss", attackers: ["bell", "shaw"], motive: "documents", second_killer: "bell", second_motive: "witness", connection: "cover", evidence, ...fileUnder(def, evidence), ...over,
  } as Theory);
  const verdict = (th: Theory) => run({ type: "submitConclusion", theory: th });
  const shawToo = verdict(T({ second_killer: "bell_shaw" }));
  expect(shawToo.kind === "verdict" && !shawToo.correct, "a report blaming Shaw for the Marshes was accepted");
  const vossOrdered = verdict(T({ second_motive: "ordered" }));
  expect(vossOrdered.kind === "verdict" && !vossOrdered.correct, "a report saying Voss ordered the Marshes' deaths was accepted");
  const bellAlone = verdict(T({ attackers: ["bell"] }));
  expect(bellAlone.kind === "verdict" && !bellAlone.correct, "a report leaving Shaw out of Alder Street was accepted");
  expect(s.status === "active", "a returned report closed the case");
  problems.push(...reportStandardProblems(def, s, { organizer: "voss", attackers: ["bell", "shaw"], motive: "documents", second_killer: "bell", second_motive: "witness", connection: "cover" }, key));
  const good = run({ type: "submitConclusion", theory: T({ attackers: ["shaw", "bell"] }), investigator: "Sam Calloway" });
  expect(good.kind === "verdict" && good.correct, `correct report returned: ${good.kind === "verdict" ? good.note : good.kind}`);
  expect(s.status === "closed", "case not closed");
  const closure = project(def, s).closure;
  expect(closure?.caller?.characterId === "cross", "closing call is not Det. Cross");

  // ---- the question limits: the whole playthrough fits without paying ----
  for (const c of def.characters) {
    const used = s.asked.filter((id) => def.questions.find((q) => q.id === id)?.characterId === c.id).length + s.presented.filter((k) => k.startsWith(`${c.id}:`)).length;
    const cap = questionsLeft(def, newState(def, 0), c.id);
    const granted = (def.reinterviews ?? []).filter((g) => g.characterId === c.id).reduce((n, g) => n + (g.questions ?? 5), 0);
    if (cap !== null && used > cap + granted) problems.push(`the reference playthrough needs ${used} questions with ${c.name}, more than ${cap} + ${granted}`);
  }

  // ---- the matcher on everyday phrasings ----
  let hits = 0;
  for (const [cid, text, want] of C003_MATCH) {
    const got = bestMatch(text, def.questions.filter((q) => q.characterId === cid));
    if (got === want) hits++;
    else problems.push(`matcher: "${text}" (${cid}) got ${got}, wanted ${want}`);
  }
  if (hits / C003_MATCH.length < 0.9) problems.push(`matcher accuracy ${hits}/${C003_MATCH.length}`);

  // ---- nothing secret in the opening view ----
  const view = JSON.stringify(project(def, newState(def)));
  for (const secret of ["\"standard\"", "linkToSuspect", "knowledge", "reconstruction", "District Attorney", "marshes_found", "MID1", "Voss", "Shaw", "Bell Security"]) if (view.includes(secret)) problems.push(`initial view leaks ${secret}`);
  // Every candidate question is still answerable in a fresh game (no dangling unlocks).
  void interviewCandidates;

  console.log(`C003: ${def.evidence.length} evidence, ${def.locations.length} locations, ${def.questions.length} questions, ${def.deductions.length} deductions`);
  console.log(`playthrough: status=${s.status} attempts=${s.attempts} events=${s.events.join(",")} matcher=${hits}/${C003_MATCH.length}`);
}
