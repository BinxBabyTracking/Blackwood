/**
 * HALLOW001 The Thirteenth Guest: the reference checks.
 * Run through: npm run check:case -- HALLOW001
 *
 * 1. The content on its own (Marsh holding still): the shared thorough and
 *    vague playthroughs, the report standard, the matcher, no leaks.
 * 2. The clock: starts at 10:32 PM, moves with actions, shown in the top bar.
 * 3. Marsh: learns only what he could see or hear, is turned away by a
 *    visible officer and caught by a quiet one, attacks at most once, never
 *    a third death, and every new investigation gets its own seed.
 * 4. A competent investigation can name him without another murder, before
 *    midnight; and across many seeds, whatever Marsh does, the case can still
 *    be solved and every ending is reachable.
 */
import { characterLocation, interviewCandidates, newState, project, reduce } from "../src/game/engine/engine";
import { runAdversary } from "../src/game/engine/adversary";
import { check } from "../src/game/engine/rules";
import { fileUnder } from "./report-helpers";
import { checkSeriesCase, type SeriesCaseConfig } from "./series-case-check";
import type { CaseDefinition, GameAction, InvestigationState, Theory } from "../src/game/engine/types";

const RIGHT = { culprit: "crane", method: "stair", blackout: "switched", guest: "josie", annabel: "crane_concealed", why: "silence" };
const KEY = ["HE029", "HE028", "HE004", "HE006", "HE031", "HE019", "HE023", "HE022", "HE017", "HE016"];

/** Marsh holds still: every learn and move removed, so the content is checked on its own. */
const still = (def: CaseDefinition): CaseDefinition => ({ ...def, adversary: def.adversary ? { ...def.adversary, learns: [], moves: [] } : undefined });

export const HALLOW001_CHECK: SeriesCaseConfig = {
  variant: still,
  hidden: [
    ["study", "st_hidden", "the hinged bookcase (before the scrapes are seen and the stair is known)"],
    ["library", "lib_globe", "the globe's envelope (before anyone says where the world is)"],
    ["carriage_house", "ch_chamber", "the opened chamber (before the police open it)"],
    ["greenhouse", "gr_stove", "the burned folder (before anything is burned)"],
  ],
  flags: ["casefile_read", "josie_found", "globe_known", "attic_known", "chamber_opened", "lower_door_found", "procession_canceled"],
  right: RIGHT,
  key: KEY,
  wrong: [
    [{ culprit: "felix" }, "a report naming Felix"],
    [{ culprit: "josie" }, "a report naming Josie Lisle"],
    [{ culprit: "intruder" }, "a report blaming an intruder"],
    [{ method: "key" }, "a report saying the door was locked from outside"],
    [{ method: "hid" }, "a report saying the killer hid in the room"],
    [{ blackout: "storm" }, "a report blaming the storm for the blackout"],
    [{ guest: "intruder" }, "a report calling the veiled woman an intruder"],
    [{ annabel: "ran" }, "a report saying Annabel ran away"],
    [{ annabel: "ambrose" }, "a report saying Ambrose killed Annabel"],
    [{ why: "inheritance" }, "a report giving the inheritance as the motive"],
  ],
  unsupported: [
    [["HE004", "HE006", "HE031", "HE019", "HE023", "HE017", "HE014"], "a report with nothing tying Marsh to the stair or the cellar"],
    [["HE029", "HE028", "HE004", "HE006", "HE023", "HE017"], "a report with nothing showing why"],
    [["HE029", "HE028", "HE004", "HE006", "HE031", "HE023"], "a report that never shows who sat in the thirteenth place"],
  ],
  caller: "mahoney",
  optional: ["HE036", "HE037", "HE038", "HD12", "RE03", "RE04", "RE05", "RE06", "RE07", "RE08", "RE09"],
  match: [
    ["crane", "Where were you when the power went?", "crane_evening"],
    ["crane", "How long had you known Ambrose?", "crane_ambrose"],
    ["crane", "Who was the woman in the veil?", "crane_veil"],
    ["josie", "What is your name?", "josie_who"],
    ["josie", "Why did you come tonight?", "josie_why"],
    ["josie", "What happened at the study door?", "josie_door"],
    ["josie", "Why did you hide?", "josie_hide"],
    ["constance", "Where were you during the blackout?", "constance_evening"],
    ["constance", "Where did Ambrose keep his old letters?", "constance_attic"],
    ["penrose", "What killed him?", "penrose_wound"],
    ["penrose", "Were you here in 1998?", "penrose_1998"],
    ["felix", "Is there another way into the study?", "felix_stair"],
    ["felix", "What did you argue with your father about?", "felix_argument"],
    ["wren", "Who asked for thirteen places?", "wren_thirteen"],
    ["wren", "Did you take any pictures?", "wren_photos"],
    ["wren", "Tell me about the procession.", "wren_procession"],
    ["harriet", "What do you remember about 1998?", "harriet_1998"],
    ["amos", "How did you get the lights back on?", "amos_lights"],
    ["amos", "What happened on Halloween 1998?", "amos_1998"],
    ["bridget", "Where were you when the lights went out?", "bridget_evening"],
    ["beatrice", "Who was the woman at the end of the table?", "beatrice_veil"],
    ["byrne", "Why did Ambrose want us here?", "byrne_call"],
    ["byrne", "What was Ambrose planning to do?", "byrne_letter"],
    ["iris", "Do you have the old plans of the house?", "iris_plans"],
    ["iris", "What's happening to the carriage house?", "iris_carriage"],
    ["mahoney", "Can you arrest him?", "mahoney_arrest"],
    ["wren", "Who won the World Series?", null],
  ],
  secrets: ["Hollins Ridge", "Marsh Advisory", "Annabel", "crane_fears", "flee_gate", "stone steps", "Ridgeline"],
  closingSecrets: /crane_fears|flee_|attack_on_/,
};

// ---------------------------------------------------------------------------

export function checkHALLOW001(def: CaseDefinition, problems: string[]) {
  const expect = (ok: unknown, msg: string) => {
    if (!ok) problems.push(msg);
  };

  // 1. The content on its own.
  checkSeriesCase("HALLOW001", def, problems, HALLOW001_CHECK);

  // ---- a little engine for scripted runs ----
  const game = (seed: string) => {
    let s: InvestigationState = { ...newState(def, 0), seed };
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
    const go = (loc: string) => run({ type: "travel", locationId: loc });
    const hot = (id: string) => {
      const o = run({ type: "hotspot", hotspotId: id });
      if (o?.kind === "inspect" && o.evidence && !s.evidence.includes(o.evidence.id)) run({ type: "collect", evidenceId: o.evidence.id });
      return o;
    };
    const ask = (cid: string, qid: string) => {
      run({ type: "talk", characterId: cid });
      return run({ type: "ask", questionId: qid });
    };
    const pin = (a: string, b: string) => {
      for (const x of [a, b]) if (!s.board.items.some((i) => i.id === x)) run({ type: "boardAdd", itemId: x, x: 10, y: 10 });
      return run({ type: "connect", a, b });
    };
    const call = (id: string) => run({ type: "placeCall", callId: id });
    return { get s() { return s; }, set s(v: InvestigationState) { s = v; }, run, go, hot, ask, pin, call, errors };
  };

  // 2. The clock.
  {
    const g = game("clock");
    expect(g.s.clock === 22 * 60 + 32, `the clock starts at ${g.s.clock}, not 10:32 PM`);
    expect(project(def, g.s).clock === "10:32 PM", `the top bar shows ${project(def, g.s).clock}`);
    g.run({ type: "dismissIntro" });
    g.run({ type: "readDocument", documentId: "casefile" });
    expect(g.s.clock === 22 * 60 + 32, "reading the case file took time");
    g.go("dining_room");
    expect(g.s.clock === 22 * 60 + 32, `travel took ${g.s.clock! - (22 * 60 + 32)} minutes, not 0`);
    g.hot("dr_thirteenth");
    expect(g.s.clock === 22 * 60 + 33, "examining something new did not take a minute");
    g.hot("dr_thirteenth");
    expect(g.s.clock === 22 * 60 + 33, "looking at the same thing again took time");
    g.ask("wren", "wren_thirteen");
    expect(g.s.clock === 22 * 60 + 34, "a question did not take a minute");
    const old = newState({ ...def, clock: undefined, adversary: undefined }, 0);
    expect(old.clock === undefined && old.seed === undefined && old.adversary === undefined, "a case without a clock or adversary carries them anyway");
  }

  // 3a. Every new investigation gets its own seed; nothing of Marsh's mind reaches the browser.
  {
    const seeds = new Set(Array.from({ length: 12 }, () => newState(def, 0).seed));
    expect(seeds.size >= 10, "new investigations share a seed");
    const g = game("leak");
    g.s = { ...g.s, flags: [...g.s.flags, "crane_fears_harriet", "crane_knows_passage"] };
    g.s.adversary!.log.push({ tick: 1, clock: "11:00 PM", kind: "learned", id: "harriet", note: "Sees an investigator sitting with Harriet" });
    const view = JSON.stringify(project(def, g.s));
    for (const secret of ["crane_fears", "crane_knows", "Sees an investigator", "\"adversary\"", "\"seed\""]) expect(!view.includes(secret), `the view leaks ${secret}`);
  }

  // 3b. Marsh learns only what he could see or hear.
  {
    const g = game("blind");
    g.run({ type: "dismissIntro" });
    g.run({ type: "readDocument", documentId: "casefile" });
    // Collect a great deal in private: the study, the stair, the cellar, the gatehouse. Nothing he can see.
    g.go("study");
    for (const h of ["st_door", "st_bookend", "st_clock", "st_desk", "st_shelves"]) g.hot(h);
    g.go("gatehouse");
    g.hot("gh_monitor");
    g.hot("gh_files");
    g.go("wine_cellar");
    g.hot("wc_panel");
    g.hot("wc_bins");
    const learned = g.s.adversary?.learned ?? [];
    expect(!learned.length, `Marsh learned ${learned.join(", ")} from things done in private`);
    expect(!g.s.flags.some((f) => f.startsWith("crane_fears") || f === "crane_knows_passage"), "Marsh fears someone he has no way to know about");
  }

  // 3c. The police: a visible officer turns him away; quiet officers catch him.
  {
    const danger = ["crane_knows_chamber", "crane_called"];
    const base = () => {
      const g = game("police");
      g.s = { ...g.s, flags: [...g.s.flags, "casefile_read", ...danger], clock: 23 * 60 + 50 };
      return g;
    };
    const tick = (g: ReturnType<typeof game>, n: number) => {
      for (let i = 0; i < n; i++) {
        g.s.clock! += 1;
        runAdversary(g.s, def);
      }
    };
    // Gate watched, lane open: he can only go by the lane, and gets away.
    const a = base();
    a.s.flags.push("police_gate");
    tick(a, 80);
    expect(!a.s.adversary!.done.includes("flee_gate"), "Marsh drove out past the officer at the gate");
    expect(a.s.flags.includes("crane_escaped") && a.s.adversary!.done.includes("flee_lane"), "Marsh never tried the unwatched lane with the gate watched");
    // Gate and lane watched: caught on the lane.
    const b = base();
    b.s.flags.push("police_gate", "police_lane");
    tick(b, 80);
    expect(b.s.flags.includes("crane_caught_fleeing") && b.s.flags.includes("crane_arrested") && !b.s.flags.includes("crane_escaped"), "the quiet officer on the lane did not catch him");
    // Nothing watched: out of the gate.
    const c = base();
    tick(c, 80);
    expect(c.s.flags.includes("crane_escaped") && c.s.adversary!.done.includes("flee_gate"), "Marsh never drove out of an unwatched gate");
    // Gate watched, no driver called: he cannot leave at all.
    const d = base();
    d.s.flags = d.s.flags.filter((f) => f !== "crane_called");
    d.s.flags.push("police_gate");
    d.s.adversary!.done.push("call_driver");
    tick(d, 80);
    expect(!d.s.flags.includes("crane_escaped"), "Marsh got away with the gate watched and no car waiting");
  }

  // 3d. One attack at most; a quiet guard stops it; never a third death; nothing before 11:15 PM.
  {
    const fears = ["crane_fears_josie", "crane_fears_harriet", "crane_fears_amos", "crane_fears_bridget", "crane_knows_passage"];
    const g = game("attack");
    g.s = { ...g.s, flags: [...g.s.flags, "casefile_read", "josie_found", ...fears, "police_gate", "police_lane"], clock: 22 * 60 + 40, location: "gatehouse" };
    g.s.adversary!.done.push("call_driver");
    for (let i = 0; i < 30; i++) {
      g.s.clock! += 1;
      runAdversary(g.s, def);
    }
    expect(!g.s.flags.includes("attack_made"), "Marsh attacked before 11:15 PM");
    for (let i = 0; i < 400; i++) {
      g.s.clock! += 1;
      runAdversary(g.s, def);
    }
    const deaths = g.s.flags.filter((f) => f.startsWith("dead_"));
    expect(g.s.flags.includes("attack_made"), "Marsh never attacked anyone he feared, unwatched, after 11:15 PM");
    expect(deaths.length <= 1, `more than one witness died: ${deaths.join(", ")}`);
    const guarded = game("attack");
    guarded.s = { ...guarded.s, flags: [...guarded.s.flags, "casefile_read", "josie_found", "crane_fears_josie", "crane_knows_passage", "guard_josie", "police_gate", "police_lane"], clock: 23 * 60 + 20, location: "gatehouse" };
    guarded.s.adversary!.done.push("call_driver");
    for (let i = 0; i < 400; i++) {
      guarded.s.clock! += 1;
      runAdversary(guarded.s, def);
    }
    expect(guarded.s.flags.includes("attack_interrupted") && guarded.s.flags.includes("crane_arrested") && !guarded.s.flags.includes("dead_josie"), "the quiet guard on Josie did not stop the attack");
    // An investigator in the same room: he waits.
    const present = game("attack");
    present.s = { ...present.s, flags: [...present.s.flags, "casefile_read", "josie_found", "crane_fears_josie", "crane_knows_passage", "police_gate", "police_lane"], clock: 23 * 60 + 20, location: "morning_room" };
    present.s.adversary!.done.push("call_driver");
    for (let i = 0; i < 200; i++) {
      present.s.clock! += 1;
      runAdversary(present.s, def);
    }
    expect(!present.s.flags.includes("attack_on_josie"), "Marsh attacked Josie with an investigator in the room");
  }

  // 4a. A competent investigation, before midnight, without another murder.
  {
    const g = game("competent");
    g.run({ type: "dismissIntro" });
    g.run({ type: "readDocument", documentId: "casefile" });
    g.run({ type: "collect", evidenceId: "HE010" });
    g.call("call_gate");
    g.go("library");
    g.ask("iris", "iris_plans");
    g.ask("harriet", "harriet_1998");
    g.ask("harriet", "harriet_ledger");
    g.go("entrance_hall");
    g.ask("byrne", "byrne_letter");
    g.ask("amos", "amos_1998");
    g.ask("amos", "amos_statement");
    g.go("study");
    for (const h of ["st_door", "st_shelves", "st_hidden"]) g.hot(h);
    g.hot("st_stair");
    g.hot("ss_dust");
    g.hot("ss_down");
    g.hot("sc_keys");
    g.go("upstairs_corridor");
    g.hot("uc_glove");
    g.hot("uc_guest_wing");
    g.hot("gw_rose");
    g.go("morning_room");
    g.ask("josie", "josie_who");
    for (const [a, b] of [["HE004", "HE021"], ["HE001", "HE004"], ["HE019", "HE031"], ["HE029", "HE005"]]) g.pin(a, b);
    expect(["HD02", "HD03", "HD09", "HD10"].every((d) => g.s.deductions.includes(d)), `competent run deductions: ${g.s.deductions.join(", ")} (${g.errors.slice(-3).join(" | ")})`);
    g.call("call_detain");
    expect(g.s.flags.includes("crane_arrested") && g.s.flags.includes("arrested_before_midnight"), `Marsh was not detained before midnight (clock ${project(def, g.s).clock}, flags ${g.s.flags.filter((f) => f.startsWith("crane") || f.startsWith("dead")).join(",")})`);
    expect(!g.s.flags.some((f) => f.startsWith("dead_")), "someone died in the competent run");
    g.go("dining_room");
    g.ask("wren", "wren_thirteen");
    const ev = [...g.s.evidence];
    const r = g.run({ type: "submitConclusion", theory: { ...RIGHT, evidence: ev, ...fileUnder(def, ev) } as Theory, investigator: "Sam Calloway" });
    expect(r?.kind === "verdict" && r.correct, `the competent report was returned: ${r?.kind === "verdict" ? r.note : g.errors.at(-1)}`);
    expect(g.s.ending === "truth_before_midnight", `the competent run ended "${g.s.ending}", not The Truth Before Midnight`);
    expect(project(def, g.s).closure?.ending === "The Truth Before Midnight", "the closing screen does not name the ending");
    expect(!g.s.flags.includes("case_lost") && !project(def, g.s).closure?.lost, "The Truth Before Midnight was counted as a loss");
    console.log(`competent run: detained at ${project(def, g.s).clock}, ${g.s.evidence.length} evidence, ending ${g.s.ending}`);
  }

  // 4b. Whatever Marsh does, the case can be solved; and every ending turns up.
  {
    const endings = new Map<string, number>();
    const policies: Policy[] = [
      { name: "careless", first: [], officers: [], cancel: false, detain: false },
      { name: "watchful", first: ["gatehouse", "garden_maze"], officers: ["call_gate", "call_lane"], cancel: false, detain: false },
      { name: "guarded", first: ["gatehouse", "library", "dining_room"], officers: ["call_gate", "call_guard_harriet", "call_guard_bridget"], cancel: true, detain: false },
      { name: "detains", first: ["gatehouse", "garden_maze"], officers: ["call_gate", "call_lane"], cancel: true, detain: true },
    ];
    for (const p of policies) {
      for (let n = 0; n < 12; n++) {
        const s = sweep(def, `${p.name}-${n}`, p);
        const deaths = s.flags.filter((f) => f.startsWith("dead_"));
        expect(deaths.length <= 1, `${p.name}/${n}: ${deaths.length} witnesses died`);
        expect(!(s.flags.includes("crane_escaped") && s.flags.includes("crane_arrested")), `${p.name}/${n}: Marsh both escaped and was arrested`);
        if (s.status !== "closed") problems.push(`${p.name}/${n}: the right report was not accepted (${s.report.submissions.at(-1)?.note ?? "never filed"})`);
        endings.set(s.ending ?? "none", (endings.get(s.ending ?? "none") ?? 0) + 1);
        // Losing endings: Marsh got away, or someone else died. Everything else is a solve.
        const losing = /^(empty_chair|second_body_)/.test(s.ending ?? "");
        expect(losing === s.flags.includes("case_lost"), `${p.name}/${n}: ending ${s.ending} counted ${s.flags.includes("case_lost") ? "as a loss" : "as a solve"}`);
        expect(losing === Boolean(project(def, s).closure?.lost), `${p.name}/${n}: the closing screen gets the loss wrong for ${s.ending}`);
      }
    }
    const seen = [...endings.keys()];
    // The Truth Before Midnight is the competent run's (4a); a methodical sweep of every question is too slow for it.
    for (const want of ["empty_chair", "last_witness"]) expect(seen.includes(want), `no seed reached the ending ${want} (saw ${seen.join(", ")})`);
    expect(seen.some((e) => e.startsWith("second_body_")), `no seed reached A Second Body (saw ${seen.join(", ")})`);
    console.log(`endings across ${policies.length * 12} seeded investigations: ${[...endings].map(([k, v]) => `${k} ${v}`).join(", ")}`);
  }
}

/**
 * A methodical investigator who goes everywhere and asks everyone everything,
 * with Marsh acting for real, under a policy for the police. Files the right
 * report with whatever was found.
 */
type Policy = { name: string; first: string[]; officers: string[]; cancel: boolean; detain: boolean };

function sweep(def: CaseDefinition, seed: string, policy: Policy): InvestigationState {
  let s: InvestigationState = { ...newState(def, 0), seed };
  let t = 1000;
  const run = (a: GameAction) => {
    try {
      const r = reduce(def, s, a, (t += 5000));
      s = r.state;
      return r.outcome;
    } catch {
      return null;
    }
  };
  const placed = () => (project(def, s).phone.outgoing ?? []).map((c) => c.id);
  run({ type: "dismissIntro" });
  run({ type: "readDocument", documentId: "casefile" });
  run({ type: "collect", evidenceId: "HE010" });
  for (const c of policy.officers) if (placed().includes(c)) run({ type: "placeCall", callId: c });
  if (policy.cancel) run({ type: "placeCall", callId: "call_cancel" });
  const reach = (from: string, seen: Set<string>): string[] => {
    if (seen.has(from)) return [];
    seen.add(from);
    const l = def.locations.find((x) => x.id === from);
    const doors = (l?.hotspots ?? []).map((h) => (h.interaction as { locationId?: string }).locationId).filter((x): x is string => Boolean(x) && !def.locations.find((y) => y.id === x)?.onMap);
    return [from, ...doors.flatMap((d) => reach(d, seen))];
  };
  const board = new Set<string>();
  for (let round = 0; round < 6; round++) {
    const order = project(def, s).map.filter((x) => x.available).sort((a, b) => (policy.first.includes(b.id) ? 1 : 0) - (policy.first.includes(a.id) ? 1 : 0) || policy.first.indexOf(a.id) - policy.first.indexOf(b.id));
    for (const m of order) {
      for (const loc of reach(m.id, new Set())) {
        if (s.location !== loc) run({ type: "travel", locationId: loc });
        if (s.location !== loc) continue;
        for (const h of project(def, s).location.hotspots) {
          const hd = def.locations.find((l) => l.id === loc)!.hotspots.find((x) => x.id === h.id)!;
          if (hd.interaction.type === "travel") continue;
          const o = run({ type: "hotspot", hotspotId: h.id });
          if (o?.kind === "inspect" && o.evidence && !s.evidence.includes(o.evidence.id)) run({ type: "collect", evidenceId: o.evidence.id });
        }
        // The police, as soon as each request can be made.
        for (const c of policy.officers) if (placed().includes(c)) run({ type: "placeCall", callId: c });
        if (policy.detain && placed().includes("call_detain")) run({ type: "placeCall", callId: "call_detain" });
        for (const c of def.characters.filter((c) => characterLocation(c, s) === loc && check(c.available, s))) {
          run({ type: "talk", characterId: c.id });
          for (let i = 0; i < 30; i++) {
            const q = interviewCandidates(def, s, c.id).find((x) => !s.asked.includes(x.id));
            if (!q) break;
            run({ type: "ask", questionId: q.id });
          }
        }
      }
    }
    for (const c of project(def, s).phone.contacts) {
      for (let i = 0; i < 20; i++) {
        const q = interviewCandidates(def, s, c.id).find((x) => !s.asked.includes(x.id));
        if (!q) break;
        run({ type: "ask", questionId: q.id });
      }
    }
    for (const c of ["call_lab", "call_chamber"]) if (placed().includes(c)) run({ type: "placeCall", callId: c });
    if (policy.detain && placed().includes("call_detain")) run({ type: "placeCall", callId: "call_detain" });
    for (const c of [...s.pendingCalls]) run({ type: "answerCall", callId: c });
    t += 3_600_000;
    run({ type: "checkLabs" });
    for (const d of [...s.pendingDeliveries]) run({ type: "openDelivery", deliveryId: d });
    for (const d of def.deliveries) if (s.openedDeliveries.includes(d.id)) for (const e of d.evidence) if (!s.evidence.includes(e)) run({ type: "collect", evidenceId: e });
    for (const d of def.deductions)
      for (const [a, b] of d.connections) {
        for (const x of [a, b])
          if (!board.has(x) && (s.evidence.includes(x) || project(def, s).characters.some((c) => c.id === x))) {
            run({ type: "boardAdd", itemId: x, x: 10, y: 10 });
            if (s.board.items.some((i) => i.id === x)) board.add(x);
          }
        if (board.has(a) && board.has(b) && !s.deductions.includes(d.id)) run({ type: "connect", a, b });
      }
    if (policy.detain && placed().includes("call_detain")) run({ type: "placeCall", callId: "call_detain" });
  }
  if (s.location !== def.startLocation) run({ type: "travel", locationId: def.startLocation });
  const ev = [...s.evidence];
  run({ type: "submitConclusion", theory: { ...RIGHT, evidence: ev, ...fileUnder(def, ev) } as Theory, investigator: "Sweep" });
  return s;
}
