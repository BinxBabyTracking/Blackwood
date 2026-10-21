import type { CaseDefinition, Condition, Discovery, Effect, InvestigationState } from "./types";

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
  if ("presented" in c) return s.presented.includes(c.presented);
  if ("contradiction" in c) return (s.contradictions ?? []).includes(c.contradiction);
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

/** Fires every reactive event whose trigger is now satisfied. Each fires at most once. */
export function runEvents(s: InvestigationState, def: CaseDefinition) {
  let fired = true;
  // Loop so an event's effects can satisfy another event's trigger in the same action.
  for (let guard = 0; fired && guard < 10; guard++) {
    fired = false;
    for (const ev of def.events) {
      if (s.events.includes(ev.id) || !check(ev.trigger, s)) continue;
      s.events.push(ev.id);
      apply(ev.effects, s, def);
      fired = true;
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
