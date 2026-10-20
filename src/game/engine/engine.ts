import { apply, check, collectEvidence, runEvents } from "./rules";
import type {
  ActionOutcome,
  ActionResponse,
  CaseDefinition,
  ClientView,
  GameAction,
  InvestigationState,
  LocationDef,
  Theory,
} from "./types";

const IDLE_CAP_MS = 5 * 60 * 1000;
const MAX_NOTES = 20000;

export function newState(def: CaseDefinition, now = Date.now()): InvestigationState {
  return {
    version: 1,
    caseId: def.id,
    status: "active",
    introSeen: false,
    location: def.startLocation,
    visited: [def.startLocation],
    unlocked: [],
    inspected: [],
    evidence: [],
    flags: [],
    asked: [],
    presented: [],
    talkedTo: [],
    conversations: {},
    notebook: [],
    timeline: [...def.timeline],
    playerNotes: "",
    board: { items: [], connections: [] },
    deductions: [],
    events: [],
    env: {},
    pendingCalls: [],
    answeredCalls: [],
    pendingDeliveries: [],
    openedDeliveries: [],
    readDocuments: [],
    messages: [],
    attempts: 0,
    activeSeconds: 0,
    lastActionAt: now,
    closedAt: null,
  };
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

const loc = (def: CaseDefinition, id: string) => def.locations.find((l) => l.id === id);
const char = (def: CaseDefinition, id: string) => def.characters.find((c) => c.id === id);

function locationAvailable(def: CaseDefinition, s: InvestigationState, l: LocationDef) {
  return s.unlocked.includes(l.id) || check(l.available, s);
}

function visibleHotspots(def: CaseDefinition, s: InvestigationState, l: LocationDef) {
  return l.hotspots.filter((h) => check(h.visible, s));
}

function characterHere(def: CaseDefinition, s: InvestigationState, id: string) {
  const c = char(def, id);
  return Boolean(c && c.locationId === s.location && check(c.available, s));
}

/** Evidence the player has legitimately uncovered and may now collect. */
function discoverable(def: CaseDefinition, s: InvestigationState, evidenceId: string) {
  for (const l of def.locations) {
    for (const h of l.hotspots) {
      if (h.interaction.type === "inspect" && h.interaction.evidence === evidenceId && s.inspected.includes(h.id) && check(h.visible, s)) {
        return true;
      }
    }
  }
  if (def.documents.some((d) => d.evidence.includes(evidenceId) && s.readDocuments.includes(d.id))) return true;
  if (def.deliveries.some((d) => d.evidence.includes(evidenceId) && s.openedDeliveries.includes(d.id))) return true;
  return false;
}

function knownCharacters(def: CaseDefinition, s: InvestigationState) {
  return def.characters.filter((c) => s.flags.includes("casefile_read") || s.talkedTo.includes(c.id));
}

// ---------------------------------------------------------------------------
// Conversation helpers
// ---------------------------------------------------------------------------

function availableQuestions(def: CaseDefinition, s: InvestigationState, characterId: string) {
  return def.questions.filter(
    (q) => q.characterId === characterId && check(q.requires, s) && (q.repeatable || !s.asked.includes(q.id)),
  );
}

function conversationOutcome(def: CaseDefinition, s: InvestigationState, characterId: string): ActionOutcome {
  const c = char(def, characterId)!;
  const questions = availableQuestions(def, s, characterId).map((q) => ({ id: q.id, prompt: q.prompt }));
  return {
    kind: "conversation",
    characterId,
    history: (s.conversations[characterId] ?? []).map((h) => ({ speaker: h.speaker === "you" ? "You" : c.name, text: h.text })),
    questions,
    available: characterHere(def, s, characterId),
  };
}

function say(s: InvestigationState, characterId: string, you: string, lines: string[]) {
  const log = (s.conversations[characterId] ??= []);
  log.push({ speaker: "you", text: you });
  for (const l of lines) log.push({ speaker: characterId, text: l });
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export class GameError extends Error {}

function fail(message: string): never {
  throw new GameError(message);
}

function evaluateTheory(def: CaseDefinition, t: Theory) {
  const sol = def.solution;
  const core = t.culprit === sol.culprit && t.motive === sol.motive && t.weapon === sol.weapon && t.location === sol.location;
  const covered = sol.evidenceGroups.filter((g) => g.anyOf.some((id) => t.evidence.includes(id))).length;
  return { core, supported: covered >= sol.minGroups, covered };
}

/**
 * Applies one player action. Pure apart from the clock: returns the new state
 * and the outcome to show. Throws GameError for actions the rules do not allow.
 */
export function reduce(
  def: CaseDefinition,
  prev: InvestigationState,
  action: GameAction,
  now = Date.now(),
): { state: InvestigationState; outcome: ActionOutcome } {
  const s: InvestigationState = structuredClone(prev);
  const idle = now - s.lastActionAt;
  if (idle > 0 && idle < IDLE_CAP_MS) s.activeSeconds += Math.round(idle / 1000);
  s.lastActionAt = now;

  if (s.status === "closed" && action.type !== "saveNotes" && action.type !== "dismissMessages") {
    fail("This case is closed.");
  }

  let outcome: ActionOutcome = { kind: "none" };
  const inOffice = s.location === def.startLocation;

  switch (action.type) {
    case "dismissIntro":
      s.introSeen = true;
      break;

    case "travel": {
      const l = loc(def, action.locationId) ?? fail("Unknown location.");
      if (!locationAvailable(def, s, l)) fail("That location is not available yet.");
      s.location = l.id;
      if (!s.visited.includes(l.id)) s.visited.push(l.id);
      apply(l.effectsOnEnter, s, def);
      break;
    }

    case "hotspot": {
      const l = loc(def, s.location)!;
      const h = visibleHotspots(def, s, l).find((x) => x.id === action.hotspotId) ?? fail("There is nothing like that here.");
      const it = h.interaction;
      if (it.type === "travel") {
        return reduce(def, s, { type: "travel", locationId: it.locationId }, now);
      }
      if (it.type === "talk") {
        return reduce(def, s, { type: "talk", characterId: it.characterId }, now);
      }
      if (it.type === "panel") {
        if (!s.inspected.includes(h.id)) s.inspected.push(h.id);
        outcome = { kind: "panel", panel: it.panel };
        break;
      }
      if (!s.inspected.includes(h.id)) s.inspected.push(h.id);
      apply(it.effects, s, def);
      const text = [...(it.textAfter ?? [])].reverse().find((t) => check(t.requires, s))?.text ?? it.text;
      const image = it.image ? def.assets.images[it.image] ?? null : it.evidence ? def.assets.images[def.evidence.find((e) => e.id === it.evidence)!.image] ?? null : null;
      outcome = {
        kind: "inspect",
        title: it.title,
        text,
        image,
        evidenceId: it.evidence ?? null,
        collected: it.evidence ? s.evidence.includes(it.evidence) : false,
      };
      break;
    }

    case "collect": {
      if (!discoverable(def, s, action.evidenceId)) fail("You have not found that yet.");
      collectEvidence(s, def, action.evidenceId);
      break;
    }

    case "readDocument": {
      const d = def.documents.find((x) => x.id === action.documentId) ?? fail("Unknown document.");
      if (!inOffice) fail("Your files are at the office.");
      if (!s.readDocuments.includes(d.id)) s.readDocuments.push(d.id);
      apply(d.effectsOnRead, s, def);
      outcome = {
        kind: "document",
        id: d.id,
        title: d.title,
        pages: d.pages,
        evidence: d.evidence.map((id) => ({ id, title: def.evidence.find((e) => e.id === id)!.title, collected: s.evidence.includes(id) })),
      };
      break;
    }

    case "talk": {
      const c = char(def, action.characterId) ?? fail("Unknown person.");
      if (!characterHere(def, s, c.id)) fail(`${c.name} is not here.`);
      if (!s.talkedTo.includes(c.id)) s.talkedTo.push(c.id);
      outcome = conversationOutcome(def, s, c.id);
      break;
    }

    case "ask": {
      const q = def.questions.find((x) => x.id === action.questionId) ?? fail("Unknown question.");
      if (!characterHere(def, s, q.characterId)) fail("They are not here.");
      if (!check(q.requires, s) || (!q.repeatable && s.asked.includes(q.id))) fail("That question is not available.");
      const c = char(def, q.characterId)!;
      if (!s.asked.includes(q.id)) s.asked.push(q.id);
      if (!s.talkedTo.includes(c.id)) s.talkedTo.push(c.id);
      say(s, c.id, q.prompt, q.reply);
      if (!q.repeatable) {
        apply([{ note: { id: `q:${q.id}`, kind: "interview", title: `${c.name}: ${q.prompt}`, text: q.reply.join(" "), characterId: c.id } }], s, def);
      }
      apply(q.effects, s, def);
      outcome = conversationOutcome(def, s, c.id);
      break;
    }

    case "present": {
      const c = char(def, action.characterId) ?? fail("Unknown person.");
      if (!characterHere(def, s, c.id)) fail(`${c.name} is not here.`);
      if (!s.evidence.includes(action.evidenceId)) fail("You do not have that evidence.");
      const ev = def.evidence.find((e) => e.id === action.evidenceId)!;
      const r = [...def.reactions].reverse().find((x) => x.characterId === c.id && x.evidenceId === ev.id && check(x.requires, s));
      const key = `${c.id}:${ev.id}`;
      if (!s.presented.includes(key)) s.presented.push(key);
      if (!s.talkedTo.includes(c.id)) s.talkedTo.push(c.id);
      const lines = r ? r.reply : [c.defaultEvidenceReply];
      say(s, c.id, `[You show ${c.name.split(" ")[0]} the ${ev.title.toLowerCase()}.]`, lines);
      if (r) {
        apply([{ note: { id: `p:${key}:${def.reactions.indexOf(r)}`, kind: "interview", title: `${c.name} on ${ev.title}`, text: r.reply.join(" "), characterId: c.id } }], s, def);
        apply(r.effects, s, def);
      }
      outcome = conversationOutcome(def, s, c.id);
      break;
    }

    case "answerCall": {
      if (!inOffice) fail("The telephone is at the office.");
      if (!s.pendingCalls.includes(action.callId)) fail("No one is on the line.");
      const call = def.calls.find((x) => x.id === action.callId)!;
      s.pendingCalls = s.pendingCalls.filter((x) => x !== call.id);
      s.answeredCalls.push(call.id);
      apply([{ note: { id: `call:${call.id}`, kind: "call", title: call.title, text: call.lines.join(" "), characterId: call.from } }], s, def);
      apply(call.effects, s, def);
      outcome = { kind: "call", title: call.title, from: char(def, call.from)?.name ?? "Caller", lines: call.lines };
      break;
    }

    case "placeCall": {
      if (!inOffice) fail("The telephone is at the office.");
      const call = def.outgoingCalls.find((x) => x.id === action.callId) ?? fail("Unknown call.");
      if (!check(call.available, s) || check(call.done, s)) fail("There is no reason to make that call right now.");
      apply([{ note: { id: `call:${call.id}`, kind: "call", title: call.label, text: call.lines.join(" "), characterId: call.to } }], s, def);
      apply(call.effects, s, def);
      if (!s.answeredCalls.includes(call.id)) s.answeredCalls.push(call.id);
      outcome = { kind: "call", title: call.label, from: char(def, call.to)?.name ?? "", lines: call.lines };
      break;
    }

    case "openDelivery": {
      if (!inOffice) fail("Deliveries arrive at the office.");
      const d = def.deliveries.find((x) => x.id === action.deliveryId) ?? fail("Unknown delivery.");
      if (!s.pendingDeliveries.includes(d.id) && !s.openedDeliveries.includes(d.id)) fail("Nothing has arrived.");
      s.pendingDeliveries = s.pendingDeliveries.filter((x) => x !== d.id);
      if (!s.openedDeliveries.includes(d.id)) {
        s.openedDeliveries.push(d.id);
        apply([{ note: { id: `delivery:${d.id}`, kind: "document", title: d.title, text: d.text } }], s, def);
      }
      outcome = {
        kind: "delivery",
        title: d.title,
        text: d.text,
        evidence: d.evidence.map((id) => ({ id, title: def.evidence.find((e) => e.id === id)!.title, collected: s.evidence.includes(id) })),
      };
      break;
    }

    case "boardAdd": {
      const known = s.evidence.includes(action.itemId)
        ? def.evidence.find((e) => e.id === action.itemId)?.boardable
        : knownCharacters(def, s).some((c) => c.id === action.itemId && c.onBoard);
      if (!known) fail("You cannot pin that to the board.");
      if (!s.board.items.some((i) => i.id === action.itemId)) {
        s.board.items.push({ id: action.itemId, x: clamp(action.x), y: clamp(action.y) });
      }
      break;
    }

    case "boardMove": {
      const item = s.board.items.find((i) => i.id === action.itemId) ?? fail("That item is not on the board.");
      item.x = clamp(action.x);
      item.y = clamp(action.y);
      break;
    }

    case "boardRemove":
      s.board.items = s.board.items.filter((i) => i.id !== action.itemId);
      s.board.connections = s.board.connections.filter(([a, b]) => a !== action.itemId && b !== action.itemId);
      break;

    case "connect": {
      const { a, b } = action;
      const onBoard = (id: string) => s.board.items.some((i) => i.id === id);
      if (a === b || !onBoard(a) || !onBoard(b)) fail("Pin both items to the board first.");
      if (!s.board.connections.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) s.board.connections.push([a, b]);
      for (const d of def.deductions) {
        if (s.deductions.includes(d.id)) continue;
        const match = d.connections.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
        if (!match || !check(d.requires, s)) continue;
        s.deductions.push(d.id);
        apply([{ note: { id: `deduction:${d.id}`, kind: "event", title: `Deduction: ${d.title}`, text: d.text } }], s, def);
        apply(d.effects, s, def);
        outcome = { kind: "deduction", id: d.id, title: d.title, text: d.text };
        break;
      }
      break;
    }

    case "disconnect":
      s.board.connections = s.board.connections.filter(
        ([x, y]) => !((x === action.a && y === action.b) || (x === action.b && y === action.a)),
      );
      break;

    case "saveNotes":
      s.playerNotes = action.text.slice(0, MAX_NOTES);
      break;

    case "dismissMessages":
      s.messages = [];
      break;

    case "submitConclusion": {
      const t = action.theory;
      if (!t || ![t.culprit, t.motive, t.weapon, t.location].every((v) => typeof v === "string" && v)) {
        fail("Answer every question before submitting.");
      }
      if (!Array.isArray(t.evidence) || t.evidence.length === 0) fail("Select the evidence that supports your theory.");
      if (t.evidence.some((id) => !s.evidence.includes(id))) fail("You can only cite evidence you have collected.");
      s.attempts += 1;
      const r = evaluateTheory(def, t);
      if (r.core && r.supported) {
        s.status = "closed";
        s.closedAt = now;
        if (!s.flags.includes("case_closed")) s.flags.push("case_closed");
        s.messages = [];
        outcome = { kind: "verdict", correct: true, feedback: "Case closed.", closure: def.solution.closure };
      } else if (r.core) {
        outcome = {
          kind: "verdict",
          correct: false,
          feedback: "The agency agrees with the substance of your theory, but the evidence you cited would not hold up. Build a stronger case before resubmitting.",
        };
      } else {
        outcome = {
          kind: "verdict",
          correct: false,
          feedback: "The agency reviewed your theory and it does not hold up against the file. Keep investigating and submit again when you are ready.",
        };
      }
      break;
    }

    default:
      fail("Unknown action.");
  }

  runEvents(s, def);
  return { state: s, outcome };
}

function clamp(n: number) {
  return Number.isFinite(n) ? Math.min(96, Math.max(0, n)) : 50;
}

/** Share of the investigation completed, for dashboards. Never reveals content. */
export function progressOf(def: CaseDefinition, s: InvestigationState) {
  if (s.status === "closed") return 100;
  const ev = s.evidence.length / def.evidence.length;
  const ded = def.deductions.length ? s.deductions.length / def.deductions.length : 0;
  return Math.min(95, Math.round(ev * 60 + ded * 35));
}

// ---------------------------------------------------------------------------
// Projection: the only thing the browser sees
// ---------------------------------------------------------------------------

export function project(def: CaseDefinition, s: InvestigationState): ClientView {
  const img = (key: string) => def.assets.images[key] ?? "";
  const l = loc(def, s.location)!;
  const bg = typeof l.background === "string" ? l.background : l.background.states[s.env[l.background.env] ?? "A"] ?? Object.values(l.background.states)[0];
  const evidenceById = new Map(def.evidence.map((e) => [e.id, e]));

  return {
    caseId: def.id,
    title: def.title,
    year: def.year,
    draft: def.draft,
    status: s.status,
    introSeen: s.introSeen,
    intro: def.intro,
    location: {
      id: l.id,
      name: l.name,
      subtitle: l.subtitle,
      background: img(bg),
      ambience: l.ambience ? def.assets.audio[l.ambience] ?? null : null,
      hotspots: visibleHotspots(def, s, l).map((h) => ({ id: h.id, label: h.label, rect: h.rect })),
    },
    map: def.locations
      .filter((x) => x.onMap)
      .map((x) => ({
        id: x.id,
        name: x.name,
        subtitle: x.subtitle,
        available: locationAvailable(def, s, x),
        visited: s.visited.includes(x.id),
        current: x.id === s.location,
      })),
    evidence: s.evidence.map((id) => {
      const e = evidenceById.get(id)!;
      return {
        id: e.id,
        title: e.title,
        description: e.description,
        inspection: e.inspection,
        image: img(e.image),
        source: loc(def, e.sourceLocationId)?.name ?? "",
        boardable: e.boardable,
        audio: e.audio ? def.assets.audio[e.audio] ?? null : null,
      };
    }),
    characters: knownCharacters(def, s).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      portrait: img(c.portrait),
      bio: c.bio.filter((b) => check(b.requires, s)).map((b) => b.text),
      onBoard: c.onBoard,
    })),
    notebook: s.notebook,
    timeline: s.timeline,
    playerNotes: s.playerNotes,
    deductions: s.deductions.map((id) => {
      const d = def.deductions.find((x) => x.id === id)!;
      return { id: d.id, title: d.title, text: d.text };
    }),
    objectives: def.objectives.filter((o) => check(o.visible, s)).map((o) => ({ id: o.id, text: o.text, done: check(o.done, s) })),
    board: s.board,
    phone: {
      ringing: s.pendingCalls.length
        ? { id: s.pendingCalls[0], from: char(def, def.calls.find((c) => c.id === s.pendingCalls[0])!.from)?.name ?? "Unknown caller" }
        : null,
      outgoing: def.outgoingCalls
        .filter((c) => check(c.available, s) && !check(c.done, s))
        .map((c) => ({ id: c.id, to: char(def, c.to)?.name ?? "", label: c.label })),
      log: s.answeredCalls.map((id) => ({
        id,
        title: def.calls.find((c) => c.id === id)?.title ?? def.outgoingCalls.find((c) => c.id === id)?.label ?? id,
      })),
    },
    deliveries: [...s.pendingDeliveries, ...s.openedDeliveries].map((id) => ({ id, title: def.deliveries.find((d) => d.id === id)!.title })),
    documents: def.documents.map((d) => ({ id: d.id, title: d.title, read: s.readDocuments.includes(d.id) })),
    statements: s.flags.includes("casefile_read")
      ? def.statements.map((st) => ({
          characterId: st.characterId,
          name: char(def, st.characterId)?.name ?? "",
          recordedAt: st.recordedAt,
          audio: def.assets.audio[st.audio] ?? null,
          transcript: st.transcript,
        }))
      : [],
    messages: s.messages,
    conclusion: { choices: def.conclusionChoices, attempts: s.attempts },
    closure: s.status === "closed" ? def.solution.closure : null,
  };
}

export function respond(def: CaseDefinition, s: InvestigationState, outcome: ActionOutcome = { kind: "none" }): ActionResponse {
  return { view: project(def, s), outcome };
}

/** Recomputes a conversation for reopening an interview panel without a state change. */
export function conversationFor(def: CaseDefinition, s: InvestigationState, characterId: string) {
  return conversationOutcome(def, s, characterId);
}
