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
  /** A text message arrives on the investigator's phone (a TextDef id). */
  | { text: string }
  /** Records a deduction as established, with its notebook entry and effects (a timeline finding or a comparison can establish one). */
  | { deduce: string }
  | { when: Condition; then: Effect[] }; // applies only if the condition holds at that moment

export interface NotebookEntryInput {
  id: string;
  kind: "interview" | "observation" | "call" | "event" | "document" | "contradiction";
  title: string;
  text: string;
  characterId?: string;
  /** Marks a statement worth highlighting in the interview notebook. */
  important?: boolean;
  /** Written by a captive investigator: shown only on the captive's screen until the captivity ends. */
  private?: boolean;
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
  /**
   * How the interview happens. Telephone interviews are opened from the office
   * phone, or from anywhere in a case with a mobile phone.
   */
  medium?: "in person" | "telephone";
  /**
   * While this holds, the person can also be telephoned: from anywhere in a
   * case with a mobile phone, otherwise from the office telephone (a detective
   * you can see at the station or ring).
   */
  phone?: Condition;
  /** A line under the person's name in the phone's contacts. */
  contact?: string;
  /**
   * Once this holds the person has died: they can no longer be interviewed,
   * are listed as deceased, and their earlier interviews stay in the notebook.
   */
  deceased?: Condition;
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
    | { type: "delivery"; deliveryId: string }
    /** Plays a conversation the investigator overhears (a CallDef with `overheard`), voiced line by line. */
    | { type: "overhear"; callId: string }
    /** Answers the case's invitation: whoever takes it goes to the meeting and is held (see CaptivityDef). */
    | { type: "meeting" };
  /** Painted artwork for this object or person (asset key), drawn over a painted scene once it exists. */
  art?: string;
  /** Draws a sprite in the scene at this rectangle; the first entry whose condition holds is shown. */
  sprite?: { image: string; when?: Condition }[];
  /** A subtle cue (a ringing telephone, something new on the desk) while the condition holds. */
  attention?: Condition;
  /** A short pointer shown beside the hotspot while the condition holds, e.g. "Tap here to travel". */
  callout?: { text: string; when: Condition };
}

export type PanelId = "casefile" | "board" | "notebook" | "map" | "phone" | "statements" | "delivery" | "conclusion" | "sequence" | "comparison";

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
  /** Kept off the map (and out of the browser) until it can be visited, so its name doesn't give the story away. */
  secret?: boolean;
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
  /**
   * How "read aloud" voices this item, part by part. A part with a speaker is
   * read in that character's own voice (a voice on a tape); the rest by the
   * narrator. Without it the whole inspection text is narrated.
   */
  readAloud?: { speakerId?: string; text: string }[];
}

export interface CallDef {
  id: string;
  from: string; // character id
  title: string;
  lines: string[];
  effects?: Effect[];
  /** Who speaks each line, by character id, when it is not `from` (an overheard exchange between two people). */
  speakers?: (string | null)[];
  /** Overheard rather than a telephone call: played from a scene, never listed in the phone's log. */
  overheard?: boolean;
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
  /** A stable id, e.g. "culprit". Answers are keyed by it. */
  id: string;
  /** More than one option may be chosen (several people carried it out). */
  multi?: boolean;
  /** Report section letter and heading, e.g. "A", "Primary Suspect". */
  section: string;
  title: string;
  question: string;
  /** `requires` keeps an option off the form until it holds (a suspect the player has not found yet). */
  options: { id: string; label: string; requires?: Condition }[];
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
  /** The reviewer's note when nothing attached makes that connection. Defaults to one about "the events of that night". */
  linkNote?: string;
  /** Relevant items that belong to no line and are not held against the report. */
  supporting: string[];
  /** How many attached items may have no bearing on the conclusions. */
  maxUnrelated: number;
  /** Answers that leave a question open; a report containing one is never accepted. */
  undecided: string[];
  /**
   * What the report must show, as a checklist the player sees at the top of the
   * evidence section. The player files each attached item under the point they
   * think it proves; a point holds when an item filed under it is in `anyOf`.
   * Labels are neutral ("Shows why they did it") and never hint at the answer.
   * Without claims a case uses the older lines-of-inquiry check alone.
   */
  claims?: ClaimDef[];
}

/** One point a report has to prove. */
export interface ClaimDef {
  id: string;
  /** Shown to the player. Neutral: it says what kind of proof is needed, never what it is. */
  label: string;
  /** Evidence that proves this point when filed under it. */
  anyOf: string[];
  /** Said on a returned report from the second return on, when no proof for this point has been found yet. A hint at where to look, never an item. */
  hint?: string;
}

/** The draft or theory key holding the items filed under a point of the report. */
export const claimKey = (id: string) => `claim:${id}`;

export interface SolutionDef {
  /** The classic four answers. Cases with other report questions use `answers`. */
  culprit?: string;
  motive?: string;
  weapon?: string;
  location?: string;
  /** The right answer to each report question, by choice id. A multi-select answer lists every option needed, in any order. */
  answers?: Record<string, string | string[]>;
  standard: EvidenceStandard;
  /** Revealed only after the report is accepted. */
  resolution: {
    accepted: string;
    reconstruction: { heading: string; body: string }[];
    /** Det. Bennett's response, spoken in his voice. */
    bennett: string[];
    /** Who makes the closing call, when it is not Det. Bennett of the LAPD. */
    caller?: { characterId: string; name: string; tag: string };
  };
}

/** A report in progress: an answer per report question (a list for multi-select), and the attached evidence. */
export interface ReportDraft {
  evidence: string[];
  [choice: string]: string | string[] | undefined;
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
  /** Image key of what will arrive there, shown grayed out with the countdown while the lab works. */
  image?: string;
  /** What happens when the results are back (usually a delivery to the desk). */
  onReady: Effect[];
}

/**
 * The investigator is lured somewhere and held (C004). Optional and reusable.
 *
 * Whoever takes up the invitation (a `meeting` hotspot) becomes the captive;
 * it is never chosen at random. With nobody else at the table it is a solo
 * escape. In a joint investigation with other screens active it is a rescue:
 * the captive plays the captive scenes on their own screen while everyone else
 * plays the rest of the case, and nothing the captive finds reaches the others
 * except through the scenes themselves (a flag the case sets, such as a signal
 * seen from outside), until the captivity ends.
 *
 * The engine sets the flag `held` while it lasts and `captivity_over` after,
 * and the environment `captivity` to "solo" or "rescue" for scene conditions.
 */
export interface CaptivityDef {
  /** While this holds and nobody has gone yet, the meeting hotspot can be taken. */
  invitation: Condition;
  /** Where the captive comes to. */
  start: string;
  /** Scenes only the captive can be in. */
  captiveScenes: string[];
  /** Evidence the captive finds, kept from the other screens until the captivity ends. */
  privateEvidence: string[];
  /** Ends the captivity: an escape, or a rescue. */
  end: Condition;
  /** Where everyone is afterwards. */
  returnTo: string;
  /** Shown to the captive as they are taken. */
  capture: { title: string; text: string };
  effectsOnCapture?: Effect[];
  /** Shown on the other screens when someone goes, with {name} for who went. */
  leftMessage: string;
  /** Shown to everyone when it ends, per mode. */
  endMessage: { solo: string; rescue: string };
  effectsOnEnd?: Effect[];
  /** Shown to the captive when they choose to go it alone. */
  aloneMessage: string;
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
  /** Title of the travel map, e.g. "Street map of Los Angeles". */
  mapTitle?: string;
  /** Lines under the final report's heading after the case number and title, e.g. Classification, Location, Victim. */
  reportHeader?: { label: string; value: string }[];
  /** Evidence and developments that earn extra questions with a particular person. */
  reinterviews?: ReinterviewDef[];
  /**
   * "mobile": the investigator carries a phone. Calls ring wherever they are,
   * telephone contacts can be called from anywhere, deliveries such as lab
   * reports can be read from anywhere, and texts arrive. Default: the office telephone only.
   */
  phone?: "office" | "mobile";
  /** Text messages the case can send with the `text` effect. */
  texts?: TextDef[];
  /** The case's status line; the last entry whose condition holds is shown (e.g. "Active homicide"). */
  status?: { label: string; when?: Condition }[];
  /** Labeled sections of the murder board, each shown once its condition holds. Items and string can cross them. */
  boardSections?: { id: string; label: string; when?: Condition }[];
  /** The date typed by the signature on the final report, e.g. "October 2018". Default "August 1985". */
  reportDate?: string;
  /**
   * The case's look. Default: the agency's noir. "medieval" dresses the game
   * as an illuminated manuscript: parchment journal, wooden table, letters.
   */
  theme?: "medieval";
  /** Words the interface uses for this case, where the agency's usual ones would not fit (no photographs in 1327). */
  words?: Partial<CaseWords>;
  /** How characters speak, for answers composed from their knowledge. */
  speech?: { setting: string; style: string };
  /** Timelines the player puts in order to test accounts (the bell timeline). */
  sequences?: SequenceDef[];
  /** Documents the player compares, side by side, to find what differs. */
  comparisons?: ComparisonDef[];
  /** The investigator is lured somewhere and held; see CaptivityDef. */
  captivity?: CaptivityDef;
}

/** Words the interface uses. Every case gets the defaults in `src/game/words.ts` unless it supplies its own. */
export interface CaseWords {
  /** What a picture of a scene is called: "Photo", "Sketch". */
  photo: string;
  /** The button that takes one: "Take a photo". */
  photoAction: string;
  /** Said once it is taken. */
  photoTaken: string;
  /** The notebook heading for one: "Photographed". */
  photoNote: string;
  /** Letter before its number on screen, "P" for P1. */
  photoPrefix: string;
  /** The stamp on a new picture, two lines: ["Photo", "Filed"]. */
  photoStamp: [string, string];
  /** The stamp on new evidence, two lines: ["Collected", "Evidence"]. */
  collectedStamp: [string, string];
  notebook: string;
  evidence: string;
  map: string;
  /** The murder board's name. */
  board: string;
  /** The home base, in a sentence: "the office". */
  home: string;
  /** The telephone panel's title. */
  phone: string;
  /** Top bar, a call waiting while away: "A call is waiting at the office". */
  callWaiting: string;
  /** Top bar, a call coming in at home: "Telephone ringing". */
  callRinging: string;
  /** The ringing call, in the panel: "The line is ringing." */
  callNotice: string;
  /** The button that takes it: "Answer the telephone". */
  callAnswer: string;
  /** Leave it for later: "Let it ring". */
  callDefer: string;
  /** Close a call: "Hang up". */
  callClose: string;
  /** Heading over earlier calls: "Earlier calls". */
  callLog: string;
  /** How a telephone contact is reached, in the people list: "By telephone from your office". */
  byPhone: string;
  /** Start talking to a telephone contact: "Call". */
  callContact: string;
  /** Heading for things one can send for: "Make a call". */
  outgoing: string;
  /** The board hint while away from home. */
  boardHintWaiting: string;
  /** The way home in the top bar: "Return to Agency HQ". */
  leave: string;
  /** Who judges the final report, in a sentence: "the agency". */
  reviewer: string;
  /** The report form's name in its header: "FORM BI-7". */
  form: string;
  /** Journal tags for what was seen and what was said. Empty strings show no tags. */
  observed: string;
  claimed: string;
}

/**
 * A timeline the player assembles from what they have learned, to test
 * people's accounts against each other. The correct places are known only
 * to the server; testing reports only the contradictions (findings) that the
 * cards as placed now show, never where a card belongs.
 */
export interface SequenceDef {
  id: string;
  title: string;
  /** How to use it, shown at the top. */
  intro: string;
  /** Shown once this holds (usually once there are cards). */
  available: Condition;
  /** The spaces, in order, e.g. Before Vespers, After Vespers. */
  spaces: { id: string; label: string }[];
  cards: SequenceCard[];
  findings: SequenceFinding[];
  /** Said when a test finds nothing new. */
  nothingNew: string;
}

export interface SequenceCard {
  id: string;
  text: string;
  /** Who or what it comes from, shown in the corner. */
  source: string;
  /** Observed: seen or found. Claimed: someone's account of themselves, placed where they say it belongs. */
  kind: "observed" | "claimed";
  /** When the card appears. */
  unlock: Condition;
  /** Where it really belongs (observed cards). Server-only. */
  space?: string;
}

export interface SequenceFinding {
  id: string;
  title: string;
  /** Written into the journal when found. */
  text: string;
  /** Cards that must be placed, each in its correct space (observed) or anywhere listed (claimed). */
  needs: { card: string; anyOf?: string[] }[];
  /** Cards that must also be in this order, earliest first. */
  ordered?: string[];
  effects?: Effect[];
}

/**
 * Two documents side by side. The player picks a passage and says what
 * differs between them; only true discrepancies are entered in the journal.
 * Which observation is right never reaches the browser.
 */
export interface ComparisonDef {
  id: string;
  title: string;
  intro: string;
  /** When the comparison can be opened. */
  available: Condition;
  /** Who comments on each find, by character id. */
  expert: string;
  left: { title: string; evidence?: string };
  right: { title: string; evidence?: string };
  regions: ComparisonRegion[];
  /** Said on a wrong pick. */
  wrong: string;
  /** Once every true discrepancy is found. */
  onComplete?: Effect[];
  completeText: string;
}

export interface ComparisonRegion {
  id: string;
  label: string;
  /** What each document says or shows at this place. */
  leftText: string;
  rightText: string;
  /** Detail images, by asset key. */
  leftImage?: string;
  rightImage?: string;
  options: { id: string; text: string }[];
  /** The true observation. A decoy region's answer is that nothing differs in substance. */
  answer: string;
  /** True discrepancies count toward completion; decoys do not. */
  discrepancy: boolean;
  /** The expert's comment on the right pick. */
  comment: string;
}

export interface TextDef {
  id: string;
  /** Character id of the sender. */
  from: string;
  body: string;
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
  timeline: { time: string; text: string; source: string; private?: boolean }[];
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
  /** Text messages received on the investigator's phone, oldest first. */
  texts?: string[];
  /** Where the player has put each card on each timeline, and the findings it has shown. */
  sequences?: Record<string, { placed: Record<string, { space: string; pos: number }>; findings: string[] }>;
  /** Passages compared: right picks found, and every pick tried (`region:option`). */
  comparisons?: Record<string, { found: string[]; tried: string[]; done: boolean }>;
  attempts: number;
  /** The final report: the working draft, every submission, and the accepted report. */
  report: { draft: ReportDraft; submissions: ReportSubmission[]; final: FinalReport | null };
  activeSeconds: number;
  lastActionAt: number;
  closedAt: number | null;
  /** The investigator held by the case's captivity, once someone has gone. */
  captivity?: CaptivityState;
}

/** Who is held, how, and where they are. Their location is theirs alone; `location` stays the table's. */
export interface CaptivityState {
  /** "host", or the guest's id in a joint investigation. */
  seat: string;
  /** The name shown to the others. */
  name: string;
  mode: "solo" | "rescue";
  location: string;
  startedAt: number;
  endedAt: number | null;
  /** Notices for the captive's screen only. */
  messages: string[];
}

/**
 * Which screen an action comes from, for the captivity rules. Without it the
 * action is the host's and nobody else is present, which is every solo game.
 */
export interface SeatContext {
  seat?: string;
  name?: string;
  /** Screens seen in the last couple of minutes, this one included. Null when presence is not known. */
  active?: string[] | null;
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
  /** A rescuer takes the place of a captive whose screen has gone quiet, keeping every step they made. */
  | { type: "takeCaptiveRole" }
  /** The captive, with nobody left at the table, finishes alone. */
  | { type: "goAlone" }
  | { type: "saveReport"; draft: ReportDraft }
  /** Puts a timeline card in a space (`pos` orders cards within it), or takes it off (`space: null`). */
  | { type: "sequencePlace"; sequenceId: string; cardId: string; space: string | null; pos: number }
  /** Tests the timeline as it stands. */
  | { type: "sequenceTest"; sequenceId: string }
  /** Says what differs at one passage of a comparison. */
  | { type: "compare"; comparisonId: string; regionId: string; optionId: string }
  /** `investigator` is set by the server from the signed-in profile, never by the browser. */
  | { type: "submitConclusion"; theory: Theory; investigator?: string };

/** A filed report: an answer per report question (a list for multi-select), and the attached evidence. */
export interface Theory {
  evidence: string[];
  [choice: string]: string | string[];
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
  deceased?: boolean;
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
    hotspots: { id: string; label: string; rect: HotspotDef["rect"]; inspected: boolean; collected: boolean; sprite: string | null; figure: boolean; pending: boolean; attention: boolean; callout: string | null }[];
  };
  map: { id: string; name: string; subtitle: string; area: string | null; available: boolean; visited: boolean; current: boolean; pin: { x: number; y: number } | null; tag: string | null }[];
  /** Optional recordings for travel scenes; when null the game synthesizes the sound. */
  travelAudio: { drive: string | null; walk: string | null };
  /** Questions put to anyone so far, by everyone at the table. */
  questionsAsked: number;
  /** Background music for the whole case: tracks played one after another, round and round. */
  music: string[];
  /** Lab tests in progress or back. `remainingMs` is as of when this view was made. */
  labs: { id: string; label: string; remainingMs: number; done: boolean; rect: { x: number; y: number; w: number; h: number }; image: string | null }[];
  evidence: ClientEvidence[];
  characters: ClientCharacter[];
  notebook: InvestigationState["notebook"];
  timeline: InvestigationState["timeline"];
  playerNotes: string;
  deductions: { id: string; title: string; text: string }[];
  objectives: { id: string; text: string; done: boolean }[];
  board: InvestigationState["board"];
  phone: {
    /** The investigator carries a phone: it rings anywhere, and contacts can be called from anywhere. */
    mobile: boolean;
    ringing: { id: string; from: string } | null;
    outgoing: { id: string; to: string; label: string }[];
    log: { id: string; title: string }[];
    /** People who can be called right now. */
    contacts: { id: string; name: string; role: string; note: string }[];
    /** Text messages, newest first. */
    texts: { id: string; from: string; body: string }[];
  };
  /** The case's status line, if the case has one. */
  caseStatus: string | null;
  /** The case's look and its words for things. */
  theme: "noir" | "medieval";
  words: CaseWords;
  /** Timelines open to the player: the cards they have, where they put them, the findings so far. */
  sequences: {
    id: string;
    title: string;
    intro: string;
    spaces: { id: string; label: string }[];
    cards: { id: string; text: string; source: string; kind: "observed" | "claimed" }[];
    placed: Record<string, { space: string; pos: number }>;
    findings: { id: string; title: string; text: string }[];
  }[];
  /** Comparisons open to the player. */
  comparisons: {
    id: string;
    title: string;
    intro: string;
    expert: string;
    left: string;
    right: string;
    regions: { id: string; label: string; leftText: string; rightText: string; leftImage: string | null; rightImage: string | null; options: { id: string; text: string }[]; found: boolean }[];
    found: number;
    total: number;
    done: boolean;
    /** Every find so far, with the expert's comment. */
    notes: { region: string; text: string }[];
  }[];
  /** Labeled sections of the murder board that are open. */
  boardSections: { id: string; label: string }[];
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
  /** Title of the travel map. */
  mapTitle: string;
  conclusion: {
    /** Lines under the report's heading after the case number and title. */
    header: { label: string; value: string }[];
    available: boolean;
    choices: ChoiceSet[];
    /** The date by the signature. */
    date: string;
    minItems: number;
    maxItems: number;
    /** Key evidence the report needs. */
    minKey: number;
    /** The points the report must prove, each with the items the player has filed under it (in `draft`). */
    claims: { id: string; label: string }[];
    /** Evidence found so far and in the whole case: a quiet sign that there is more to find. */
    found: number;
    total: number;
    attempts: number;
    draft: ReportDraft;
    /** The agency's response to the latest returned report. */
    /** The last returned submission: when, the reviewer's note, which attempt, and the evidence it carried. */
    review: { at: number; note: string; attempt: number; evidence: string[] } | null;
    final: FinalReport | null;
  };
  /** While someone is held: this screen's part in it. */
  captivity: {
    role: "captive" | "rescuer";
    mode: "solo" | "rescue";
    /** Who went. */
    who: string;
    /** The captive's screen has gone quiet (rescuers), or every rescuer has (captive). */
    quiet: boolean;
    canTakeOver: boolean;
    canGoAlone: boolean;
  } | null;
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
      /** A talking portrait: one frame per mouth shape plus a blink, or null for a still portrait. */
      face: TalkingFace | null;
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
  | { kind: "call"; id: string; title: string; from: string; fromId: string; lines: string[]; voiced: boolean; speakers?: string[]; overheard?: boolean }
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
  /** A timeline test: the findings it turned up, or none. */
  | { kind: "sequence"; found: { title: string; text: string }[]; message: string }
  /** A comparison pick: right or not, and what the expert says. */
  | { kind: "compare"; regionId: string; correct: boolean; comment: string; complete: boolean }
  | {
      kind: "verdict";
      correct: boolean;
      feedback: string;
      note: string;
      /** Filled in by the server after the service record is updated. */
      record?: { first: boolean; awarded: string[]; rank: string | null };
    }
  | { kind: "error"; message: string };

/** The mouth shapes a talking portrait is painted in. "rest" is the portrait itself, mouth closed. */
export const FACE_SHAPES = ["rest", "slight", "ah", "ee", "oh", "oo", "f", "blink"] as const;
export type FaceShape = (typeof FACE_SHAPES)[number];
/** Image URL per shape. rest, slight, ah, ee, oh, oo and blink are always present; f is optional. */
export type TalkingFace = Partial<Record<FaceShape, string>> & { rest: string };

export interface ActionResponse {
  view: ClientView;
  outcome: ActionOutcome;
}
