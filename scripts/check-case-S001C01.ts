/**
 * S01 C01's reference playthrough for the case checker: plays The Ledger from
 * Hannah's visit to a closed case with the real engine. Checks that each piece
 * of evidence is reachable exactly one way and arrives the way the design says,
 * that the gated finds (the textbook, Susan's binder, Holt's out tray) stay
 * hidden until earned, that every deduction and event fires, that the report
 * tells Reddick and Holt apart and needs Holt's part as sender, not killer,
 * that the case fits the question limits, and that the closed case hands the
 * player to the series' rolling board.
 * Run through: npm run check:case -- S001C01
 */
import { evaluateReport } from "../src/game/engine/evaluation";
import { characterLocation, interviewCandidates, newState, normalizeState, project, reduce } from "../src/game/engine/engine";
import { bestMatch } from "../src/game/engine/matcher";
import { questionsLeft } from "../src/game/engine/questions";
import { check } from "../src/game/engine/rules";
import { fileUnder, reportStandardProblems } from "./report-helpers";
import { vaguePlaythrough } from "./series-case-check";
import type { CaseDefinition, GameAction, InvestigationState, Theory } from "../src/game/engine/types";

/** Everyday phrasings and the authored answer each should reach. */
export const S001C01_MATCH: [string, string, string | null][] = [
  ["hannah", "Why did you hire us?", "hannah_hire"],
  ["hannah", "Was your dad worried about something?", "hannah_anxious"],
  ["hannah", "Did he ever mention a book?", "hannah_book"],
  ["hannah", "When did you last see your father?", "hannah_last"],
  ["hannah", "Do you know Adrian Holt?", "hannah_holt"],
  ["whitfield", "Did Martin raise concerns with you?", "whitfield_concerns"],
  ["whitfield", "Tell me about the recovery fund.", "whitfield_fund"],
  ["whitfield", "Where were you on Thursday night?", "whitfield_thursday"],
  ["holt", "What is Tri-County Facility Partners?", "holt_tricounty"],
  ["holt", "Why did you pay Paul Reddick?", "holt_payment"],
  ["holt", "Where were you Thursday night?", "holt_thursday"],
  ["reddick", "Where were you on Thursday night?", "reddick_thursday"],
  ["reddick", "Who gave you the access card?", "reddick_card"],
  ["reddick", "What happened to your boots?", "reddick_boots"],
  ["ames", "Why did Martin contact you?", "ames_call"],
  ["ames", "Can I see his email?", "ames_email"],
  ["avery", "Can I see the door access log?", "avery_doors"],
  ["avery", "Who does card 0447 belong to?", "avery_card"],
  ["avery", "Is there a camera on the building?", "avery_camera"],
  ["morris", "What did you see Thursday evening?", "morris_thursday"],
  ["morris", "Did you see a van in the lot?", "morris_van"],
  ["bowman", "Can I see the police report?", "bowman_report"],
  ["bowman", "What did the autopsy find?", "bowman_autopsy"],
  ["bowman", "Can the lab compare the footprints?", "bowman_footwear"],
  ["foster", "What was the argument with Martin about?", "foster_argument"],
  ["bennett", "What do you make of the case?", "bennett_case"],
  ["morris", "What's your favorite movie?", null],
  ["avery", "Do you follow the Steelers?", null],
];

export function checkS001C01(def: CaseDefinition, problems: string[]) {
  const expect = (ok: unknown, msg: string) => {
    if (!ok) problems.push(msg);
  };

  // ---- each piece of evidence is reachable exactly one way ----
  const json = JSON.stringify(def);
  const scene = def.locations.flatMap((l) => l.hotspots.map((h) => (h.interaction as { evidence?: string }).evidence).filter(Boolean));
  const delivered = def.deliveries.flatMap((d) => d.evidence);
  const given = new Set([...json.matchAll(/"giveEvidence":"([^"]+)"/g)].map((m) => m[1]));
  for (const e of def.evidence) {
    const routes = scene.filter((x) => x === e.id).length + delivered.filter((x) => x === e.id).length + (given.has(e.id) ? 1 : 0);
    expect(routes === 1, `${e.id} is reachable ${routes} ways`);
  }

  // ---- play it ----
  let s: InvestigationState = newState(def, 0);
  let t = 1000;
  const errors: string[] = [];
  const run = (a: GameAction) => {
    try {
      const r = reduce(def, s, a, (t += 5000));
      s = r.state;
      return r.outcome;
    } catch (e) {
      errors.push(`${a.type}: ${(e as Error).message}`);
      return null;
    }
  };
  const hidden = (loc: string, hotspot: string) => {
    const saved = s.location;
    s = { ...s, location: loc };
    const there = project(def, s).location.hotspots.some((h) => h.id === hotspot);
    s = { ...s, location: saved };
    return !there;
  };

  run({ type: "dismissIntro" });
  run({ type: "readDocument", documentId: "casefile" });
  expect(s.flags.includes("casefile_read"), "reading the case file did not set casefile_read");

  // The gated finds are hidden at the start.
  expect(hidden("martin_office", "mo_textbook"), "the textbook is visible before anyone mentions the book");
  expect(hidden("foundation", "fd_fundbinder"), "Susan's binder is visible before speaking to her");
  expect(hidden("meridian", "me_outtray"), "Holt's out tray is visible before D09");
  expect(!project(def, s).map.some((m) => m.name.includes("Meridian")), "the map names Meridian before the player learns it");

  // A thorough player: every place, every hotspot, everyone, every question, every call, until nothing new happens.
  const board = new Set<string>();
  const exhaust = (cid: string) => {
    run({ type: "talk", characterId: cid });
    for (let i = 0; i < 40; i++) {
      const q = interviewCandidates(def, s, cid).find((x) => !s.asked.includes(x.id));
      if (!q) break;
      const n = s.asked.length;
      run({ type: "ask", questionId: q.id });
      if (s.asked.length === n) break;
    }
    for (const e of s.evidence) if (!s.presented.includes(`${cid}:${e}`) && ["E018", "E019", "E024", "E025", "E021", "E007", "E006", "E027"].includes(e)) run({ type: "present", characterId: cid, evidenceId: e });
  };
  const progress = () => s.evidence.length + s.deductions.length + s.asked.length + s.answeredCalls.length + s.openedDeliveries.length + s.events.length + s.flags.length;
  for (let round = 0; round < 30; round++) {
    const before = progress();
    for (const m of project(def, s).map.filter((x) => x.available)) {
      for (const loc of [m.id, ...def.locations.filter((l) => !l.onMap && l.hotspots.length && def.locations.find((p) => p.id === m.id)?.hotspots.some((h) => (h.interaction as { locationId?: string }).locationId === l.id)).map((l) => l.id)]) {
        if (s.location !== loc) run({ type: "travel", locationId: loc });
        if (s.location !== loc) continue;
        for (const h of project(def, s).location.hotspots) {
          const hd = def.locations.find((l) => l.id === loc)!.hotspots.find((x) => x.id === h.id)!;
          if (hd.interaction.type === "travel") continue;
          const o = run({ type: "hotspot", hotspotId: h.id });
          if (o?.kind === "inspect" && o.evidence && !s.evidence.includes(o.evidence.id)) run({ type: "collect", evidenceId: o.evidence.id });
        }
        for (const c of def.characters.filter((c) => characterLocation(c, s) === loc && check(c.available, s))) exhaust(c.id);
      }
    }
    for (const c of project(def, s).phone.contacts) exhaust(c.id);
    for (const c of [...s.pendingCalls]) run({ type: "answerCall", callId: c });
    t += 200000;
    run({ type: "checkLabs" });
    for (const d of [...s.pendingDeliveries]) run({ type: "openDelivery", deliveryId: d });
    for (const d of def.deliveries) if (s.openedDeliveries.includes(d.id)) for (const e of d.evidence) if (!s.evidence.includes(e)) run({ type: "collect", evidenceId: e });
    for (const d of def.deductions)
      for (const [a, b] of d.connections) {
        for (const x of [a, b]) if (!board.has(x) && (s.evidence.includes(x) || project(def, s).characters.some((c) => c.id === x))) {
          run({ type: "boardAdd", itemId: x, x: 10, y: 10 });
          if (s.board.items.some((i) => i.id === x)) board.add(x);
        }
        if (board.has(a) && board.has(b) && !s.deductions.includes(d.id)) run({ type: "connect", a, b });
      }
    if (progress() === before && round > 2) break;
  }

  const missing = def.evidence.map((e) => e.id).filter((e) => !s.evidence.includes(e));
  expect(!missing.length, `a thorough playthrough never finds ${missing.join(", ")}`);
  const unmade = def.deductions.map((d) => d.id).filter((d) => !s.deductions.includes(d));
  expect(!unmade.length, `a thorough playthrough never makes ${unmade.join(", ")}`);
  for (const e of def.events) expect(s.events.includes(e.id), `event ${e.id} never fired`);
  for (const f of ["casefile_read", "book_known", "holt_admits", "footwear_requested"]) expect(s.flags.includes(f), `flag ${f} never set`);
  expect(!hidden("meridian", "me_outtray") || s.evidence.includes("E019"), "Holt's out tray never appeared after D09");

  // How each item arrives, per the design: handed over in conversation, delivered, or found.
  const VIA: Record<string, string> = {
    E001: "dialogue", E002: "dialogue", E003: "dialogue", E008: "dialogue", E023: "dialogue",
    E006: "dialogue", E022: "dialogue", E010: "dialogue", E020: "dialogue", E017: "dialogue",
    E026: "dialogue", E027: "dialogue",
    E007: "delivery", E029: "delivery", E030: "delivery",
  };
  for (const e of def.evidence) {
    const via = s.discoveries[e.id]?.via;
    if (!via) continue;
    const want = VIA[e.id] ?? "scene";
    expect(via === want || (want === "dialogue" && via !== "scene" && via !== "delivery"), `${e.id} arrived via ${via}, expected ${want}`);
  }

  // A save mid-case round-trips.
  const reloaded = normalizeState(def, JSON.parse(JSON.stringify(s)));
  expect(reloaded.evidence.length === s.evidence.length && reloaded.deductions.length === s.deductions.length && reloaded.events.length === s.events.length, "state lost on reload");

  // ---- the report ----
  if (s.location !== "office") run({ type: "travel", locationId: "office" });
  const report = project(def, s).conclusion;
  expect(report.available && report.choices.length === 7, `report form wrong: ${report.choices.length} questions`);
  const right = { culprit: "reddick", weapon: "eagle", purpose: "records", sender: "holt", ordered: "no", coverup: "protect", investigating: "meridian" };
  const key = ["E006", "E023", "E011", "E016", "E004", "E003", "E019"];
  const T = (over: Partial<Theory>, evidence = key): Theory => ({ ...right, evidence, ...fileUnder(def, evidence), ...over }) as Theory;
  const verdict = (th: Theory) => run({ type: "submitConclusion", theory: th });
  const wrong: [Partial<Theory>, string][] = [
    [{ culprit: "holt" }, "a report naming Holt as the killer"],
    [{ culprit: "burglar" }, "a report blaming a burglar"],
    [{ ordered: "yes" }, "a report saying Holt ordered the killing"],
    [{ sender: "nobody" }, "a report saying Reddick acted alone"],
    [{ sender: "whitfield" }, "a report naming Susan Whitfield as sender"],
    [{ purpose: "valuables" }, "a report calling it a robbery"],
  ];
  for (const [over, what] of wrong) {
    const o = verdict(T(over));
    expect(o?.kind === "verdict" && !o.correct, `${what} was accepted`);
  }
  {
    // Every collected item goes with a report: an investigation that never placed Reddick at the scene is returned.
    const sceneless = ["E011", "E016", "E004", "E003", "E019", "E013", "E015"];
    const r = evaluateReport(def, { ...right, evidence: sceneless } as Theory, s, 0);
    expect(!r.accepted, "a report with nothing placing Reddick at the scene was accepted");
  }
  expect(s.status === "active", "a returned report closed the case");
  problems.push(...reportStandardProblems(def, s, right, key));
  const good = run({ type: "submitConclusion", theory: T({}), investigator: "Sam Calloway" });
  expect(good?.kind === "verdict" && good.correct, `correct report returned: ${good?.kind === "verdict" ? good.note : good?.kind}`);
  expect(s.status === "closed", "case not closed");
  const closure = project(def, s).closure;
  expect(closure?.caller?.characterId === "bowman", "closing call is not Det. Bowman");
  expect(closure?.series?.seriesId === "S001" && closure.series.text.includes("Meridian"), "the closed case does not hand over to the series notebook");
  expect(!/Clearwater|MAG-RM|leak/i.test(JSON.stringify(closure ?? {})), "the closing hints at the series' leak");

  // ---- the question limits: the whole playthrough fits without paying ----
  for (const c of def.characters) {
    const used = s.asked.filter((id) => def.questions.find((q) => q.id === id)?.characterId === c.id).length + s.presented.filter((k) => k.startsWith(`${c.id}:`)).length;
    const cap = questionsLeft(def, newState(def, 0), c.id);
    const granted = (def.reinterviews ?? []).filter((g) => g.characterId === c.id).reduce((n, g) => n + (g.questions ?? 5), 0);
    if (cap !== null && used > cap + granted) problems.push(`the thorough playthrough needs ${used} questions with ${c.name}, more than ${cap} + ${granted}`);
  }

  // ---- the matcher on everyday phrasings ----
  let hits = 0;
  for (const [cid, text, want] of S001C01_MATCH) {
    const got = bestMatch(text, def.questions.filter((q) => q.characterId === cid));
    if (got === want) hits++;
    else problems.push(`matcher: "${text}" (${cid}) got ${got}, wanted ${want}`);
  }
  if (hits / S001C01_MATCH.length < 0.9) problems.push(`matcher accuracy ${hits}/${S001C01_MATCH.length}`);

  // ---- nothing secret in the opening view ----
  const view = JSON.stringify(project(def, newState(def)));
  for (const secret of ["\"standard\"", "linkToSuspect", "knowledge", "reconstruction", "District Attorney", "Judas", "Clearwater", "storm drain", "$9,500"]) if (view.includes(secret)) problems.push(`initial view leaks ${secret}`);

  const real = errors.filter((e) => !/already|not available|isn't|can't|No further|not on the board|nothing new|not here/i.test(e));
  if (real.length) console.log(`(engine refused ${real.length} moves in the thorough playthrough, e.g. ${real.slice(0, 3).join(" | ")})`);
  // A player who never finds the right words still gets to the report.
  const v = vaguePlaythrough(def);
  if (v.evidence.length) problems.push(`vague player: never gets ${v.evidence.join(", ")}`);
  if (!v.report) problems.push("vague player: the report never opens");

  console.log(`S001C01: ${def.evidence.length} evidence, ${def.locations.length} locations, ${def.questions.length} questions, ${def.deductions.length} deductions`);
  console.log(`playthrough: status=${s.status} attempts=${s.attempts} events=${s.events.join(",")} matcher=${hits}/${S001C01_MATCH.length}`);
}
