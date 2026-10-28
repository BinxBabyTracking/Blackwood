/**
 * C005's reference playthrough for the case checker: plays The Abbey of Silent
 * Bells from the archdeacon's commission to a closed case with the real
 * engine, checking the order the story must keep (letters and visits only at
 * the chamber, the archive shut then opened, Peter gone and found alive, the
 * salt bin searched only when the case is made), that each piece of evidence
 * arrives one way, that the bell timeline and the manuscript comparison work
 * and keep their answers on the server, that the report tells murder,
 * forgery and innocent secrecy apart, and that the case fits the question
 * limits. Run through: npm run check:case -- C005
 */
import { newState, normalizeState, project, reduce, characterLocation } from "../src/game/engine/engine";
import { bestMatch } from "../src/game/engine/matcher";
import { questionsLeft } from "../src/game/engine/questions";
import { fileUnder, reportStandardProblems } from "./report-helpers";
import type { CaseDefinition, GameAction, InvestigationState, Theory } from "../src/game/engine/types";

/** Everyday phrasings and the authored answer each should reach. */
export const C005_MATCH: [string, string, string | null][] = [
  ["abbot", "How did Edmund die?", "abbot_welcome"],
  ["abbot", "Who found the body?", "abbot_found"],
  ["abbot", "What's the missing document?", "abbot_charter"],
  ["abbot", "Can I get into the archive?", "abbot_archive"],
  ["abbot", "Where was everybody on Monday evening?", "abbot_evening"],
  ["matthias", "Where were you Monday night?", "matthias_evening"],
  ["matthias", "Who has keys to the passage?", "matthias_passage"],
  ["matthias", "Were you at Compline?", "matthias_compline"],
  ["thomas", "How did you find him?", "thomas_found"],
  ["thomas", "What was Edmund working on?", "thomas_charter"],
  ["thomas", "Did anyone leave the reading?", "thomas_collation"],
  ["thomas", "How do you tell an old hand from a new one?", "thomas_hands"],
  ["peter", "What did you hear in the book room?", "peter_voices"],
  ["peter", "Did you see anyone in the kitchen court?", "peter_court"],
  ["anselm", "Who has keys to the passage?", "anselm_keys"],
  ["anselm", "Did you lend Edmund anything?", "anselm_candlestick"],
  ["anselm", "Who was at Compline?", "anselm_compline"],
  ["agnes", "What did you see on the body?", "agnes_wound"],
  ["agnes", "Could it have been a seizure?", "agnes_seizure"],
  ["agnes", "When did he die?", "agnes_when"],
  ["simon", "How was Compline rung on Monday?", "simon_compline"],
  ["simon", "Tell me about Peter.", "simon_peter"],
  ["william", "Who came to the abbey on Monday?", "william_monday"],
  ["william", "Does Peter have any family?", "william_peter"],
  ["william", "Could anyone get over the wall?", "william_wall"],
  ["roland", "What do you want with Fellbeck?", "roland_fellbeck"],
  ["roland", "Where did the old confirmation come from?", "roland_writing"],
  ["geoffrey", "Were you at the abbey on Monday?", "geoffrey_monday"],
  ["geoffrey", "Do you know the cellarer?", "geoffrey_matthias"],
  ["archdeacon", "What do you make of all this?", "archdeacon_case"],
  ["william", "What's your favorite song?", null],
  ["anselm", "Do you like fishing?", null],
];

export function checkC005(def: CaseDefinition, problems: string[]) {
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
  /** Letters and visits come only to the chamber. */
  const answer = (callId: string) => {
    expect(s.location === def.startLocation, `answering ${callId} away from the chamber`);
    expect(s.pendingCalls.includes(callId), `${callId} is not at the door (pending: ${s.pendingCalls.join(",")})`);
    return run({ type: "answerCall", callId });
  };
  const connect = (a: string, b: string, want: string) => {
    run({ type: "boardAdd", itemId: a, x: 10, y: 10 });
    run({ type: "boardAdd", itemId: b, x: 30, y: 30 });
    run({ type: "connect", a, b });
    expect(s.deductions.includes(want), `${a} + ${b} did not give ${want}`);
  };
  const place = (cardId: string, space: string | null, pos = 0) => run({ type: "sequencePlace", sequenceId: "bells", cardId, space, pos });
  const compare = (comparisonId: string, regionId: string, text: string) => {
    const c = project(def, s).comparisons.find((x) => x.id === comparisonId);
    const opt = c?.regions.find((r) => r.id === regionId)?.options.find((o) => o.text.startsWith(text));
    if (!opt) {
      problems.push(`comparison ${comparisonId}/${regionId}: no option "${text}"`);
      return null;
    }
    return run({ type: "compare", comparisonId, regionId, optionId: opt.id });
  };
  const MODERN = /\b(police|forensic|laborator|dna|fingerprint|alibi|o'clock|minutes?|okay|telephone|phone|photograph)\b/i;

  // ---- the commission ----
  run({ type: "dismissIntro" });
  try { collect("E01"); problems.push("collected E01 before finding it"); } catch {}
  run({ type: "readDocument", documentId: "casefile" });
  const start = project(def, s);
  expect(start.theme === "medieval" && start.words.photo === "Sketch" && start.words.notebook === "Journal", "C005 does not wear its medieval theme and words");
  for (const k of ["edmund", "abbot", "matthias", "thomas", "anselm", "simon", "peter", "agnes", "william", "roland", "geoffrey", "archdeacon"]) expect(known().includes(k), `${k} missing from the commission`);
  for (const hidden of ["margery", "alice"]) expect(!known().includes(hidden), `${hidden} is listed at the start`);
  for (const secret of ["passage", "mill"]) expect(!start.map.some((m) => m.id === secret), `${secret} is on the map at the start`);
  expect(!start.map.find((m) => m.id === "manor")?.available, "Ashcombe Hall open at the start");
  expect(start.caseStatus === "The death of Brother Edmund", `status at start: ${start.caseStatus}`);
  expect(!start.conclusion.available, "the finding can be written at the start");
  expect(start.phone.contacts.some((c) => c.id === "archdeacon"), "the archdeacon cannot be written to from the chamber");
  expect(start.sequences.length === 0 && start.comparisons.length === 0, "the timeline or the lectern is open before there is anything to put on it");

  // ---- Act 1: the book room, the body, the door ----
  go("book_room");
  for (const h of ["br_sketch", "br_desk", "br_door", "br_chest", "br_register"]) look(h);
  expect(["E01", "E03", "E04", "E08", "E14"].every((e) => s.evidence.includes(e)), "book room evidence not collected");
  expect(s.eventStates.RE02 === "available" && !s.pendingCalls.includes("visit_abbot_archive"), "the abbot came to the door away from the chamber");
  go("infirmary");
  ask("agnes_wound");
  ask("agnes_seizure");
  expect(s.discoveries.E02?.via === "dialogue", "Agnes did not hand over her account");
  connect("E01", "E02", "D01");

  go("cloister");
  ask("peter_voices");
  ask("peter_oil");
  ask("peter_court");
  expect(project(def, s).map.some((m) => m.id === "passage" && m.available), "the passage did not open once the bar was examined");
  go("passage");
  look("pa_aumbry");
  look("pa_frame");
  connect("E04", "E05", "D02");
  connect("E05", "E06", "D03");
  expect(s.eventStates.RE03 === "available" && !s.pendingCalls.length, "Thomas came to the door before the player was in the chamber");

  // ---- Act 2: the writing ----
  go("scriptorium");
  ask("thomas_monday");
  ask("thomas_collation");
  ask("thomas_charter");
  ask("thomas_grant");
  look("sc_carrel");
  look("sc_exemplar");
  expect(s.discoveries.E09?.via === "dialogue", "Thomas did not hand over the grant");
  connect("E13", "E14", "D08");
  connect("E08", "E14", "D05");

  go("chamber");
  for (const c of ["letter_warning", "visit_abbot_archive", "visit_thomas_peter"]) answer(c);
  expect(s.messages.some((m) => m.includes("Wednesday, October 21")), "no notice of the morning Peter was missed");
  expect(project(def, s).caseStatus?.includes("Peter missing"), "status does not say Peter is missing");
  expect(project(def, s).map.some((m) => m.id === "manor" && m.available), "Ashcombe Hall did not open with the warning");
  {
    const there = { ...s, location: "cloister" };
    try { reduce(def, there, { type: "talk", characterId: "peter" }, t); problems.push("Peter can still be questioned after he ran"); } catch {}
  }

  // The first comparison: the words.
  const lectern = project(def, s).comparisons;
  expect(lectern.length === 1 && lectern[0].id === "words", "the words comparison is not open with the grant and the copy in hand");
  expect(!JSON.stringify(lectern).includes("\"answer\"") && !JSON.stringify(lectern).includes("discrepancy"), "a comparison answer reached the browser");
  let o = compare("words", "tenure", "One is in Latin");
  expect(o?.kind === "compare" && !o.correct, "a wrong observation was accepted");
  o = compare("words", "greeting", "Nothing here differs");
  expect(o?.kind === "compare" && o.correct && !s.comparisons?.words.found.includes("greeting"), "a decoy passage counted as a discrepancy");
  compare("words", "tenure", "One gives the land forever");
  compare("words", "bounds", "One runs to the old ford");
  o = compare("words", "witnesses", "Osbert is subprior in 1189");
  expect(o?.kind === "compare" && o.complete && s.deductions.includes("D06"), "completing the words comparison did not establish D06");
  expect(!s.deductions.includes("D07"), "D07 established before the necrology was read");
  expect(s.notebook.filter((n) => n.id.startsWith("compare:words:")).length === 4, "comparison finds not entered in the journal");

  // ---- the abbot opens the archive ----
  go("abbot_chamber");
  ask("abbot_evening");
  ask("abbot_welcome");
  look("ab_roll");
  try { reduce(def, { ...s, location: "muniments" }, { type: "collect", evidenceId: "E11" }, t); problems.push("E11 collectable with the archive shut"); } catch {}
  run({ type: "present", characterId: "abbot", evidenceId: "E14" });
  expect(s.eventStates.RE08 && s.flags.includes("abbot_shown_notes"), "showing the abbot Edmund's notes did not open the archive");
  ask("abbot_rent");
  ask("abbot_promise");
  go("muniments");
  look("mu_seals");
  look("mu_necrology");
  connect("E10", "E12", "D07");

  // ---- the cellar ----
  go("cellar");
  ask("matthias_evening");
  ask("matthias_compline");
  ask("matthias_passage");
  look("ce_habit");
  look("ce_daybook");
  expect(project(def, s).location.hotspots.some((h) => h.id === "ce_tally"), "the tally box did not show with the day book");
  look("ce_tally");
  expect(!project(def, s).location.hotspots.some((h) => h.id === "ce_salt"), "the salt store shows before the search");
  ask("matthias_sleeve");
  ask("matthias_founder");
  ask("matthias_rent");
  expect(s.contradictions.includes("X_REMIT"), "Matthias's rent story not contradicted");
  connect("E15", "E16", "D09");

  // ---- the bells ----
  go("tower");
  ask("simon_compline");
  look("to_customary");
  ask("simon_rope");
  ask("simon_clapper");
  expect(s.discoveries.E23?.via === "dialogue", "Simon did not hand over his tally");
  expect(s.contradictions.includes("X_FOUNDER"), "the founder story not contradicted");
  look("to_frame");
  expect(s.evidence.includes("E28"), "Peter's tablet not found in the bell frame");

  go("church");
  ask("anselm_compline");
  ask("anselm_candlestick");
  expect(!project(def, s).location.hotspots.some((h) => h.id === "cu_altar_b"), "the candlestick is evidence before the inventory is read");
  look("cu_sacristy");
  look("cu_altar_b");
  ask("anselm_returned");
  connect("E19", "E20", "D11");
  expect(s.contradictions.includes("X_COMPLINE"), "Matthias's Compline story not contradicted");

  go("cloister");
  look("cl_cloak");
  connect("E27", "E28", "D13");
  go("gatehouse");
  look("ga_roll");
  ask("william_monday");
  ask("william_peter");

  go("infirmary");
  ask("agnes_examine");
  expect(s.flags.includes("x1_requested") && !s.pendingDeliveries.includes("exam_candlestick"), "the examination arrived before a journey");

  // ---- back to the chamber: Margery, the mill, the examination ----
  go("chamber");
  expect(s.pendingDeliveries.includes("exam_candlestick"), "Agnes's examination is not on the table after a journey");
  expect(s.eventStates.RE04 === "active" && s.eventStates.RE05 === "active", `Margery or the mill not at the door: ${s.eventStates.RE04} ${s.eventStates.RE05}`);
  answer("visit_margery");
  expect(s.evidence.includes("E26") && known().includes("margery"), "Margery's statement not given, or she is not listed");
  answer("visit_william_mill");
  run({ type: "openDelivery", deliveryId: "exam_candlestick" });
  collect("E21");
  expect(s.eventStates.EX1 === "completed", "the examination event did not complete");
  expect(s.contradictions.includes("X_PASSAGE") && s.contradictions.includes("X_OIL"), "Margery's statement did not contradict Matthias and Peter");

  // ---- the bell timeline ----
  const bells = project(def, s).sequences[0];
  expect(bells && bells.cards.length >= 12, `bell timeline has ${bells?.cards.length} cards`);
  expect(!JSON.stringify(bells).includes("compline_bell\"}") || !JSON.stringify(bells.cards).includes("space"), "a card's place reached the browser");
  place("M2", "compline_bell");
  place("R1", "before_compline");
  let test = run({ type: "sequenceTest", sequenceId: "bells" });
  expect(test.kind === "sequence" && test.found.length === 0, "a finding showed with a card misplaced");
  for (const [card, space, pos] of [["G1", "before_vespers", 0], ["B1", "after_vespers", 0], ["B2", "after_vespers", 1], ["B3", "before_compline", 0], ["B4", "before_compline", 1], ["R1", "compline_bell", 0], ["R2", "compline_bell", 1], ["M1", "compline_bell", 2], ["C1", "during_compline", 0], ["C2", "during_compline", 1], ["D1", "after_compline", 0], ["P1", "before_compline", 2]] as const) place(card, space, pos);
  test = run({ type: "sequenceTest", sequenceId: "bells" });
  expect(test.kind === "sequence" && ["Matthias's account of Compline cannot be true", "Peter lingered at the fire", "The hour of the deed"].every((x) => test.kind === "sequence" && test.found.some((f) => f.title === x)), `timeline findings: ${test.kind === "sequence" ? test.found.map((f) => f.title).join("; ") : test.kind}`);
  expect(s.deductions.includes("D12"), "the timeline did not establish D12");

  // ---- the mill ----
  go("mill");
  ask("alice_peter");
  ask("alice_mill");
  ask("peter_why");
  ask("peter_fire");
  ask("peter_saw");
  ask("peter_threat");
  ask("peter_testimony");
  expect(characterLocation(def.characters.find((c) => c.id === "peter")!, s) === "mill", "Peter is not at the mill");
  expect(s.discoveries.E29?.via === "dialogue" && s.discoveries.E30?.via === "dialogue", "Alice or Peter did not give their account");
  connect("E26", "E30", "D14");
  connect("E07", "E26", "D04");
  expect(project(def, s).conclusion.available, "the finding cannot be written once Peter is found");
  expect(!project(def, s).caseStatus?.includes("missing"), "status still says Peter is missing");
  expect(s.eventStates.RE07 === "available", `RE07 should wait for the chamber: ${s.eventStates.RE07}`);

  // ---- Ashcombe ----
  go("manor");
  ask("roland_writing");
  ask("roland_warning");
  ask("geoffrey_found");
  ask("geoffrey_monday");
  expect(s.contradictions.includes("X_GATE") && s.contradictions.includes("X_FOUND"), "Geoffrey's story not contradicted");
  talk("geoffrey");
  run({ type: "present", characterId: "geoffrey", evidenceId: "E17" });
  ask("roland_accounts");
  connect("E17", "E18", "D10");

  // ---- the search ----
  go("chamber");
  answer("letter_geoffrey");
  answer("visit_abbot_search");
  expect(s.messages.some((m) => m.includes("Thursday, October 22")), "no notice for Thursday");
  go("cellar");
  look("ce_salt");
  expect(s.evidence.includes("E31") && s.eventStates.RE07 === "completed", "the charter not recovered from the salt");
  {
    const o2 = run({ type: "talk", characterId: "matthias" });
    expect(o2.kind === "conversation" && o2.refusing, "Matthias still answers freely after the salt bin");
  }

  // ---- the second comparison: the leaf ----
  go("chamber");
  for (const [region, text] of [["seal", "The saint stands"], ["parchment", "The leaf has been scraped"], ["ink", "The ink is dark"], ["cords", "Nothing here differs"], ["hand", "The a has two bowls"]] as const) compare("leaf", region, text);
  expect(s.evidence.includes("E32") && s.comparisons?.leaf.done, "completing the leaf comparison did not give Thomas's dossier");
  connect("E31", "E09", "D15");
  connect("matthias", "E30", "D16");
  expect(s.deductions.length === 16, `expected all 16 deductions, have ${s.deductions.join(",")}`);
  expect(s.evidence.length === 32, `expected all 32 evidence items, have ${s.evidence.length}: missing ${def.evidence.map((e) => e.id).filter((e) => !s.evidence.includes(e))}`);

  // Evidence arrives one way each.
  const VIA: Record<string, string> = {
    E02: "dialogue", E09: "dialogue", E18: "dialogue", E23: "dialogue", E24: "dialogue", E26: "dialogue", E29: "dialogue", E30: "dialogue", E32: "dialogue",
    E21: "delivery",
  };
  for (const e of def.evidence) expect(s.discoveries[e.id]?.via === (VIA[e.id] ?? "scene"), `${e.id} arrived via ${s.discoveries[e.id]?.via}`);
  const sources = (id: string) =>
    def.locations.flatMap((l) => l.hotspots).filter((h) => h.interaction.type === "inspect" && h.interaction.evidence === id).length +
    def.deliveries.filter((d) => d.evidence.includes(id)).length +
    def.questions.filter((q) => JSON.stringify(q.effects ?? []).includes(`"giveEvidence":"${id}"`)).length +
    def.calls.filter((c) => JSON.stringify(c.effects ?? []).includes(`"giveEvidence":"${id}"`)).length +
    (def.comparisons ?? []).filter((c) => JSON.stringify(c.onComplete ?? []).includes(`"giveEvidence":"${id}"`)).length;
  for (const e of def.evidence) expect(sources(e.id) === 1, `${e.id} has ${sources(e.id)} ways to be found`);

  // A save in the middle of it all round-trips.
  const reloaded = normalizeState(def, JSON.parse(JSON.stringify(s)));
  expect(reloaded.sequences?.bells.findings.length === s.sequences?.bells.findings.length && reloaded.comparisons?.leaf.done, "timeline or comparison lost on reload");
  const old = normalizeState(def, { ...JSON.parse(JSON.stringify(s)), sequences: undefined, comparisons: undefined });
  expect(old.sequences && old.comparisons, "an older save is not upgraded");

  // Nothing anyone in 1327 says uses a modern word.
  for (const q of def.questions) for (const line of [...q.reply, ...(q.variants ?? []).flatMap((v) => v.reply)]) if (MODERN.test(line)) problems.push(`modern word in ${q.id}: ${line.slice(0, 70)}`);
  for (const c of def.calls) for (const line of c.lines) if (MODERN.test(line)) problems.push(`modern word in ${c.id}: ${line.slice(0, 70)}`);
  for (const e of def.evidence) if (MODERN.test(e.inspection)) problems.push(`modern word in ${e.id}`);
  for (const k of Object.values(def.characters).flatMap((c) => c.knowledge ?? [])) if (MODERN.test(k.text)) problems.push(`modern word in knowledge: ${k.text.slice(0, 70)}`);
  if (/\b\d{1,2}:\d{2}\b|\b\d{1,2}\s?(AM|PM)\b/.test(JSON.stringify({ q: def.questions, c: def.calls, e: def.evidence, k: def.characters.map((c) => c.knowledge) }))) problems.push("a clock time appears in what someone says or reads");

  // ---- the finding ----
  go("chamber");
  const report = project(def, s).conclusion;
  expect(report.available && report.choices.length === 6 && report.choices.find((c) => c.id === "forgers")?.multi, "report form wrong");
  expect(report.date === "Friday, October 23, 1327", "report date");
  const key = ["E26", "E31", "E20", "E23", "E17", "E29", "E21", "E30"];
  const right = { killer: "matthias", motive: "forgery", weapon: "candlestick", barred: "aumbry", forgers: ["matthias", "geoffrey"], peter: "fled" };
  const T = (over: Partial<Theory>, evidence = key): Theory => ({ ...right, evidence, ...fileUnder(def, evidence), ...over }) as Theory;
  const verdict = (th: Theory) => run({ type: "submitConclusion", theory: th });
  const roland = verdict(T({ killer: "matthias_roland" }));
  expect(roland.kind === "verdict" && !roland.correct, "a finding blaming Lord Roland's command was accepted");
  const rolandForged = verdict(T({ forgers: ["matthias", "geoffrey", "roland"] }));
  expect(rolandForged.kind === "verdict" && !rolandForged.correct, "a finding naming Lord Roland a forger was accepted");
  const aloneForged = verdict(T({ forgers: ["matthias"] }));
  expect(aloneForged.kind === "verdict" && !aloneForged.correct, "a finding leaving Geoffrey out of the forgery was accepted");
  const drowned = verdict(T({ peter: "killed" }));
  expect(drowned.kind === "verdict" && !drowned.correct, "a finding that Peter was killed was accepted");
  expect(s.status === "active", "a returned finding closed the case");
  problems.push(...reportStandardProblems(def, s, right, key));
  const good = run({ type: "submitConclusion", theory: T({ forgers: ["geoffrey", "matthias"] }), investigator: "Sam Calloway" });
  expect(good.kind === "verdict" && good.correct, `correct finding returned: ${good.kind === "verdict" ? good.note : good.kind}`);
  expect(s.status === "closed", "case not closed");
  const closure = project(def, s).closure;
  expect(closure?.caller?.characterId === "archdeacon", "the closing letter is not the archdeacon's");

  // ---- the question limits: the whole playthrough fits without paying ----
  for (const c of def.characters) {
    const used = s.asked.filter((id) => def.questions.find((q) => q.id === id)?.characterId === c.id).length + s.presented.filter((k) => k.startsWith(`${c.id}:`)).length;
    const cap = questionsLeft(def, newState(def, 0), c.id);
    const granted = (def.reinterviews ?? []).filter((g) => g.characterId === c.id).reduce((n, g) => n + (g.questions ?? 5), 0);
    if (cap !== null && used > cap + granted) problems.push(`the reference playthrough needs ${used} questions with ${c.name}, more than ${cap} + ${granted}`);
  }

  // ---- the matcher on everyday phrasings ----
  let hits = 0;
  for (const [cid, text, want] of C005_MATCH) {
    const got = bestMatch(text, def.questions.filter((q) => q.characterId === cid));
    if (got === want) hits++;
    else problems.push(`matcher: "${text}" (${cid}) got ${got}, wanted ${want}`);
  }
  if (hits / C005_MATCH.length < 0.9) problems.push(`matcher accuracy ${hits}/${C005_MATCH.length}`);

  // ---- nothing secret in the opening view ----
  const view = JSON.stringify(project(def, newState(def)));
  for (const secret of ["\"standard\"", "linkToSuspect", "knowledge", "\"reconstruction\"", "salt bin", "candle aumbry", "Lady altar\"", "\"answer\"", "\"discrepancy\"", "archbishop's prison"]) if (view.includes(secret)) problems.push(`initial view leaks ${secret}`);

  console.log(`C005: ${def.evidence.length} evidence, ${def.locations.length} locations, ${def.questions.length} questions, ${def.deductions.length} deductions`);
  console.log(`playthrough: status=${s.status} attempts=${s.attempts} events=${s.events.join(",")} matcher=${hits}/${C005_MATCH.length}`);
}
