/**
 * The reference playthrough shared by every S001 case, configured per case.
 * Plays the case with the real engine as a thorough player would (every place,
 * every hotspot, everyone, every question, every call, every delivery, every
 * deduction the evidence allows) and checks:
 *
 * - each piece of evidence is reachable exactly one way, and arrives the way
 *   the design says;
 * - gated finds are hidden at the start;
 * - every deduction, event and story flag happens;
 * - a save round-trips;
 * - the report: wrong answers and an unsupported report are returned, the
 *   Final Report Standard holds, and the right report closes the case;
 * - the closing call, the series notebook entry, and no series spoilers;
 * - the whole playthrough fits the question limits without paying;
 * - the matcher reaches the right answer for everyday phrasings;
 * - nothing secret in the opening view.
 */
import { evaluateReport } from "../src/game/engine/evaluation";
import { characterLocation, interviewCandidates, newState, normalizeState, project, reduce } from "../src/game/engine/engine";
import { bestMatch } from "../src/game/engine/matcher";
import { questionsLeft } from "../src/game/engine/questions";
import { check } from "../src/game/engine/rules";
import { fileUnder, reportStandardProblems } from "./report-helpers";
import type { CaseDefinition, GameAction, InvestigationState, Theory } from "../src/game/engine/types";

export interface SeriesCaseConfig {
  /** [location, hotspot, what it is]: must not be visible at the start. */
  hidden: [string, string, string][];
  /** How each item arrives, when not found in a scene: "dialogue" or "delivery". Derived from the case when left out. */
  via?: Record<string, "dialogue" | "delivery" | "document">;
  /** Story flags the thorough playthrough must set. */
  flags: string[];
  /** The right answers, without evidence. */
  right: Record<string, string | string[]>;
  /** A set of evidence that proves every report point. */
  key: string[];
  /** Wrong answers that must be returned. */
  wrong: [Record<string, string | string[]>, string][];
  /** Evidence sets that must be returned even with the right answers when they are all the player has found, and why. */
  unsupported?: [string[], string][];
  /** The closing call's character id. */
  caller: string;
  /** Everyday phrasings: [character, words, question id or null]. */
  match: [string, string, string | null][];
  /** Text that must not be in the opening view. */
  secrets: string[];
  /** Text that must not be anywhere in the closing (later cases' secrets). */
  closingSecrets?: RegExp;
  /** Items the player presents to whoever is in front of them, when held. */
  present?: string[];
  /** Evidence only an action the vague player never takes can bring (showing something to someone). */
  vagueExempt?: string[];
  /** Evidence, deductions and events the thorough player need not reach (made only by what an adversary does). */
  optional?: string[];
  /** Plays a version of the case (for example without its adversary, so the content can be checked on its own). */
  variant?: (def: CaseDefinition) => CaseDefinition;
}

export function checkSeriesCase(id: string, full: CaseDefinition, problems: string[], cfg: SeriesCaseConfig) {
  const def = cfg.variant ? cfg.variant(full) : full;
  const optional = new Set(cfg.optional ?? []);
  const expect = (ok: unknown, msg: string) => {
    if (!ok) problems.push(msg);
  };

  // ---- each piece of evidence is reachable exactly one way ----
  const json = JSON.stringify(def);
  const scene = def.locations.flatMap((l) => l.hotspots.map((h) => (h.interaction as { evidence?: string }).evidence).filter(Boolean));
  const delivered = def.deliveries.flatMap((d) => d.evidence);
  const given = [...json.matchAll(/"giveEvidence":"([^"]+)"/g)].map((m) => m[1]);
  const documented = def.documents.flatMap((d) => d.evidence);
  for (const e of def.evidence) {
    const routes = scene.filter((x) => x === e.id).length + delivered.filter((x) => x === e.id).length + documented.filter((x) => x === e.id).length + (given.includes(e.id) ? 1 : 0);
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
  const visible = (loc: string, hotspot: string) => {
    const saved = s.location;
    s = { ...s, location: loc };
    const there = project(def, s).location.hotspots.some((h) => h.id === hotspot);
    s = { ...s, location: saved };
    return there;
  };

  run({ type: "dismissIntro" });
  const file = run({ type: "readDocument", documentId: "casefile" });
  if (file?.kind === "document") for (const e of file.evidence) if (!e.collected) run({ type: "collect", evidenceId: e.id });
  for (const [loc, h, what] of cfg.hidden) expect(!visible(loc, h), `${what} is visible at the start`);

  const present = new Set(cfg.present ?? []);
  const board = new Set<string>();
  const exhaust = (cid: string) => {
    run({ type: "talk", characterId: cid });
    for (let i = 0; i < 60; i++) {
      const q = interviewCandidates(def, s, cid).find((x) => !s.asked.includes(x.id));
      if (!q) break;
      const n = s.asked.length;
      run({ type: "ask", questionId: q.id });
      if (s.asked.length === n) break;
    }
    for (const e of s.evidence) if (present.has(e) && !s.presented.includes(`${cid}:${e}`)) run({ type: "present", characterId: cid, evidenceId: e });
  };
  // Sub-scenes are reached through doors from the scenes on the map.
  const reach = (from: string, seen: Set<string>): string[] => {
    if (seen.has(from)) return [];
    seen.add(from);
    const l = def.locations.find((x) => x.id === from);
    const doors = (l?.hotspots ?? []).map((h) => (h.interaction as { locationId?: string }).locationId).filter((x): x is string => Boolean(x) && !def.locations.find((y) => y.id === x)?.onMap);
    return [from, ...doors.flatMap((d) => reach(d, seen))];
  };
  const progress = () => s.evidence.length + s.deductions.length + s.asked.length + s.answeredCalls.length + s.openedDeliveries.length + s.events.length + s.flags.length + s.inspected.length + s.visited.length;
  for (let round = 0; round < 40; round++) {
    const before = progress();
    for (const m of project(def, s).map.filter((x) => x.available)) {
      for (const loc of reach(m.id, new Set())) {
        if (s.location !== loc) run({ type: "travel", locationId: loc });
        if (s.location !== loc) continue;
        for (const h of project(def, s).location.hotspots) {
          if (h.local) continue;
          const hd = def.locations.find((l) => l.id === loc)!.hotspots.find((x) => x.id === h.id)!;
          if (hd.interaction.type === "travel") continue;
          const o = run({ type: "hotspot", hotspotId: h.id });
          if (o?.kind === "inspect" && o.evidence && !s.evidence.includes(o.evidence.id)) run({ type: "collect", evidenceId: o.evidence.id });
        }
        for (const c of def.characters.filter((c) => characterLocation(c, s) === loc && check(c.available, s))) exhaust(c.id);
        for (const c of project(def, s).phone.outgoing) if (!s.answeredCalls.includes(c.id)) run({ type: "placeCall", callId: c.id });
      }
    }
    for (const c of project(def, s).phone.contacts) exhaust(c.id);
    for (const c of project(def, s).phone.outgoing) if (!s.answeredCalls.includes(c.id)) run({ type: "placeCall", callId: c.id });
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
    if (progress() === before && round > 2) break;
  }

  const missing = def.evidence.map((e) => e.id).filter((e) => !s.evidence.includes(e) && !optional.has(e));
  expect(!missing.length, `a thorough playthrough never finds ${missing.join(", ")}`);
  const unmade = def.deductions.map((d) => d.id).filter((d) => !s.deductions.includes(d) && !optional.has(d));
  expect(!unmade.length, `a thorough playthrough never makes ${unmade.join(", ")}`);
  for (const e of def.events) if (!optional.has(e.id)) expect(s.events.includes(e.id), `event ${e.id} never fired`);
  for (const f of cfg.flags) expect(s.flags.includes(f), `flag ${f} never set`);
  if (def.chapters?.length) expect((s.chapters?.current ?? 1) >= def.chapters.length, `the playthrough stops at chapter ${s.chapters?.current}`);

  for (const e of def.evidence) {
    const via = s.discoveries[e.id]?.via;
    if (!via) continue;
    const want = cfg.via?.[e.id] ?? (delivered.includes(e.id) ? "delivery" : given.includes(e.id) ? "dialogue" : documented.includes(e.id) ? "document" : "scene");
    const got = via === "scene" || via === "delivery" || via === "document" ? via : "dialogue";
    expect(got === want, `${e.id} arrived via ${via}, expected ${want}`);
  }

  const reloaded = normalizeState(def, JSON.parse(JSON.stringify(s)));
  expect(reloaded.evidence.length === s.evidence.length && reloaded.deductions.length === s.deductions.length && reloaded.events.length === s.events.length, "state lost on reload");

  // ---- the report ----
  if (s.location !== def.startLocation && def.locations.some((l) => l.id === "office")) run({ type: "travel", locationId: "office" });
  const report = project(def, s).conclusion;
  expect(report.available, "the report is not available at the end of a thorough playthrough");
  expect(report.choices.length === def.conclusionChoices.length, `the report shows ${report.choices.length} of ${def.conclusionChoices.length} questions`);
  const T = (over: Record<string, unknown>, evidence = cfg.key): Theory => ({ ...cfg.right, evidence, ...fileUnder(def, evidence), ...over }) as Theory;
  // Each wrong report is tried on the same save, so one that is wrongly accepted can't hide the rest.
  const ready = s;
  for (const [over, what] of cfg.wrong) {
    const o = run({ type: "submitConclusion", theory: T(over) });
    expect(o?.kind === "verdict" && !o.correct, `${what} was accepted`);
    s = ready;
  }
  for (const [ev, what] of cfg.unsupported ?? []) {
    // Every collected item goes with a report, so this is the review an investigation that found only these items would get.
    const r = evaluateReport(def, { ...(cfg.right as Omit<Theory, "evidence">), evidence: ev } as Theory, ready, 0);
    expect(!r.accepted, `${what} was accepted`);
  }
  expect(s.status === "active", "a returned report closed the case");
  problems.push(...reportStandardProblems(def, s, cfg.right as Omit<Theory, "evidence">, cfg.key));
  const good = run({ type: "submitConclusion", theory: T({}), investigator: "Sam Calloway" });
  expect(good?.kind === "verdict" && good.correct, `correct report returned: ${good?.kind === "verdict" ? good.note : (good?.kind ?? errors.at(-1))}`);
  expect(s.status === "closed", "case not closed");
  const closure = project(def, s).closure;
  expect(closure?.caller?.characterId === cfg.caller, `closing call is from ${closure?.caller?.characterId}, not ${cfg.caller}`);
  if (/^S\d{3}C\d{2}$/.test(id)) expect(closure?.series?.seriesId === "S001", "the closed case does not write the series notebook");
  const closingText = JSON.stringify(closure ?? {});
  expect(!/Clearwater|MAG-RM|account 20417/i.test(closingText) || id >= "S001C04", "the closing names the leak channel before C04");
  if (cfg.closingSecrets) expect(!cfg.closingSecrets.test(closingText), "the closing gives away a later case");

  // ---- a player who never finds the right words still gets to the report ----
  {
    const v = vaguePlaythrough(def);
    const exempt = new Set(cfg.vagueExempt ?? []);
    const stuck = v.evidence.filter((e) => !exempt.has(e) && !optional.has(e));
    if (stuck.length) problems.push(`vague player: never gets ${stuck.join(", ")} (nothing volunteers it)`);
    const vd = v.deductions.filter((d) => !optional.has(d));
    if (vd.length) problems.push(`vague player: never makes ${vd.join(", ")}`);
    if (!v.report) problems.push(`vague player: the report never opens (stuck in chapter ${v.chapter})`);
  }

  // ---- the question limits ----
  for (const c of def.characters) {
    const used = s.asked.filter((q) => def.questions.find((x) => x.id === q)?.characterId === c.id).length + s.presented.filter((k) => k.startsWith(`${c.id}:`)).length;
    const cap = questionsLeft(def, newState(def, 0), c.id);
    const granted = (def.reinterviews ?? []).filter((g) => g.characterId === c.id).reduce((n, g) => n + (g.questions ?? 5), 0);
    if (cap !== null && used > cap + granted) problems.push(`the thorough playthrough needs ${used} questions with ${c.name}, more than ${cap} + ${granted}`);
  }

  // ---- the matcher ----
  let hits = 0;
  for (const [cid, text, want] of cfg.match) {
    const got = bestMatch(text, def.questions.filter((q) => q.characterId === cid));
    if (got === want) hits++;
    else problems.push(`matcher: "${text}" (${cid}) got ${got}, wanted ${want}`);
  }
  if (cfg.match.length && hits / cfg.match.length < 0.9) problems.push(`matcher accuracy ${hits}/${cfg.match.length}`);

  // ---- nothing secret in the opening view ----
  const view = JSON.stringify(project(def, newState(def)));
  for (const secret of ["\"standard\"", "linkToSuspect", "knowledge", "reconstruction", ...cfg.secrets]) if (view.includes(secret)) problems.push(`initial view leaks ${secret}`);

  const real = errors.filter((e) => !/already|not available|isn't|can't|No further|not on the board|nothing new|not here|Nothing/i.test(e));
  if (real.length) console.log(`(engine refused ${real.length} moves in the thorough playthrough, e.g. ${[...new Set(real)].slice(0, 4).join(" | ")})`);
  console.log(`${id}: ${def.evidence.length} evidence, ${def.locations.length} locations, ${def.questions.length} questions, ${def.deductions.length} deductions, ${def.events.length} events`);
  console.log(`playthrough: status=${s.status} attempts=${s.attempts} chapter=${s.chapters?.current ?? "-"} events=${s.events.join(",")} matcher=${hits}/${cfg.match.length}`);
}


/**
 * A player who never finds the right words: everywhere, everyone, every call
 * and delivery, but the only question ever asked is a vague one. Returns what
 * such a player cannot reach, which should be nothing that blocks the case.
 */
export function vaguePlaythrough(def: CaseDefinition) {
  let s: InvestigationState = newState(def, 0);
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
  run({ type: "dismissIntro" });
  const file = run({ type: "readDocument", documentId: "casefile" });
  if (file?.kind === "document") for (const e of file.evidence) if (!e.collected) run({ type: "collect", evidenceId: e.id });
  const board = new Set<string>();
  const reach = (from: string, seen: Set<string>): string[] => {
    if (seen.has(from)) return [];
    seen.add(from);
    const l = def.locations.find((x) => x.id === from);
    const doors = (l?.hotspots ?? []).map((h) => (h.interaction as { locationId?: string }).locationId).filter((x): x is string => Boolean(x) && !def.locations.find((y) => y.id === x)?.onMap);
    return [from, ...doors.flatMap((d) => reach(d, seen))];
  };
  // Like a real player: back to someone only when something new has happened since, and on until two questions bring nothing.
  const lastSeen: Record<string, number> = {};
  const world = () => s.evidence.length + s.deductions.length + s.events.length + s.flags.length + (s.chapters?.current ?? 0) + s.visited.length;
  const vague = (cid: string) => {
    if (lastSeen[cid] === world()) return;
    run({ type: "talk", characterId: cid });
    let idle = 0;
    for (let i = 0; i < 12 && idle < 2; i++) {
      const before = s.evidence.length + s.asked.length + s.flags.length;
      run({ type: "askFree", characterId: cid, text: "Is there anything else you can tell me?", match: null, composed: null, facts: null });
      idle = s.evidence.length + s.asked.length + s.flags.length === before ? idle + 1 : 0;
    }
    lastSeen[cid] = world();
  };
  const progress = () => s.evidence.length + s.deductions.length + s.answeredCalls.length + s.openedDeliveries.length + s.events.length + s.flags.length + s.inspected.length;
  for (let round = 0; round < 40; round++) {
    const before = progress();
    for (const m of project(def, s).map.filter((x) => x.available)) {
      for (const loc of reach(m.id, new Set())) {
        if (s.location !== loc) run({ type: "travel", locationId: loc });
        if (s.location !== loc) continue;
        for (const h of project(def, s).location.hotspots) {
          if (h.local) continue;
          const hd = def.locations.find((l) => l.id === loc)!.hotspots.find((x) => x.id === h.id)!;
          if (hd.interaction.type === "travel") continue;
          const o = run({ type: "hotspot", hotspotId: h.id });
          if (o?.kind === "inspect" && o.evidence && !s.evidence.includes(o.evidence.id)) run({ type: "collect", evidenceId: o.evidence.id });
        }
        for (const c of def.characters.filter((c) => characterLocation(c, s) === loc && check(c.available, s))) vague(c.id);
        for (const c of project(def, s).phone.outgoing) if (!s.answeredCalls.includes(c.id)) run({ type: "placeCall", callId: c.id });
      }
    }
    for (const c of project(def, s).phone.contacts) vague(c.id);
    for (const c of project(def, s).phone.outgoing) if (!s.answeredCalls.includes(c.id)) run({ type: "placeCall", callId: c.id });
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
    if (progress() === before && round > 2) break;
  }
  return {
    evidence: def.evidence.map((e) => e.id).filter((e) => !s.evidence.includes(e)),
    deductions: def.deductions.map((d) => d.id).filter((d) => !s.deductions.includes(d)),
    events: def.events.map((e) => e.id).filter((e) => !s.events.includes(e)),
    chapter: s.chapters?.current ?? null,
    report: project(def, s).conclusion.available,
    state: s,
  };
}
