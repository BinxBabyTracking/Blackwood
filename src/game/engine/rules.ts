import { clockMinutes } from "./clock";
import type { CaseDefinition, Condition, Discovery, Effect, InvestigationState, ReactiveEventDef } from "./types";

/** Evaluates a rule condition against the current investigation state. */
export function check(c: Condition | undefined, s: InvestigationState): boolean {
  if (!c) return true;
  if ("all" in c) return c.all.every((x) => check(x, s));
  if ("any" in c) return c.any.some((x) => check(x, s));
  if ("not" in c) return !check(c.not, s);
  if ("flag" in c) return s.flags.includes(c.flag);
  if ("hasEvidence" in c) return s.evidence.includes(c.hasEvidence);
  if ("inspected" in c) return s.inspected.includes(c.inspected);
  if ("visited" in c) return s.visited.includes(c.visited);
  if ("asked" in c) return s.asked.includes(c.asked);
  if ("talkedTo" in c) return s.talkedTo.includes(c.talkedTo);
  if ("deduction" in c) return s.deductions.includes(c.deduction);
  if ("event" in c) return s.events.includes(c.event);
  if ("env" in c) return (s.env[c.env] ?? "A") === c.is; // every environment starts in state A
  if ("at" in c) return s.location === c.at;
  if ("evidenceCount" in c) return s.evidence.length >= c.evidenceCount;
  if ("boardConnections" in c) return (s.board?.connections?.length ?? 0) >= c.boardConnections;
  if ("presented" in c) return s.presented.includes(c.presented);
  if ("contradiction" in c) return (s.contradictions ?? []).includes(c.contradiction);
  if ("eventState" in c) {
    const st = s.eventStates?.[c.eventState] ?? "locked";
    return Array.isArray(c.is) ? c.is.includes(st) : st === c.is;
  }
  if ("callPending" in c) return s.pendingCalls.includes(c.callPending);
  if ("callAnswered" in c) return s.answeredCalls.includes(c.callAnswered);
  if ("deliveryPending" in c) return s.pendingDeliveries.includes(c.deliveryPending);
  if ("deliveryOpened" in c) return s.openedDeliveries.includes(c.deliveryOpened);
  if ("labStarted" in c) return Boolean(s.labs?.[c.labStarted]);
  if ("labReady" in c) return Boolean(s.labs?.[c.labReady]?.done);
  if ("chapter" in c) return (s.chapters?.current ?? 1) >= c.chapter;
  if ("chapterDone" in c) return Boolean(s.chapters?.completed.some((r) => r.number === c.chapterDone));
  if ("clockAt" in c) return s.clock !== undefined && s.clock >= clockMinutes(c.clockAt);
  if ("moved" in c) return Boolean(s.adversary?.done.includes(c.moved));
  if ("attempts" in c) return (s.attempts ?? 0) >= c.attempts;
  if ("always" in c) return true;
  return false;
}

function add(list: string[], v: string) {
  if (!list.includes(v)) list.push(v);
}

/** Applies effects in place. Every effect is idempotent so replaying is safe. */
export function apply(effects: Effect[] | undefined, s: InvestigationState, def: CaseDefinition) {
  for (const e of effects ?? []) {
    if ("setFlag" in e) add(s.flags, e.setFlag);
    else if ("clearFlag" in e) s.flags = s.flags.filter((f) => f !== e.clearFlag);
    else if ("giveEvidence" in e) collectEvidence(s, def, e.giveEvidence, "dialogue");
    else if ("setEnv" in e) s.env[e.setEnv] = e.to;
    else if ("unlockLocation" in e) add(s.unlocked, e.unlockLocation);
    else if ("note" in e) {
      if (!s.notebook.some((n) => n.id === e.note.id)) s.notebook.push({ ...e.note, at: Date.now() });
    } else if ("timeline" in e) {
      if (!s.timeline.some((t) => t.time === e.timeline.time && t.text === e.timeline.text)) s.timeline.push(e.timeline);
    } else if ("incomingCall" in e) {
      if (!s.answeredCalls.includes(e.incomingCall)) add(s.pendingCalls, e.incomingCall);
    } else if ("delivery" in e) {
      if (!s.openedDeliveries.includes(e.delivery)) add(s.pendingDeliveries, e.delivery);
    } else if ("message" in e) add(s.messages, e.message);
    else if ("unlockQuestion" in e) add((s.unlockedQuestions ??= []), e.unlockQuestion);
    else if ("text" in e) {
      const t = def.texts?.find((x) => x.id === e.text);
      s.texts ??= [];
      if (t && !s.texts.includes(t.id)) {
        s.texts.push(t.id);
        const from = def.characters.find((c) => c.id === t.from)?.name ?? "Unknown";
        add(s.messages, `New text from ${from}: "${t.body}"`);
        if (!s.notebook.some((n) => n.id === `text:${t.id}`)) {
          s.notebook.push({ id: `text:${t.id}`, kind: "call", title: `Text from ${from}`, text: t.body, characterId: t.from, at: Date.now() });
        }
        // The text sits in the sender's message thread too, so it can be answered there.
        (s.conversations[t.from] ??= []).push({ speaker: t.from, text: t.body, kind: "answer", q: `text:${t.id}`, via: "text", at: s.lastActionAt });
      }
    }
    else if ("startLab" in e) {
      const lab = def.labs?.find((l) => l.id === e.startLab);
      s.labs ??= {};
      if (lab && !s.labs[lab.id]) s.labs[lab.id] = { startedAt: s.lastActionAt, readyAt: s.lastActionAt + lab.seconds * 1000, done: false };
    }
    else if ("deduce" in e) {
      const d = def.deductions.find((x) => x.id === e.deduce);
      if (d && !s.deductions.includes(d.id)) {
        s.deductions.push(d.id);
        if (!s.notebook.some((n) => n.id === `deduction:${d.id}`)) s.notebook.push({ id: `deduction:${d.id}`, kind: "event", title: `Deduction: ${d.title}`, text: d.text, at: Date.now() });
        apply(d.effects, s, def);
      }
    }
    else if ("when" in e) {
      if (check(e.when, s)) apply(e.then, s, def);
    }
  }
}

/** Adds evidence to the notebook once. Returns false if it was already collected. */
export function collectEvidence(s: InvestigationState, def: CaseDefinition, id: string, via: Discovery["via"] = "scene", now = Date.now()) {
  const ev = def.evidence.find((x) => x.id === id);
  if (!ev || s.evidence.includes(id)) return false;
  s.evidence.push(id);
  s.discoveries ??= {};
  s.discoveries[id] = { locationId: s.location, sceneState: s.env[s.location] ?? "A", via, at: now };
  if (!s.notebook.some((n) => n.id === `evidence:${id}`)) {
    s.notebook.push({ id: `evidence:${id}`, kind: "observation", title: `${ev.id}: ${ev.title}`, text: ev.description, at: Date.now() });
  }
  return true;
}

/** Whether every requirement for an event to become available holds. */
function eventReady(ev: ReactiveEventDef, s: InvestigationState) {
  return (
    check(ev.requires, s) &&
    (ev.requiresFlags ?? []).every((f) => s.flags.includes(f)) &&
    (ev.requiresEvidence ?? []).every((e) => s.evidence.includes(e)) &&
    (ev.requiresDeductions ?? []).every((d) => s.deductions.includes(d)) &&
    (ev.requiresInterviews ?? []).every((q) => s.asked.includes(q))
  );
}

/**
 * The reactive event engine. Advances every event through its lifecycle as far
 * as the current state allows, one stage at a time, and never backwards.
 * Events are independent: each keeps its own state and effects, so any order
 * of discovery produces the same facts. Runs after every player action.
 */
export function runEvents(s: InvestigationState, def: CaseDefinition) {
  s.eventStates ??= {};
  let changed = true;
  // Loop so one event's effects can advance another in the same action.
  for (let guard = 0; changed && guard < 20; guard++) {
    changed = false;
    for (const ev of def.events) {
      const st = s.eventStates[ev.id];
      if (st === "completed") continue;
      if (!st) {
        if (!eventReady(ev, s)) continue;
        s.eventStates[ev.id] = "available";
        apply(ev.onAvailable, s, def);
        changed = true;
      } else if (st === "available") {
        if (!check(ev.activate, s)) continue;
        s.eventStates[ev.id] = "active";
        add(s.events, ev.id);
        apply(ev.onActivate, s, def);
        changed = true;
      } else if (st === "active") {
        if (!check(ev.complete, s)) continue;
        s.eventStates[ev.id] = "completed";
        for (const q of ev.unlocksQuestions ?? []) add((s.unlockedQuestions ??= []), q);
        apply(ev.onComplete, s, def);
        changed = true;
      }
    }
  }
}

/** Records every contradiction whose supporting evidence is now established. Each is recorded once. */
export function runContradictions(s: InvestigationState, def: CaseDefinition) {
  s.contradictions ??= [];
  for (const c of def.contradictions ?? []) {
    if (s.contradictions.includes(c.id) || !check(c.when, s)) continue;
    s.contradictions.push(c.id);
    apply([{ note: { id: `contradiction:${c.id}`, kind: "contradiction", title: c.title, text: c.text, characterId: c.characterId } }], s, def);
  }
}

/** The manner a character currently shows: the last demeanor whose condition holds. */
export function demeanorOf(def: CaseDefinition, s: InvestigationState, characterId: string) {
  const c = def.characters.find((x) => x.id === characterId);
  return [...(c?.demeanor ?? [])].reverse().find((d) => check(d.requires, s)) ?? null;
}

/** Notices changes of manner and writes a stage cue into that character's transcript once. */
export function runDemeanor(s: InvestigationState, def: CaseDefinition) {
  s.demeanor ??= {};
  for (const c of def.characters) {
    if (!c.demeanor?.length) continue;
    const d = demeanorOf(def, s, c.id);
    const id = d?.id ?? "";
    if ((s.demeanor[c.id] ?? "") === id) continue;
    s.demeanor[c.id] = id;
    if (d?.cue && s.conversations[c.id]?.length) s.conversations[c.id].push({ speaker: "cue", text: d.cue, kind: "cue" });
  }
}
