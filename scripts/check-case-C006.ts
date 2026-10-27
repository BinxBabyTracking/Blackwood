/**
 * C006's own checks: a reference playthrough of all six chapters, solo, from
 * the first visit to the accepted report, plus the rules the brief asks for
 * (exactly one way to each item, every deduction made from evidence in hand,
 * every event once, checkpoints saved, resume after a JSON round trip, nothing
 * of later chapters in the view, a report that keeps the crimes apart).
 * Called from scripts/check-case.ts for C006.
 */
import { newState, normalizeState, project, reduce } from "../src/game/engine/engine";
import { check } from "../src/game/engine/rules";
import { questionsLeft } from "../src/game/engine/questions";
import { bestMatch } from "../src/game/engine/matcher";
import { fileUnder, reportStandardProblems } from "./report-helpers";
import type { CaseDefinition, Effect, GameAction, InvestigationState, Theory } from "../src/game/engine/types";
import { MANIFEST } from "../src/cases/C006/manifest";

/** Everyday phrasings and the authored answer each should reach. */
export const C006_MATCH: [string, string, string | null][] = [
  ["sarah", "What happened the night Emily disappeared?", "sarah_night"],
  ["sarah", "Why did your dad blame the steel company?", "sarah_father"],
  ["sarah", "Who is W on her calendar?", "sarah_w"],
  ["sarah", "Where did your sister work?", "sarah_job"],
  ["sarah", "How did she sit in the car when she drove?", "sarah_car"],
  ["wade", "When was the last time you saw her?", "wade_lastseen"],
  ["wade", "Where were you that Saturday night?", "wade_saturday96"],
  ["wade", "Did she ever talk about running away to Pittsburgh?", "wade_pittsburgh"],
  ["wade", "Have you ever been inside the East Mill?", "wade_eastmill"],
  ["rebecca", "Were you at the Valley View motel that night?", "rebecca_motel"],
  ["rebecca", "Did Emily call you on Saturday?", "rebecca_night"],
  ["andrew", "What did you see by the gate?", "andrew_saw"],
  ["andrew", "What did the truck look like?", "andrew_truck"],
  ["mitchell", "Can I look at the old 1996 case file?", "mitchell_file"],
  ["mitchell", "Did anybody see anything at the storage place?", "mitchell_witness"],
  ["mitchell", "What was stolen from Glenn?", "mitchell_taken"],
  ["mitchell", "Can you run that plate through the readers?", "mitchell_plate"],
  ["brooks", "How was she identified?", "brooks_id"],
  ["brooks", "What killed her?", "brooks_cause"],
  ["brooks", "What was in her pockets?", "brooks_effects"],
  ["karen", "Who bought the East Mill land in 1996?", "karen_sale"],
  ["karen", "Are there old taxi records?", "karen_cab"],
  ["earl", "Did the union file a complaint about Gallery B?", "earl_grievance"],
  ["ray", "What happened down in the gallery that night?", "ray_night"],
  ["ray", "Did you get a lawyer and sue?", "ray_settlement"],
  ["evelyn", "Did you give Ron Lasko the memo?", "evelyn_ron"],
  ["evelyn", "Did you keep any copies?", "evelyn_copies"],
  ["stroud", "What happened in Gallery B?", "stroud_1996"],
  ["trent", "Where were you Thursday night?", "trent_oct25"],
  ["glenn", "What about the inspection log?", "glenn_log"],
  ["len", "Tell me everything that happened.", "len_statement"],
  ["jessica", "Do you have any tapes of interviews?", "jessica_tape"],
];

export function checkC006(def: CaseDefinition, problems: string[]) {
  const expect = (ok: unknown, msg: string) => {
    if (!ok) problems.push(msg);
  };

  // ------------------------------------------------------------ static: one way to each item
  const routes = new Map<string, string[]>();
  const add = (id: string, how: string) => routes.set(id, [...(routes.get(id) ?? []), how]);
  const effects = (list: Effect[] | undefined, how: string) => {
    for (const e of list ?? []) {
      if ("giveEvidence" in e) add(e.giveEvidence, how);
      if ("when" in e) effects(e.then, how);
    }
  };
  for (const l of def.locations) for (const h of l.hotspots) if (h.interaction.type === "inspect" && h.interaction.evidence) add(h.interaction.evidence, `scene ${h.id}`);
  for (const d of def.documents) for (const e of d.evidence) add(e, `document ${d.id}`);
  for (const d of def.deliveries) for (const e of d.evidence) add(e, `delivery ${d.id}`);
  for (const q of def.questions) {
    effects(q.effects, `question ${q.id}`);
    for (const v of q.variants ?? []) effects(v.effects, `question ${q.id} (variant)`);
  }
  for (const c of def.calls) effects(c.effects, `call ${c.id}`);
  for (const ev of def.events) {
    effects(ev.onAvailable, `event ${ev.id}`);
    effects(ev.onActivate, `event ${ev.id}`);
    effects(ev.onComplete, `event ${ev.id}`);
  }
  for (const c of def.characters) for (const k of c.knowledge ?? []) effects(k.effects, `knowledge ${c.id}`);
  for (const e of def.evidence) {
    const r = routes.get(e.id) ?? [];
    if (r.length !== 1) problems.push(`${e.id} is reached ${r.length} ways: ${r.join("; ") || "none"}`);
  }
  // The manifest says how each item is reached; the case must agree.
  const kind = (how: string) => (how.startsWith("scene") ? "scene" : how.startsWith("document") ? "document" : how.startsWith("delivery") ? "delivery" : how.startsWith("question") || how.startsWith("knowledge") ? "dialogue" : "event");
  for (const m of MANIFEST) {
    const r = routes.get(m.id)?.[0];
    if (!r) continue;
    const k = kind(r);
    const want = m.via === "lab" ? "delivery" : m.via;
    if (k !== want) problems.push(`${m.id}: manifest says ${m.via}, case reaches it by ${r}`);
  }
  expect(def.evidence.length === 100 && def.deductions.length === 35 && def.events.length === 20 && def.chapters?.length === 6, "C006 must have 100 evidence, 35 deductions, 20 events, 6 chapters");
  expect(def.locations.length === 30, `C006 has ${def.locations.length} locations, not 30`);
  const interviewable = def.characters.filter((c) => def.questions.some((q) => q.characterId === c.id));
  expect(interviewable.length === 15, `${interviewable.length} interviewable people, not 15`);

  // ------------------------------------------------------------ the matcher on everyday phrasings
  let hits = 0;
  for (const [cid, text, want] of C006_MATCH) {
    const got = bestMatch(text, def.questions.filter((q) => q.characterId === cid));
    if (got === want) hits++;
    else problems.push(`matcher: "${text}" (${cid}) got ${got}, wanted ${want}`);
  }
  if (hits / C006_MATCH.length < 0.9) problems.push(`matcher accuracy ${hits}/${C006_MATCH.length}`);

  // ------------------------------------------------------------ the reference playthrough
  let s: InvestigationState = newState(def, 0);
  let t = 1000;
  const foundIn = new Map<string, number>();
  const run = (a: GameAction) => {
    const r = reduce(def, s, a, (t += 5000));
    const before = new Set(s.evidence);
    const chapter = s.chapters?.current ?? 1;
    s = r.state;
    for (const e of s.evidence) if (!before.has(e) && !foundIn.has(e)) foundIn.set(e, chapter);
    return r.outcome;
  };
  const go = (l: string) => {
    if (s.location !== l) run({ type: "travel", locationId: l });
  };
  const look = (h: string) => {
    const o = run({ type: "hotspot", hotspotId: h });
    if (o.kind === "inspect" && o.evidence && !s.evidence.includes(o.evidence.id)) run({ type: "collect", evidenceId: o.evidence.id });
    return o;
  };
  const talk = (c: string) => run({ type: "talk", characterId: c });
  const ask = (qid: string) => {
    const q = def.questions.find((x) => x.id === qid);
    if (!q) throw new Error(`unknown question ${qid}`);
    talk(q.characterId);
    return run({ type: "ask", questionId: qid });
  };
  const answer = (callId: string) => {
    expect(s.pendingCalls.includes(callId), `${callId} is not ringing (pending: ${s.pendingCalls.join(",")})`);
    return run({ type: "answerCall", callId });
  };
  const open = (deliveryId: string) => {
    expect(s.pendingDeliveries.includes(deliveryId), `${deliveryId} has not arrived`);
    run({ type: "openDelivery", deliveryId });
    for (const e of def.deliveries.find((d) => d.id === deliveryId)!.evidence) if (!s.evidence.includes(e)) run({ type: "collect", evidenceId: e });
  };
  const connect = (a: string, b: string, want: string) => {
    run({ type: "boardAdd", itemId: a, x: 10, y: 10 });
    run({ type: "boardAdd", itemId: b, x: 30, y: 30 });
    run({ type: "connect", a, b });
    expect(s.deductions.includes(want), `${a} + ${b} did not give ${want}`);
  };
  const chapterDone = (n: number) => {
    const done = s.chapters?.completed.some((r) => r.number === n);
    expect(done, `chapter ${n} did not complete (open objectives: ${project(def, s).objectives.filter((o) => !o.done && o.chapter === n && !o.optional).map((o) => o.id).join(", ")})`);
    const v = project(def, s);
    expect(v.chapter?.checkpoint?.number === n, `no checkpoint screen for chapter ${n}`);
    // Save at the checkpoint and come back: nothing is lost and the chapter is not completed twice.
    const back = normalizeState(def, JSON.parse(JSON.stringify(s)));
    expect(JSON.stringify(back.evidence) === JSON.stringify(s.evidence) && back.chapters?.current === s.chapters?.current, `resume at checkpoint ${n} lost progress`);
    run({ type: "chapterContinue" });
    expect(s.chapters!.completed.filter((r) => r.number === n).length === 1, `chapter ${n} completed more than once`);
    expect(project(def, s).chapter?.checkpoint === null, `checkpoint ${n} still showing after Continue`);
  };
  const wait = () => {
    t += 200000;
    run({ type: "checkLabs" });
  };

  // The view never carries later chapters' names or the solution.
  const leaks = (label: string) => {
    const v = JSON.stringify(project(def, s));
    const cur = s.chapters?.current ?? 1;
    for (const ch of def.chapters!) if (ch.number > cur + 1 && v.includes(ch.title)) problems.push(`${label}: chapter ${ch.number}'s title reached the browser`);
    for (const secret of ["linkToSuspect", "\"answers\"", "reconstruction", "Closing report only", "W.A.R. Reeves"]) if (v.includes(secret)) problems.push(`${label}: view leaks ${secret}`);
  };

  try {
    // ---------------- Chapter 1
    run({ type: "dismissIntro" });
    run({ type: "readDocument", documentId: "casefile" });
    run({ type: "collect", evidenceId: "E012" });
    leaks("start");
    go("lasko_home");
    ask("sarah_emily");
    ask("sarah_night");
    ask("sarah_job");
    for (const h of ["lh_diary", "lh_calendar", "lh_prints", "lh_pager"]) look(h);
    ask("sarah_w");
    ask("sarah_father");
    go("police");
    ask("mitchell_case");
    ask("mitchell_file");
    for (const h of ["pd_report", "pd_notes", "pd_inventory", "pd_wade96", "pd_rebecca96", "pd_andrew96"]) look(h);
    expect(s.eventStates.RE01 === "active" && s.pendingDeliveries.includes("sarah_photo"), "RE01 did not bring Sarah's photograph");
    open("sarah_photo");
    ask("sarah_car");
    go("forensic");
    ask("brooks_id");
    ask("brooks_cause");
    ask("brooks_effects");
    ask("sarah_ring");
    go("mill_gate");
    look("mg_gate");
    go("shop_floor");
    look("sf_hasp");
    look("sf_bench");
    go("tool_crib");
    look("tc_photos");
    go("corso_photo");
    look("cf_cabinet");
    go("sloan_home");
    ask("rebecca_emily");
    ask("rebecca_night");
    go("pierce_home");
    ask("andrew_saw");
    ask("andrew_friday");
    go("reeves_auto");
    ask("wade_emily");
    ask("wade_lastseen");
    if (s.pendingCalls.includes("call_board")) answer("call_board");
    expect(!s.eventStates.RE02 && !s.eventStates.RE05, `a later chapter's event fired in chapter 1: ${JSON.stringify(s.eventStates)}`);
    connect("E019", "E001", "D01");
    connect("E004", "E015", "D02");
    connect("E003", "E009", "D03");
    connect("E011", "E013", "D04");
    connect("E008", "E002", "D05");
    connect("E016", "E013", "D06");
    connect("E014", "E013", "D07");
    chapterDone(1);
    leaks("chapter 2");

    // ---------------- Chapter 2
    answer("call_ray");
    go("admin_building");
    for (const h of ["ab_incidents", "ab_rosters", "ab_gm", "ab_hr"]) look(h);
    go("maint_office");
    for (const h of ["mo_ledger", "mo_binder", "mo_drawer", "mo_photo"]) look(h);
    go("loading_yard");
    look("ly_gallery");
    go("medical_station");
    look("ms_log");
    go("regulatory");
    for (const h of ["rg_osha", "rg_fire", "rg_interviews"]) look(h);
    go("union_hall");
    ask("earl_grievance");
    ask("earl_stroud");
    ask("earl_borough");
    look("uh_cabinet");
    ask("ray_night");
    ask("ray_emily");
    answer("call_karen_borough");
    go("borough");
    look("bo_letters");
    look("bo_memo");
    go("stroud_office");
    ask("stroud_1996");
    ask("stroud_memo");
    look("so_grant");
    go("courthouse");
    ask("karen_sale");
    go("newspaper");
    ask("jessica_gallery");
    ask("jessica_tape");
    ask("evelyn_memo");
    ask("evelyn_ron");
    ask("evelyn_copies");
    open("evelyn_copies");
    connect("E022", "E024", "D11");
    connect("E026", "E031", "D12");
    connect("E028", "E039", "D13");
    connect("E029", "E023", "D14");
    connect("E021", "E028", "D15");
    connect("E026", "E022", "D16");
    connect("E036", "E038", "D17");
    connect("E034", "E035", "D20");
    chapterDone(2);

    // ---------------- Chapter 3
    answer("call_glenn");
    expect(s.evidence.includes("E041"), "Glenn's voicemail did not file E041");
    go("sutter_home");
    expect(project(def, s).location.hotspots.some((h) => h.id === "sh_glenn"), "Glenn is not at home to talk to");
    ask("glenn_why");
    ask("glenn_gallery");
    ask("glenn_log");
    expect(!s.eventStates.RE06, "Glenn died while the investigator was in his house");
    go("office");
    expect(s.eventStates.RE06 === "active", "Glenn's death did not follow the visit");
    answer("call_mitchell_glenn");
    expect(project(def, s).characters.find((c) => c.id === "glenn")?.deceased, "Glenn not shown as deceased");
    go("storage");
    for (const h of ["cs_photos", "cs_print", "cs_tackle", "cs_log", "cs_contract"]) look(h);
    go("police");
    for (const q of ["mitchell_glenn_death", "mitchell_glenn_calls", "mitchell_witness", "mitchell_taken"]) ask(q);
    ask("brooks_glenn");
    go("sutter_home");
    expect(!project(def, s).location.hotspots.some((h) => h.id === "sh_calendar"), "Glenn's house open before the police release it");
    ask("mitchell_sutter_house");
    expect(s.eventStates.RE07 === "completed", "RE07 did not resolve");
    look("sh_calendar");
    look("sh_desk");
    go("trent_office");
    ask("trent_job");
    ask("trent_oct25");
    look("to_roster");
    look("to_ledger");
    go("river_gate");
    look("rv_trailer");
    ask("mitchell_trent_interview");
    go("reeves_auto");
    look("ra_orders");
    connect("E041", "E042", "D21");
    connect("E049", "E043", "D22");
    connect("E045", "E046", "D23");
    connect("E056", "E052", "D24");
    if (s.pendingCalls.includes("call_threat")) answer("call_threat");
    go("office");
    if (project(def, s).location.hotspots.some((h) => h.id === "of_window")) look("of_window");
    chapterDone(3);

    // ---------------- Chapter 4
    answer("call_len");
    expect(project(def, s).characters.some((c) => c.id === "len"), "Len not known after his call");
    go("office");
    expect(s.eventStates.RE11 === "completed", "RE11 did not fire at the office");
    answer("call_mitchell_len");
    go("greer_home");
    for (const h of ["gh_hall", "gh_pills", "gh_letter", "gh_neighbor"]) look(h);
    go("police");
    ask("mitchell_len_missing");
    ask("mitchell_len_calls");
    ask("mitchell_plate");
    connect("E064", "E063", "D26");
    connect("E065", "E053", "D27");
    expect(s.eventStates.RE13 === "active", "RE13 not active after D27");
    go("courthouse");
    ask("karen_trent_land");
    ask("karen_len_land");
    connect("E069", "E070", "D28");
    answer("call_mitchell_raid");
    go("laurel_road");
    look("lr_gate");
    expect(s.flags.includes("trent_arrested") && s.eventStates.RE15 === "completed", "Len was not recovered");
    go("camp");
    look("cp_cellar");
    look("cp_can");
    go("police");
    for (const q of ["mitchell_search", "mitchell_recovery", "mitchell_hospital"]) ask(q);
    ask("len_statement");
    connect("E075", "E077", "D29");
    connect("E077", "E066", "D30");
    chapterDone(4);

    // ---------------- Chapter 5
    answer("call_jessica_lawyer");
    answer("call_mitchell_box");
    open("safe_deposit");
    for (const q of ["mitchell_trent_custody", "mitchell_burner", "mitchell_stroud_phone", "mitchell_wire", "mitchell_payments", "mitchell_boots", "mitchell_handwriting"]) ask(q);
    expect(!s.evidence.includes("E060"), "lab results came back at once");
    wait();
    open("lab_boots");
    open("lab_hand");
    go("pierce_home");
    ask("andrew_time");
    look("pi_shoebox");
    ask("andrew_wade");
    go("rail_building");
    look("rb_ledger");
    go("reeves_auto");
    look("ra_invoices");
    go("newspaper");
    look("np_directory");
    expect(s.eventStates.RE04 === "active", "RE04 not active with the pager number identified");
    go("sloan_home");
    ask("rebecca_motel");
    ask("rebecca_denise");
    ask("rebecca_shop");
    open("denise_letters");
    go("river_gate");
    look("rv_guardhouse");
    ask("evelyn_aug17");
    open("evelyn_expense");
    go("courthouse");
    ask("karen_cab");
    go("sutter_home");
    look("sh_bible");
    go("reeves_auto");
    ask("wade_saturday");
    answer("call_mitchell_wade");
    connect("E082", "E013", "D08");
    connect("E087", "E009", "D09");
    connect("E084", "E011", "D10");
    connect("E093", "E094", "D18");
    connect("E078", "E026", "D19");
    connect("E080", "E057", "D25");
    connect("E088", "E089", "D31");
    connect("E098", "E058", "D33");
    connect("E060", "E079", "D34");
    for (const x of ["x_wade_day", "x_wade_studio", "x_wade_ring", "x_rebecca_1996", "x_andrew_time", "x_trent_home"]) expect(s.contradictions.includes(x), `contradiction ${x} not recorded`);
    chapterDone(5);

    // ---------------- Chapter 6
    answer("call_mitchell_mill");
    go("mill_reconstruction");
    look("mr_bench");
    look("mr_loft");
    go("reeves_auto");
    look("ra_ledger");
    go("forensic");
    ask("brooks_bench");
    connect("E081", "E087", "D32");
    connect("wade", "trent", "D35");
  } catch (e) {
    problems.push(`C006 playthrough stopped: ${(e as Error).message}`);
    return;
  }

  // ------------------------------------------------------------ everything found, once
  for (const m of MANIFEST) {
    const at = foundIn.get(m.id);
    if (at !== undefined && at !== m.chapter) problems.push(`${m.id}: manifest says chapter ${m.chapter}, the playthrough found it in chapter ${at}`);
  }
  const missing = def.evidence.filter((e) => !s.evidence.includes(e.id)).map((e) => e.id);
  expect(!missing.length, `evidence never collected: ${missing.join(", ")}`);
  expect(new Set(s.evidence).size === s.evidence.length, "evidence duplicated");
  const notMade = def.deductions.filter((d) => !s.deductions.includes(d.id)).map((d) => d.id);
  expect(!notMade.length, `deductions never made: ${notMade.join(", ")}`);
  const notDone = def.events.filter((e) => s.eventStates[e.id] !== "completed").map((e) => `${e.id}:${s.eventStates[e.id] ?? "locked"}`);
  expect(!notDone.length, `events not completed: ${notDone.join(", ")}`);
  expect(new Set(s.events).size === s.events.length, "an event repeated");
  expect(s.chapters?.current === 6 && s.chapters.completed.length === 5, `chapters: current ${s.chapters?.current}, completed ${s.chapters?.completed.map((r) => r.number)}`);

  // No purchased questions were needed, and no limited interview ran out.
  for (const c of def.characters) {
    const left = questionsLeft(def, s, c.id);
    if (left !== null && left < 0) problems.push(`${c.id} over the question limit`);
  }
  expect(!(s.budget?.purchases ?? []).length, "the playthrough bought questions");

  // ------------------------------------------------------------ the timelines and the comparison
  const place = (seq: string, card: string, space: string, pos = 0) => run({ type: "sequencePlace", sequenceId: seq, cardId: card, space, pos });
  const seq96 = def.sequences!.find((q) => q.id === "t1996")!;
  for (const c of seq96.cards) if (c.space) place("t1996", c.id, c.space, seq96.cards.indexOf(c));
  place("t1996", "a_wade_four", "aug17_day");
  place("t1996", "a_rebecca_home", "aug17_night");
  place("t1996", "a_andrew_ten", "aug17_night");
  place("t1996", "a_wade_fri", "early_aug");
  place("t1996", "a_len_claim", "june_after");
  const tested = run({ type: "sequenceTest", sequenceId: "t1996" });
  const found96 = s.sequences?.t1996?.findings ?? [];
  expect(tested.kind === "sequence" && found96.length === seq96.findings.length, `1996 timeline findings: ${found96.join(", ")} of ${seq96.findings.map((f) => f.id).join(", ")}`);
  const seq18 = def.sequences!.find((q) => q.id === "t2018")!;
  for (const c of seq18.cards) if (c.space) place("t2018", c.id, c.space, seq18.cards.indexOf(c));
  place("t2018", "b_trent_home", "thu");
  place("t2018", "b_trent_willing", "weekend");
  run({ type: "sequenceTest", sequenceId: "t2018" });
  expect((s.sequences?.t2018?.findings ?? []).length === seq18.findings.length, `2018 timeline findings: ${(s.sequences?.t2018?.findings ?? []).join(", ")}`);
  const cmp = def.comparisons!.find((c) => c.id === "page41")!;
  for (const r of cmp.regions) run({ type: "compare", comparisonId: "page41", regionId: r.id, optionId: r.answer });
  expect(s.comparisons?.page41?.done, "page 41 comparison did not complete");

  // ------------------------------------------------------------ the final report
  expect(project(def, s).conclusion.available, "report not available in chapter 6");
  const right = def.solution.answers!;
  const good = ["E086", "E081", "E100", "E032", "E026", "E078", "E045", "E080", "E058", "E068", "E072", "E077", "E087", "E088"];
  problems.push(...reportStandardProblems(def, structuredClone(s), right as Omit<Theory, "evidence">, good));
  const submit = (over: Partial<Theory>) =>
    reduce(def, s, { type: "submitConclusion", theory: { ...(right as Theory), evidence: good, ...fileUnder(def, good), ...over }, investigator: "Test" }, (t += 5000));
  for (const [label, over] of [
    ["one murderer for everything", { emily_killer: "trent", emily_hid: "trent" }],
    ["Emily died for the cover-up", { emily_why: "cover", emily_cover: "yes", connection: "one" }],
    ["Glenn robbed", { glenn_order: "robbery" }],
    ["Len went willingly", { len_taker: "nobody", len_why: "protect" }],
  ] as [string, Partial<Theory>][]) {
    const r = submit(over);
    expect(r.outcome.kind === "verdict" && !r.outcome.correct && r.state.status !== "closed", `wrong report accepted: ${label}`);
    if (r.outcome.kind === "verdict" && /wade|reeves|trent|stroud|personal/i.test(r.outcome.note)) problems.push(`returned report note gives the answer away: ${r.outcome.note}`);
  }
  const ok = submit({});
  expect(ok.outcome.kind === "verdict" && ok.outcome.correct && ok.state.status === "closed", `correct report rejected: ${ok.outcome.kind === "verdict" ? ok.outcome.note : ok.outcome.kind}`);
  s = ok.state;
  run({ type: "dismissMessages" });
  expect(s.chapters?.completed.length === 6, "the last chapter was not recorded when the case closed");
  expect(project(def, s).chapter?.checkpoint === null && project(def, s).closure, "closure not shown at the end");
  const back = normalizeState(def, JSON.parse(JSON.stringify(s)));
  expect(back.status === "closed" && back.evidence.length === 100 && back.deductions.length === 35, "completion lost on reload");

  // ------------------------------------------------------------ guards that hold for any order
  const fresh = newState(def, 0);
  expect(!check({ chapter: 2 }, fresh), "a new case starts past chapter 1");
  const v0 = project(def, fresh);
  expect(!v0.map.some((m) => ["sutter_home", "storage", "laurel_road", "camp", "borough", "mill_reconstruction"].includes(m.id)), "a secret place is on the map at the start");
  for (const p of ["glenn", "len", "trent", "stroud"]) if (v0.characters.some((c) => c.id === p)) problems.push(`${p} is known at the start`);
}
