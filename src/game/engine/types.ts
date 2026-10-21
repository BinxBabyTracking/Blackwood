/**
 * Blackwood investigation engine: shared types.
 *
 * A case is pure configuration (a CaseDefinition). The engine interprets it on
 * the server; the browser only ever receives a ClientView projected from the
 * current state, so restricted content (solutions, deduction rules, hidden
 * metadata, unrevealed dialogue) never leaves the server.
 */

// ---------------------------------------------------------------------------
// Conditions and effects: the rule language shared by every system
// ---------------------------------------------------------------------------

export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { flag: string }
  | { hasEvidence: string }
  | { inspected: string }
  | { visited: string }
  | { asked: string } // dialogue question id
  | { talkedTo: string } // character id
  | { deduction: string }
  | { event: string } // reactive event has fired
  | { env: string; is: string } // environmental state
  | { evidenceCount: number }
  | { at: string } // player's current location
  | { always: true };

export type Effect =
  | { setFlag: string }
  | { clearFlag: string }
  | { giveEvidence: string }
  | { setEnv: string; to: string }
  | { unlockLocation: string }
  | { note: NotebookEntryInput }
  | { timeline: { time: string; text: string; source: string } }
  | { incomingCall: string } // call id, rings at the office telephone
  | { delivery: string } // delivery id, appears at the office
  | { message: string }; // shown once to the player as a notice

export interface NotebookEntryInput {
  id: string;
  kind: "interview" | "observation" | "call" | "event" | "document";
  title: string;
  text: string;
  characterId?: string;
}

// ---------------------------------------------------------------------------
// Case content
// ---------------------------------------------------------------------------

export interface AssetManifest {
  /** Keys are stable asset ids used throughout the case; values are public URLs. */
  images: Record<string, string>;
  /** Null until a recording is uploaded. Players never see a play control for null audio. */
  audio: Record<string, string | null>;
}

export interface CharacterDef {
  id: string;
  name: string;
  role: string;
  portrait: string; // asset key
  /** Bio paragraphs, each optionally gated so hidden details appear only when relevant. */
  bio: { text: string; requires?: Condition }[];
  /** Whether the character can be met or interviewed right now. */
  available: Condition;
  /** Where the character can be interviewed. Null means by telephone only. */
  locationId: string | null;
  /** Characters that the player may pin to the murder board. */
  onBoard: boolean;
  /** Reply used when the player presents evidence with no authored reaction. */
  defaultEvidenceReply: string;
  /** Reply used when no questions remain. */
  idleLine: string;
}

export interface DialogueQuestion {
  id: string;
  characterId: string;
  /** What the investigator says. */
  prompt: string;
  /** The character's answer, line by line. */
  reply: string[];
  requires?: Condition;
  /** Questions that can be asked again stay in the list after being asked. */
  repeatable?: boolean;
  effects?: Effect[];
}

export interface EvidenceReaction {
  characterId: string;
  evidenceId: string;
  reply: string[];
  requires?: Condition;
  effects?: Effect[];
}

export interface HotspotDef {
  id: string;
  label: string;
  /** Position as percentages of the 16:9 scene. */
  rect: { x: number; y: number; w: number; h: number };
  /** Visual kind used by placeholder art generation. */
  kind: string;
  visible?: Condition;
  interaction:
    | { type: "inspect"; title: string; text: string; image?: string; evidence?: string; effects?: Effect[]; textAfter?: { requires: Condition; text: string }[] }
    | { type: "panel"; panel: PanelId }
    | { type: "talk"; characterId: string }
    | { type: "travel"; locationId: string };
}

export type PanelId = "casefile" | "board" | "notebook" | "map" | "phone" | "statements" | "delivery" | "conclusion";

export interface LocationDef {
  id: string;
  name: string;
  subtitle: string;
  /** Background asset key, optionally varying with environmental state. */
  background: string | { env: string; states: Record<string, string> };
  ambience?: string; // audio key
  available: Condition;
  /** Shown on the map; false for sub-scenes reached from another scene. */
  onMap: boolean;
  /** Pin position on the travel map, as percentages. */
  mapPin?: { x: number; y: number };
  hotspots: HotspotDef[];
  effectsOnEnter?: Effect[];
}

export interface EvidenceDef {
  id: string;
  title: string;
  description: string;
  sourceLocationId: string;
  image: string; // asset key
  inspection: string;
  /** Prose description of how it is found, for designers; not shown to players. */
  discovery: string;
  characters: string[];
  related: string[];
  boardable: boolean;
  audio?: string;
}

export interface CallDef {
  id: string;
  from: string; // character id
  title: string;
  lines: string[];
  effects?: Effect[];
}

export interface OutgoingCallDef {
  id: string;
  to: string; // character id
  label: string;
  available: Condition;
  /** Once true the option disappears from the phone. */
  done: Condition;
  lines: string[];
  effects?: Effect[];
}

export interface DeliveryDef {
  id: string;
  title: string;
  text: string;
  evidence: string[];
}

export interface DocumentDef {
  id: string;
  title: string;
  /** Summary fields shown at the top of a dossier. */
  dossier?: { label: string; value: string }[];
  /** Characters introduced by this document, shown with portraits. */
  people?: string[];
  pages: { heading?: string; body: string }[];
  /** Evidence that can be collected from this document. */
  evidence: string[];
  effectsOnRead?: Effect[];
}

export interface StatementDef {
  characterId: string;
  recordedAt: string;
  audio: string; // audio key, may resolve to null
  transcript: { speaker: string; text: string }[];
}

export interface ReactiveEventDef {
  id: string;
  title: string;
  trigger: Condition;
  effects: Effect[];
}

export interface DeductionDef {
  id: string;
  title: string;
  /** Recorded in the notebook once confirmed. Written so it never names the culprit outright. */
  text: string;
  /** Any one of these board connections confirms it. Board item ids are evidence or character ids. */
  connections: [string, string][];
  /** Extra state required before the connection counts. */
  requires?: Condition;
  effects?: Effect[];
}

export interface ObjectiveDef {
  id: string;
  text: string;
  visible: Condition;
  done: Condition;
}

export interface ChoiceSet {
  id: "culprit" | "motive" | "weapon" | "location";
  question: string;
  options: { id: string; label: string }[];
}

export interface SolutionDef {
  culprit: string;
  motive: string;
  weapon: string;
  location: string;
  /** The submitted evidence must cover at least `minGroups` of these groups (one item from each). */
  evidenceGroups: { id: string; label: string; anyOf: string[] }[];
  minGroups: number;
  closure: { heading: string; body: string }[];
}

export interface CaseDefinition {
  id: string;
  title: string;
  year: number;
  draft: boolean;
  assets: AssetManifest;
  startLocation: string;
  intro: { heading?: string; text: string }[];
  characters: CharacterDef[];
  locations: LocationDef[];
  evidence: EvidenceDef[];
  questions: DialogueQuestion[];
  reactions: EvidenceReaction[];
  documents: DocumentDef[];
  statements: StatementDef[];
  calls: CallDef[];
  outgoingCalls: OutgoingCallDef[];
  deliveries: DeliveryDef[];
  events: ReactiveEventDef[];
  deductions: DeductionDef[];
  objectives: ObjectiveDef[];
  conclusionChoices: ChoiceSet[];
  solution: SolutionDef;
  /** Seed timeline entries the player starts with. */
  timeline: { time: string; text: string; source: string }[];
}

// ---------------------------------------------------------------------------
// Saved state (stored in save_games.state, never contains case content)
// ---------------------------------------------------------------------------

export interface InvestigationState {
  version: 1;
  caseId: string;
  status: "active" | "closed";
  introSeen: boolean;
  location: string;
  visited: string[];
  unlocked: string[];
  inspected: string[];
  evidence: string[];
  /** Where and when each piece of evidence was collected. */
  discoveries: Record<string, Discovery>;
  /** The player's own notes on individual evidence items. */
  evidenceNotes: Record<string, string>;
  /** Whether narration controls are shown in evidence views. Narration itself always waits for the player. */
  narration: boolean;
  flags: string[];
  asked: string[];
  presented: string[]; // `${characterId}:${evidenceId}`
  talkedTo: string[];
  conversations: Record<string, { speaker: "you" | string; text: string }[]>;
  notebook: (NotebookEntryInput & { at: number })[];
  timeline: { time: string; text: string; source: string }[];
  playerNotes: string;
  board: { items: { id: string; x: number; y: number }[]; connections: [string, string][] };
  deductions: string[];
  events: string[];
  env: Record<string, string>;
  pendingCalls: string[];
  answeredCalls: string[];
  pendingDeliveries: string[];
  openedDeliveries: string[];
  readDocuments: string[];
  messages: string[];
  attempts: number;
  activeSeconds: number;
  lastActionAt: number;
  closedAt: number | null;
}

export interface Discovery {
  locationId: string;
  /** Environmental state of that location when the evidence was found (A, B...). */
  sceneState: string;
  /** How it reached the notebook: a scene hotspot, a document, a delivery or a conversation. */
  via: "scene" | "document" | "delivery" | "dialogue";
  at: number;
}

// ---------------------------------------------------------------------------
// Actions the browser can send
// ---------------------------------------------------------------------------

export type GameAction =
  | { type: "dismissIntro" }
  | { type: "travel"; locationId: string }
  | { type: "hotspot"; hotspotId: string }
  | { type: "collect"; evidenceId: string }
  | { type: "readDocument"; documentId: string }
  | { type: "talk"; characterId: string }
  | { type: "ask"; questionId: string }
  | { type: "present"; characterId: string; evidenceId: string }
  | { type: "answerCall"; callId: string }
  | { type: "placeCall"; callId: string }
  | { type: "openDelivery"; deliveryId: string }
  | { type: "boardAdd"; itemId: string; x: number; y: number }
  | { type: "boardMove"; itemId: string; x: number; y: number }
  | { type: "boardRemove"; itemId: string }
  | { type: "connect"; a: string; b: string }
  | { type: "disconnect"; a: string; b: string }
  | { type: "saveNotes"; text: string }
  | { type: "saveEvidenceNote"; evidenceId: string; text: string }
  | { type: "setNarration"; enabled: boolean }
  | { type: "dismissMessages" }
  | { type: "submitConclusion"; theory: Theory };

export interface Theory {
  culprit: string;
  motive: string;
  weapon: string;
  location: string;
  evidence: string[];
}

// ---------------------------------------------------------------------------
// What the browser receives
// ---------------------------------------------------------------------------

export interface ClientEvidence {
  id: string;
  title: string;
  description: string;
  inspection: string;
  image: string;
  source: string;
  boardable: boolean;
  audio: string | null;
  collected: boolean;
  /** Where the player collected it, once collected. */
  foundAt: string | null;
  collectedAt: number | null;
  /** Names of related people the player already knows about. */
  related: string[];
  /** The player's own note on this item. */
  note: string;
}

export interface ClientCharacter {
  id: string;
  name: string;
  role: string;
  portrait: string;
  bio: string[];
  onBoard: boolean;
}

export interface ClientView {
  caseId: string;
  title: string;
  year: number;
  draft: boolean;
  status: InvestigationState["status"];
  introSeen: boolean;
  intro: CaseDefinition["intro"];
  location: {
    id: string;
    name: string;
    subtitle: string;
    background: string;
    ambience: string | null;
    hotspots: { id: string; label: string; rect: HotspotDef["rect"]; inspected: boolean; collected: boolean }[];
  };
  map: { id: string; name: string; subtitle: string; available: boolean; visited: boolean; current: boolean; pin: { x: number; y: number } | null }[];
  evidence: ClientEvidence[];
  characters: ClientCharacter[];
  notebook: InvestigationState["notebook"];
  timeline: InvestigationState["timeline"];
  playerNotes: string;
  deductions: { id: string; title: string; text: string }[];
  objectives: { id: string; text: string; done: boolean }[];
  board: InvestigationState["board"];
  phone: {
    ringing: { id: string; from: string } | null;
    outgoing: { id: string; to: string; label: string }[];
    log: { id: string; title: string }[];
  };
  deliveries: { id: string; title: string }[];
  documents: { id: string; title: string; read: boolean }[];
  statements: { characterId: string; name: string; recordedAt: string; audio: string | null; transcript: StatementDef["transcript"] }[];
  messages: string[];
  narration: boolean;
  conclusion: { choices: ChoiceSet[]; attempts: number };
  /** Only present once the case is closed. */
  closure: SolutionDef["closure"] | null;
}

/** One-off payloads returned alongside the view for the action just taken. */
export type ActionOutcome =
  | { kind: "none" }
  | { kind: "inspect"; title: string; text: string; image: string | null; evidence: ClientEvidence | null }
  | { kind: "panel"; panel: PanelId }
  | { kind: "conversation"; characterId: string; history: { speaker: string; text: string }[]; questions: { id: string; prompt: string }[]; available: boolean }
  | {
      kind: "document";
      id: string;
      title: string;
      dossier: { label: string; value: string }[];
      people: { id: string; name: string; role: string; portrait: string }[];
      pages: DocumentDef["pages"];
      evidence: { id: string; title: string; collected: boolean }[];
    }
  | { kind: "call"; title: string; from: string; lines: string[] }
  | { kind: "delivery"; title: string; text: string; evidence: { id: string; title: string; collected: boolean }[] }
  | { kind: "deduction"; id: string; title: string; text: string }
  | { kind: "verdict"; correct: boolean; feedback: string; closure?: SolutionDef["closure"] }
  | { kind: "error"; message: string };

export interface ActionResponse {
  view: ClientView;
  outcome: ActionOutcome;
}
