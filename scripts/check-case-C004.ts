/**
 * C004's reference playthrough for the case checker: plays The Last Broadcast
 * from Louise Vale's visit to a closed case with the real engine, and the night
 * at the warehouse every way it can go:
 *
 *   - alone, as an escape;
 *   - a joint investigation of two, and of six, as a rescue, checking that the
 *     captive's finds stay off the other screens until it is over and that
 *     neither side can finish without the other;
 *   - the captive's screen going quiet (another player takes their place, with
 *     every step kept), and every rescuer going quiet (the captive goes it alone).
 *
 * Also: each piece of evidence arrives one way (E27 one per mode), the story
 * keeps its order, every deduction can be made, the report tells Harlan, Russo
 * and Mercer apart, and free-form questions reach the right answers.
 * Run through: npm run check:case -- C004
 */
import { heldNow, interviewCandidates, newState, project, reduce } from "../src/game/engine/engine";
import { bestMatch } from "../src/game/engine/matcher";
import { fileUnder, reportStandardProblems } from "./report-helpers";
import type { CaseDefinition, GameAction, InvestigationState, SeatContext, Theory } from "../src/game/engine/types";

/** Everyday phrasings and the authored answer each should reach. */
export const C004_MATCH: [string, string, string | null][] = [
  ["louise", "Why did you hire us?", "louise_hire"],
  ["louise", "Did your brother say he was going to announce something?", "louise_announcement"],
  ["louise", "When did you last see Arthur?", "louise_lastsaw"],
  ["louise", "What do you think of Henry Mercer?", "louise_henry"],
  ["victor", "Where were you on Friday night?", "victor_evening"],
  ["victor", "What did you hear on the radio at 10:15?", "victor_broadcast"],
  ["victor", "Who would want to hurt Arthur?", "victor_henry"],
  ["victor", "How was the body found?", "victor_found"],
  ["henry", "What were you and Arthur arguing about?", "henry_argument"],
  ["henry", "Where did you go after you left the station?", "henry_evening"],
  ["henry", "Why did you lie to the police?", "henry_police"],
  ["henry", "How do I get into the Blue Lantern?", "henry_lantern"],
  ["henry", "Is there a transcript of what was broadcast?", "henry_transcript"],
  ["samuel", "Was Arthur really live on the air at 10:15?", "samuel_1015"],
  ["samuel", "Did Arthur rehearse that evening?", "samuel_rehearsal"],
  ["samuel", "What happened at 10:35?", "samuel_cue"],
  ["samuel", "What is that machine on the wall?", "samuel_recorder"],
  ["clara", "Did you hear the argument in the lobby?", "clara_argument"],
  ["clara", "Who has keys to the storage room?", "clara_keys"],
  ["rose", "When did you last see Arthur?", "rose_door"],
  ["rose", "Can you get me into the Blue Lantern?", "rose_lantern"],
  ["rose", "Did he always bar the studio door?", "rose_bar"],
  ["russo", "Where were you Friday night?", "russo_friday"],
  ["russo", "Did you know Arthur Vale?", "russo_arthur"],
  ["keene", "Can I see the photographs of the scene?", "keene_photos"],
  ["keene", "What did the coroner say?", "keene_coroner"],
  ["keene", "Why does the captain think Mercer did it?", "keene_mercer"],
  ["agnes", "What time did Henry Mercer come in on Friday?", "agnes_friday"],
  ["agnes", "Could anyone have left the house after ten?", "agnes_door"],
  ["frankie", "What is your job here?", "frankie_job"],
  ["frankie", "Who runs the warehouse at night?", "frankie_who"],
  ["rose", "What's your favorite song?", null],
  ["agnes", "Do you like baseball?", null],
];

/** One investigation driven by the real engine, with the clock moving five seconds an action. */
class Game {
  s: InvestigationState;
  t = 1000;
  constructor(
    private def: CaseDefinition,
    s?: InvestigationState,
  ) {
    this.s = s ? structuredClone(s) : newState(def, 0);
  }
  run(a: GameAction, ctx: SeatContext = {}) {
    const r = reduce(this.def, this.s, a, (this.t += 5000), ctx);
    this.s = r.state;
    return r.outcome;
  }
  view(ctx: SeatContext = {}) {
    return project(this.def, this.s, this.t, ctx);
  }
  hot(h: string, ctx: SeatContext = {}) {
    return this.run({ type: "hotspot", hotspotId: h }, ctx);
  }
  look(h: string, ctx: SeatContext = {}) {
    const o = this.hot(h, ctx);
    if (o.kind === "inspect" && o.evidence && !this.s.evidence.includes(o.evidence.id)) this.run({ type: "collect", evidenceId: o.evidence.id }, ctx);
    return o;
  }
  go(l: string, ctx: SeatContext = {}) {
    const here = ctx.seat && heldNow(this.s)?.seat === ctx.seat ? heldNow(this.s)!.location : this.s.location;
    if (here !== l) this.run({ type: "travel", locationId: l }, ctx);
  }
  ask(qid: string, ctx: SeatContext = {}) {
    const q = this.def.questions.find((x) => x.id === qid);
    if (!q) throw new Error(`unknown question ${qid}`);
    this.run({ type: "talk", characterId: q.characterId }, ctx);
    return this.run({ type: "ask", questionId: qid }, ctx);
  }
  answerCalls(ctx: SeatContext = {}) {
    for (let i = 0; i < 6 && this.s.pendingCalls.length; i++) this.run({ type: "answerCall", callId: this.s.pendingCalls[0] }, ctx);
  }
  openDeliveries(ctx: SeatContext = {}) {
    for (const d of [...this.s.pendingDeliveries]) {
      this.run({ type: "openDelivery", deliveryId: d }, ctx);
      for (const e of this.def.deliveries.find((x) => x.id === d)!.evidence) if (!this.s.evidence.includes(e)) this.run({ type: "collect", evidenceId: e }, ctx);
    }
  }
  connect(a: string, b: string, ctx: SeatContext = {}) {
    this.run({ type: "boardAdd", itemId: a, x: 10, y: 10 }, ctx);
    this.run({ type: "boardAdd", itemId: b, x: 30, y: 30 }, ctx);
    return this.run({ type: "connect", a, b }, ctx);
  }
  fails(a: GameAction, ctx: SeatContext = {}) {
    try {
      this.run(a, ctx);
      return false;
    } catch {
      return true;
    }
  }
}

export function checkC004(def: CaseDefinition, problems: string[]) {
  const expect = (ok: unknown, msg: string) => {
    if (!ok) problems.push(msg);
  };

  // ---- every evidence item has one way in (E27: one per mode) ----
  const routes = new Map<string, string[]>();
  const note = (id: string, how: string) => routes.set(id, [...(routes.get(id) ?? []), how]);
  for (const l of def.locations) for (const h of l.hotspots) if (h.interaction.type === "inspect" && h.interaction.evidence) note(h.interaction.evidence, `scene:${h.id}`);
  for (const d of def.deliveries) for (const e of d.evidence) note(e, `delivery:${d.id}`);
  for (const d of def.documents) for (const e of d.evidence) note(e, `document:${d.id}`);
  for (const q of def.questions) for (const fx of q.effects ?? []) if ("giveEvidence" in fx) note(fx.giveEvidence, `dialogue:${q.characterId}`);
  for (const e of def.evidence) {
    const r = routes.get(e.id) ?? [];
    if (e.id === "E27") expect(r.length === 2 && r.includes("scene:a3_gate_seen") && r.includes("scene:r2_car"), `E27 should have exactly the solo and rescue routes: ${r}`);
    else expect(r.length === 1, `${e.id} has ${r.length} ways in: ${r}`);
  }
  expect(def.evidence.length === 28, `expected 28 evidence items, found ${def.evidence.length}`);
  expect(def.deductions.length === 14, `expected 14 deductions, found ${def.deductions.length}`);

  // =====================================================================
  // 1. Solo: the reference playthrough, through the escape to a closed case
  // =====================================================================
  const g = new Game(def);
  g.run({ type: "dismissIntro" });
  expect(g.fails({ type: "collect", evidenceId: "E24" }), "E24 collectable at the start");
  expect(g.fails({ type: "travel", locationId: "warehouse_gate" }), "warehouse reachable at the start");
  expect(g.fails({ type: "travel", locationId: "wh_storeroom" }), "a captive scene reachable at the start");
  g.run({ type: "readDocument", documentId: "casefile" });
  expect(!project(def, g.s).characters.some((c) => ["sal", "augie", "stranger"].includes(c.id)), "the warehouse men are listed before they are met");
  expect(!g.view().conclusion.available, "report available at the start");

  // Studio A
  g.go("studio_a");
  g.look("sa_door");
  g.look("sa_desk");
  g.look("sa_rack");
  expect(g.s.evidence.includes("E03"), "E03 not found at the door");
  // Storage: nothing to find until there is a reason to look.
  g.go("storage");
  expect(!g.view().location.hotspots.some((h) => h.id === "st_crates"), "the weight's crate is searchable before E17 or E20");
  // Control room
  g.go("control_room");
  for (const h of ["cr_schedule", "cr_recorder", "cr_register", "cr_turntable", "cr_window"]) g.look(h);
  g.ask("samuel_rehearsal");
  g.ask("samuel_1015");
  const lie = g.s.conversations.samuel?.some((l) => /Live\. From Studio A/.test(l.text));
  expect(lie, "Samuel should lie about 10:15 before his card arrives");
  g.ask("samuel_workshop");
  g.ask("samuel_panel");
  g.ask("rose_door");
  expect(g.fails({ type: "travel", locationId: "blue_lantern" }), "the Blue Lantern reachable without the password");
  g.ask("rose_lantern");
  // The weight
  g.go("storage");
  g.look("st_crates");
  g.look("st_panel");
  expect(g.s.evidence.includes("E18"), "E18 not found");
  // Workshop
  g.go("workshop");
  g.look("ws_rack");
  g.look("ws_log");
  // Station office
  g.go("station_office");
  g.look("so_ledger");
  g.look("so_diary");
  g.ask("victor_evening");
  g.ask("victor_broadcast");
  g.ask("clara_books");
  g.ask("clara_victor");
  g.ask("clara_invoice");
  g.ask("victor_lakeshore");
  expect(["E13", "E14", "E16", "E17"].every((e) => g.s.evidence.includes(e)), `station office evidence missing: ${["E13", "E14", "E16", "E17"].filter((e) => !g.s.evidence.includes(e))}`);
  expect(g.s.contradictions.includes("X_OFFICE") && g.s.contradictions.includes("X_STORAGE") && g.s.contradictions.includes("X_LIVE"), `Harlan's contradictions not recorded: ${g.s.contradictions}`);
  // Police
  g.go("police");
  g.ask("keene_photos");
  g.ask("keene_coroner");
  g.ask("keene_statements");
  g.ask("keene_send_weight");
  expect(g.s.labs.weight && !g.s.labs.weight.done, "the chemist's test was not started");
  // Henry and Agnes
  g.go("boardinghouse");
  g.ask("henry_argument");
  g.ask("henry_evening");
  g.ask("henry_broadcast");
  g.ask("henry_transcript");
  g.ask("henry_apartment");
  g.ask("agnes_friday");
  g.go("mercer_apartment");
  g.look("ma_desk");
  // Louise
  g.go("vale_house");
  g.ask("louise_announcement");
  expect(!g.view().location.hotspots.some((h) => h.id === "vh_letter"), "Arthur's letter on the piano before Louise's call");
  // Back at the office: Louise, Rose, Samuel, and the board hint.
  g.go("office");
  expect(g.s.eventStates.RE01 === "active" && g.s.eventStates.RE02 === "active" && g.s.eventStates.RE03 === "active", `office events not active: ${JSON.stringify(g.s.eventStates)}`);
  g.answerCalls();
  g.t += 200000;
  g.run({ type: "checkLabs" });
  g.openDeliveries();
  for (const e of ["E05", "E19", "E21"]) expect(g.s.evidence.includes(e), `${e} did not arrive at the office`);
  expect(g.s.conversations.samuel === undefined || !g.s.conversations.samuel.some((l) => /I played it\./.test(l.text)), "Samuel told the truth before he was asked again");
  g.go("control_room");
  g.ask("samuel_evening");
  expect(g.s.conversations.samuel.some((l) => /five past nine Mr\. Harlan came in/.test(l.text)), "Samuel's candid account missing after his card");
  g.go("vale_house");
  g.look("vh_letter");
  // The Blue Lantern and the warehouse by day
  g.go("blue_lantern");
  g.look("bl_crates");
  expect(!g.view().location.hotspots.some((h) => h.id === "bl_office"), "Russo's office open before talking to him");
  g.ask("russo_who");
  g.look("bl_office");
  g.ask("russo_victor");
  expect(g.s.contradictions.includes("X_RUSSO"), "Russo's contradiction not recorded");
  g.go("warehouse_gate");
  g.ask("frankie_cabinets");
  g.ask("frankie_sketch");
  expect(g.s.evidence.includes("E25"), "E25 not handed over");
  // The board, before the warehouse
  const pre: [string, string, string][] = [
    ["D01", "E12", "E13"], ["D02", "E04", "E05"], ["D03", "E06", "E07"], ["D04", "E08", "E09"], ["D05", "E03", "E17"], ["D06", "E10", "E11"],
    ["D07", "E18", "E20"], ["D08", "E16", "E17"], ["D09", "E13", "E14"], ["D10", "E15", "E23"], ["D12", "E03", "E16"], ["D14", "E02", "E09"],
  ];
  for (const [d, a, b] of pre) {
    const o = g.connect(a, b);
    expect(o.kind === "deduction" && o.id === d, `${a}+${b} should make ${d}, got ${o.kind === "deduction" ? o.id : o.kind}`);
  }
  expect(!g.view().conclusion.available, "the report opened before the warehouse");
  // The warning, then the invitation
  g.go("office");
  g.answerCalls();
  expect(g.s.answeredCalls.includes("call_warning"), "the warning call never came");
  expect(g.s.flags.includes("invitation"), "the invitation did not arrive");
  const atInvitation = structuredClone(g.s);
  expect(g.view().location.hotspots.some((h) => h.id === "office_invitation"), "the invitation is not on the office floor");

  // ---- the meeting, alone ----
  const taken = g.hot("office_invitation");
  expect(taken.kind === "inspect" && /Riverside Shipping/.test(taken.title), "the capture was not shown");
  const cap = heldNow(g.s);
  expect(cap && cap.mode === "solo" && cap.seat === "host" && cap.location === "wh_storeroom", `solo capture wrong: ${JSON.stringify(cap)}`);
  const held = g.view();
  expect(held.captivity?.role === "captive" && held.map.length === 0 && held.location.id === "wh_storeroom", "the captive's screen is not the storeroom");
  expect(g.fails({ type: "travel", locationId: "office" }), "a captive could travel home");
  expect(g.fails({ type: "talk", characterId: "keene" }), "a captive could telephone");
  expect(g.fails({ type: "boardAdd", itemId: "E01", x: 1, y: 1 }), "a captive could use the board");
  expect(g.fails({ type: "travel", locationId: "wh_tally" }), "the tally office open before the hasp is pried");
  g.hot("a1_strap");
  const heard = g.hot("a1_door");
  expect(heard.kind === "call" && heard.overheard && heard.speakers?.[0] === "Sal", "the overheard exchange did not play with its speakers");
  expect(!g.view().phone.log.some((c) => c.id === "overheard_1"), "an overheard exchange shows in the telephone log");
  g.hot("a1_inner");
  g.look("a2_ledger");
  g.hot("a2_lamp");
  g.hot("a2_stencil");
  g.hot("a2_window");
  expect(!g.s.flags.includes("signal_sent"), "a solo captive signalled nobody");
  expect(!g.view().location.hotspots.some((h) => h.id === "a2_stair"), "the stair open before the guard leaves");
  g.hot("a2_back");
  g.look("a1_tags");
  g.hot("a1_listen_again");
  g.hot("a1_inner");
  g.hot("a2_stair");
  g.hot("a3_door");
  expect(g.s.flags.includes("on_pier"), "the river door did not open alone");
  g.look("a3_gate_seen");
  g.hot("a3_riverpath");
  expect(!heldNow(g.s) && g.s.flags.includes("captivity_over") && !g.s.flags.includes("held"), "the escape did not end the captivity");
  expect(g.s.location === "office" && g.view().location.id === "office", "not back at the office after the escape");
  expect(["E24", "E26", "E27"].every((e) => g.s.evidence.includes(e)), "warehouse evidence missing after the escape");
  expect(!g.s.notebook.some((n) => n.private), "private notes left after the escape");
  // After the warehouse
  g.answerCalls();
  g.openDeliveries();
  expect(g.s.evidence.includes("E28") && g.s.flags.includes("victor_arrested"), "the safe was not opened");
  g.go("police");
  const v = g.run({ type: "talk", characterId: "victor" });
  expect(v.kind === "conversation" && v.refusing, "Harlan answers questions in custody");
  for (const [d, a, b] of [["D11", "E23", "E24"], ["D13", "E24", "E26"]] as [string, string, string][]) {
    const o = g.connect(a, b);
    expect(o.kind === "deduction" && o.id === d, `${a}+${b} should make ${d}`);
  }
  expect(g.s.deductions.length === 14, `deductions ${g.s.deductions.length}/14`);
  expect(g.s.evidence.length === 28, `evidence ${g.s.evidence.length}/28, missing ${def.evidence.map((e) => e.id).filter((e) => !g.s.evidence.includes(e))}`);
  for (const e of ["RE01", "RE02", "RE03", "RE04", "RE05", "RE06", "RE07"]) expect(g.s.eventStates[e] === "completed", `${e} is ${g.s.eventStates[e]}`);

  // ---- the report ----
  g.go("office");
  expect(g.view().conclusion.available, "the report is not available after the warehouse");
  const right = { killer: "victor", motive: "exposure", weapon: "weight", time: "t0955", voice: "disc", lock: "crawlway", russo: "scheme", henry: "innocent" };
  const key = ["E17", "E12", "E03", "E09", "E19", "E24", "E07"];
  problems.push(...reportStandardProblems(def, g.s, right, key));
  const T = (over: Partial<Theory> = {}): Theory => ({ ...right, evidence: key, ...fileUnder(def, key), ...over }) as Theory;
  const wrong = reduce(def, g.s, { type: "submitConclusion", theory: T({ killer: "henry" }), investigator: "Test" }, 2);
  expect(wrong.outcome.kind === "verdict" && !wrong.outcome.correct && !/harlan|victor|mercer/i.test(wrong.outcome.note), "a report naming Mercer was not returned cleanly");
  const russoKiller = reduce(def, g.s, { type: "submitConclusion", theory: T({ russo: "killer" }), investigator: "Test" }, 2);
  expect(russoKiller.outcome.kind === "verdict" && !russoKiller.outcome.correct, "a report calling Russo the killer was accepted");
  const live = reduce(def, g.s, { type: "submitConclusion", theory: T({ time: "t1015", voice: "alive" }), investigator: "Test" }, 2);
  expect(live.outcome.kind === "verdict" && !live.outcome.correct, "a report with the false timeline was accepted");
  const ok = g.run({ type: "submitConclusion", theory: T(), investigator: "Ian" });
  expect(ok.kind === "verdict" && ok.correct && g.s.status === "closed", "the right report was not accepted");
  expect(g.view().closure?.caller?.characterId === "keene", "the closing call is not Keene's");

  // =====================================================================
  // 2. A rescue with two at the table
  // =====================================================================
  const rescue = (seats: string[], captive: string, rescuer: string, label: string) => {
    const r = new Game(def, atInvitation);
    const ctx = (seat: string): SeatContext => ({ seat, name: seat === "host" ? "Ian" : `Guest ${seat}`, active: seats });
    const C = ctx(captive);
    const R = ctx(rescuer);
    r.hot("office_invitation", C);
    const c = heldNow(r.s);
    expect(c?.mode === "rescue" && c.seat === captive, `${label}: not a rescue: ${JSON.stringify(c)}`);
    for (const s of seats.filter((x) => x !== captive)) {
      const v2 = r.view(ctx(s));
      expect(v2.captivity?.role === "rescuer" && v2.location.id === "office" && !v2.location.hotspots.some((h) => h.id === "office_invitation"), `${label}: ${s} is not a rescuer at the office`);
    }
    expect(r.view(R).messages.some((m) => m.includes("has taken the envelope")), `${label}: the others were not told who went`);
    expect(r.fails({ type: "travel", locationId: "wh_storeroom" }, R), `${label}: a rescuer walked into the storeroom`);
    expect(r.fails({ type: "travel", locationId: "wells_bridge" }, R), `${label}: the bridge open before the note was read`);
    // The captive starts; the others look for them.
    r.hot("a1_strap", C);
    r.hot("a1_door", C);
    r.hot("a1_inner", C);
    r.look("a2_ledger", C);
    const rv = r.view(R);
    expect(!rv.evidence.some((e) => e.id === "E24"), `${label}: the rescuers can see the captive's ledger`);
    expect(!rv.notebook.some((n) => n.id === "evidence:E24" || n.id === "call:overheard_1"), `${label}: the captive's notes leak into the shared notebook`);
    expect(!rv.phone.log.some((l) => l.id === "overheard_1"), `${label}: the overheard exchange leaks into the phone log`);
    expect(r.view(C).evidence.some((e) => e.id === "E24"), `${label}: the captive can't see their own ledger`);
    expect(r.fails({ type: "boardAdd", itemId: "E24", x: 1, y: 1 }, R), `${label}: a rescuer pinned the captive's ledger`);
    r.hot("office_left_note", R);
    r.go("wells_bridge", R);
    r.hot("r1_windows", R);
    expect(!r.s.flags.includes("signal_seen"), `${label}: the signal was seen before it was sent`);
    r.go("wh_night_gate", R);
    expect(r.fails({ type: "ask", questionId: "frankie_door" }, R), `${label}: Frankie opened a door before anyone knew which`);
    r.ask("frankie_where", R);
    r.ask("frankie_note", R);
    // The captive signals and gets down to the door, which won't open from inside.
    r.hot("a2_lamp", C);
    r.hot("a2_stencil", C);
    r.hot("a2_window", C);
    expect(r.s.flags.includes("signal_sent"), `${label}: the lamp signal was not sent`);
    r.hot("a2_back", C);
    r.look("a1_tags", C);
    r.hot("a1_listen_again", C);
    r.hot("a1_inner", C);
    r.hot("a2_stair", C);
    r.hot("a3_door", C);
    const stuck = r.view(C).location.hotspots.map((h) => h.id);
    expect(!stuck.includes("a3_partners") && !stuck.includes("a3_riverpath") && !stuck.includes("a3_gate_seen") && !r.s.flags.includes("on_pier"), `${label}: the captive got out alone in a rescue: ${stuck}`);
    expect(heldNow(r.s), `${label}: the captivity ended with the door still chained`);
    // The rescuers see six flashes and get Frankie to the door.
    r.go("wells_bridge", R);
    r.hot("r1_windows", R);
    expect(r.s.flags.includes("signal_seen"), `${label}: the signal was not seen from the bridge`);
    r.go("wh_night_gate", R);
    r.ask("frankie_door", R);
    expect(r.s.flags.includes("door_unchained"), `${label}: Frankie did not unchain bay 6`);
    expect(heldNow(r.s), `${label}: the rescuers finished the rescue alone`);
    r.look("r2_car", R);
    r.hot("a3_door", C);
    r.hot("a3_partners", C);
    expect(!heldNow(r.s) && r.s.flags.includes("captivity_over"), `${label}: the rescue did not end the captivity`);
    for (const s of seats) {
      const v3 = r.view(ctx(s));
      expect(v3.captivity === null && v3.location.id === "office", `${label}: ${s} not back at the office`);
      expect(v3.evidence.some((e) => e.id === "E24") && v3.evidence.some((e) => e.id === "E26") && v3.evidence.some((e) => e.id === "E27"), `${label}: ${s} lacks the warehouse evidence afterward`);
    }
    return r;
  };
  rescue(["host", "g1"], "g1", "host", "two at the table");

  // =====================================================================
  // 3. Six at the table: the host is held, the guests rescue, any of them can act
  // =====================================================================
  const six = ["host", "g1", "g2", "g3", "g4", "g5"];
  rescue(six, "host", "g4", "six at the table");
  {
    const r = new Game(def, atInvitation);
    const ctx = (seat: string): SeatContext => ({ seat, name: seat, active: six });
    r.hot("office_invitation", ctx("g2"));
    expect(r.fails({ type: "hotspot", hotspotId: "office_invitation" }, ctx("g3")), "a second player could also go to the meeting");
    r.hot("office_left_note", ctx("g1"));
    r.go("wells_bridge", ctx("g5"));
    expect(r.view(ctx("g3")).location.id === "wells_bridge", "rescuers do not share one view of the city");
    expect(r.view(ctx("g2")).location.id === "wh_storeroom", "the captive's scene changed when a rescuer moved");
  }

  // =====================================================================
  // 4. The captive's screen goes quiet: another player takes their place
  // =====================================================================
  {
    const r = new Game(def, atInvitation);
    const all = ["host", "g1", "g2"];
    const ctx = (seat: string, active = all): SeatContext => ({ seat, name: seat === "host" ? "Ian" : seat, active });
    r.hot("office_invitation", ctx("g1"));
    r.hot("a1_strap", ctx("g1"));
    r.hot("a1_door", ctx("g1"));
    r.hot("a1_inner", ctx("g1"));
    r.look("a2_ledger", ctx("g1"));
    expect(r.fails({ type: "takeCaptiveRole" }, ctx("host")), "a player took the place of a captive who is still there");
    const quiet = ["host", "g2"];
    const hv = r.view(ctx("host", quiet));
    expect(hv.captivity?.quiet && hv.captivity.canTakeOver, "the others were not offered the captive's place when their screen went quiet");
    expect(r.view(ctx("host")).captivity?.canTakeOver === false, "taking over offered while the captive is still there");
    expect(r.view({ seat: "host" }).captivity?.canTakeOver === false, "taking over offered when presence is unknown");
    r.run({ type: "takeCaptiveRole" }, ctx("host", quiet));
    const c = heldNow(r.s)!;
    expect(c.seat === "host" && c.name === "Ian" && c.location === "wh_tally" && r.s.flags.includes("hands_free") && r.s.evidence.includes("E24"), `the captive's steps were not kept: ${JSON.stringify(c)}`);
    const hv2 = r.view(ctx("host", quiet));
    expect(hv2.captivity?.role === "captive" && hv2.location.id === "wh_tally", "the player who took over does not see the tally office");
    expect(r.view(ctx("g2", quiet)).captivity?.role === "rescuer", "the remaining player is not a rescuer");
    // The rejoining player is now a rescuer, and the rescue finishes.
    expect(r.view(ctx("g1")).captivity?.role === "rescuer", "the dropped player did not come back as a rescuer");
    const H = ctx("host", quiet), G = ctx("g2", quiet);
    r.hot("a2_lamp", H);
    r.hot("a2_stencil", H);
    r.hot("a2_window", H);
    r.hot("a2_back", H);
    r.look("a1_tags", H);
    r.hot("a1_listen_again", H);
    r.hot("a1_inner", H);
    r.hot("a2_stair", H);
    r.hot("office_left_note", G);
    r.go("wells_bridge", G);
    r.hot("r1_windows", G);
    r.go("wh_night_gate", G);
    r.ask("frankie_door", G);
    r.look("r2_car", G);
    r.hot("a3_door", H);
    r.hot("a3_partners", H);
    expect(r.s.flags.includes("captivity_over"), "the rescue after a takeover did not finish");
  }

  // =====================================================================
  // 5. Every rescuer goes quiet: the captive goes it alone
  // =====================================================================
  {
    const r = new Game(def, atInvitation);
    const all = ["host", "g1"];
    const C = (active = all): SeatContext => ({ seat: "g1", name: "Sam", active });
    r.hot("office_invitation", C());
    r.hot("a1_strap", C());
    r.hot("a1_door", C());
    r.hot("a1_inner", C());
    r.look("a2_ledger", C());
    r.hot("a2_back", C());
    r.look("a1_tags", C());
    r.hot("a1_listen_again", C());
    r.hot("a1_inner", C());
    r.hot("a2_stair", C());
    r.hot("a3_door", C());
    expect(!r.s.flags.includes("on_pier"), "the door opened in a rescue without the chain off");
    expect(r.fails({ type: "goAlone" }, C()), "the captive went alone while the others were still there");
    expect(r.view(C(["g1"])).captivity?.canGoAlone, "going alone not offered when every rescuer went quiet");
    r.run({ type: "goAlone" }, C(["g1"]));
    expect(heldNow(r.s)?.mode === "solo" && r.s.env.captivity === "solo", "going alone did not switch to the escape");
    r.hot("a3_door", C(["g1"]));
    r.look("a3_gate_seen", C(["g1"]));
    r.hot("a3_riverpath", C(["g1"]));
    expect(r.s.flags.includes("captivity_over") && r.s.evidence.includes("E27"), "going alone did not finish the escape");
  }

  // =====================================================================
  // 6. Money first: the warehouse thread and the board in another order
  // =====================================================================
  {
    const m = new Game(def);
    m.run({ type: "dismissIntro" });
    m.run({ type: "readDocument", documentId: "casefile" });
    m.go("boardinghouse");
    m.ask("henry_lantern");
    m.go("blue_lantern");
    m.look("bl_crates");
    m.ask("russo_who");
    m.look("bl_office");
    m.go("warehouse_gate");
    m.ask("frankie_sketch");
    m.go("office");
    m.answerCalls();
    expect(m.s.flags.includes("invitation"), "the invitation did not come on the money-first path");
    expect(!m.view().conclusion.available, "the report opened on the money-first path before D03 and the warehouse");
    m.hot("office_invitation");
    for (const h of ["a1_strap", "a1_door", "a1_inner"]) m.hot(h);
    m.look("a2_ledger");
    m.hot("a2_back");
    m.look("a1_tags");
    m.hot("a1_listen_again");
    m.hot("a1_inner");
    m.hot("a2_stair");
    m.hot("a3_door");
    m.look("a3_gate_seen");
    m.hot("a3_riverpath");
    expect(m.s.flags.includes("captivity_over"), "the escape failed on the money-first path");
    expect(!m.view().conclusion.available, "the report opened without the recording deduction");
  }

  // ---- what is offered at the start ----
  for (const c of def.characters.filter((x) => def.questions.some((q) => q.characterId === x.id))) {
    const fresh = new Game(def);
    fresh.run({ type: "readDocument", documentId: "casefile" });
    if (["frankie"].includes(c.id)) continue;
    expect(interviewCandidates(def, fresh.s, c.id).length > 0, `${c.id} has no opening questions`);
  }

  // ---- free-form matching ----
  let hits = 0;
  for (const [cid, text, want] of C004_MATCH) {
    const got = bestMatch(text, def.questions.filter((q) => q.characterId === cid));
    if (got === want) hits++;
    else problems.push(`match: "${text}" (${cid}) got ${got}, want ${want}`);
  }
  if (hits / C004_MATCH.length < 0.9) problems.push(`matcher accuracy ${hits}/${C004_MATCH.length}`);

  console.log(`playthrough: status=${g.s.status} attempts=${g.s.attempts} events=${g.s.events.join(",")} matcher=${hits}/${C004_MATCH.length}`);
}
