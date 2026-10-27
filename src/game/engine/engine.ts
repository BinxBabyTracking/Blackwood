import { cleanAnswer, cleanClaims, evaluateReport, reportProblem, REVIEW_FEEDBACK } from "./evaluation";
import { concepts } from "./matcher";
import {
  allowance,
  credits,
  EXTENSION_COST,
  LAST_AT,
  newBudget,
  noteAuthoredAnswer,
  questionsLeft,
  redeemCredits,
  runReinterviews,
  spendQuestion,
  WARN_AT,
} from "./questions";
import { apply, check, collectEvidence, demeanorOf, runContradictions, runDemeanor, runEvents } from "./rules";
import type {
  CharacterDef,
  ClientDevelopment,
  ClientEvidence,
  ClientInterview,
  ClientLine,
  ClientQuestions,
  DialogueQuestion,
  PatienceDef,
  QuestionFund,
  ActionOutcome,
  ActionResponse,
  CaseDefinition,
  ClientView,
  GameAction,
  HotspotDef,
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
    photos: [],
    labs: {},
    discoveries: {},
    evidenceNotes: {},
    narration: true,
    flags: [],
    asked: [],
    presented: [],
    talkedTo: [],
    conversations: {},
    unlockedQuestions: [],
    contradictions: [],
    demeanor: {},
    voices: true,
    notebook: [],
    timeline: [...def.timeline],
    playerNotes: "",
    board: { items: [], connections: [] },
    deductions: [],
    events: [],
    eventStates: {},
    env: {},
    pendingCalls: [],
    answeredCalls: [],
    pendingDeliveries: [],
    openedDeliveries: [],
    readDocuments: [],
    messages: [],
    texts: [],
    attempts: 0,
    report: { draft: { evidence: [] }, submissions: [], final: null },
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

/** Where a character is right now: their last move whose condition holds, else their home location. */
export function characterLocation(c: CharacterDef, s: InvestigationState): string | null {
  const moved = (c.moves ?? []).filter((m) => check(m.when, s)).pop();
  return moved ? moved.locationId : c.locationId;
}

/** Whether a person has died in this investigation. */
export function isDeceased(c: CharacterDef, s: InvestigationState) {
  return Boolean(c.deceased && check(c.deceased, s));
}

const mobile = (def: CaseDefinition) => def.phone === "mobile";

/**
 * How the investigator can reach a person right now: face to face where they
 * are, by telephone (from the office, or from anywhere with a mobile phone),
 * or not at all.
 */
function reachOf(def: CaseDefinition, s: InvestigationState, c: CharacterDef): "in person" | "telephone" | null {
  if (!check(c.available, s) || isDeceased(c, s)) return null;
  const here = characterLocation(c, s) === s.location;
  if (c.medium === "telephone") return here || mobile(def) ? "telephone" : null;
  if (here) return "in person";
  if (mobile(def) && c.phone && check(c.phone, s)) return "telephone";
  return null;
}

function characterHere(def: CaseDefinition, s: InvestigationState, id: string) {
  const c = char(def, id);
  return Boolean(c && reachOf(def, s, c));
}

/** Why a person cannot be talked to right now, in words. */
function unreachable(def: CaseDefinition, s: InvestigationState, c: CharacterDef) {
  if (isDeceased(c, s)) return `${c.name} is dead.`;
  if (c.medium === "telephone") return `${c.name} can be reached from your office telephone.`;
  return `${c.name} is not here.`;
}

/** Whether the telephone is within reach: always with a mobile phone, else only at the office. */
function phoneInReach(def: CaseDefinition, s: InvestigationState) {
  return mobile(def) || s.location === def.startLocation;
}

/** How the player legitimately uncovered a piece of evidence, or null if they have not. */
function discoverable(def: CaseDefinition, s: InvestigationState, evidenceId: string): "scene" | "document" | "delivery" | null {
  for (const l of def.locations) {
    for (const h of l.hotspots) {
      if (h.interaction.type === "inspect" && h.interaction.evidence === evidenceId && s.inspected.includes(h.id) && check(h.visible, s)) {
        return "scene";
      }
    }
  }
  if (def.documents.some((d) => d.evidence.includes(evidenceId) && s.readDocuments.includes(d.id))) return "document";
  if (def.deliveries.some((d) => d.evidence.includes(evidenceId) && s.openedDeliveries.includes(d.id))) return "delivery";
  return null;
}

/** Narration is only offered for evidence the player has found or collected, so it cannot leak unfound text. */
export function canNarrate(def: CaseDefinition, s: InvestigationState, evidenceId: string) {
  return s.evidence.includes(evidenceId) || discoverable(def, s, evidenceId) !== null;
}

/**
 * Brings a save written by an earlier version up to the current shape without
 * touching any progress it already holds.
 */
export function normalizeState(def: CaseDefinition, raw: InvestigationState): InvestigationState {
  const fresh = newState(def, raw.lastActionAt ?? Date.now());
  const s = { ...fresh, ...raw } as InvestigationState;
  s.discoveries ??= {};
  s.photos ??= [];
  s.labs ??= {};
  s.evidenceNotes ??= {};
  s.narration ??= true;
  s.voices ??= true;
  s.unlockedQuestions ??= [];
  s.offers ??= {};
  s.budget ??= newBudget();
  s.contradictions ??= [];
  s.demeanor ??= {};
  s.conversations ??= {};
  s.eventStates ??= {};
  s.texts ??= [];
  s.report ??= { draft: { evidence: [] }, submissions: [], final: null };
  // Saves from before the event lifecycle recorded only which events had fired.
  for (const id of s.events ?? []) s.eventStates[id] ??= "active";
  for (const id of s.evidence) {
    s.discoveries[id] ??= {
      locationId: def.evidence.find((e) => e.id === id)?.sourceLocationId ?? s.location,
      sceneState: "A",
      via: "scene",
      at: s.lastActionAt,
    };
  }
  return s;
}

/** The browser-safe description of one evidence item. */
export function evidenceView(def: CaseDefinition, s: InvestigationState, id: string): ClientEvidence | null {
  const e = def.evidence.find((x) => x.id === id);
  if (!e) return null;
  const d = s.discoveries?.[id];
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    inspection: e.inspection,
    image: def.assets.images[e.image] ?? "",
    source: loc(def, e.sourceLocationId)?.name ?? "",
    boardable: e.boardable,
    audio: e.audio ? def.assets.audio[e.audio] ?? null : null,
    collected: s.evidence.includes(id),
    foundAt: d ? loc(def, d.locationId)?.name ?? null : null,
    collectedAt: d?.at ?? null,
    related: knownCharacters(def, s)
      .filter((c) => e.characters.includes(c.id))
      .map((c) => c.name),
    note: s.evidenceNotes?.[id] ?? "",
    label: e.id,
  };
}

/** Whether this evidence id, or photograph id, is in the investigator's files. */
export function hasItem(s: InvestigationState, id: string) {
  return s.evidence.includes(id) || (s.photos ?? []).some((p) => p.id === id);
}

/** A photograph, shown everywhere evidence is shown. */
export function photoView(def: CaseDefinition, s: InvestigationState, p: InvestigationState["photos"][number]): ClientEvidence {
  return {
    id: p.id,
    title: `Photo: ${p.title}`,
    description: `A photograph you took at ${loc(def, p.locationId)?.name ?? "the scene"}.`,
    inspection: p.text,
    image: p.image,
    source: loc(def, p.locationId)?.name ?? "",
    boardable: true,
    audio: null,
    collected: true,
    foundAt: loc(def, p.locationId)?.name ?? null,
    collectedAt: p.at,
    related: [],
    note: s.evidenceNotes?.[p.id] ?? "",
    photo: true,
    label: `P${(s.photos ?? []).findIndex((x) => x.id === p.id) + 1}`,
  };
}

/** The background a location shows right now (asset key). */
function sceneBackground(def: CaseDefinition, s: InvestigationState, l: LocationDef) {
  return typeof l.background === "string" ? l.background : l.background.states[s.env[l.background.env] ?? "A"] ?? Object.values(l.background.states)[0];
}

/** The painted object or person drawn over the scene for this hotspot, if any. */
function hotspotSprite(def: CaseDefinition, s: InvestigationState, h: HotspotDef, painted: boolean) {
  const sp = h.sprite?.find((x) => check(x.when, s));
  if (sp) return def.assets.images[sp.image] || null;
  // Painted objects and people only go over a painted scene; placeholder scenes draw their own.
  return h.art && painted && def.assets.images[h.art] ? def.assets.images[h.art] : null;
}

/** Things in a scene that can be photographed: anything looked at that is not itself collectable evidence. */
function photographable(h: HotspotDef) {
  return h.interaction.type === "inspect" && !h.interaction.evidence;
}

function knownCharacters(def: CaseDefinition, s: InvestigationState) {
  return def.characters.filter((c) => s.talkedTo.includes(c.id) || (c.known ? check(c.known, s) : s.flags.includes("casefile_read")));
}

// ---------------------------------------------------------------------------
// Conversation helpers
// ---------------------------------------------------------------------------

/** Question ids that only appear once an earlier answer unlocks them. */
function followUps(def: CaseDefinition) {
  return new Set([...def.questions.flatMap((q) => q.unlocks ?? []), ...def.events.flatMap((e) => e.unlocksQuestions ?? [])]);
}

/** Whether a dialogue entry's requirements are met. Never sent to the browser. */
export function questionOpen(def: CaseDefinition, s: InvestigationState, q: DialogueQuestion) {
  if (!check(q.requires, s)) return false;
  if (q.requiresEvidence?.some((e) => !s.evidence.includes(e))) return false;
  if (q.requiresDeductions?.some((d) => !s.deductions.includes(d))) return false;
  if (q.requiresFlags?.some((f) => !s.flags.includes(f))) return false;
  if (followUps(def).has(q.id) && !s.unlockedQuestions.includes(q.id)) return false;
  return true;
}

function refusing(def: CaseDefinition, s: InvestigationState, characterId: string) {
  return Boolean(demeanorOf(def, s, characterId)?.refuses);
}

function availableQuestions(def: CaseDefinition, s: InvestigationState, characterId: string) {
  const refuse = refusing(def, s, characterId);
  return def.questions.filter(
    (q) =>
      q.characterId === characterId &&
      questionOpen(def, s, q) &&
      (q.repeatable || !s.asked.includes(q.id)) &&
      (!refuse || q.allowWhenRefusing),
  );
}

function shortName(c: CharacterDef) {
  const parts = c.name.split(" ");
  return parts[0].endsWith(".") ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0];
}

function whereOf(def: CaseDefinition, s: InvestigationState, c: CharacterDef) {
  if (isDeceased(c, s)) return "Deceased";
  if (c.medium === "telephone") return mobile(def) ? "By phone" : "By telephone from your office";
  if (reachOf(def, s, c) === "telephone") return "By phone";
  const at = characterLocation(c, s);
  return at ? loc(def, at)?.name ?? "" : "";
}

/** Whether a character has a voice. The browser combines this with the player's voices setting. */
function voiced(c: CharacterDef | undefined) {
  return Boolean(c?.voice);
}

function clientLines(def: CaseDefinition, s: InvestigationState, characterId: string): ClientLine[] {
  const c = char(def, characterId);
  return (s.conversations[characterId] ?? []).map((h, n) => ({
    n,
    speakerId: h.speaker,
    speaker: h.speaker === "you" ? "You" : h.speaker === "cue" ? "" : c?.name ?? h.speaker,
    text: h.text,
    kind: h.kind ?? (h.speaker === "you" ? "question" : h.speaker === "cue" ? "cue" : "answer"),
  }));
}

function conversationOutcome(def: CaseDefinition, s: InvestigationState, characterId: string, latest: number[] = []): ActionOutcome {
  const c = char(def, characterId)!;
  const d = demeanorOf(def, s, characterId);
  return {
    kind: "conversation",
    characterId,
    name: c.name,
    role: c.role,
    portrait: def.assets.images[c.portrait] ?? "",
    where: whereOf(def, s, c),
    medium: reachOf(def, s, c) ?? c.medium ?? "in person",
    demeanor: d?.label ?? null,
    refusing: Boolean(d?.refuses),
    history: clientLines(def, s, characterId),
    latest,
    canAsk: characterHere(def, s, characterId) && s.status !== "closed" && questionsLeft(def, s, characterId) !== 0,
    idle: d?.refuses ?? d?.idleLine ?? c.idleLine,
    available: characterHere(def, s, characterId),
    voiced: voiced(c),
    questions: questionsView(def, s, c),
  };
}

/** Appends an exchange and returns the transcript positions of the character's new lines. */
function say(s: InvestigationState, characterId: string, you: string, lines: string[], kinds: { you: "question" | "present"; them: "answer" | "reaction" | "refusal" }, q?: string) {
  const log = (s.conversations[characterId] ??= []);
  log.push({ speaker: "you", text: you, kind: kinds.you, q });
  const latest: number[] = [];
  for (const l of lines) {
    latest.push(log.length);
    log.push({ speaker: characterId, text: l, kind: kinds.them, q });
  }
  return latest;
}

/**
 * Questions a character can answer right now, in the player's own words: the
 * entries currently open, including ones already asked (asking again gets the
 * same answer). Locked entries are never candidates, so wording a question
 * cleverly cannot reach information the investigation has not earned.
 */
export function interviewCandidates(def: CaseDefinition, s: InvestigationState, characterId: string) {
  const refuse = refusing(def, s, characterId);
  return def.questions.filter((q) => q.characterId === characterId && questionOpen(def, s, q) && (!refuse || q.allowWhenRefusing));
}

/** Tidies a composed answer: plain text, no em dashes, a sensible length. */
function cleanComposed(t: unknown) {
  if (typeof t !== "string") return "";
  return t
    .replace(/[\u2014\u2013]/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .slice(0, 480)
    .trim();
}

/** What a character knows right now: the facts whose conditions hold. Server-side only. */
export function characterKnowledge(def: CaseDefinition, s: InvestigationState, characterId: string) {
  return knownFacts(def, s, characterId).map((k) => k.text);
}

/** The facts a character knows right now, with their position in the character's knowledge list. */
export function knownFacts(def: CaseDefinition, s: InvestigationState, characterId: string) {
  const c = char(def, characterId);
  return (c?.knowledge ?? []).map((k, index) => ({ index, text: k.text, ok: check(k.requires, s) })).filter((k) => k.ok).map(({ index, text }) => ({ index, text }));
}

/** A short yes, such as "sure" or "yeah, show me". */
const YES = /^(yes|yeah|yep|yup|ya|sure|ok|okay|please|alright|all right|go ahead|go on|absolutely|definitely|of course|i would|i'?d like (that|it|to)|let'?s see|let me see|show me|give (it|me)|hand it|that would|that'?d)\b/i;

/**
 * The entry a character's last answer offered, if this question takes it up:
 * a short yes as the very next question, and the entry is still open.
 */
export function acceptedOffer(def: CaseDefinition, s: InvestigationState, characterId: string, text: string) {
  const offered = s.offers?.[characterId];
  if (!offered) return null;
  const t = text.trim();
  if (t.split(/\s+/).length > 10 || !YES.test(t)) return null;
  return interviewCandidates(def, s, characterId).some((q) => q.id === offered) ? offered : null;
}

/**
 * Records one dialogue entry: transcript, notebook, unlocks, offers and
 * effects. `asked` is the investigator's own words, or null when the
 * character volunteers it.
 */
function recordAnswer(def: CaseDefinition, s: InvestigationState, q: DialogueQuestion, asked: string | null) {
  const c = char(def, q.characterId)!;
  const first = !s.asked.includes(q.id);
  if (first) s.asked.push(q.id);
  if (!s.talkedTo.includes(c.id)) s.talkedTo.push(c.id);
  const r = replyFor(s, q);
  const lines = asked === null && q.volunteer?.reply ? q.volunteer.reply : r.lines;
  let latest: number[];
  if (asked !== null) latest = say(s, c.id, asked, lines, { you: "question", them: "answer" }, q.id);
  else {
    const log = (s.conversations[c.id] ??= []);
    latest = lines.map((text) => log.push({ speaker: c.id, text, kind: "answer", q: q.id }) - 1);
  }
  if (!q.repeatable && first) {
    apply([{ note: { id: `q:${q.id}`, kind: "interview", title: asked !== null ? `${c.name}: ${asked}` : `${c.name}, unprompted`, text: q.reveals ?? r.lines.join(" "), characterId: c.id, important: Boolean(q.reveals) } }], s, def);
  }
  for (const u of q.unlocks ?? []) if (!s.unlockedQuestions.includes(u)) s.unlockedQuestions.push(u);
  if (q.offers) (s.offers ??= {})[c.id] = q.offers;
  apply(q.effects, s, def);
  apply(r.effects, s, def);
  return latest;
}

/**
 * The character has told the investigator what an authored entry says, in
 * their own words: the entry counts as asked, with its notebook entry,
 * unlocks and effects, but no second transcript line.
 */
function creditAnswer(def: CaseDefinition, s: InvestigationState, q: DialogueQuestion, asked: string) {
  const c = char(def, q.characterId)!;
  s.asked.push(q.id);
  const r = replyFor(s, q);
  if (!q.repeatable) apply([{ note: { id: `q:${q.id}`, kind: "interview", title: `${c.name}: ${asked}`, text: q.reveals ?? r.lines.join(" "), characterId: c.id, important: Boolean(q.reveals) } }], s, def);
  for (const u of q.unlocks ?? []) if (!s.unlockedQuestions.includes(u)) s.unlockedQuestions.push(u);
  apply(q.effects, s, def);
  apply(r.effects, s, def);
}

function answerQuestion(def: CaseDefinition, s: InvestigationState, q: DialogueQuestion, asked: string) {
  return recordAnswer(def, s, q, asked);
}

/**
 * Essential information a character brings up without being asked, once:
 * when the question touches its subject, or after enough questions to them.
 * Returns the new transcript lines, or none.
 */
function volunteerFact(def: CaseDefinition, s: InvestigationState, characterId: string, question: string) {
  if (refusing(def, s, characterId)) return [];
  const asked = (s.conversations[characterId] ?? []).filter((l) => l.speaker === "you" && l.kind === "question").length;
  const said = new Set(concepts(question));
  const v = interviewCandidates(def, s, characterId).find(
    (q) =>
      q.volunteer &&
      !s.asked.includes(q.id) &&
      ((q.volunteer.near && concepts(q.volunteer.near).some((w) => said.has(w))) || (q.volunteer.after !== undefined && asked >= q.volunteer.after)),
  );
  return v ? recordAnswer(def, s, v, null) : [];
}

/** The answer a character gives right now: the last variant whose condition holds, else the base reply. */
function replyFor(s: InvestigationState, q: DialogueQuestion) {
  const v = [...(q.variants ?? [])].reverse().find((x) => check(x.requires, s));
  return { lines: v?.reply ?? q.reply, effects: v?.effects ?? [] };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export class GameError extends Error {}

function fail(message: string): never {
  throw new GameError(message);
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

  if (s.status === "closed" && !["saveNotes", "saveEvidenceNote", "setNarration", "setVoices", "dismissMessages"].includes(action.type)) {
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
      if (it.type === "delivery") {
        const d = def.deliveries.find((x) => x.id === it.deliveryId) ?? fail("Nothing has arrived.");
        if (!s.pendingDeliveries.includes(d.id) && !s.openedDeliveries.includes(d.id)) fail("Nothing has arrived.");
        if (!s.inspected.includes(h.id)) s.inspected.push(h.id);
        outcome = deliveryOutcome(def, s, d.id, !s.openedDeliveries.includes(d.id));
        break;
      }
      if (it.type === "panel") {
        if (!s.inspected.includes(h.id)) s.inspected.push(h.id);
        outcome = { kind: "panel", panel: it.panel };
        break;
      }
      if (!s.inspected.includes(h.id)) s.inspected.push(h.id);
      apply(it.effects, s, def);
      const text = [...(it.textAfter ?? [])].reverse().find((t) => check(t.requires, s))?.text ?? it.text;
      const ev = it.evidence ? evidenceView(def, s, it.evidence) : null;
      outcome = {
        kind: "inspect",
        title: ev?.title ?? it.title,
        text,
        image: it.image ? def.assets.images[it.image] ?? null : ev?.image ?? null,
        evidence: ev,
        photo: photographable(h) ? { hotspotId: h.id, taken: s.photos.some((p) => p.id === `PH_${h.id}`) } : null,
      };
      break;
    }

    case "collect": {
      const via = discoverable(def, s, action.evidenceId);
      if (!via) fail("You have not found that yet.");
      if (s.evidence.includes(action.evidenceId)) fail("That evidence is already in your notebook.");
      collectEvidence(s, def, action.evidenceId, via, now);
      break;
    }

    case "checkLabs":
      break;

    case "photograph": {
      const l = loc(def, s.location)!;
      const h = visibleHotspots(def, s, l).find((x) => x.id === action.hotspotId) ?? fail("There is nothing like that here to photograph.");
      if (!photographable(h) || h.interaction.type !== "inspect") fail("That cannot be photographed.");
      const id = `PH_${h.id}`;
      if (s.photos.some((p) => p.id === id)) fail("You already have a photograph of that.");
      const it = h.interaction;
      const text = [...(it.textAfter ?? [])].reverse().find((t) => check(t.requires, s))?.text ?? it.text;
      const bgKey = sceneBackground(def, s, l);
      const bgUrl = def.assets.images[bgKey] ?? "";
      const sprite = hotspotSprite(def, s, h, !bgUrl.endsWith(".svg"));
      const q = new URLSearchParams({ bg: bgUrl, r: [h.rect.x, h.rect.y, h.rect.w, h.rect.h].join(",") });
      if (sprite) q.set("s", sprite);
      s.photos.push({ id, hotspotId: h.id, locationId: l.id, title: it.title, text, image: `/api/photo?${q}`, at: now });
      s.discoveries[id] = { locationId: l.id, sceneState: (typeof l.background === "string" ? "A" : s.env[l.background.env]) ?? "A", via: "scene", at: now };
      if (!s.inspected.includes(h.id)) s.inspected.push(h.id);
      apply([{ note: { id: `photo:${id}`, kind: "observation", title: `Photographed: ${it.title}`, text } }], s, def);
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
        dossier: d.dossier ?? [],
        peopleHeading: d.peopleHeading ?? "Persons involved",
        people: (d.people ?? []).map((id) => {
          const c = char(def, id)!;
          return { id: c.id, name: c.name, role: c.role, portrait: def.assets.images[c.portrait] ?? "" };
        }),
        pages: d.pages,
        evidence: d.evidence.map((id) => ({ id, title: def.evidence.find((e) => e.id === id)!.title, collected: s.evidence.includes(id) })),
      };
      break;
    }

    case "talk": {
      const c = char(def, action.characterId) ?? fail("Unknown person.");
      if (!characterHere(def, s, c.id)) fail(unreachable(def, s, c));
      if (!s.talkedTo.includes(c.id)) s.talkedTo.push(c.id);
      outcome = conversationOutcome(def, s, c.id);
      break;
    }

    case "ask": {
      const q = def.questions.find((x) => x.id === action.questionId) ?? fail("Unknown question.");
      if (!characterHere(def, s, q.characterId)) fail("They are not here.");
      if (!availableQuestions(def, s, q.characterId).some((x) => x.id === q.id)) fail("That question is not available.");
      const latest = answerQuestion(def, s, q, q.prompt);
      finish(s, def);
      outcome = conversationOutcome(def, s, q.characterId, latest);
      break;
    }

    case "askFree": {
      const c = char(def, action.characterId) ?? fail("Unknown person.");
      if (!characterHere(def, s, c.id)) fail(unreachable(def, s, c));
      const text = String(action.text ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
      if (!text) fail("Ask a question first.");
      if (!s.talkedTo.includes(c.id)) s.talkedTo.push(c.id);
      // Every question asked and answered costs one from this person's allowance, whatever the answer.
      const fund = chargeQuestion(def, s, c);
      // A short yes takes up what the character just offered; otherwise the
      // match chosen on the server from this character's current candidates, checked again here.
      const offered = acceptedOffer(def, s, c.id, text);
      const wanted = offered ?? action.match;
      const q = wanted ? interviewCandidates(def, s, c.id).find((x) => x.id === wanted) : undefined;
      if (s.offers) delete s.offers[c.id];
      const composed = cleanComposed(action.composed);
      let latest: number[];
      if (q) {
        latest = answerQuestion(def, s, q, text);
        noteAuthoredAnswer(s, q.id, fund);
      } else if (composed && !refusing(def, s, c.id)) {
        // An answer composed on the server from this character's available knowledge.
        latest = say(s, c.id, text, [composed], { you: "question", them: "answer" }, "composed");
        // Facts the answer drew on bring their effects with them, such as evidence handed over.
        const known = new Set(knownFacts(def, s, c.id).map((k) => k.index));
        const open = interviewCandidates(def, s, c.id);
        for (const i of new Set(action.facts ?? [])) {
          const fact = known.has(i) ? c.knowledge?.[i] : undefined;
          if (!fact) continue;
          const entry = fact.entry ? open.find((x) => x.id === fact.entry) : undefined;
          if (entry && !s.asked.includes(entry.id)) creditAnswer(def, s, entry, text);
          apply(fact.effects, s, def);
        }
      } else {
        const d = demeanorOf(def, s, c.id);
        const unknown = c.noAnswer?.length ? c.noAnswer : [c.idleLine];
        const asked = (s.conversations[c.id] ?? []).filter((l) => l.q === "none" && l.speaker !== "you").length;
        const line = d?.refuses ?? unknown[asked % unknown.length];
        latest = say(s, c.id, text, [line], { you: "question", them: d?.refuses ? "refusal" : "answer" }, "none");
      }
      markFund(s, c.id, fund);
      // Nothing is volunteered over an open offer, so a following "yes" is never ambiguous.
      if (!s.offers?.[c.id] && questionsLeft(def, s, c.id) !== 0) latest = [...latest, ...volunteerFact(def, s, c.id, text)];
      latest = [...latest, ...patienceLines(def, s, c, fund)];
      finish(s, def);
      outcome = conversationOutcome(def, s, c.id, latest);
      break;
    }

    case "present": {
      const c = char(def, action.characterId) ?? fail("Unknown person.");
      if (!characterHere(def, s, c.id)) fail(unreachable(def, s, c));
      if (!s.evidence.includes(action.evidenceId)) fail("You do not have that evidence.");
      const ev = def.evidence.find((e) => e.id === action.evidenceId)!;
      const fund = chargeQuestion(def, s, c);
      const d = demeanorOf(def, s, c.id);
      const r = d?.refuses ? undefined : [...def.reactions].reverse().find((x) => x.characterId === c.id && x.evidenceId === ev.id && check(x.requires, s));
      const key = `${c.id}:${ev.id}`;
      if (!s.presented.includes(key)) s.presented.push(key);
      if (!s.talkedTo.includes(c.id)) s.talkedTo.push(c.id);
      const lines = d?.refuses ? [d.refuses] : r ? r.reply : [c.defaultEvidenceReply];
      const verb = reachOf(def, s, c) === "telephone" ? "read" : "show";
      const said = say(s, c.id, `You ${verb} ${shortName(c)} ${ev.id}, the ${ev.title.toLowerCase()}.`, lines, { you: "present", them: d?.refuses ? "refusal" : "reaction" }, ev.id);
      markFund(s, c.id, fund);
      const latest = [...said, ...patienceLines(def, s, c, fund)];
      if (r) {
        noteAuthoredAnswer(s, `reaction:${key}:${def.reactions.indexOf(r)}`, fund);
        apply([{ note: { id: `p:${key}:${def.reactions.indexOf(r)}`, kind: "interview", title: `${c.name} on ${ev.title}`, text: r.reveals ?? r.reply.join(" "), characterId: c.id, important: Boolean(r.reveals) } }], s, def);
        apply(r.effects, s, def);
      }
      finish(s, def);
      outcome = conversationOutcome(def, s, c.id, latest);
      break;
    }

    case "extendInterview": {
      const c = char(def, action.characterId) ?? fail("Unknown person.");
      if (!characterHere(def, s, c.id)) fail(`${c.name} is not here.`);
      const requestId = String(action.requestId ?? "").slice(0, 80);
      if (!requestId) fail("Try that again.");
      // The same request again (a retry, a second click that crossed in flight) changes nothing.
      if (s.budget?.redemptions.some((r) => r.id === requestId)) {
        outcome = conversationOutcome(def, s, c.id);
        break;
      }
      if ((s.budget?.mode ?? "standard") !== "standard") fail("Extra questions in this mode are bought, not earned. That is not available yet.");
      if (allowance(def, s, c.id) === null) fail(`${c.name} has no limit on questions.`);
      if (credits(s).balance < EXTENSION_COST) fail("You don't have enough expense money for that yet.");
      redeemCredits(s, c.id, requestId, now);
      const p = patienceOf(c);
      const log = (s.conversations[c.id] ??= []);
      log.push({ speaker: "you", text: p.offer, kind: "present", q: "extension" });
      const latest = [log.push({ speaker: c.id, text: p.accept, kind: "answer", q: "extension" }) - 1];
      outcome = conversationOutcome(def, s, c.id, latest);
      break;
    }

    case "answerCall": {
      if (!phoneInReach(def, s)) fail("The telephone is at the office.");
      if (!s.pendingCalls.includes(action.callId)) fail("No one is on the line.");
      const call = def.calls.find((x) => x.id === action.callId)!;
      s.pendingCalls = s.pendingCalls.filter((x) => x !== call.id);
      s.answeredCalls.push(call.id);
      apply([{ note: { id: `call:${call.id}`, kind: "call", title: call.title, text: call.lines.join(" "), characterId: call.from } }], s, def);
      // The call belongs to the caller's interview record too, so it can be revisited and followed up.
      const log = (s.conversations[call.from] ??= []);
      log.push({ speaker: "cue", text: inOffice ? `${call.title}, at your office.` : `${call.title}, on your phone.`, kind: "cue", q: call.id });
      for (const l of call.lines) log.push({ speaker: call.from, text: l, kind: "call", q: call.id });
      apply(call.effects, s, def);
      outcome = { kind: "call", id: call.id, title: call.title, from: char(def, call.from)?.name ?? "Caller", fromId: call.from, lines: call.lines, voiced: voiced(char(def, call.from)) };
      break;
    }

    case "placeCall": {
      if (!phoneInReach(def, s)) fail("The telephone is at the office.");
      const call = def.outgoingCalls.find((x) => x.id === action.callId) ?? fail("Unknown call.");
      if (!check(call.available, s) || check(call.done, s)) fail("There is no reason to make that call right now.");
      apply([{ note: { id: `call:${call.id}`, kind: "call", title: call.label, text: call.lines.join(" "), characterId: call.to } }], s, def);
      apply(call.effects, s, def);
      if (!s.answeredCalls.includes(call.id)) s.answeredCalls.push(call.id);
      outcome = { kind: "call", id: call.id, title: call.label, from: char(def, call.to)?.name ?? "", fromId: call.to, lines: call.lines, voiced: false };
      break;
    }

    case "openDelivery": {
      // With a mobile phone, reports also come by email and can be read anywhere.
      if (!inOffice && !mobile(def)) fail("Deliveries arrive at the office.");
      const d = def.deliveries.find((x) => x.id === action.deliveryId) ?? fail("Unknown delivery.");
      if (!s.pendingDeliveries.includes(d.id) && !s.openedDeliveries.includes(d.id)) fail("Nothing has arrived.");
      s.pendingDeliveries = s.pendingDeliveries.filter((x) => x !== d.id);
      if (!s.openedDeliveries.includes(d.id)) {
        s.openedDeliveries.push(d.id);
        apply([{ note: { id: `delivery:${d.id}`, kind: "document", title: d.title, text: d.text } }], s, def);
      }
      outcome = deliveryOutcome(def, s, d.id, false);
      break;
    }

    case "boardAdd": {
      const known = s.photos.some((p) => p.id === action.itemId)
        ? true
        : s.evidence.includes(action.itemId)
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
      s.playerNotes = String(action.text ?? "").slice(0, MAX_NOTES);
      break;

    case "saveEvidenceNote": {
      if (!hasItem(s, action.evidenceId)) fail("Collect that evidence before adding notes to it.");
      const text = String(action.text ?? "").slice(0, 4000);
      if (text.trim()) s.evidenceNotes[action.evidenceId] = text;
      else delete s.evidenceNotes[action.evidenceId];
      break;
    }

    case "setNarration":
      s.narration = Boolean(action.enabled);
      break;

    case "setVoices":
      s.voices = Boolean(action.enabled);
      break;

    case "dismissMessages":
      s.messages = [];
      break;

    case "saveReport": {
      if (!check(def.reportAvailable, s)) fail("You are not ready to write the final report yet.");
      const d = action.draft ?? { evidence: [] };
      const evidence = [...new Set(Array.isArray(d.evidence) ? d.evidence : [])]
        .filter((id) => typeof id === "string" && hasItem(s, id))
        .slice(0, def.solution.standard.maxItems);
      const draft: InvestigationState["report"]["draft"] = { evidence, ...cleanClaims(def, evidence, d) };
      for (const c of def.conclusionChoices) draft[c.id] = cleanAnswer(c, d[c.id]);
      s.report.draft = draft;
      break;
    }

    case "submitConclusion": {
      if (!check(def.reportAvailable, s)) fail("You are not ready to write the final report yet.");
      const t = action.theory;
      const problem = reportProblem(def, s, t);
      if (problem) fail(problem);
      const theory: Theory = { evidence: [...t.evidence], ...cleanClaims(def, t.evidence, t) };
      for (const c of def.conclusionChoices) theory[c.id] = cleanAnswer(c, t[c.id])!;
      s.attempts += 1;
      s.report.draft = { ...theory, evidence: [...theory.evidence] };
      const review = evaluateReport(def, theory, s, s.report.submissions.filter((x) => !x.accepted).length);
      s.report.submissions.push({ at: now, theory, accepted: review.accepted, note: review.note });
      if (review.accepted) {
        s.status = "closed";
        s.closedAt = now;
        if (!s.flags.includes("case_closed")) s.flags.push("case_closed");
        s.messages = [];
        s.report.final = { theory, investigator: (action.investigator ?? "").trim() || "Investigator", filedAt: now, attempts: s.attempts };
        outcome = { kind: "verdict", correct: true, feedback: def.solution.resolution.accepted, note: "" };
      } else {
        outcome = { kind: "verdict", correct: false, feedback: REVIEW_FEEDBACK, note: review.note };
      }
      break;
    }

    default:
      fail("Unknown action.");
  }

  finish(s, def);
  return { state: s, outcome };
}

/** Rules that run after every action: reactive events, established contradictions, changes of manner. */
function finish(s: InvestigationState, def: CaseDefinition) {
  runLabs(s, def);
  runEvents(s, def);
  runContradictions(s, def);
  runDemeanor(s, def);
  runBoardHint(s, def);
  // New discoveries can give a reason to question someone again.
  for (const note of runReinterviews(def, s)) s.messages.push(note);
}

/** Lab results come back once their time is up, checked on every action. */
function runLabs(s: InvestigationState, def: CaseDefinition) {
  for (const l of def.labs ?? []) {
    const j = s.labs?.[l.id];
    if (!j || j.done || s.lastActionAt < j.readyAt) continue;
    j.done = true;
    apply(l.onReady, s, def);
  }
}

/**
 * Det. Bennett's nudge toward the board. Not a development of the case, just
 * advice: it is offered once, when enough evidence is in hand and nothing has
 * been connected, and rings only in the office like every call.
 */
function runBoardHint(s: InvestigationState, def: CaseDefinition) {
  const h = def.boardHint;
  if (!h || s.status === "closed" || s.flags.includes("board_hint_offered")) return;
  if (s.evidence.length < h.evidenceCount || (s.board?.connections?.length ?? 0) > 0) return;
  if (!phoneInReach(def, s)) {
    if (!s.flags.includes("board_hint_waiting")) {
      s.flags.push("board_hint_waiting");
      s.messages.push("Det. Bennett is trying to reach you at the office.");
    }
    return;
  }
  s.flags.push("board_hint_offered");
  if (!s.answeredCalls.includes(h.callId) && !s.pendingCalls.includes(h.callId)) s.pendingCalls.push(h.callId);
}

const DEFAULT_PATIENCE: PatienceDef = {
  warn: "I don't have a great deal more time for this.",
  last: "A couple more questions, and then I really must go.",
  farewell: "That's all I can tell you for now.",
  offer: "Offer $5 for a little more of their time.",
  accept: "All right. Five more questions, but then I really have to go.",
};

const patienceOf = (c: CharacterDef) => c.patience ?? DEFAULT_PATIENCE;

/** The question limit as the interview screen sees it. */
function questionsView(def: CaseDefinition, s: InvestigationState, c: CharacterDef): ClientQuestions {
  const a = allowance(def, s, c.id);
  const mode = s.budget?.mode ?? "standard";
  const { balance } = credits(s);
  const canExtend = Boolean(a) && mode === "standard" && balance >= EXTENSION_COST && characterHere(def, s, c.id) && s.status !== "closed";
  return {
    limited: Boolean(a),
    left: a?.left ?? 0,
    exhausted: Boolean(a) && a!.left === 0,
    mode,
    expense: mode === "standard" ? balance : 0,
    extend: canExtend ? { offer: patienceOf(c).offer, cost: EXTENSION_COST } : null,
  };
}

/**
 * Charges one question to a character before they answer, and marks the
 * investigator's line with what paid for it. Refuses when nothing is left.
 */
function chargeQuestion(def: CaseDefinition, s: InvestigationState, c: CharacterDef): QuestionFund | null {
  if (questionsLeft(def, s, c.id) === 0) fail(`${c.name} has nothing more to say for now.`);
  return spendQuestion(def, s, c.id);
}

function markFund(s: InvestigationState, characterId: string, fund: QuestionFund | null) {
  if (!fund) return;
  const log = s.conversations[characterId] ?? [];
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].speaker === "you") {
      log[i].fund = fund;
      return;
    }
  }
}

/**
 * The character's patience after an answer: a word of impatience as the
 * allowance runs low, and a closing line when it runs out. Returns the new
 * transcript positions.
 */
function patienceLines(def: CaseDefinition, s: InvestigationState, c: CharacterDef, fund: QuestionFund | null) {
  if (!fund) return [];
  const left = questionsLeft(def, s, c.id);
  const p = patienceOf(c);
  const line = left === 0 ? p.farewell : left === LAST_AT ? p.last : left === WARN_AT && fund === "base" ? p.warn : null;
  if (!line) return [];
  const log = (s.conversations[c.id] ??= []);
  return [log.push({ speaker: c.id, text: line, kind: "answer", q: "patience" }) - 1];
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

/** `now` sets how long lab countdowns have left; the real clock unless a test passes its own. */
export function project(def: CaseDefinition, s: InvestigationState, now = Date.now()): ClientView {
  const img = (key: string) => def.assets.images[key] ?? "";
  const l = loc(def, s.location)!;
  const bg = sceneBackground(def, s, l);
  const painted = !img(bg).endsWith(".svg");

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
      area: l.area ?? null,
      name: l.name,
      subtitle: l.subtitle,
      background: img(bg),
      ambience: l.ambience ? def.assets.audio[l.ambience] ?? null : null,
      hotspots: visibleHotspots(def, s, l).map((h) => ({
        id: h.id,
        label: h.label,
        rect: h.rect,
        inspected: s.inspected.includes(h.id),
        collected: h.interaction.type === "inspect" && Boolean(h.interaction.evidence) && s.evidence.includes(h.interaction.evidence!),
        sprite: hotspotSprite(def, s, h, painted),
        figure: h.interaction.type === "talk",
        // A painted scene whose painting for this person or object has not arrived yet.
        pending: Boolean(h.art && painted && !def.assets.images[h.art] && !h.sprite?.some((x) => check(x.when, s))),
        attention: h.attention ? check(h.attention, s) : false,
        callout: h.callout && check(h.callout.when, s) ? h.callout.text : null,
      })),
    },
    map: def.locations
      .filter((x) => x.onMap && (!x.secret || locationAvailable(def, s, x) || s.visited.includes(x.id)))
      .map((x) => ({
        id: x.id,
        name: x.name,
        subtitle: x.subtitle,
        area: x.area ?? null,
        available: locationAvailable(def, s, x),
        visited: s.visited.includes(x.id),
        current: x.id === s.location,
        pin: x.mapPin ?? null,
        tag: x.mapTag ?? null,
      })),
    evidence: [...s.evidence.map((id) => evidenceView(def, s, id)!), ...s.photos.map((p) => photoView(def, s, p))],
    characters: knownCharacters(def, s).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      portrait: img(c.portrait),
      bio: c.bio.filter((b) => check(b.requires, s)).map((b) => b.text),
      onBoard: c.onBoard,
      deceased: isDeceased(c, s),
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
      mobile: mobile(def),
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
      contacts: phoneContacts(def, s),
      texts: [...(s.texts ?? [])].reverse().flatMap((id) => {
        const t = def.texts?.find((x) => x.id === id);
        return t ? [{ id: t.id, from: char(def, t.from)?.name ?? "Unknown", body: t.body }] : [];
      }),
    },
    caseStatus: [...(def.status ?? [])].reverse().find((x) => check(x.when, s))?.label ?? null,
    boardSections: (def.boardSections ?? []).filter((b) => check(b.when, s)).map((b) => ({ id: b.id, label: b.label })),
    deliveries: [...s.pendingDeliveries, ...s.openedDeliveries].map((id) => ({ id, title: def.deliveries.find((d) => d.id === id)!.title })),
    documents: def.documents.map((d) => ({ id: d.id, title: d.title, read: s.readDocuments.includes(d.id) })),
    statements: s.flags.includes("casefile_read")
      ? def.statements.map((st) => {
          const audio = def.assets.audio[st.audio] ?? null;
          const canVoice = st.transcript.every((l) => char(def, l.speakerId)?.voice);
          return {
            characterId: st.characterId,
            name: char(def, st.characterId)?.name ?? "",
            recordedAt: st.recordedAt,
            officer: st.officer,
            tape: st.tape,
            status: audio ? "Original recording on file" : canVoice ? "Cassette on file. Transcript verified" : "Transcript only. Tape not yet digitized",
            audio,
            voiced: !audio && canVoice,
            transcript: st.transcript,
          };
        })
      : [],
    interviews: interviewsView(def, s),
    developments: developmentsView(def, s),
    messages: s.messages,
    narration: s.narration,
    voices: s.voices,
    music: (def.soundtrack ?? []).filter((t) => t.kind === "music").flatMap((t) => (def.assets.audio[t.key] ? [def.assets.audio[t.key]!] : [])),
    labs: (def.labs ?? []).flatMap((l) => {
      const j = s.labs?.[l.id];
      return j ? [{ id: l.id, label: l.label, remainingMs: Math.max(0, j.readyAt - now), done: j.done, rect: l.rect, image: l.image ? def.assets.images[l.image] ?? null : null }] : [];
    }),
    travelAudio: { drive: def.assets.audio["sfx.travel_drive"] ?? null, walk: def.assets.audio["sfx.travel_walk"] ?? null },
    questionsAsked: Object.values(s.conversations).reduce((n, lines) => n + lines.filter((l) => l.speaker === "you" && l.kind === "question").length, 0),
    mapTitle: def.mapTitle ?? "Street map",
    conclusion: {
      header: def.reportHeader ?? [],
      available: check(def.reportAvailable, s),
      choices: def.conclusionChoices.map((c) => ({ ...c, options: c.options.filter((o) => check(o.requires, s)).map((o) => ({ id: o.id, label: o.label })) })),
      date: def.reportDate ?? "August 1985",
      minItems: def.solution.standard.minItems,
      maxItems: def.solution.standard.maxItems,
      minKey: def.solution.standard.minKey ?? def.solution.standard.minItems,
      claims: (def.solution.standard.claims ?? []).map((c) => ({ id: c.id, label: c.label })),
      found: s.evidence.length,
      total: def.evidence.length,
      attempts: s.attempts,
      draft: { ...s.report.draft, evidence: s.report.draft.evidence.filter((id) => hasItem(s, id)) },
      review: (() => {
        const last = s.report.submissions.at(-1);
        return last && !last.accepted ? { at: last.at, note: last.note, attempt: s.report.submissions.length, evidence: [...last.theory.evidence] } : null;
      })(),
      final: s.report.final,
    },
    // The solution, the reconstruction and Bennett's response exist in the view only once the case is closed.
    closure: s.status === "closed" ? { ...def.solution.resolution, final: s.report.final, closedAt: s.closedAt } : null,
  };
}

export function respond(def: CaseDefinition, s: InvestigationState, outcome: ActionOutcome = { kind: "none" }): ActionResponse {
  return { view: project(def, s), outcome };
}

/** Recomputes a conversation for reopening an interview panel without a state change. */
export function conversationFor(def: CaseDefinition, s: InvestigationState, characterId: string) {
  return conversationOutcome(def, s, characterId);
}

/** People the investigator can ring right now: telephone contacts, and in a mobile case anyone who has given a number. */
function phoneContacts(def: CaseDefinition, s: InvestigationState) {
  if (!phoneInReach(def, s)) return [];
  return def.characters
    .filter((c) => (c.medium === "telephone" || (mobile(def) && c.phone && check(c.phone, s))) && reachOf(def, s, c) === "telephone")
    .map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      note: c.contact ?? (c.id === "bennett" && !mobile(def) ? "LAPD Northeast Division. Ask about the scene, the reports, or request assistance." : ""),
    }));
}

function interviewsView(def: CaseDefinition, s: InvestigationState): ClientInterview[] {
  return def.characters
    .filter((c) => def.questions.some((q) => q.characterId === c.id) && (s.talkedTo.includes(c.id) || knownCharacters(def, s).some((k) => k.id === c.id)))
    .map((c) => {
      const d = demeanorOf(def, s, c.id);
      const open = availableQuestions(def, s, c.id).filter((q) => !q.repeatable).length;
      const talked = s.talkedTo.includes(c.id);
      const status = isDeceased(c, s) ? "Deceased" : !talked ? "Not interviewed" : d?.refuses ? "Declining to answer" : open ? "Open lines of questioning" : "No further questions for now";
      const notes = s.notebook.filter((n) => n.characterId === c.id);
      return {
        characterId: c.id,
        name: c.name,
        role: c.role,
        portrait: def.assets.images[c.portrait] ?? "",
        where: whereOf(def, s, c),
        medium: reachOf(def, s, c) ?? c.medium ?? "in person",
        demeanor: talked && !isDeceased(c, s) ? d?.label ?? null : null,
        status,
        asked: def.questions.filter((q) => q.characterId === c.id && s.asked.includes(q.id)).length,
        transcript: clientLines(def, s, c.id),
        statements: notes.filter((n) => n.kind === "interview" && n.important).map((n) => ({ id: n.id, title: n.title, text: n.text })),
        contradictions: notes.filter((n) => n.kind === "contradiction").map((n) => ({ id: n.id, title: n.title, text: n.text })),
        voiced: voiced(c),
        questionsLeft: questionsLeft(def, s, c.id),
      };
    });
}

/**
 * The exact text a player has been given for one line of dialogue, and who
 * speaks it. Voice audio is generated only for text returned here, so it
 * always matches the subtitle and never reveals anything unheard.
 */
export function spokenLine(
  def: CaseDefinition,
  s: InvestigationState,
  ref: { kind: "conversation" | "statement" | "call" | "delivery" | "resolution" | "document"; id: string; n: number },
): { speakerId: string; text: string } | null {
  if (ref.kind === "document") {
    // A document the player has opened can be read aloud by the narrator, page by page.
    const doc = def.documents.find((d) => d.id === ref.id);
    const page = doc && s.readDocuments.includes(doc.id) ? doc.pages[ref.n] : undefined;
    return page ? { speakerId: "narrator", text: page.spoken ?? (page.heading ? `${page.heading}. ${page.body}` : page.body) } : null;
  }
  if (ref.kind === "conversation") {
    const line = s.conversations[ref.id]?.[ref.n];
    if (!line || line.speaker === "you" || line.speaker === "cue") return null;
    return { speakerId: line.speaker, text: line.text };
  }
  if (ref.kind === "statement") {
    if (!s.flags.includes("casefile_read")) return null;
    const line = def.statements.find((x) => x.characterId === ref.id)?.transcript[ref.n];
    return line ? { speakerId: line.speakerId, text: line.text } : null;
  }
  if (ref.kind === "resolution") {
    // Nothing from the solution is spoken, or sent to the voice service, before the case is closed.
    if (s.status !== "closed") return null;
    const r = def.solution.resolution;
    if (ref.id === "accepted" && ref.n === 0) return { speakerId: "narrator", text: r.accepted };
    if (ref.id === "reconstruction" && r.reconstruction[ref.n]) return { speakerId: "narrator", text: r.reconstruction[ref.n].body };
    if (ref.id === "bennett" && r.bennett[ref.n]) return { speakerId: r.caller?.characterId ?? "bennett", text: r.bennett[ref.n] };
    return null;
  }
  if (ref.kind === "delivery") {
    // An opened note can be read aloud by the narrator.
    const d = def.deliveries.find((x) => x.id === ref.id);
    return d && ref.n === 0 && s.openedDeliveries.includes(d.id) ? { speakerId: "narrator", text: d.text } : null;
  }
  if (!s.answeredCalls.includes(ref.id)) return null;
  const call = def.calls.find((c) => c.id === ref.id);
  const text = call?.lines[ref.n];
  return call && text ? { speakerId: call.from, text } : null;
}

function deliveryOutcome(def: CaseDefinition, s: InvestigationState, id: string, sealed: boolean): ActionOutcome {
  const d = def.deliveries.find((x) => x.id === id)!;
  return {
    kind: "delivery",
    id: d.id,
    title: d.title,
    sealed,
    exterior: d.exterior ?? "",
    // The contents stay on the server until the player opens it.
    text: sealed ? "" : d.text,
    evidence: sealed ? [] : d.evidence.map((e) => ({ id: e, title: def.evidence.find((x) => x.id === e)!.title, collected: s.evidence.includes(e) })),
  };
}

/** Events and Developments: only events the player has encountered, and only what they have learned. */
function developmentsView(def: CaseDefinition, s: InvestigationState): ClientDevelopment[] {
  return def.events
    .filter((ev) => {
      const st = s.eventStates?.[ev.id];
      if (st !== "active" && st !== "completed") return false;
      return ev.notebook.visible ? check(ev.notebook.visible, s) : true;
    })
    .map((ev) => {
      const c = ev.characterId ? char(def, ev.characterId) : undefined;
      const call = ev.notebook.call && s.answeredCalls.includes(ev.notebook.call) ? def.calls.find((x) => x.id === ev.notebook.call) : undefined;
      const delivery = ev.notebook.delivery && s.openedDeliveries.includes(ev.notebook.delivery) ? def.deliveries.find((x) => x.id === ev.notebook.delivery) : undefined;
      return {
        id: ev.id,
        title: ev.title,
        status: s.eventStates[ev.id] === "completed" ? "Resolved" : "Open",
        characterId: c?.id ?? null,
        character: c?.name ?? null,
        learned: ev.notebook.learned.filter((l) => check(l.requires, s)).map((l) => l.text),
        evidence: (ev.evidence ?? []).filter((e) => s.evidence.includes(e)).map((e) => ({ id: e, title: def.evidence.find((x) => x.id === e)!.title })),
        call: call ? { title: call.title, speaker: char(def, call.from)?.name ?? "", lines: call.lines } : null,
        note: delivery ? { title: delivery.title, text: delivery.text } : null,
      };
    });
}
