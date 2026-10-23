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
  /** At least this many strings between items on the murder board. */
  | { boardConnections: number }
  | { at: string } // player's current location
  | { presented: string } // `${characterId}:${evidenceId}`
  | { contradiction: string } // contradiction id has been recorded
  | { eventState: string; is: EventState | EventState[] } // reactive event lifecycle
  | { callPending: string }
  | { callAnswered: string }
  | { deliveryPending: string }
  | { deliveryOpened: string }
  /** A lab test has been sent off. */
  | { labStarted: string }
  /** A lab test's results are back. */
  | { labReady: string }
  | { always: true };

/** Reactive event lifecycle. An event with no recorded state is "locked". */
export type EventState = "locked" | "available" | "active" | "completed";

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
  | { message: string } // shown once to the player as a notice
  | { unlockQuestion: string } // reveals a follow-up dialogue entry
  | { startLab: string } // sends a lab test off; results come back after its time
  | { when: Condition; then: Effect[] }; // applies only if the condition holds at that moment

export interface NotebookEntryInput {
  id: string;
  kind: "interview" | "observation" | "call" | "event" | "document" | "contradiction";
  title: string;
  text: string;
  characterId?: string;
  /** Marks a statement worth highlighting in the interview notebook. */
  important?: boolean;
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

/** A consistent ElevenLabs voice for one character. Never changes between scenes. */
export interface VoiceProfile {
  /** ElevenLabs voice id. Can be overridden per deployment with ELEVENLABS_VOICE_<CHARACTER>. */
  voiceId: string;
  /** Casting note, for designers. */
  direction: string;
  /** Optional ElevenLabs voice settings that shape the delivery. */
  settings?: { stability?: number; similarity_boost?: number; style?: number; use_speaker_boost?: boolean };
}

/** A deterministic manner a character adopts once a condition holds. The last matching entry wins. */
export interface DemeanorDef {
  id: string;
  /** Shown to the player, e.g. "Guarded". */
  label: string;
  requires: Condition;
  /** Replaces the idle line while active. */
  idleLine?: string;
  /** While active, only questions marked allowWhenRefusing are offered, and evidence gets this reply. */
  refuses?: string;
  /** Written into the transcript once, when the manner first changes. */
  cue?: string;
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
  /**
   * When the player learns this person exists, so they appear in the case file,
   * people list and board. Defaults to reading the case file. Use it for anyone
   * the case file must not name yet (the culprit found mid-case, a later victim).
   */
  known?: Condition;
  /** Where the character can be interviewed. Null means nowhere. */
  locationId: string | null;
  /**
   * Later places the character moves to (a suspect taken into custody). The
   * last entry whose condition holds wins; otherwise `locationId` applies.
   * The scene at each place needs a person hotspot shown under the same condition.
   */
  moves?: { when: Condition; locationId: string }[];
  /** How the interview happens. Telephone interviews are opened from the office phone. */
  medium?: "in person" | "telephone";
  /** Characters that the player may pin to the murder board. */
  onBoard: boolean;
  /** Reply used when the player presents evidence with no authored reaction. */
  defaultEvidenceReply: string;
  /** Reply used when no questions remain. */
  idleLine: string;
  /** In-character replies to a question the character has no answer for, used in turn. */
  noAnswer?: string[];
  voice?: VoiceProfile;
  demeanor?: DemeanorDef[];
  /** How the character speaks, for answers composed from their knowledge. */
  persona?: string;
  /**
   * Everything the character knows and will say, in their own version of
   * events (a liar's facts are his story, not the truth). Each fact is only
   * available once its condition holds, exactly like the authored answers, so
   * a composed answer can never reach what the investigation has not earned.
   * Server-only; never sent to the browser.
   */
  /**
   * What the character knows, for answers in their own words. When an answer
   * uses a fact, the fact's `entry` (the authored answer with the same
   * information) counts as asked and its effects apply, as do the fact's own
   * `effects`, so evidence arrives however the subject comes up.
   */
  knowledge?: { text: string; requires?: Condition; effects?: Effect[]; entry?: string }[];
  /**
   * Questions this character answers per case before needing a reason to talk
   * again. Defaults to the case's `questionLimit`; null means no limit (for
   * example the police contact, who must stay reachable).
   */
  questionLimit?: number | null;
  /** How the character runs out of patience, and how they take an offer of more time. */
  patience?: PatienceDef;
}

/** In-character lines for the interview question limit. */
export interface PatienceDef {
  /** Said once, about five questions before the allowance runs out. */
  warn: string;
  /** Said with two questions left. */
  last: string;
  /** Said as the last question is answered; the interview ends. */
  farewell: string;
  /** The investigator's in-world offer for more time (fictional money), and the character's reply. */
  offer: string;
  accept: string;
}

/**
 * A legitimate reason to question someone again: when the condition first
 * holds, that character gets extra questions (5 by default). Each grant is
 * awarded once.
 */
export interface ReinterviewDef {
  id: string;
  characterId: string;
  when: Condition;
  questions?: number;
  /** Shown to the investigator when granted, e.g. "Daniel Mercer will have to explain the jacket." */
  note: string;
}

/**
 * One authored dialogue entry: what the investigator asks and how the
 * character answers. Entries are data; the engine decides what is offered.
 */
export interface DialogueQuestion {
  id: string;
  characterId: string;
  /** Groups questions in the interview, e.g. "The evening". */
  topic?: string;
  /**
   * The question this answer responds to, in a neutral wording. Players never
   * see it; it is what free-form questions are matched against.
   */
  prompt: string;
  /** Extra words and phrases a player might use to ask this, for matching. */
  keywords?: string[];
  /** The character's answer, line by line. */
  reply: string[];
  /** Deterministic alternatives; the last whose condition holds replaces `reply`. */
  variants?: { requires: Condition; reply: string[]; effects?: Effect[] }[];
  requires?: Condition;
  requiresEvidence?: string[];
  requiresDeductions?: string[];
  requiresFlags?: string[];
  /** Follow-up questions this entry unlocks once asked. A question listed here is hidden until then. */
  unlocks?: string[];
  /** Information this answer reveals, recorded in the notebook as an important statement. */
  reveals?: string;
  /** Voice override for this entry; defaults to the character's voice. */
  voice?: string;
  /** Questions that can be asked again stay in the list after being asked. */
  repeatable?: boolean;
  /** Still offered while the character refuses to cooperate. */
  allowWhenRefusing?: boolean;
  effects?: Effect[];
  /**
   * The entry this answer offers ("Want to see the schedule?"). A short yes
   * as the very next question ("yes", "sure", "show me") takes that entry.
   */
  offers?: string;
  /**
   * Essential information the character brings up unprompted, once: when a
   * question touches the subject (`near`, words like a keyword list) or after
   * `after` questions to them. `reply` is how they bring it up; without it
   * they give the usual answer.
   */
  volunteer?: { near?: string; after?: number; reply?: string[] };
}

export interface EvidenceReaction {
  characterId: string;
  evidenceId: string;
  reply: string[];
  requires?: Condition;
  effects?: Effect[];
  /** Recorded as an important statement. */
  reveals?: string;
}

/**
 * A discrepancy between testimony and what the investigator has established.
 * Recorded only when `when` holds, so nobody is labeled inconsistent
 * without supporting evidence. Written neutrally; it never says who lied.
 */
export interface ContradictionDef {
  id: string;
  characterId: string;
  title: string;
  text: string;
  when: Condition;
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
    | { type: "travel"; locationId: string }
    | { type: "delivery"; deliveryId: string };
  /** Painted artwork for this object or person (asset key), drawn over a painted scene once it exists. */
  art?: string;
  /** Draws a sprite in the scene at this rectangle; the first entry whose condition holds is shown. */
  sprite?: { image: string; when?: Condition }[];
  /** A subtle cue (a ringing telephone, something new on the desk) while the condition holds. */
  attention?: Condition;
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
  /** A label always shown above the pin on the map, e.g. "CRIME SCENE", to draw players there. */
  mapTag?: string;
  /** Neighborhood. Travel within one area is on foot; between areas, by car. */
  area?: string;
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
  /** What the sealed item looks like before it is opened. */
  exterior?: string;
  /** The enclosed note. Can be read aloud by the narrator. */
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
  /** `spoken` is what the narrator reads aloud, written for the ear (dates and times in words); otherwise heading and body. */
  pages: { heading?: string; body: string; spoken?: string }[];
  /** Heading above the people list. */
  peopleHeading?: string;
  /** Evidence that can be collected from this document. */
  evidence: string[];
  effectsOnRead?: Effect[];
}

export interface StatementDef {
  characterId: string;
  recordedAt: string;
  officer: string;
  /** Tape label, e.g. "85-NE-2291 / Tape 1". */
  tape: string;
  /** Audio key for a real recording; when null the tape is voiced with the character voices on request. */
  audio: string;
  /** Each line names its speaker by character id so it can be voiced consistently. */
  transcript: { speakerId: string; speaker: string; text: string }[];
}

/**
 * A reactive story event. Deterministic: it moves through its lifecycle only
 * when the investigation state satisfies each stage, and is re-evaluated after
 * every player action. Never on a timer. Each stage happens once.
 *
 *   locked -> available   when `requires` (and the listed flags, evidence,
 *                         deductions and interviews) all hold
 *   available -> active   when `activate` holds (where and how it is presented)
 *   active -> completed   when `complete` holds
 */
export interface ReactiveEventDef {
  id: string;
  caseId: string;
  title: string;
  /** The person the event concerns, for the notebook. */
  characterId?: string;
  /** General trigger condition (supports all / any / not). */
  requires: Condition;
  requiresFlags?: string[];
  requiresEvidence?: string[];
  requiresDeductions?: string[];
  /** Dialogue entries that must have been asked. */
  requiresInterviews?: string[];
  /** When an available event is presented to the player. Defaults to immediately. */
  activate?: Condition;
  complete: Condition;
  onAvailable?: Effect[];
  onActivate?: Effect[];
  onComplete?: Effect[];
  /** Follow-up dialogue entries hidden until this event completes. */
  unlocksQuestions?: string[];
  /** Evidence this event makes discoverable, listed in the notebook once collected. */
  evidence?: string[];
  /** Events and Developments entry in the notebook. */
  notebook: {
    /** When the entry is shown. Defaults to once the event is active. */
    visible?: Condition;
    /** What the investigator has learned; each line appears once its condition holds. */
    learned: { text: string; requires?: Condition }[];
    /** A telephone call whose transcript belongs with this event. */
    call?: string;
    /** A delivery whose enclosed note belongs with this event. */
    delivery?: string;
  };
}

export interface DeductionDef {
  id: string;
  /** Design code from the brief, e.g. "D02". */
  code?: string;
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
  /** Report section letter and heading, e.g. "A", "Primary Suspect". */
  section: string;
  title: string;
  question: string;
  options: { id: string; label: string }[];
}

/**
 * The evidentiary standard a final report must meet. Configured per case and
 * judged only on the server. A report is supported when its attached evidence
 * covers enough independent lines of inquiry and ties the named person to the
 * events; no single combination of items is required.
 */
export interface EvidenceStandard {
  minItems: number;
  maxItems: number;
  /** Independent lines of support, e.g. physical, timeline, financial. */
  lines: { id: string; label: string; anyOf: string[] }[];
  minLines: number;
  /** At least this many attached items must be key evidence (items on a line of support). The rest may be anything. */
  minKey?: number;
  /** At least one attached item must connect the named person to the events. */
  linkToSuspect: string[];
  /** Relevant items that belong to no line and are not held against the report. */
  supporting: string[];
  /** How many attached items may have no bearing on the conclusions. */
  maxUnrelated: number;
  /** Answers that leave a question open; a report containing one is never accepted. */
  undecided: string[];
}

export interface SolutionDef {
  culprit: string;
  motive: string;
  weapon: string;
  location: string;
  standard: EvidenceStandard;
  /** Revealed only after the report is accepted. */
  resolution: {
    accepted: string;
    reconstruction: { heading: string; body: string }[];
    /** Det. Bennett's response, spoken in his voice. */
    bennett: string[];
  };
}

export interface ReportDraft {
  culprit?: string;
  motive?: string;
  weapon?: string;
  location?: string;
  evidence: string[];
}

export interface ReportSubmission {
  at: number;
  theory: Theory;
  accepted: boolean;
  /** The agency reviewer's note, written so it never says which answer is wrong. */
  note: string;
}

export interface FinalReport {
  theory: Theory;
  investigator: string;
  filedAt: number;
  attempts: number;
}

/** A piece of music or room sound made with ElevenLabs from the Admin page. */
export interface SoundtrackDef {
  /** Asset key, e.g. "music.theme" or "amb.diner". */
  key: string;
  kind: "music" | "ambience";
  label: string;
  /** Music: the track length. Ambience: one seamless loop (at most 30). */
  seconds: number;
  prompt: string;
}

/**
 * A test sent to the police lab. It takes real time: the countdown runs on
 * the server from the moment it is sent, whether or not anyone is playing.
 */
export interface LabDef {
  id: string;
  /** Shown on the countdown, e.g. "Blood typing: the broken glass". */
  label: string;
  seconds: number;
  /** The office desk spot where the countdown is shown (a hotspot rect). */
  rect: { x: number; y: number; w: number; h: number };
  /** What happens when the results are back (usually a delivery to the desk). */
  onReady: Effect[];
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
  contradictions: ContradictionDef[];
  documents: DocumentDef[];
  statements: StatementDef[];
  calls: CallDef[];
  outgoingCalls: OutgoingCallDef[];
  deliveries: DeliveryDef[];
  events: ReactiveEventDef[];
  deductions: DeductionDef[];
  objectives: ObjectiveDef[];
  conclusionChoices: ChoiceSet[];
  /** When the final report may be opened and filed. */
  reportAvailable: Condition;
  solution: SolutionDef;
  /** Seed timeline entries the player starts with. */
  timeline: { time: string; text: string; source: string }[];
  /** Questions each interviewee answers before needing a new reason (default 20). */
  questionLimit?: number;
  /** Music and room sound, generated once and served from storage. */
  soundtrack?: SoundtrackDef[];
  /**
   * A nudge toward the murder board: once this much evidence is collected with
   * nothing connected on the board, this call rings at the office (once).
   */
  boardHint?: { evidenceCount: number; callId: string };
  /** Tests the player can have the police lab run. */
  labs?: LabDef[];
  /** Evidence and developments that earn extra questions with a particular person. */
  reinterviews?: ReinterviewDef[];
}

// ---------------------------------------------------------------------------
// Saved state (stored in save_games.state, never contains case content)
// ---------------------------------------------------------------------------

/** A photograph the investigator took of something in a scene. It is filed with the evidence. */
export interface PhotoRecord {
  /** `PH_<hotspotId>`: one photograph per thing photographed. */
  id: string;
  hotspotId: string;
  locationId: string;
  title: string;
  /** What the investigator observed, written on the back. */
  text: string;
  /** The picture: the scene cropped to the subject, as it looked when taken. */
  image: string;
  at: number;
}

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
  /** Photographs taken in scenes, filed alongside the evidence. */
  photos: PhotoRecord[];
  /** Lab tests sent off, by lab id: when they were sent, when they come back, and whether they have. */
  labs: Record<string, { startedAt: number; readyAt: number; done: boolean }>;
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
  conversations: Record<string, ConversationLine[]>;
  /** Interview question allowances, credits and redemptions. */
  budget?: QuestionBudget;
  /** Follow-up questions unlocked by earlier answers. */
  unlockedQuestions: string[];
  /** Per character, the entry their last answer offered, taken by a short yes. */
  offers?: Record<string, string>;
  /** Contradictions the investigator has established. */
  contradictions: string[];
  /** Each character's current manner, so changes are noticed once. */
  demeanor: Record<string, string>;
  /** Whether characters speak aloud during interviews. */
  voices: boolean;
  notebook: (NotebookEntryInput & { at: number })[];
  timeline: { time: string; text: string; source: string }[];
  playerNotes: string;
  board: { items: { id: string; x: number; y: number }[]; connections: [string, string][] };
  deductions: string[];
  /** Events that have been presented (active or completed). Kept for older saves and conditions. */
  events: string[];
  /** Lifecycle of every event that has left the locked state. */
  eventStates: Record<string, Exclude<EventState, "locked">>;
  env: Record<string, string>;
  pendingCalls: string[];
  answeredCalls: string[];
  pendingDeliveries: string[];
  openedDeliveries: string[];
  readDocuments: string[];
  messages: string[];
  attempts: number;
  /** The final report: the working draft, every submission, and the accepted report. */
  report: { draft: ReportDraft; submissions: ReportSubmission[]; final: FinalReport | null };
  activeSeconds: number;
  lastActionAt: number;
  closedAt: number | null;
}

export interface ConversationLine {
  /** "you", a character id, or "cue" for a stage note. */
  speaker: "you" | "cue" | string;
  text: string;
  /** The question or evidence that produced this line. */
  q?: string;
  kind?: "question" | "answer" | "present" | "reaction" | "refusal" | "cue" | "call";
  /** For the investigator's questions: which allowance paid for it. */
  fund?: QuestionFund;
}

/** Where a question's cost came from. */
export type QuestionFund = "base" | "reinterview" | "bonus" | "purchased";

/** One character's question allowance in this investigation. All counts only ever grow. */
export interface CharacterBudget {
  baseUsed: number;
  reinterviewGranted: number;
  reinterviewUsed: number;
  bonusGranted: number;
  bonusUsed: number;
  purchasedGranted: number;
  purchasedUsed: number;
}

/** The interview question economy for one investigation. */
export interface QuestionBudget {
  mode: "standard" | "hardcore";
  characters: Record<string, CharacterBudget>;
  /** Authored answers whose first delivery counted toward expense credits, by unique id. */
  qualifying: string[];
  /** Re-interview grants already awarded. */
  grants: string[];
  /** Credits spent; credits earned are derived from `qualifying`. */
  redeemed: number;
  redemptions: { id: string; characterId: string; credits: number; at: number }[];
  purchases: { id: string; characterId: string; questions: number; at: number; reference: string }[];
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
  | { type: "photograph"; hotspotId: string }
  /** Nothing to do but let time-based things (lab results) catch up. */
  | { type: "checkLabs" }
  | { type: "readDocument"; documentId: string }
  | { type: "talk"; characterId: string }
  | { type: "ask"; questionId: string }
  /**
   * A question in the player's own words, typed or spoken. The server decides
   * which authored answer it matches (`match`), never the browser.
   */
  | { type: "askFree"; characterId: string; text: string; match?: string | null; composed?: string | null; facts?: number[] | null }
  | { type: "present"; characterId: string; evidenceId: string }
  /** Spend five expense credits (an in-world $5) for five more questions with one person. `requestId` makes a retry harmless. */
  | { type: "extendInterview"; characterId: string; requestId: string }
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
  | { type: "setVoices"; enabled: boolean }
  | { type: "dismissMessages" }
  | { type: "saveReport"; draft: ReportDraft }
  /** `investigator` is set by the server from the signed-in profile, never by the browser. */
  | { type: "submitConclusion"; theory: Theory; investigator?: string };

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
  /** A photograph the investigator took, rather than an item collected. */
  photo?: boolean;
  /** How the item is referred to on screen, e.g. "E07" or "P2". */
  label: string;
}

export interface ClientCharacter {
  id: string;
  name: string;
  role: string;
  portrait: string;
  bio: string[];
  onBoard: boolean;
}

export interface ClientLine {
  /** Position in the character's transcript; used to request the spoken audio. */
  n: number;
  speakerId: string;
  speaker: string;
  text: string;
  kind: NonNullable<ConversationLine["kind"]>;
}

export interface ClientInterview {
  characterId: string;
  name: string;
  role: string;
  portrait: string;
  where: string;
  medium: "in person" | "telephone";
  demeanor: string | null;
  /** "Not interviewed", "In progress", "No further questions for now", "Declining to answer". */
  status: string;
  asked: number;
  transcript: ClientLine[];
  statements: { id: string; title: string; text: string }[];
  contradictions: { id: string; title: string; text: string }[];
  voiced: boolean;
  /** Questions left with this person, or null when unlimited. */
  questionsLeft: number | null;
}

/** What the interview screen shows about the question allowance. Never the credit arithmetic. */
export interface ClientQuestions {
  limited: boolean;
  /** Questions left right now. */
  left: number;
  exhausted: boolean;
  mode: "standard" | "hardcore";
  /** Expense money in hand (fictional dollars), standard mode only. */
  expense: number;
  /** The in-world offer for five more questions, when it can be made now. */
  extend: { offer: string; cost: number } | null;
}

export interface ClientDevelopment {
  id: string;
  title: string;
  status: "Open" | "Resolved";
  characterId: string | null;
  character: string | null;
  learned: string[];
  evidence: { id: string; title: string }[];
  call: { title: string; speaker: string; lines: string[] } | null;
  note: { title: string; text: string } | null;
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
    area: string | null;
    name: string;
    subtitle: string;
    background: string;
    ambience: string | null;
    hotspots: { id: string; label: string; rect: HotspotDef["rect"]; inspected: boolean; collected: boolean; sprite: string | null; figure: boolean; pending: boolean; attention: boolean }[];
  };
  map: { id: string; name: string; subtitle: string; area: string | null; available: boolean; visited: boolean; current: boolean; pin: { x: number; y: number } | null; tag: string | null }[];
  /** Optional recordings for travel scenes; when null the game synthesizes the sound. */
  travelAudio: { drive: string | null; walk: string | null };
  /** Background music for the whole case: tracks played one after another, round and round. */
  music: string[];
  /** Lab tests in progress or back. `remainingMs` is as of when this view was made. */
  labs: { id: string; label: string; remainingMs: number; done: boolean; rect: { x: number; y: number; w: number; h: number } }[];
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
  statements: {
    characterId: string;
    name: string;
    recordedAt: string;
    officer: string;
    tape: string;
    status: string;
    audio: string | null;
    voiced: boolean;
    transcript: StatementDef["transcript"];
  }[];
  interviews: ClientInterview[];
  developments: ClientDevelopment[];
  messages: string[];
  narration: boolean;
  voices: boolean;
  conclusion: {
    available: boolean;
    choices: ChoiceSet[];
    minItems: number;
    maxItems: number;
    attempts: number;
    draft: ReportDraft;
    /** The agency's response to the latest returned report. */
    /** The last returned submission: when, the reviewer's note, which attempt, and the evidence it carried. */
    review: { at: number; note: string; attempt: number; evidence: string[] } | null;
    final: FinalReport | null;
  };
  /** Only present once the case is closed. */
  closure: (SolutionDef["resolution"] & { final: FinalReport | null; closedAt: number | null }) | null;
}

/** One-off payloads returned alongside the view for the action just taken. */
export type ActionOutcome =
  | { kind: "none" }
  | { kind: "inspect"; title: string; text: string; image: string | null; evidence: ClientEvidence | null; photo: { hotspotId: string; taken: boolean } | null }
  | { kind: "panel"; panel: PanelId }
  | {
      kind: "conversation";
      characterId: string;
      name: string;
      role: string;
      portrait: string;
      where: string;
      medium: "in person" | "telephone";
      demeanor: string | null;
      refusing: boolean;
      history: ClientLine[];
      /** Transcript positions added by the action just taken. */
      latest: number[];
      /** Whether the investigator can ask anything right now. Authored questions are never sent. */
      canAsk: boolean;
      idle: string;
      available: boolean;
      voiced: boolean;
      questions: ClientQuestions;
    }
  | {
      kind: "document";
      id: string;
      title: string;
      dossier: { label: string; value: string }[];
      peopleHeading: string;
      people: { id: string; name: string; role: string; portrait: string }[];
      pages: DocumentDef["pages"];
      evidence: { id: string; title: string; collected: boolean }[];
    }
  | { kind: "call"; id: string; title: string; from: string; fromId: string; lines: string[]; voiced: boolean }
  | {
      kind: "delivery";
      id: string;
      title: string;
      /** True until the player chooses to open it. */
      sealed: boolean;
      exterior: string;
      text: string;
      evidence: { id: string; title: string; collected: boolean }[];
    }
  | { kind: "deduction"; id: string; title: string; text: string }
  | {
      kind: "verdict";
      correct: boolean;
      feedback: string;
      note: string;
      /** Filled in by the server after the service record is updated. */
      record?: { first: boolean; awarded: string[]; rank: string | null };
    }
  | { kind: "error"; message: string };

export interface ActionResponse {
  view: ClientView;
  outcome: ActionOutcome;
}
