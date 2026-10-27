/**
 * Checks the optional engine settings added for C003 (mobile phone, texts,
 * phone contacts, deceased people, case status, board sections, report
 * questions with several answers) on a copy of C002, and that a case without
 * them behaves as before. Run: npx tsx --conditions=react-server scripts/check-engine.ts
 */
import { C002 } from "../src/cases/C002";
import { newState, project, reduce, GameError } from "../src/game/engine/engine";
import { evaluateReport, reportProblem } from "../src/game/engine/evaluation";
import { fileUnder } from "./report-helpers";
import type { CaseDefinition, GameAction, InvestigationState } from "../src/game/engine/types";

const problems: string[] = [];
const expect = (ok: unknown, msg: string) => {
  if (!ok) problems.push(msg);
};
const refused = (def: CaseDefinition, s: InvestigationState, a: GameAction) => {
  try {
    reduce(def, s, a, 1000);
    return false;
  } catch (e) {
    return e instanceof GameError;
  }
};

/** A started game in the office with the case file read. */
function started(def: CaseDefinition) {
  let s = newState(def, 0);
  s = reduce(def, s, { type: "dismissIntro" }, 1).state;
  s = reduce(def, s, { type: "readDocument", documentId: "casefile" }, 2).state;
  return s;
}

// --- A case without the new settings: unchanged -------------------------------------------
{
  const def = C002;
  const s = started(def);
  const v = project(def, s, 10);
  expect(!v.phone.mobile, "C002 has a mobile phone");
  expect(v.caseStatus === null && v.boardSections.length === 0, "C002 shows a status or board sections");
  expect(v.conclusion.date === "August 1985", "C002 report date changed");
  expect(v.phone.contacts.some((c) => c.id === "bennett" && c.note.startsWith("LAPD")), "Bennett missing from C002 office phone");
  const away = { ...s, location: "police_station" };
  expect(refused(def, away, { type: "talk", characterId: "bennett" }), "C002 Bennett callable away from the office");
  expect(project(def, away, 10).phone.contacts.length === 0, "C002 phone contacts listed away from the office");
}

// --- The same case with the new settings ---------------------------------------------------
const def: CaseDefinition = structuredClone(C002);
def.phone = "mobile";
def.reportDate = "October 2018";
def.texts = [{ id: "t1", from: "ruth", body: "Found something. Come by." }];
def.status = [{ label: "Active homicide" }, { label: "Active multiple homicide", when: { flag: "second" } }];
def.boardSections = [
  { id: "a", label: "September 14" },
  { id: "b", label: "October 29", when: { flag: "second" } },
];
const ferris = def.characters.find((c) => c.id === "ferris")!;
ferris.phone = { flag: "casefile_read" };
ferris.contact = "Mariposa Bay Police.";
const howard = def.characters.find((c) => c.id === "howard")!;
howard.deceased = { flag: "second" };
def.calls.push({ id: "call_test", from: "ruth", title: "Ruth calls", lines: ["Hello."] });
// Report: the classic four, with the culprit question allowing several answers.
const culprit = def.conclusionChoices.find((c) => c.id === "culprit")!;
culprit.multi = true;
const right = { ...def.solution };
def.solution = { ...right, answers: { culprit: [right.culprit!, "tom"], motive: right.motive!, weapon: right.weapon!, location: right.location! } };

{
  let s = started(def);
  const v0 = project(def, s, 10);
  expect(v0.phone.mobile, "mobile phone not shown");
  expect(v0.caseStatus === "Active homicide", `status line: ${v0.caseStatus}`);
  expect(v0.boardSections.length === 1, "board sections before the second opens");
  expect(v0.conclusion.date === "October 2018", "report date");

  // Away from the office: contacts, calls, deliveries.
  s = reduce(def, s, { type: "travel", locationId: "elm_street" }, 20).state;
  const v1 = project(def, s, 30);
  expect(v1.phone.contacts.some((c) => c.id === "bennett"), "Bennett not callable away from the office with a mobile phone");
  expect(v1.phone.contacts.some((c) => c.id === "ferris" && c.note === "Mariposa Bay Police."), "Ferris not in contacts by phone");
  const talk = reduce(def, s, { type: "talk", characterId: "ferris" }, 40);
  expect(talk.outcome.kind === "conversation" && talk.outcome.medium === "telephone", "Ferris not reached by phone from Elm Street");
  expect(talk.outcome.kind === "conversation" && talk.outcome.where === "By phone", "Ferris not shown as by phone");
  s.pendingCalls.push("call_test");
  const ans = reduce(def, s, { type: "answerCall", callId: "call_test" }, 50);
  expect(ans.outcome.kind === "call", "call not answered away from the office");
  s = ans.state;
  expect(s.conversations.ruth?.some((l) => l.text.includes("on your phone")), "call cue does not say on your phone");
  s.pendingDeliveries.push("paper");
  expect(!refused(def, s, { type: "openDelivery", deliveryId: "paper" }), "delivery cannot be opened away from the office");

  // Texts.
  s = reduce(def, s, { type: "dismissMessages" }, 60).state;
  s.flags.push("trigger_text");
  def.events.push({ id: "TX", caseId: def.id, title: "Text", requires: { flag: "trigger_text" }, complete: { always: true }, onActivate: [{ text: "t1" }], notebook: { learned: [] } });
  s = reduce(def, s, { type: "checkLabs" }, 70).state;
  const v2 = project(def, s, 80);
  expect(v2.phone.texts.length === 1 && v2.phone.texts[0].from === "Ruth Kessler", `texts: ${JSON.stringify(v2.phone.texts)}`);
  expect(v2.messages.some((m) => m.startsWith("New text from")), "no notice for a new text");
  s = reduce(def, s, { type: "checkLabs" }, 90).state;
  expect((s.texts ?? []).length === 1, "text delivered twice");

  // The second crime: status, sections, a death.
  expect(!refused(def, s, { type: "talk", characterId: "howard" }), "Howard not interviewable before his death");
  s = reduce(def, s, { type: "askFree", characterId: "howard", text: "How are you sleeping?" }, 95).state;
  s.flags.push("second");
  const v3 = project(def, s, 100);
  expect(v3.caseStatus === "Active multiple homicide", "status did not change");
  expect(v3.boardSections.length === 2, "second board section did not open");
  expect(refused(def, s, { type: "talk", characterId: "howard" }), "a dead man can still be interviewed");
  expect(v3.characters.find((c) => c.id === "howard")?.deceased === true, "Howard not marked deceased");
  const iv = v3.interviews.find((i) => i.characterId === "howard");
  expect(iv?.status === "Deceased", `Howard interview status: ${iv?.status}`);
  expect(iv?.transcript.length, "Howard's earlier interview was lost");

  // The report: answers saved and judged with a multi-select question.
  const theory = { culprit: ["tom", right.culprit!], motive: right.motive!, weapon: right.weapon!, location: right.location!, evidence: ["E01"] };
  const open: CaseDefinition = { ...def, reportAvailable: { always: true } };
  const saved = reduce(open, s, { type: "saveReport", draft: { ...theory, culprit: ["tom", "made_up", right.culprit!, "tom"], motive: "made_up" } }, 110).state.report.draft;
  expect(JSON.stringify(saved.culprit) === JSON.stringify(["tom", right.culprit]), `multi-select draft not cleaned: ${JSON.stringify(saved.culprit)}`);
  expect(saved.motive === undefined && saved.weapon === right.weapon, `draft answers: ${JSON.stringify(saved)}`);
  const evaluated = evaluateReport(def, { ...theory, evidence: [] });
  expect(evaluated.note.length > 0, "an unsupported report was accepted");
  const std = def.solution.standard;
  // One proof per report point first, then items from each line of inquiry, filed under their points as a player would.
  const keyItems = [...(std.claims ?? []).map((c) => c.anyOf[0]), ...std.lines.flatMap((l) => l.anyOf.slice(0, 2))];
  const evidence = [...new Set([...std.linkToSuspect.slice(0, 1), ...keyItems])].slice(0, std.maxItems);
  const full = { ...theory, evidence, ...fileUnder(def, evidence) };
  const order = evaluateReport(def, { ...full, culprit: [right.culprit!, "tom"] });
  const ok = evaluateReport(def, full);
  expect(ok.accepted === order.accepted, "answer order changed the verdict");
  expect(!evaluateReport(def, { ...full, culprit: [right.culprit!] }).accepted, "a multi-select answer missing one person was accepted");
  expect(!evaluateReport(def, { ...full, culprit: right.culprit! }).accepted, "a single answer to a multi-select question was accepted");
  expect(ok.accepted || ok.note.includes("lines") || ok.note.includes("key"), `full report note: ${ok.note}`);
  const withAll: InvestigationState = { ...s, evidence: [...new Set([...s.evidence, ...full.evidence])] };
  expect(reportProblem(def, withAll, full) === null, `report problem: ${reportProblem(def, withAll, full)}`);
  expect(reportProblem(def, withAll, { ...full, culprit: [] }) !== null, "an empty multi-select answer was allowed");
  expect(reportProblem(def, withAll, { ...full, culprit: ["tom", "made_up"] }) !== null, "an unknown option was allowed");
}

// --- Settings added for C005: words, theme, timelines, comparisons, the deduce effect -------
{
  const base = C002;
  const v0 = project(base, started(base), 10);
  expect(v0.theme === "noir" && v0.words.photo === "Photo" && v0.words.board === "Murder board", "a case without words lost the agency's words");
  expect(v0.sequences.length === 0 && v0.comparisons.length === 0, "a case without timelines shows one");

  const ded = base.deductions[0];
  const def: CaseDefinition = {
    ...base,
    theme: "medieval",
    words: { photo: "Sketch", photoPrefix: "S", board: "Deduction table" },
    sequences: [
      {
        id: "bells",
        title: "The bell timeline",
        intro: "Set the cards in order.",
        available: { always: true },
        nothingNew: "Nothing new.",
        spaces: [
          { id: "a", label: "Before" },
          { id: "b", label: "During" },
          { id: "c", label: "After" },
        ],
        cards: [
          { id: "x", text: "X happened", source: "Someone", kind: "observed", unlock: { always: true }, space: "a" },
          { id: "y", text: "Y happened", source: "Someone", kind: "observed", unlock: { always: true }, space: "b" },
          { id: "k", text: "I was there", source: "Liar", kind: "claimed", unlock: { always: true } },
          { id: "z", text: "Not yet known", source: "Someone", kind: "observed", unlock: { flag: "never" }, space: "c" },
        ],
        findings: [
          { id: "f1", title: "The claim fails", text: "It cannot be true.", needs: [{ card: "x" }, { card: "y" }, { card: "k", anyOf: ["b"] }], ordered: ["x", "y"], effects: [{ deduce: ded.id }] },
        ],
      },
    ],
    comparisons: [
      {
        id: "cmp",
        title: "Two writings",
        intro: "Compare them.",
        available: { always: true },
        expert: base.characters[0].id,
        left: { title: "Old" },
        right: { title: "New" },
        wrong: "Nothing amiss there.",
        completeText: "All found.",
        onComplete: [{ setFlag: "cmp_done" }],
        regions: [
          { id: "r1", label: "Seal", leftText: "Seated", rightText: "Standing", options: [{ id: "a", text: "The saint stands" }, { id: "b", text: "Same" }], answer: "a", discrepancy: true, comment: "Right." },
          { id: "r2", label: "Greeting", leftText: "Hail", rightText: "Hail", options: [{ id: "a", text: "Later form" }, { id: "b", text: "Nothing differs" }], answer: "b", discrepancy: false, comment: "Agreed." },
        ],
      },
    ],
  };
  let s = started(def);
  const run = (a: GameAction) => {
    const r = reduce(def, s, a, 5000);
    s = r.state;
    return r.outcome;
  };
  const v = project(def, s, 10);
  expect(v.theme === "medieval" && v.words.photo === "Sketch" && v.words.notebook === "Notebook", "case words not merged with the defaults");
  const seq = v.sequences[0];
  expect(seq && seq.cards.length === 3, "a locked timeline card was shown");
  expect(!JSON.stringify(v.sequences).includes('"space":"a"') || !JSON.stringify(seq.cards).includes("space"), "a card's correct place reached the browser");
  expect(!JSON.stringify(v.comparisons).includes("answer") && !JSON.stringify(v.comparisons).includes("discrepancy"), "a comparison answer reached the browser");
  expect(refused(def, s, { type: "sequencePlace", sequenceId: "bells", cardId: "z", space: "c", pos: 0 }), "a locked card was placed");
  expect(refused(def, s, { type: "sequencePlace", sequenceId: "bells", cardId: "x", space: "nowhere", pos: 0 }), "a card went to a place that does not exist");
  run({ type: "sequencePlace", sequenceId: "bells", cardId: "x", space: "b", pos: 0 });
  run({ type: "sequencePlace", sequenceId: "bells", cardId: "y", space: "b", pos: 1 });
  run({ type: "sequencePlace", sequenceId: "bells", cardId: "k", space: "b", pos: 2 });
  let o = run({ type: "sequenceTest", sequenceId: "bells" });
  expect(o.kind === "sequence" && o.found.length === 0 && o.message === "Nothing new.", "a finding showed with a card in the wrong place");
  run({ type: "sequencePlace", sequenceId: "bells", cardId: "x", space: "a", pos: 0 });
  o = run({ type: "sequenceTest", sequenceId: "bells" });
  expect(o.kind === "sequence" && o.found.length === 1, "the finding did not show once the cards were right");
  expect(s.deductions.includes(ded.id) && s.notebook.some((n) => n.id === `deduction:${ded.id}`), "the deduce effect did not record the deduction");
  o = run({ type: "sequenceTest", sequenceId: "bells" });
  expect(o.kind === "sequence" && o.found.length === 0, "a finding was found twice");
  run({ type: "sequencePlace", sequenceId: "bells", cardId: "k", space: null, pos: 0 });
  expect(!s.sequences!.bells.placed.k && s.sequences!.bells.findings.length === 1, "taking a card off lost a finding");

  o = run({ type: "compare", comparisonId: "cmp", regionId: "r1", optionId: "b" });
  expect(o.kind === "compare" && !o.correct && o.comment === "Nothing amiss there.", "a wrong pick was accepted");
  o = run({ type: "compare", comparisonId: "cmp", regionId: "r2", optionId: "b" });
  expect(o.kind === "compare" && o.correct && !o.complete && !s.comparisons!.cmp.found.includes("r2"), "a decoy counted as a discrepancy");
  o = run({ type: "compare", comparisonId: "cmp", regionId: "r1", optionId: "a" });
  expect(o.kind === "compare" && o.correct && o.complete && s.flags.includes("cmp_done"), "completing the comparison did not apply its effects");
  expect(project(def, s, 10).comparisons[0].done, "the comparison does not show as done");
  expect(refused(def, s, { type: "compare", comparisonId: "cmp", regionId: "r1", optionId: "zzz" }), "an unknown option was accepted");

  const photoDef: CaseDefinition = { ...def };
  const pv = project(photoDef, { ...s, photos: [{ id: "PH_x", hotspotId: "x", locationId: s.location, title: "Desk", text: "A desk.", image: "", at: 1 }] }, 10);
  expect(pv.evidence.some((e) => e.label === "S1" && e.title === "Sketch: Desk"), "a sketch is still called a photo");
}

if (problems.length) {
  console.error(`Engine checks failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Engine checks passed.");
