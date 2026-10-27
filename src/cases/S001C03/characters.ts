import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { G, KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * S001C03 "Dead Freight" interviews, written against docs/S001C03-timeline.md.
 *
 * Rules for this file: nobody confesses; Gaffney, Kane and Fisk give their own
 * accounts, lies included, and move only where the design moves them; nobody
 * names who killed Hector Navarro; nobody states a forensic result that is not
 * in a report; every time, amount and number agrees with the timeline. Nothing
 * from the "Closing report only" list is said by anyone. Kane never names
 * anyone above him and never mentions Rourke; nobody says "the Architect."
 * Nobody explains the copier footer or the courier account on E022. Counsel in
 * the Rourke and Holt interviews is written into their replies. Det. Whitaker
 * starts on robbery and moves with the evidence.
 *
 * Every question is gated by `requires` alone, with the same condition as the
 * knowledge facts that point to it (shared through `G` in knowledge.ts).
 */

const ev = (id: string): Condition => ({ hasEvidence: id });
const never: Condition = { not: { always: true } };
const { maloneKnown, fiskKnown, kaneKnown, holtKnown, patapsco } = G;
const fiskRefuses: Condition = { all: [{ flag: "fisk_refuses" }, { not: { any: [ev("E028"), ev("E004")] } }] };

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The victim: in the file and on the board, never interviewed
  // ---------------------------------------------------------------------
  {
    id: "hector",
    name: "Hector Navarro",
    role: "Cargo checker, East Harbor Terminal. The victim",
    portrait: "char.hector",
    bio: [
      { text: "Thirty-nine. Cargo checker at East Harbor Terminal for eleven years, badge 21-0613. Lived at 3214 Fait Avenue, Highlandtown, with his wife Marisol and their daughter Sofia." },
      { text: "Found dead behind a stack of flat racks in Staging Area C at 9:22 PM on Sunday, December 2, 2018." },
      { text: "Reported seal and weight discrepancies on four export containers to his supervisor on November 29.", requires: ev("E014") },
      { text: "Kept a dated notebook of containers that left at night and came back with new seals, from November 15.", requires: ev("E009") },
    ],
    available: never,
    deceased: { always: true },
    locationId: null,
    onBoard: true,
    defaultEvidenceReply: "",
    idleLine: "",
  },

  // ---------------------------------------------------------------------
  // Everyone else
  // ---------------------------------------------------------------------
  {
    id: "marisol",
    name: "Marisol Navarro",
    role: "Hector's wife, your client",
    portrait: "char.marisol",
    bio: [
      { text: "Thirty-seven. Medical office administrator at a family practice in Highlandtown. Lives at 3214 Fait Avenue." },
      { text: "Called Blackwood at 9:00 AM on Monday, December 3. Their daughter Sofia, nine, is staying with Marisol's sister this week." },
    ],
    available: { always: true },
    locationId: "navarro_home",
    phone: { talkedTo: "marisol" },
    contact: "Your client. Fait Avenue, Highlandtown.",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. Hector didn't bring work home, not until this month.",
    idleLine: "I need to sit for a while. Call me when you know something.",
    noAnswer: ["I don't know.", "He never told me that.", "I wish I knew."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Woman of thirty-seven, a medical office administrator in Baltimore, grieving and worn out, steady underneath; then determined. Baltimore American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "grieving", label: "Grieving", requires: { always: true } },
      { id: "determined", label: "Determined", requires: { event: "RE01" }, cue: "Marisol has Hector's work gloves on the table in front of her. She keeps one hand on them." },
    ],
  },
  {
    id: "gaffney",
    name: "Russell Gaffney",
    role: "Terminal operations supervisor, EHTOC",
    portrait: "char.gaffney",
    bio: [
      { text: "Fifty-five. Terminal operations supervisor at East Harbor Terminal since 2013. Office in the Terminal Administration Building." },
      { text: "Hector Navarro's supervisor. Gave him a verbal warning on Friday, November 30.", requires: ev("E015") },
      { text: "Came to Baltimore from a stevedoring company in Norfolk, Virginia, which he left in March 2012.", requires: G.gaffneyNorfolk },
    ],
    available: { always: true },
    locationId: "gaffney_office",
    onBoard: true,
    defaultEvidenceReply: "That's paperwork. I've got a yard to run.",
    idleLine: "I've got a vessel working. We're done for now.",
    noAnswer: ["I wouldn't know.", "That's not my department.", "Ask the company."],
    voice: {
      voiceId: "VR6AewLTigWG4xSOukaG",
      direction: "Man of fifty-five, a port operations supervisor: brusque and dismissive at first, then defensive, then frightened and quietly broken. Mid-Atlantic American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "dismissive", label: "Dismissive", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: { any: [ev("E012"), { deduction: "D05" }] }, cue: "Gaffney stops looking at his screen. He folds his arms." },
      { id: "shaken", label: "Shaken", requires: { flag: "gaffney_admits" }, cue: "Gaffney sits down heavily. His radio squawks and he turns it off." },
      { id: "cooperating", label: "Cooperating", requires: { any: [{ deduction: "D12" }, ev("E023")] }, cue: "Gaffney puts his phone face up on the desk between you and leaves it there." },
    ],
  },
  {
    id: "kane",
    name: "Gideon Kane",
    role: "President, Kane Logistics Inc.",
    portrait: "char.kane",
    bio: [
      { text: "Forty-eight. President of Kane Logistics Inc., 1900 Clinton Street, Canton: drayage coordination and terminal security under a Terminal Services Agreement with EHTOC since 2016." },
      { text: "Operates the Riverside Freight Transfer Yard in Fairfield.", requires: { any: [ev("E026"), ev("E035"), { asked: "kane_riverside" }] } },
      { text: "Party to a 2017 security services agreement with Meridian Advisory Group.", requires: ev("E022") },
    ],
    available: { always: true },
    known: kaneKnown,
    locationId: "kane_office",
    phone: { event: "RE05" },
    contact: "Kane Logistics, Clinton Street, Canton. (410) 555-0100.",
    onBoard: true,
    defaultEvidenceReply: "Interesting. I don't see what it has to do with me.",
    idleLine: "I think we've covered it. My door's open, within reason.",
    noAnswer: ["I couldn't tell you.", "That isn't something I'd know.", "You'd have to ask the terminal."],
    voice: {
      voiceId: "N2lVS1w4EtoT3dr4eOWO",
      direction: "Man of forty-eight, a Baltimore logistics executive: calm, courteous, faintly amused, never raises his voice; colder and shorter once his lawyer is in the room. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: { any: [ev("E021"), ev("E023")] }, cue: "Kane's smile stays. He stops offering you coffee." },
      { id: "cold", label: "Cold", requires: { flag: "kane_searched" }, cue: "A lawyer in a gray suit sits beside Kane's desk now. Kane looks at him before every answer." },
    ],
  },
  {
    id: "fisk",
    name: "Dwayne Fisk",
    role: "Owner, Fisk Freight Security LLC",
    portrait: "char.fisk",
    bio: [
      { text: "Thirty-four. Owner of Fisk Freight Security LLC, a fenced yard and office trailer off Pennington Avenue, Curtis Bay. Six guards. Subcontractor to Kane Logistics since 2016." },
      { text: "Holds contractor badge C-1147 at East Harbor Terminal; Staging Area C was added to it on October 15, 2018.", requires: ev("E018") },
      { text: "Drives a gray 2016 Ford F-250 Super Duty with a roof-mounted amber light bar, MD plate 7FK4417.", requires: ev("E019") },
      { text: "In custody at BPD Homicide.", requires: G.custody },
    ],
    available: { always: true },
    known: fiskKnown,
    locationId: "fisk_yard",
    moves: [{ when: G.custody, locationId: "police" }],
    onBoard: true,
    defaultEvidenceReply: "Don't know what that is.",
    idleLine: "I got posts to cover. We're done.",
    noAnswer: ["Couldn't tell you.", "No idea.", "Not my business."],
    voice: {
      voiceId: "TxGEqnHWrfWFTfGW9XjX",
      direction: "Man of thirty-four, a private security contractor: flat, polite, watchful, very short answers, nothing offered; later sullen and lawyered. Baltimore American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "flat", label: "Flat", requires: { always: true } },
      { id: "evasive", label: "Evasive", requires: { any: [{ deduction: "D06" }, ev("E027")] }, cue: "Fisk looks past you at his truck, then back." },
      { id: "refusing", label: "Declining to answer", requires: fiskRefuses, refuses: "I said what I had to say. You bring something new, I'll listen. Otherwise I've got posts to cover.", cue: "Fisk sits back and folds his arms. He has stopped answering." },
      { id: "custody", label: "In custody", requires: G.custody, cue: "Fisk sits in the interview room in a county jumpsuit, a public defender beside him with a legal pad." },
    ],
  },
  {
    id: "rourke",
    name: "Julian Rourke",
    role: "Director of Corporate Intelligence, Meridian Advisory Group; in federal detention",
    portrait: "char.rourke",
    bio: [
      { text: "Forty-six. Director of Corporate Intelligence at Meridian Advisory Group, Washington, D.C. In federal detention since November 21, 2018." },
      { text: "Interviewed by video link from detention, his lawyer present, arranged through FBI Special Agent Teresa Quinlan." },
    ],
    available: G.rourkeKnown,
    known: G.rourkeKnown,
    locationId: null,
    medium: "telephone",
    phone: G.rourkeKnown,
    contact: "Video link from federal detention, with counsel",
    questionLimit: 12,
    onBoard: true,
    defaultEvidenceReply: "His lawyer, off camera: 'My client has no comment on that document.'",
    idleLine: "His lawyer, off camera: 'We're done for today.'",
    noAnswer: ["I have nothing to say about that.", "His lawyer, off camera: 'Next question.'", "That is not something I would know."],
    voice: {
      voiceId: "SOYHLrjzK2X1ezoPC6cr",
      direction: "Man of forty-six, a corporate intelligence director on a video link from detention: precise, clipped, coldly contemptuous, every word chosen. Educated American.",
      settings: { stability: 0.7, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "precise", label: "Precise", requires: { always: true } },
      { id: "shut", label: "Shut", requires: { presented: "rourke:E033" }, cue: "Rourke looks off screen at his lawyer and stays looking there." },
    ],
  },
  {
    id: "holt",
    name: "Adrian Holt",
    role: "Principal, Holt Advisory LLC; held at Carroway County Prison",
    portrait: "char.holt",
    bio: [
      { text: "Forty-nine. Principal of Holt Advisory LLC, Suite 2210, 600 Grant Street, Pittsburgh. Held at Carroway County Prison since November 15, 2018." },
      { text: "Recorded interview at the prison, his lawyer present, arranged through Det. Bowman of the Carroway Police." },
      { text: "Manager of Patapsco Freight Services LLC and its authorized signatory.", requires: holtKnown },
    ],
    available: holtKnown,
    known: holtKnown,
    locationId: null,
    medium: "telephone",
    phone: holtKnown,
    contact: "Recorded interview, Carroway County Prison, with counsel",
    questionLimit: 12,
    onBoard: true,
    defaultEvidenceReply: "His lawyer: 'My client won't comment on that.'",
    idleLine: "His lawyer: 'That's all for today.'",
    noAnswer: ["I couldn't say.", "That isn't something I'd know.", "His lawyer: 'He won't answer that.'"],
    voice: {
      voiceId: "cjVigY5qzO86Huf0OWal",
      direction: "Man of about fifty, a Pittsburgh financial adviser in a prison interview room: still polished and articulate, tired, clipped and careful, closing down. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "polished", label: "Polished", requires: { always: true } },
      { id: "declining", label: "Declining", requires: ev("E038"), cue: "Holt's lawyer leans in and says something. Holt nods and folds his hands." },
    ],
  },
  {
    id: "lindqvist",
    name: "Joanne Lindqvist",
    role: "Cargo documentation clerk, cargo verification office",
    portrait: "char.lindqvist",
    bio: [
      { text: "Thirty-one. Cargo documentation clerk in the cargo verification office, second floor of the Gate 1 building. Keys dock receipts, seals and weights." },
      { text: "Re-keyed seal numbers and weights on containers marked SH on her supervisor's instruction, six times since October.", requires: ev("E025") },
    ],
    available: { always: true },
    locationId: "verification",
    onBoard: true,
    defaultEvidenceReply: "I'm not sure. I only see the paper that comes to my desk.",
    idleLine: "I need to get back to the screen before someone notices.",
    noAnswer: ["I don't know.", "That's not on my desk.", "I'm sorry, I really don't."],
    voice: {
      voiceId: "MF3mGyEYCl7XYWbV9V6O",
      direction: "Woman of thirty-one, a port documentation clerk: careful, quiet, frightened, choosing her words; then relieved and forthcoming. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "careful", label: "Careful", requires: { always: true } },
      { id: "frightened", label: "Frightened", requires: { event: "RE02" }, cue: "Joanne glances at the stairs every time a door closes below." },
      { id: "forthcoming", label: "Forthcoming", requires: ev("E025"), cue: "Joanne lets out a long breath. She sits up straighter." },
    ],
  },
  {
    id: "malone",
    name: "Eddie Malone",
    role: "Owner-operator, Malone Hauling",
    portrait: "char.malone",
    bio: [
      { text: "Forty-three. Owner-operator of Malone Hauling: one 2012 Freightliner Cascadia day cab, MALONE HAULING on both doors. Leased on to Kane Logistics since 2016." },
      { text: "Drove night legs from Gate 4 to the Riverside yard and back since September.", requires: ev("E026") },
    ],
    available: maloneKnown,
    known: maloneKnown,
    locationId: "terminal_gate",
    onBoard: true,
    defaultEvidenceReply: "I drive. I don't read the paper they put in the box.",
    idleLine: "Queue's moving. I gotta go.",
    noAnswer: ["Couldn't tell you.", "I just drive the truck.", "Ask the dispatcher."],
    voice: {
      voiceId: "yoZ06aMxZJJ28mfd3POQ",
      direction: "Man of forty-three, a one-truck owner-operator: wary and gruff at first, then relieved to get it off his chest. Baltimore American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "wary", label: "Wary", requires: { always: true } },
      { id: "forthcoming", label: "Forthcoming", requires: ev("E026"), cue: "Malone shuts off the engine and climbs down from the cab." },
    ],
  },
  {
    id: "sullivan",
    name: "Vince Sullivan",
    role: "Retired checker and union steward",
    portrait: "char.sullivan",
    bio: [
      { text: "Sixty-two. Retired checker and union steward. Usually at the union hall trailer across the road from Gate 1." },
      { text: "Hector Navarro's mentor. Hector came to him on Sunday, November 25.", requires: { asked: "sullivan_hector" } },
    ],
    available: { always: true },
    locationId: "terminal_gate",
    onBoard: true,
    defaultEvidenceReply: "Read it to me. My eyes aren't what they were.",
    idleLine: "I need some air. Come back later.",
    noAnswer: ["Couldn't tell you.", "Ask somebody in a tie.", "That's above a checker's pay."],
    voice: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
      direction: "Man of sixty-two, a retired longshore checker and union steward: blunt, gravelly, grieving and angry, plain words. Baltimore American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [{ id: "blunt", label: "Blunt", requires: { always: true } }],
  },
  {
    id: "whitaker",
    name: "Det. Allison Whitaker",
    role: "BPD Homicide, lead investigator",
    portrait: "char.whitaker",
    bio: [
      { text: "Forty-five. Baltimore Police Department, Homicide Unit, lead on case 18-1202-118." },
      { text: "At 601 East Fayette Street or on her cell, any time." },
    ],
    available: { always: true },
    locationId: "police",
    phone: { always: true },
    contact: "BPD Homicide, 601 East Fayette Street. Lead on the Navarro case.",
    onBoard: false,
    defaultEvidenceReply: "Noted. Tell me what you think it means.",
    idleLine: "That's what I've got. Call me when something moves.",
    noAnswer: ["That's not in my file.", "I don't know yet.", "I won't guess on that."],
    voice: {
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      direction: "Woman of forty-five, a Baltimore homicide detective: direct, dry, busy, fair, no wasted words. Baltimore American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: { deduction: "D01" }, cue: "Whitaker turns a fresh page in her notebook and writes the date at the top." },
    ],
  },
  {
    id: "walsh",
    name: "Philip Walsh",
    role: "Accounts manager, EHTOC accounts office",
    portrait: "char.walsh",
    bio: [
      { text: "Forty. Accounts manager in the EHTOC accounts office, first floor of the Terminal Administration Building. A CPA." },
      { text: "Paid Kane Logistics' invoices to Patapsco Freight Services under a Notice of Assignment.", requires: ev("E032") },
    ],
    available: { always: true },
    known: { chapter: 3 },
    locationId: "accounting",
    onBoard: true,
    defaultEvidenceReply: "I'd want to look at that against the ledger before I said anything.",
    idleLine: "I need to get back to the ledger. Come back if you have something specific.",
    noAnswer: ["The ledger doesn't tell me that.", "That's an operations question.", "I don't know, and I'm not going to guess."],
    voice: {
      voiceId: "bIHbv24MWmeRgasZH58o",
      direction: "Man of forty, a corporate accountant: nervous, precise, talks fast when worried, relieved once he's helping. American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "nervous", label: "Nervous", requires: { always: true } },
      { id: "cooperative", label: "Cooperative", requires: ev("E032"), cue: "Walsh pulls a chair around to your side of the desk and opens the vendor file." },
    ],
  },
  {
    id: "bennett",
    name: "Frank Bennett",
    role: "Blackwood records, by phone",
    portrait: "char.bennett",
    bio: [
      { text: "Forty years with the LAPD, retired. Blackwood keeps him on to pull records and backgrounds." },
      { text: "Reachable by phone, any time." },
    ],
    available: { always: true },
    locationId: "office",
    medium: "telephone",
    contact: "Blackwood records. Backgrounds, records, a second opinion.",
    onBoard: false,
    defaultEvidenceReply: "Read it to me again. Over the phone it doesn't tell me much more than that.",
    idleLine: "That's all I've got right now. Call me when you've got something I can run down.",
    noAnswer: ["Nothing in the records on that.", "I can't help you there. Find me a name and I'll run it.", "That's not something I've got."],
    voice: {
      voiceId: "nPczCjzI2devNBz1zQrb",
      direction: "Older man in his late sixties, retired detective, calm, dry, kind underneath. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [{ id: "professional", label: "Professional", requires: { always: true } }],
  },
];

const q = (characterId: string, topic: string, id: string, prompt: string, reply: string[], extra: Partial<DialogueQuestion> = {}): DialogueQuestion => ({
  id,
  characterId,
  topic,
  prompt,
  reply,
  ...extra,
});

const tl = (time: string, text: string, source: string) => ({ timeline: { time, text, source } });

export const questions: DialogueQuestion[] = [
  // =====================================================================
  // Marisol Navarro: the client
  // =====================================================================
  q("marisol", "Hiring us", "marisol_hire", "Why did you call Blackwood?", [
    "Because the police said robbery before they'd even looked. Hector was scared of something at work, and he wrote it all down.",
    "I read about your agency in the paper last month. I didn't know who else to call.",
  ]),
  q("marisol", "Hector", "marisol_hector", "Tell me about Hector.", [
    "Eleven years a checker at East Harbor. The one who actually reads the numbers. Everybody else signs; Hector reads.",
    "He coached Sofia's softball team. He made terrible pancakes on Sundays when he wasn't working.",
  ]),
  q("marisol", "Hector", "marisol_worry", "Was Hector worried about anything?", [
    "Since the middle of November. Short-tempered, not sleeping. He said numbers were changing on containers. 'Seals that don't stay the same seal,' he said.",
    "I didn't understand it. I don't think he wanted me to.",
  ], { reveals: "From mid-November Hector was worried that seal numbers on containers were changing: 'seals that don't stay the same seal.'" }),
  q("marisol", "Hector", "marisol_notebook", "Did Hector keep notes about it?", [
    "He bought a black notebook and kept it on him, in his jacket. Then around Thanksgiving he stopped bringing it home.",
    "I asked where it was. He said somewhere safe.",
  ], { reveals: "Hector kept a black notebook from mid-November and stopped bringing it home around Thanksgiving." }),
  q("marisol", "Hector", "marisol_night", "Did Hector go out at night?", [
    "Wednesday, the 28th. About midnight he put his jacket on and said he was going to see something at the gate.",
    "He came back after two. He didn't say what he saw. He just sat in the kitchen.",
  ], {
    reveals: "On Wednesday night, November 28, Hector left about midnight 'to see something at the gate' and came back after two.",
    effects: [tl("About midnight (Wed 11/28)", "Hector tells Marisol he is going 'to see something at the gate.' He comes back after two.", "Marisol Navarro")],
  }),
  q("marisol", "Work", "marisol_supervisor", "What did Hector say about his supervisor?", [
    "Friday he came home and said Gaffney told him to stop being an auditor. A warning. In writing, he said, like he'd done something wrong.",
    "He said, 'Fine. Monday I'll go over his head.'",
  ], { reveals: "On Friday, November 30, Hector said his supervisor, Gaffney, had warned him 'to stop being an auditor.'" }),
  q("marisol", "People", "marisol_vince", "Who did Hector trust at work?", [
    "Vince Sullivan. His old steward, retired now. The only one at that place he trusted.",
    "Vince is always at the union hall trailer across from Gate 1.",
  ]),
  q("marisol", "Sunday", "marisol_sunday", "Tell me about Sunday.", [
    "He left at six thirty for a seven o'clock start. Overtime, a ship was working. Off at five thirty.",
    "At 5:36 he texted he'd be home by seven. I started calling at 7:10. At 8:51 I called terminal security.",
  ], {
    reveals: "Hector worked 7:00 AM to 5:30 PM on Sunday. He texted at 5:36 PM; Marisol called him from 7:10 PM and called terminal security at 8:51 PM.",
    effects: [tl("8:51 PM (Sun 12/2)", "Marisol calls East Harbor terminal security.", "Marisol Navarro")],
  }),
  q("marisol", "Sunday", "marisol_phone", "Can I see your messages and calls with Hector?", [
    "Here. My phone, and the family account page. His last text, my calls, all voicemail.",
    "And look at the line. 'Last network activity 6:44 PM.' He never turned his phone off. Not once in eleven years. Copy whatever you need.",
  ], {
    reveals: "Marisol showed you her messages and calls with Hector and the family account: his line's last network activity was 6:44 PM Sunday.",
    effects: [{ giveEvidence: "E006" }, tl("6:44 PM (Sun 12/2)", "Hector's phone drops off the network.", "Family phone account")],
    volunteer: { near: "phone phones text texts message messages call calls called voicemail last contact heard from him find my iphone" },
  }),
  q("marisol", "The police", "marisol_police", "What did the police tell you?", [
    "Robbery. That somebody took his wallet money and his phone.",
    "He carried sixty dollars and he never fought anybody for anything. Who kills a man for sixty dollars inside a fence?",
  ]),
  q("marisol", "Hector", "marisol_locker", "Did Hector have a locker at work?", [
    "His gear locker. I remember now. He said his notes were 'with the chains, the only place nobody looks.'",
    "His own padlock, not the company's. The combination is Sofia's birthday. Zero four, eleven, zero nine.",
  ], {
    requires: G.locker,
    reveals: "Hector kept his notes in his gear locker, 'with the chains.' His own padlock: combination 04-11-09, Sofia's birthday.",
    effects: [{ setFlag: "locker_combo" }],
    volunteer: { near: "locker lockers lock padlock combination chains gear kept keep hide hidden safe place where" },
  }),
  q("marisol", "People", "marisol_kane", "Do you know Kane Logistics?", [
    "The security company out there. Their trucks are everywhere. That's all I know.",
  ], { requires: kaneKnown }),
  q("marisol", "Family", "marisol_sofia", "How is your daughter?", [
    "Sofia's nine. She's at my sister's this week. She knows her papa's gone. She doesn't know the rest, and I don't want her to.",
  ]),
  q("marisol", "Hector", "marisol_book", "We found Hector's notebook.", [
    "'It goes to Vince Sullivan at the hall, not to the company.' That's him. Stubborn to the end.",
    "'Marisol, I'm sorry.' He knew. He knew it could go bad, and he went back anyway.",
  ], { requires: ev("E009") }),

  // =====================================================================
  // Russell Gaffney: operations supervisor
  // =====================================================================
  q("gaffney", "About him", "gaffney_who", "What do you do here, Mr. Gaffney?", [
    "Terminal operations supervisor. Five years. Every box that moves on this terminal moves because my office planned it.",
    "Hector Navarro worked under me. Terrible thing.",
  ]),
  q("gaffney", "Hector", "gaffney_hector", "What kind of worker was Hector?", [
    "A good checker. Careful. He overstepped, that's all.",
  ]),
  q("gaffney", "The report", "gaffney_discrepancies", "What about the seal and weight discrepancies Hector reported?", [
    "Clerical. Seals get replaced after Customs exams and the paperwork lags behind the box. It happens every week at every terminal on the East Coast.",
    "Hector saw two numbers and decided it was a conspiracy.",
  ], {
    reveals: "Gaffney says the seal and weight discrepancies Hector reported were clerical: seals replaced after Customs exams, paperwork lagging.",
    variants: [{
      requires: G.gaffneyAdmits,
      reply: [
        "They weren't all clerical. You know that already.",
        "Those boxes went out at night on moves I approved. What was in them, I don't know. I didn't ask.",
      ],
    }],
  }),
  q("gaffney", "The report", "gaffney_warning", "Why did you give Hector a warning?", [
    "Because he pulled records outside his assignment and photographed cargo on terminal property. That's policy. The warning was by the book.",
    "He was a checker, not an auditor.",
  ], { reveals: "Gaffney says his verbal warning to Hector was 'by the book.'" }),
  q("gaffney", "The moves", "gaffney_special", "What are special handling moves?", [
    "Re-weighs, re-stows, repairs. They're in the Kane contract, Amendment No. 2. Perfectly legal. The contractor does them and bills them.",
  ]),
  q("gaffney", "People", "gaffney_kane", "How well do you know Gideon Kane?", [
    "He's the contractor. I see him at contract meetings. I barely know the man beyond that.",
  ], { requires: kaneKnown, reveals: "Gaffney says he barely knows Gideon Kane beyond 'the contractor.'" }),
  q("gaffney", "People", "gaffney_fisk", "Do you know Dwayne Fisk?", [
    "Kane's security sub. I see his truck around the gates. That's all.",
  ], { requires: fiskKnown }),
  q("gaffney", "Sunday", "gaffney_sunday", "Where were you on Sunday evening?", [
    "Home. All day. My wife will tell you. I heard about it Monday morning like everybody else.",
  ]),
  q("gaffney", "People", "gaffney_lindqvist", "Who handles the seal amendments?", [
    "Joanne Lindqvist, in verification. She processes what comes to her desk.",
  ]),
  q("gaffney", "Money", "gaffney_patapsco", "Why are Kane's invoices paid to Patapsco Freight Services?", [
    "Where invoices get paid is an accounts question. Talk to Walsh downstairs. I approve the work, not the bank account.",
  ], { requires: patapsco }),
  q("gaffney", "The moves", "gaffney_moves", "Who approved the night moves?", [
    "I did. By phone. Nothing on the move plan, no checker. Kane's people called and said re-weigh, re-stow, and I said fine.",
    "That's what the amendment says I can do. What was in the boxes, I don't know. I never asked.",
  ], {
    requires: G.gaffneyAdmits,
    reveals: "Gaffney admits he approved the night moves himself, by phone, off the move plan and without a checker. He says he does not know what was in the containers.",
  }),
  q("gaffney", "The records", "gaffney_reissue", "Why did you re-issue the record for 4827?", [
    "Tuesday morning. I sat at Joanne's terminal and did it myself.",
    "Because it would look bad. Two seals on one box, with a dead man's name on the first one. It would look bad.",
  ], {
    requires: G.gaffneyAdmits,
    reveals: "Gaffney admits he re-issued the record for TMCU 482771-6 himself on Tuesday morning 'because it would look bad.'",
    effects: [tl("7:52 AM (Tue 12/4)", "Gaffney re-issues the dock receipt record for TMCU 482771-6 under his own user name.", "Russell Gaffney")],
  }),
  q("gaffney", "The badge", "gaffney_badge", "Why did you add Staging Area C to Fisk's badge?", [
    "October. Kane wanted escorts on the special handling moves, and the escort needs C. I called security and told them to add it.",
    "His badge. Sunday night. Twenty minutes after Hector's. God.",
  ], {
    requires: { deduction: "D06" },
    reveals: "Gaffney admits he had Staging Area C added to Fisk's badge in October because Kane wanted escorts on the special handling moves.",
  }),
  q("gaffney", "Kane", "gaffney_texts", "What did you tell Kane about Hector?", [
    "Friday night I texted him that Hector put it in writing. He said, 'Leave him to me.' Saturday he asked me Hector's shift on Sunday, and I told him. Days. Off at six.",
    "I thought they'd lean on him. Offer him money. I didn't think. Here. Take the screenshots. Send them to the detective. I'll send them myself.",
  ], {
    requires: G.gaffneyTexts,
    reveals: "Gaffney admits he told Kane about Hector's report on Friday, November 30, and told him Hector's Sunday shift on Saturday. He handed over his texts with Kane.",
    effects: [
      { giveEvidence: "E023" },
      tl("6:48 PM (Fri 11/30)", "Gaffney texts Kane about Hector's report. Kane: 'Keep it that way. Leave him to me.'", "Gaffney's texts"),
      tl("9:14 AM (Sat 12/1)", "Kane asks Gaffney Hector's Sunday shift. Gaffney: 'Days. Off at 6.'", "Gaffney's texts"),
    ],
    volunteer: { after: 1, reply: ["Before you ask me anything. Sit down. I have to show you something on my phone."] },
  }),
  q("gaffney", "Kane", "gaffney_monday", "What did you mean, 'Was that you'?", [
    "I texted him at seven fifteen Monday morning, after he told me to clean up the paper. He never answered.",
    "That's the worst part. He never answered.",
  ], { requires: ev("E023") }),
  q("gaffney", "About him", "gaffney_disclosure", "Tell me about your annual disclosure.", [
    "I sign one every January, like everybody. It's a form.",
  ], { requires: ev("E024") }),
  q("gaffney", "About him", "gaffney_norfolk", "What happened in Norfolk?", [
    "March 2012. Elizabeth River Stevedoring. A drayage contractor paid me for two years and I took it. Sixty-four thousand dollars. I paid it back, signed a separation agreement, resigned. No police.",
    "I've answered no on every disclosure since. Kane showed me a file on it in October 2017, in his car, in the lot. Typed. Everything. After that, I did as I was told.",
  ], {
    requires: G.gaffneyNorfolk,
    reveals: "Gaffney admits the 2012 Separation and Repayment Agreement in Norfolk ($64,000), that he has answered no on every disclosure since, and that Kane showed him a file on it in October 2017.",
    effects: [tl("Tue 10/17/2017", "Kane shows Gaffney the file on his Norfolk repayment agreement.", "Russell Gaffney")],
  }),

  // =====================================================================
  // Gideon Kane: Kane Logistics
  // =====================================================================
  q("kane", "Introductions", "kane_who", "What does Kane Logistics do?", [
    "Drayage coordination and terminal security at three terminals in the Port of Baltimore. We move boxes and we watch gates.",
  ]),
  q("kane", "The moves", "kane_special", "What are your special handling moves?", [
    "Re-weighs, re-stows, repairs, as Amendment No. 2 describes them. Approved by terminal operations, every one. It's all in the contract.",
  ]),
  q("kane", "Money", "kane_patapsco", "What is Patapsco Freight Services?", [
    "Our billing and disbursement agent, which is common in this business. It keeps receivables out of my operating account.",
  ], { requires: patapsco, reveals: "Kane calls Patapsco Freight Services 'our billing and disbursement agent.'" }),
  q("kane", "People", "kane_fisk", "How well do you know Dwayne Fisk?", [
    "Dwayne's one of a dozen subcontractors. I speak to him when there's a problem with a post. That's the relationship.",
  ], { requires: fiskKnown, reveals: "Kane says he speaks to Fisk only 'when there's a problem with a post.'" }),
  q("kane", "Meridian", "kane_meridian", "What is your arrangement with Meridian Advisory Group?", [
    "A consulting client. They refer security work. I'd be curious how you came by a copy of a private contract.",
  ], { requires: ev("E022") }),
  q("kane", "Sunday", "kane_calls", "Why did you and Fisk talk on Sunday night?", [
    "He called about a gate. Gates are what I pay him for.",
  ], { requires: ev("E021"), reveals: "Kane says Fisk called him Sunday night 'about a gate.'" }),
  q("kane", "Money", "kane_payment", "Why did Patapsco wire Fisk $12,000 on Monday morning?", [
    "I don't discuss subcontractor payments.",
  ], { requires: { all: [ev("E020"), ev("E029")] } }),
  q("kane", "People", "kane_gaffney", "What is your relationship with Russell Gaffney?", [
    "Russell runs operations at East Harbor. We work together, professionally, the way a contractor works with any terminal.",
  ]),
  q("kane", "People", "kane_texts", "What about your texts with Gaffney?", [
    "Russell Gaffney is a frightened man who says things. I'd be careful building anything on him.",
  ], { requires: ev("E023") }),
  q("kane", "The victim", "kane_hector", "Did you know Hector Navarro?", [
    "I never met the man. I'm sorry for his family. Terminals are dangerous places.",
  ]),
  q("kane", "Sunday", "kane_sunday", "Where were you on Sunday evening?", [
    "At my desk at the Riverside yard, until late. Alone, before you ask. I run a business seven days a week.",
  ]),
  q("kane", "The freight", "kane_cargo", "What was in the containers you moved at night?", [
    "Whatever the shipper declared. I move boxes. I don't open them.",
  ]),
  q("kane", "The freight", "kane_riverside", "What happens at the Riverside yard?", [
    "Transload. Cargo comes off one box and goes into another. It's a licensed transfer yard. Nothing exotic about it.",
  ]),
  q("kane", "The freight", "kane_bay3", "What happens in bay 3 at the Riverside yard?", [
    "It's a working bay. My crew does what the paperwork says.",
  ], { requires: ev("E035") }),
  q("kane", "Fisk", "kane_instruction", "What did you tell Fisk to do on Saturday?", [
    "I told a contractor to recover company property and to keep it civil. I'll say that to a jury.",
  ], { requires: ev("E028"), reveals: "Faced with his messages on Fisk's phone, Kane says he told 'a contractor to recover company property and to keep it civil.'" }),
  q("kane", "People", "kane_holt", "Do you know Adrian Holt?", [
    "A name on paperwork.",
  ], { requires: holtKnown }),
  q("kane", "Introductions", "kane_call", "Why did you call me?", [
    "Because I hear you've been asking about my contractors. I like to know who's asking about my people. Better you hear it from me.",
  ], { requires: { callAnswered: "call_kane" } }),
  q("kane", "The search", "kane_lawyer", "Anything to say now that the warrants are served?", [
    "My lawyer is sitting right there. Ask him.",
  ], { requires: G.kaneSearched }),
  q("kane", "The search", "kane_papers", "What are the Meridian papers in your Riverside office?", [
    "Those are my private papers. My lawyer will deal with how you came to read them.",
  ], { requires: G.kanePapers }),

  // =====================================================================
  // Dwayne Fisk: security subcontractor
  // =====================================================================
  q("fisk", "Introductions", "fisk_who", "Who are you, Mr. Fisk?", [
    "Dwayne Fisk. Fisk Freight Security. Six guards. Escorts, yard security, gates.",
  ]),
  q("fisk", "Work", "fisk_kane", "Who do you work for?", [
    "Kane Logistics, mostly. Since 2016. Couple of warehouse clients on the side.",
  ]),
  q("fisk", "Sunday", "fisk_sunday", "Where were you on Sunday evening?", [
    "Riverside yard, main gate. Four to midnight. Worked it myself. My guy was sick.",
  ], {
    reveals: "Fisk says he worked the Riverside yard main gate himself from 4:00 PM to midnight on Sunday because 'my guy was sick,' and never went to East Harbor.",
    effects: [tl("4:00 PM to midnight (Sun 12/2)", "Fisk says he worked the Riverside yard main gate himself.", "Dwayne Fisk")],
  }),
  q("fisk", "The victim", "fisk_hector", "Did you know Hector Navarro?", [
    "Never met any Navarro.",
  ]),
  q("fisk", "Work", "fisk_truck", "What do you drive?", [
    "Gray F-250. Light bar on the roof. Company truck. It's parked right there.",
  ]),
  q("fisk", "Sunday", "fisk_eastharbor", "The Gate 4 camera has your truck coming in at 6:12 on Sunday.", [
    "Might have run by East Harbor to check a post. I never got out of the truck.",
  ], { requires: ev("E027"), reveals: "Shown the Gate 4 camera, Fisk says he 'might have run by East Harbor to check a post' but never got out of the truck." }),
  q("fisk", "Sunday", "fisk_badge", "Who used badge C-1147 on Sunday night?", [
    "Nobody uses my badge but me.",
    "Maybe one of my guys borrowed it. They ride escorts.",
  ], { requires: G.fiskBadge, reveals: "Fisk says nobody uses his badge but him, then that 'maybe one of my guys borrowed it.'" }),
  q("fisk", "Work", "fisk_staging", "Why is Staging Area C on your badge?", [
    "Special handling escorts. Ops put it on. Ask Gaffney.",
  ], { requires: ev("E018") }),
  q("fisk", "Sunday", "fisk_schedule", "Your own schedule had L. Pagano on the Riverside gate on Sunday.", [
    "The board's wrong. I covered the gate.",
  ], { requires: ev("E017") }),
  q("fisk", "Money", "fisk_payment", "What was the $12,000 from Patapsco on Monday?", [
    "November escorts. Ask Patapsco.",
  ], { requires: ev("E020"), reveals: "Fisk says the $12,000 from Patapsco was for 'November escorts.'" }),
  q("fisk", "Sunday", "fisk_mabry", "A witness saw a gray pickup with an amber light bar by the C-row fence at 6:30.", [
    "Lot of gray trucks with light bars in a port.",
  ], { requires: ev("E008") }),
  q("fisk", "Work", "fisk_meridian", "Do you work for Meridian Advisory Group?", [
    "I take my work from Kane Logistics. I don't know who Kane's customers are.",
  ], { requires: ev("E022") }),
  q("fisk", "The phone", "fisk_phone", "Why was Hector Navarro's phone under your seat?", [
    "Found a phone in the lot. Meant to turn it in.",
    "His lawyer, from the next chair: 'That's all he's saying about the phone.'",
  ], { requires: ev("E028"), reveals: "In custody, Fisk says he found a phone in the lot and meant to turn it in." }),
  q("fisk", "The phone", "fisk_notebook", "What notebook were you looking for?", [
    "I don't know about any notebook.",
  ], { requires: ev("E028") }),
  q("fisk", "The scene", "fisk_bar", "The lab matched a binder bar from the gear cage.", [
    "Twenty-two bars in that cage. Anybody could pick one up. I don't work the cage.",
  ], { requires: ev("E004") }),
  q("fisk", "Custody", "fisk_lawyer", "Do you want to tell me what happened?", [
    "My lawyer's here. I've said what I'm going to say.",
  ], { requires: G.custody }),

  // =====================================================================
  // Julian Rourke: video link from federal detention, counsel present
  // =====================================================================
  q("rourke", "Introductions", "rourke_who", "What did your practice do at Meridian?", [
    "Corporate intelligence. Due diligence profiles for the firm's practices and its clients. Background, exposure, reputational risk. Ordinary work.",
  ]),
  q("rourke", "The practice", "rourke_requests", "Who asked for your profiles?", [
    "Requests came through the designated channel. I did not choose subjects.",
  ], { reveals: "Rourke says requests for profiles 'came through the designated channel' and that he did not choose subjects." }),
  q("rourke", "The profile", "rourke_gaffney", "Do you know Russell Gaffney?", [
    "I don't recall a Gaffney. We prepared a great many profiles.",
  ]),
  q("rourke", "The profile", "rourke_profile", "The profile on Gaffney is marked 'Reviewed: J.R.'", [
    "I review a great many...",
    "His lawyer, off camera: 'The document speaks for itself. Next question.'",
  ]),
  q("rourke", "People", "rourke_kane", "Do you know Gideon Kane?", [
    "Kane. An account label. Logistics, Baltimore. That's how such accounts were described to me.",
  ]),
  q("rourke", "The victim", "rourke_hector", "What do you know about Hector Navarro's death?", [
    "Nothing. I know nothing about a checker in Baltimore. That is simply true, and you may write it down.",
  ]),
  q("rourke", "The practice", "rourke_channel", "What is the designated channel?", [
    "A procedure.",
    "His lawyer, off camera: 'Next question.'",
  ]),
  q("rourke", "The profile", "rourke_index", "What is the Compromising Information Index?", [
    "His lawyer, off camera: 'We're not discussing internal files of a former employer. Move on.'",
  ]),
  q("rourke", "Custody", "rourke_custody", "Why are you in federal detention?", [
    "His lawyer, off camera: 'Not a subject for today.'",
  ]),
  q("rourke", "People", "rourke_holt", "Did you work with Adrian Holt?", [
    "Other practices were other people's business.",
    "His lawyer, off camera: 'We're not discussing other matters.'",
  ]),

  // =====================================================================
  // Adrian Holt: recorded interview, Carroway County Prison, counsel present
  // =====================================================================
  q("holt", "Introductions", "holt_who", "What is your role in companies like Patapsco?", [
    "I serve as nominal manager of several client entities. It's a common arrangement. Somebody has to sign the annual report.",
  ]),
  q("holt", "Patapsco", "holt_patapsco", "What is Patapsco Freight Services?", [
    "A logistics advisory engagement, referred through Meridian. Ms. Dunmore filed the articles at my instruction. Standard.",
  ], { reveals: "Holt says Patapsco Freight Services was 'a logistics advisory engagement referred through Meridian,' filed by Carol Dunmore at his instruction." }),
  q("holt", "People", "holt_kane", "Do you know Gideon Kane?", [
    "I've spoken to Mr. Kane by telephone. About invoices.",
  ]),
  q("holt", "Patapsco", "holt_signatory", "You signed Patapsco's authorized signatory letter.", [
    "A standard vendor letter, September 10. The terminal's accounts department asked for one. I provided one.",
  ], { requires: ev("E032") }),
  q("holt", "Money", "holt_wires", "Who sent Patapsco $46,000 on November 28?", [
    "I've been in a cell since November 15. Whatever moved on November 28 did not move on my login.",
    "His lawyer: 'And that's the last answer on the bank records. My client is declining on advice of counsel.'",
  ], { requires: ev("E038"), reveals: "Holt says the November 28 wire to Patapsco 'did not move on my login'; he has been in custody since November 15." }),
  q("holt", "Money", "holt_fee", "What was Holt Advisory's $9,000 management fee for?", [
    "His lawyer: 'He won't answer that.'",
  ], { requires: ev("E038") }),
  q("holt", "Meridian", "holt_meridian", "What is your relationship with Meridian?", [
    "Meridian referred the engagement. Beyond that, on advice of counsel, I have nothing to add.",
  ]),
  q("holt", "Meridian", "holt_carroway", "Is this connected to Carroway?", [
    "There are matters in Carroway I won't discuss.",
  ]),
  q("holt", "The victim", "holt_hector", "What do you know about Hector Navarro's death?", [
    "I've never set foot on that terminal. I know nothing about that man's death, and I'd like that on the recording.",
  ]),
  q("holt", "People", "holt_dunmore", "What did Carol Dunmore do for Patapsco?", [
    "Carol manages my office. She filed Patapsco's papers at my instruction. She files for a number of small firms.",
  ]),
  q("holt", "Meridian", "holt_above", "Who do you answer to?", [
    "His lawyer: 'We're done with that subject.'",
  ]),

  // =====================================================================
  // Joanne Lindqvist: documentation clerk
  // =====================================================================
  q("lindqvist", "About her", "lindqvist_who", "What do you do here?", [
    "Cargo documentation. Dock receipts, seals, weights, amendments. If it's paper about a box, it crosses my desk.",
  ]),
  q("lindqvist", "The seals", "lindqvist_seals", "Why do seal numbers get changed on dock receipts?", [
    "Seal amendments happen. Customs opens a box for an exam and re-seals it, and the record gets amended. It's administrative.",
    "I process what the supervisors send me.",
  ], {
    reveals: "Joanne Lindqvist says seal amendments are administrative: Customs re-seals boxes and she processes what supervisors send her.",
    variants: [{
      requires: G.lindqvistOpen,
      reply: ["It wasn't administrative. I said that because it's what I was told.", "Mr. Gaffney told me what to key, and I keyed it."],
    }],
  }),
  q("lindqvist", "Hector", "lindqvist_hector", "Did Hector ask you about seals?", [
    "On the 28th. He came up with a photo on his phone and asked why 4827 had a new seal. I told him what Mr. Gaffney told me: re-sealed after an inspection, paperwork behind.",
    "He looked at me like he felt sorry for me.",
  ], { effects: [tl("Wed 11/28", "Hector asks Joanne Lindqvist why 4827 has a new seal.", "Joanne Lindqvist")] }),
  q("lindqvist", "The seals", "lindqvist_sh", "What does SH mean on the containers?", [
    "Special handling. The Kane moves. They come on a list, not on the move plan.",
  ]),
  q("lindqvist", "The seals", "lindqvist_customs", "Wouldn't Customs have a record of an exam?", [
    "If Customs re-seals a box there's a CBP hold and an exam record. I don't pull those. That's not my desk.",
  ]),
  q("lindqvist", "The seals", "lindqvist_statement", "What really happened with the seal records?", [
    "Since October, six times, Mr. Gaffney brought me a list in the morning of containers marked SH and told me to re-key the seals and weights to what was on the box. I did it. I didn't ask for the inspection records.",
    "Tuesday at about ten to eight he sat down at the terminal by my desk and re-issued 4827 himself. He's never done one himself. I wrote it all down for Detective Whitaker. This is your copy.",
  ], {
    requires: G.lindqvistOpen,
    reveals: "Joanne Lindqvist says that since October Gaffney gave her six morning lists of SH containers to re-key, and that on Tuesday at about 7:50 AM he re-issued 4827's record himself. She gave you a copy of her statement.",
    effects: [{ giveEvidence: "E025" }],
    volunteer: { after: 1 },
  }),
  q("lindqvist", "The seals", "lindqvist_report", "Can you show how many containers were changed?", [
    "I've been building a list since Sunday. Paper dock receipts against the Gate 4 screens against the system history. Eight I could match end to end.",
    "Every one gained four to five tons overnight. None has a Customs exam. Take it.",
  ], {
    requires: G.lindqvistReport,
    reveals: "Joanne Lindqvist handed over her consolidated discrepancy report: eight containers, each four to five tons heavier after a night move, none with a Customs exam.",
    effects: [{ giveEvidence: "E036" }],
    volunteer: { after: 1 },
  }),
  q("lindqvist", "The seals", "lindqvist_text", "Why did you text me about the record?", [
    "Because I watched it happen and I couldn't say it on the desk line. The printout's what it says now. I put it face down in my tray.",
  ], { requires: { event: "RE02" } }),
  q("lindqvist", "People", "lindqvist_gaffney", "What is Mr. Gaffney like to work for?", [
    "He's my supervisor. He's not a yeller. He just tells you, and you do it.",
  ]),
  q("lindqvist", "People", "lindqvist_kane", "Do you know Kane Logistics?", [
    "I know their trucks. That's all.",
  ], { requires: kaneKnown }),
  q("lindqvist", "People", "lindqvist_fisk", "Do you know Dwayne Fisk?", [
    "No. I don't know anyone named Fisk.",
  ], { requires: fiskKnown }),
  q("lindqvist", "About her", "lindqvist_scared", "Are you all right?", [
    "No. I keyed those numbers. My initials are on the history.",
    "Hector asked me, and I gave him the company line.",
  ]),

  // =====================================================================
  // Eddie Malone: owner-operator
  // =====================================================================
  q("malone", "Introductions", "malone_who", "Who are you?", [
    "Eddie Malone. Malone Hauling. One truck, a 2012 Cascadia day cab. My name's on the doors.",
  ]),
  q("malone", "Work", "malone_kane", "Who do you haul for?", [
    "Leased on to Kane Logistics since 2016. They dispatch, I drive.",
  ]),
  q("malone", "Night runs", "malone_log", "Tell me about the night runs.", [
    "Since September. About thirty legs. Gate 4 out about one in the morning, over to the Riverside yard, back before five. 'Re-weigh moves,' dispatch calls them.",
    "I run paper alongside the ELD. For the IRS. Here. Take it. I'm done carrying it around.",
  ], {
    reveals: "Eddie Malone has driven about thirty night legs since September from Gate 4 to the Riverside yard and back, called 're-weigh moves.' He handed over his paper log.",
    effects: [{ giveEvidence: "E026" }, tl("1:12 AM (Wed 11/28)", "Malone takes TMCU 482771-6 out of Gate 4 to the Riverside yard; back in at 4:40 AM.", "Eddie Malone's log")],
    volunteer: { near: "night nights run runs legs moves move gate 4 riverside overnight late haul hauls hauling midnight morning" },
  }),
  q("malone", "Night runs", "malone_waiting", "What happens at the Riverside yard?", [
    "I back into bay 3, they pull the doors shut, and I sit in my cab two and a half hours. Forklifts. Nobody tells me nothing.",
    "Then they hook me up and I take it back.",
  ]),
  q("malone", "Night runs", "malone_pay", "How do you get paid for the night moves?", [
    "Six fifty a leg. Double the going rate. And the checks come from Patapsco Freight, not Kane. No bill of lading, ever.",
  ], { reveals: "Malone is paid $650 a leg for the night moves, by Patapsco Freight checks, with no bill of lading." }),
  q("malone", "Night runs", "malone_photo", "Did anyone see you on the night runs?", [
    "Late November, a guy in a car on Broening Highway took my picture coming out of Gate 4. I wrote it in my log.",
  ]),
  q("malone", "Sunday", "malone_sunday", "Where were you on Sunday?", [
    "My daughter's in Glen Burnie. Her kid's birthday. All day and into the night.",
  ]),
  q("malone", "The victim", "malone_hector", "Did you know Hector Navarro?", [
    "No. If that was him in the car with the camera, I wish I'd stopped and talked to him.",
  ]),
  q("malone", "Night runs", "malone_dispatcher", "What did dispatch tell you about the containers?", [
    "Forget the numbers. That's what the dispatcher said. Forget the numbers.",
  ]),
  q("malone", "People", "malone_fisk", "Do you know Dwayne Fisk?", [
    "Kane's security guys are around the yard. I keep to my cab.",
  ], { requires: fiskKnown }),
  q("malone", "Night runs", "malone_riverside", "This is the Riverside yard's gate log.", [
    "That's the yard's book. Bay 3, transload. Those are my nights, my boxes. 'New seal.' I never saw them put one on.",
  ], { requires: ev("E035") }),

  // =====================================================================
  // Vince Sullivan: retired checker, union steward
  // =====================================================================
  q("sullivan", "Introductions", "sullivan_who", "Who are you?", [
    "Vince Sullivan. Checker thirty-one years, steward thirty. Retired, they tell me. I'm still in the trailer every day.",
  ]),
  q("sullivan", "The work", "sullivan_seals", "How do container seals work?", [
    "A seal goes on at the shipper's and comes off at the consignee's. In between, the only one who cuts it is Customs, and Customs leaves a CBP record.",
    "Nobody re-keys a seal. Nobody.",
  ], { reveals: "Vince Sullivan: a seal is only cut between shipper and consignee at a Customs exam, which leaves a CBP record. 'Nobody re-keys a seal.'" }),
  q("sullivan", "The work", "sullivan_moveplan", "Can a container leave staging at night?", [
    "Not without a line on the move plan and a checker on it. That's the whole point of a checker.",
  ]),
  q("sullivan", "The work", "sullivan_gate4", "What is Gate 4 used for?", [
    "Contractor lane. Opened in September, 'for contractors.' Since then boxes walk.",
    "I've seen Eddie Malone's day cab go through it at one in the morning, pulling an export box. Malone Hauling, on the door.",
  ], {
    reveals: "Gate 4, the contractor lane, opened in September; Sullivan has seen Malone Hauling's day cab go through it at one in the morning.",
    volunteer: { near: "gate 4 contractor lane contractors night trucks truck boxes walk" },
  }),
  q("sullivan", "People", "sullivan_kane", "Who runs security at the terminal?", [
    "Kane Logistics. Gideon Kane. Security and half the drayage. His trucks, his guards.",
  ], { reveals: "Kane Logistics, Gideon Kane's company, runs security and half the drayage at East Harbor." }),
  q("sullivan", "People", "sullivan_gaffney", "What do you think of Russell Gaffney?", [
    "Came up from Norfolk in 2013 with a story nobody ever heard the end of. He doesn't walk the yard. He signs.",
  ]),
  q("sullivan", "Hector", "sullivan_hector", "Did Hector come to you about the seals?", [
    "Sunday before last, the 25th. Sat right there and asked me what a seal change means. I told him: write it up. If they ignore you, come back to me.",
    "He came back dead.",
  ], {
    reveals: "On Sunday, November 25, Hector asked Vince Sullivan what a seal change meant. Sullivan told him to write it up and come back if ignored.",
    effects: [tl("Sun 11/25", "Hector asks Vince Sullivan at the union hall what a seal change means.", "Vince Sullivan")],
  }),
  q("sullivan", "The work", "sullivan_lockers", "Where would a checker keep something private?", [
    "Gear lockers, in the lashing gear building. Checkers keep anything they don't want walking in there. Your own lock, nobody touches it.",
    "Which one was his, I couldn't tell you.",
  ]),
  q("sullivan", "Hector", "sullivan_notebook", "Hector's notebook says it goes to you.", [
    "Then it goes to court first, and then it comes to me, and I'll keep it in this trailer till I die.",
    "He did it right. Every date. That's a checker.",
  ], { requires: ev("E009") }),
  q("sullivan", "Introductions", "sullivan_union", "What is the union hall trailer?", [
    "Forty years across from Gate 1. Every checker on this terminal has sat in that trailer and complained about the coffee.",
  ]),

  // =====================================================================
  // Det. Allison Whitaker: the police; no limit
  // =====================================================================
  q("whitaker", "The case", "whitaker_case", "Where does the investigation stand?", [
    "Working theory is robbery. The port's had a run of them. I'm not married to it.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D01" }, reply: ["Sixty bucks and a phone, a gold ring left on his hand, and he was dragged. I've stopped writing 'robbery' on anything I sign."] },
      { requires: { deduction: "D06" }, reply: ["A contractor's badge into C twenty-three minutes after his. I want to know where that contractor says he was."] },
      { requires: { flag: "fisk_custody" }, reply: ["Fisk is in custody on the phone. Now it's about who sent him, and why."] },
      { requires: { flag: "kane_searched" }, reply: ["Kane Logistics is searched, HSI is with us, and the yard is next. Keep going."] },
    ],
  }),
  q("whitaker", "Reports", "whitaker_report", "Can I see the police report?", [
    "Here. Benitez, the security officer, found him at 9:22 Sunday night behind the flat racks. 911 at 9:24.",
    "Read my note at the bottom.",
  ], {
    reveals: "Det. Whitaker handed over the incident report: Hector was found at 9:22 PM Sunday behind the flat racks in Staging Area C.",
    effects: [{ giveEvidence: "E001" }, tl("9:22 PM (Sun 12/2)", "Security officer L. Benitez finds Hector behind the flat racks in Staging Area C. 911 at 9:24.", "Police report")],
    volunteer: { after: 1 },
  }),
  q("whitaker", "Reports", "whitaker_photos", "Can I see the scene photographs?", [
    "Five that matter. Look at the stain in the lane in six, and where he is in three.",
  ], { reveals: "Det. Whitaker handed over the crime scene photographs.", effects: [{ giveEvidence: "E002" }] }),
  q("whitaker", "Reports", "whitaker_me", "What did the medical examiner find?", [
    "Blunt force injury of the head. One blow. A straight bar about an inch wide with a hooked end. Bruises on his left arm where he tried to block it, and his heels were dragged after.",
    "Death between about six and eight Sunday evening. No weapon recovered. Here's Dr. Ashworth's summary.",
  ], {
    reveals: "The medical examiner found one blow from a straight bar with a hooked end; death between about 6:00 and 8:00 PM Sunday.",
    effects: [{ giveEvidence: "E003" }, tl("6:00 to 8:00 PM (Sun 12/2)", "Medical examiner's window for Hector's death.", "ME summary")],
  }),
  q("whitaker", "Reports", "whitaker_canvass", "Did the canvass turn up any witnesses?", [
    "One. Otis Mabry, reefer mechanic. About six thirty, a big gray pickup with an amber light bar on the service road outside the C fence. Lights off, engine running.",
    "No plate. It was raining. Here's his statement.",
  ], {
    reveals: "Otis Mabry saw a big gray pickup with an amber roof light bar on the service road outside the Staging Area C fence at about 6:30 PM Sunday.",
    effects: [{ giveEvidence: "E008" }, tl("About 6:30 PM (Sun 12/2)", "Otis Mabry sees a gray pickup with an amber light bar on the service road outside the C fence.", "Canvass statement")],
  }),
  q("whitaker", "The case", "whitaker_robbery", "Why did you start with robbery?", [
    "The port's had a run of car break-ins and locker thefts. Wallet emptied, phone gone. It reads like one.",
    "But he kept his ring, his watch and his cards. And you badge in to get into C.",
  ]),
  q("whitaker", "The case", "whitaker_phone", "Did you find Hector's phone?", [
    "No. Not on him, not anywhere in C. His wife's account will show you when it went dark.",
  ]),
  q("whitaker", "The case", "whitaker_access", "Who keeps the terminal's access records?", [
    "Terminal security, the office beside Gate 1. Reader logs, the contractor binder, the gate cameras. I've asked for printouts.",
  ]),
  q("whitaker", "Lab", "whitaker_bars", "Can you send the binder bars from the gear cage to the lab?", [
    "Hooked bars, an inch thick, forty feet from the stain. And one hung the wrong way. Yes.",
    "I'll have the unit bag all twenty-two this afternoon. Lab gets them today. You'll get the report.",
  ], {
    requires: G.bars,
    reveals: "Det. Whitaker is sending all twenty-two binder bars from the gear cage to the lab.",
    effects: [{ startLab: "bars" }, { setFlag: "bars_requested" }],
  }),
  q("whitaker", "Lab", "whitaker_lab", "Anything back from the lab?", ["Nothing pending. Give me something to send."], {
    repeatable: true,
    variants: [
      { requires: { labStarted: "bars" }, reply: ["The bars are at the lab. Twenty-two of them. You'll get the report when it's back."] },
      { requires: { labReady: "bars" }, reply: ["The bar report's in. Read the conclusion. It says what it says and no more."] },
    ],
  }),
  q("whitaker", "Records", "whitaker_cdr", "Can you get Fisk's phone records?", [
    "With the truck by the fence, a judge gave me a court order on his phone. It came back today. Here.",
    "Read the cell sites. Then read my note.",
  ], {
    requires: { deduction: "D08" },
    reveals: "Det. Whitaker obtained Fisk's call detail records on a court order.",
    effects: [{ giveEvidence: "E021" }],
    volunteer: { after: 1 },
  }),
  q("whitaker", "Warrants", "whitaker_warrant", "Can you get a search warrant?", [
    "A judge signs warrants on evidence, not theories. Bring me facts that put a person at the scene, or money moving between people who shouldn't be paying each other.",
  ], {
    repeatable: true,
    variants: [
      { requires: { flag: "fisk_custody" }, reply: ["The truck warrant's done. The phone was under the seat. For anybody else, I need what ties them to Fisk."] },
      { requires: { flag: "kane_searched" }, reply: ["Kane Logistics and the Riverside yard are under warrant. If there's more, I need it tied together for the judge."] },
      { requires: { flag: "safe_open" }, reply: ["The judge extended it to the safe and the locksmith's done. That's every door I can open."] },
    ],
  }),
  q("whitaker", "Records", "whitaker_patapsco", "What do Patapsco's bank records show?", [
    "Economic Crimes subpoenaed Patapsco's bank on what you tied together. Sergeant Ibarra built the schedule. Here.",
    "Read who initiated the wires.",
  ], {
    requires: { deduction: "D14" },
    reveals: "Det. Whitaker handed over Economic Crimes' schedule of Patapsco Freight Services' bank records.",
    effects: [{ giveEvidence: "E038" }],
    volunteer: { after: 1 },
  }),
  q("whitaker", "Interviews", "whitaker_rourke", "Can I interview Julian Rourke?", [
    "He's in federal detention. I called Agent Quinlan at the FBI. She'll put you on a video link with him. His lawyer will be on, and he'll set the length.",
  ], { requires: G.rourkeKnown }),
  q("whitaker", "Interviews", "whitaker_holt", "Can I interview Adrian Holt?", [
    "He's held at Carroway County Prison. Det. Bowman out there set up a recorded interview. Counsel present. Don't expect him to be chatty.",
  ], { requires: holtKnown }),
  q("whitaker", "Records", "whitaker_courier", "What do you make of the courier envelope?", [
    "An anonymous copy of a real contract is still a real contract. I'll subpoena the original. Meanwhile it tells me where to look.",
  ], { requires: ev("E022") }),
  q("whitaker", "Custody", "whitaker_fisk", "Can I talk to Fisk?", [
    "He's in interview two with a public defender. You can sit in. Don't expect much.",
  ], { requires: G.custody }),
  q("whitaker", "People", "whitaker_gaffney", "What about Gaffney's texts?", [
    "He sent me the screenshots himself while you watched. His lawyer's going to hate that.",
  ], { requires: ev("E023") }),
  q("whitaker", "People", "whitaker_kane", "What do you know about Kane Logistics?", [
    "They have the security contract at East Harbor and run half the trucks. Kane's a name I know. I need more than a name.",
  ], { requires: kaneKnown }),

  // =====================================================================
  // Philip Walsh: accounts manager
  // =====================================================================
  q("walsh", "About him", "walsh_who", "What do you do here, Mr. Walsh?", [
    "Accounts manager. Payables, receivables, contractor deposits. I'm a CPA, which right now feels like a liability.",
  ]),
  q("walsh", "The contract", "walsh_amendment", "What did you make of Amendment No. 2?", [
    "It surprised me. Moves at any hour, no checker, no move plan, on a verbal approval. I asked. Operations told me not to question it.",
  ]),
  q("walsh", "Patapsco", "walsh_patapsco", "Why are Kane's invoices paid to Patapsco Freight Services?", [
    "A Notice of Assignment. Kane assigned his receivables to Patapsco. For vendor setup I needed an authorized signatory letter, and I got one, signed by a consultant in Pittsburgh.",
    "Here. That's the vendor file copy. I should have asked who he was.",
  ], {
    requires: G.walshPatapsco,
    reveals: "Philip Walsh handed over Patapsco's authorized signatory letter from EHTOC's vendor file, signed by a Pittsburgh consultant.",
    effects: [{ giveEvidence: "E032" }],
    volunteer: { near: "patapsco assignment notice remit remittance vendor signatory paid pay payments invoices kane" },
  }),
  q("walsh", "Money", "walsh_security", "Who posted Kane's performance security?", [
    "Meridian Advisory Group, by wire, $150,000, September 6. Which I have never seen a consultant do for a contractor.",
    "I flagged it to operations the next day. I was told to accept it. It's on the deposits ledger, on my desk.",
  ], { reveals: "Meridian Advisory Group posted Kane Logistics' $150,000 performance security on September 6." }),
  q("walsh", "Money", "walsh_paid", "How much has EHTOC paid to Patapsco?", [
    "A hundred and forty-one thousand six hundred dollars. And I didn't ask a single question. I'm going to lose my license over a Notice of Assignment.",
  ]),
  q("walsh", "Money", "walsh_invoice", "What do you make of Kane's invoice KL-1130-18?", [
    "Six special handling moves, six escorts, remit to Patapsco. Approved 'R.G., Ops.' No container numbers. I paid ones just like it every week.",
  ], { requires: ev("E029") }),
  q("walsh", "Patapsco", "walsh_holt", "Who is Adrian Holt?", [
    "The signatory on the letter. Holt Advisory, Pittsburgh. I've never spoken to him. The letter was all I needed, apparently.",
  ], { requires: ev("E032") }),
  q("walsh", "The contract", "walsh_gaffney", "Who approves Kane's special handling invoices?", [
    "Operations. Mr. Gaffney's initials. I pay what operations approves.",
  ]),

  // =====================================================================
  // Bennett: records by phone; no limit
  // =====================================================================
  q("bennett", "The case", "bennett_case", "What do you make of the file?", [
    "A robbery inside a fence you need a badge for isn't a robbery. Find out who else had a badge.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D02" }, reply: ["Now you know what Navarro was writing down. Find out who needed it to stop."] },
      { requires: { deduction: "D10" }, reply: ["You've got the man who sent him. Now the money: who pays the people who pay Fisk."] },
    ],
  }),
  q("bennett", "Records", "bennett_truck", "Can you pull the registration on Fisk's truck?", [
    "Already did. MVA, plate 7FK4417: gray 2016 F-250 Super Duty, crew cab, owned by Fisk Freight Security. The insurer's file photo shows an amber light bar on the roof.",
    "Sending it to your desk.",
  ], {
    requires: fiskKnown,
    reveals: "Fisk Freight Security's truck is a gray 2016 F-250 Super Duty, plate 7FK4417, with a roof-mounted amber light bar.",
    effects: [{ giveEvidence: "E019" }],
    volunteer: { near: "truck pickup vehicle registration plate mva fisk light bar" },
  }),
  q("bennett", "Records", "bennett_patapsco", "Can you pull the records on Patapsco Freight Services?", [
    "Maryland filing, January 9 of this year. Organizer Carol Dunmore. Principal office care of 600 Grant Street, Suite 2210, Pittsburgh. Manager, Holt Advisory LLC.",
    "A Baltimore freight company run out of a Pittsburgh office suite. I'm sending it over.",
  ], {
    requires: G.bennettPatapsco,
    reveals: "Patapsco Freight Services LLC was organized by Carol Dunmore on January 9, 2018, from Suite 2210, 600 Grant Street, Pittsburgh, and is managed by Holt Advisory LLC.",
    effects: [{ giveEvidence: "E030" }],
    volunteer: { near: "patapsco freight services filing company records llc state who owns" },
  }),
  q("bennett", "Records", "bennett_courier", "Who sent the courier envelope?", [
    "Came by courier. No name, no note. The contract's real enough.",
  ], { requires: ev("E022") }),
  q("bennett", "Records", "bennett_kane", "Run Gideon Kane for me.", [
    "Kane Logistics Inc., Clinton Street, Canton. Filings in order, licensed, insured. No record on Kane himself.",
  ], { requires: kaneKnown }),
  q("bennett", "Records", "bennett_fisk", "Run Dwayne Fisk for me.", [
    "Fisk Freight Security LLC, Curtis Bay. Licensed security agency, six guards on the books. No record on Fisk.",
  ], { requires: fiskKnown }),
  q("bennett", "Records", "bennett_gaffney", "Run Russell Gaffney for me.", [
    "No record in Maryland. Came up from Norfolk in 2013. Virginia doesn't tell me why people leave jobs.",
  ]),
  q("bennett", "Records", "bennett_meridian", "What can you find on Meridian Advisory Group?", [
    "Private consulting firm, Washington, with a Pittsburgh office. Private firms don't file much worth reading.",
  ]),
  q("bennett", "The case", "bennett_again", "Anything new on your side?", ["Nothing new. I'm waiting on you."], {
    repeatable: true,
    variants: [{ requires: { flag: "kane_searched" }, reply: ["Whitaker's got warrants out. Watch your desk and your phone."] }],
  }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  // Marisol
  r("marisol", "E001", ["'Left a gold ring and a watch.' I told them. Nobody robs a man and leaves his ring."]),
  r("marisol", "E006", ["6:44. He never turned it off. Somebody turned it off."]),
  r("marisol", "E009", ["That's his writing. Block capitals for the numbers, always.", "'Marisol, I'm sorry.' Oh, Hector."]),
  r("marisol", "E010", ["The pictures he got printed. He wouldn't let me see them."]),
  r("marisol", "E014", ["He wrote this at the kitchen table Thursday night. He printed a copy and put it under his mug.", "'Copy. Sent 11/29.' He knew he'd need it."]),
  r("marisol", "E015", ["'You are a checker, not an auditor.' That's what he told me on Friday."]),
  r("marisol", "E016", ["Every night since the 20th, three minutes. That's his locker. He said with the chains."], { effects: [{ setFlag: "locker_combo" }], reveals: "Shown the door log, Marisol remembers Hector's locker: his own padlock, combination 04-11-09." }),
  r("marisol", "E028", ["His phone. In that man's truck."]),
  // Gaffney
  r("gaffney", "E011", [
    "Hector's paper. He kept the paper.",
    "All right. All right. I approved those moves. By phone. Nothing on the plan. Kane's people called them re-weighs. I don't know what was in the boxes.",
  ], { reveals: "Shown the signed dock receipt, Gaffney admits he approved the night moves by phone, off the move plan." }),
  r("gaffney", "E012", [
    "My user name. Tuesday morning. Yes. I did that.",
    "It would have looked bad. Two seals. I approved the moves, by phone, off the plan. I don't know what was in the boxes.",
  ], { reveals: "Shown the re-issued record, Gaffney admits he re-issued it and approved the night moves by phone." }),
  r("gaffney", "E013", ["'SH, G4, 0100, RG.' That's my hand. Special handling, per the amendment."]),
  r("gaffney", "E014", ["I read it. I answered it. That's what a supervisor does."]),
  r("gaffney", "E015", ["By the book. It was by the book."]),
  r("gaffney", "E018", ["'Per R. Gaffney.' Escorts need the zone. That's all it was for."]),
  r("gaffney", "E024", ["That's my disclosure. Where did you get that out of my drawer?"]),
  r("gaffney", "E033", ["Where did you get this. Where did you... 'He'll do as told.'", "Yes. Norfolk. And yes, he showed it to me. October 2017."]),
  r("gaffney", "E023", ["I sent those to the detective myself. I'm not hiding anymore."]),
  r("gaffney", "E034", ["I signed for EHTOC. Delegated authority. It's a legal contract."]),
  // Kane
  r("kane", "E022", ["A private contract, photocopied. I wonder who's handing out my paperwork. Meridian is a consulting client."]),
  r("kane", "E021", ["My number, Dwayne's number. He called about a gate."]),
  r("kane", "E023", ["Russell Gaffney is a frightened man who says things."]),
  r("kane", "E028", ["I told a contractor to recover company property and to keep it civil. I'll say that to a jury."]),
  r("kane", "E029", ["My invoice. Approved by terminal operations, paid as assigned. Ordinary business."]),
  r("kane", "E020", ["I don't discuss subcontractor payments."]),
  r("kane", "E034", ["Amendment No. 2. Signed by both parties. Read clause one."]),
  r("kane", "E033", ["Private papers from my credenza. My lawyer will talk about how they left it."]),
  r("kane", "E035", ["A yard log. My crew writes things down. Good for them."]),
  r("kane", "E037", ["Private papers. Ask my lawyer."]),
  r("kane", "E039", ["Private papers. Ask my lawyer."]),
  r("kane", "E040", ["Kane reads it, looks at his lawyer, and says nothing at all."]),
  r("kane", "E009", ["A checker's diary. Grocery lists and grievances."]),
  // Fisk
  r("fisk", "E017", ["The board's wrong. I covered the gate."]),
  r("fisk", "E027", ["Can't read a plate on that."]),
  r("fisk", "E007", ["A number. Nobody uses my badge but me."]),
  r("fisk", "E018", ["Gaffney put C on it. Ask him."]),
  r("fisk", "E019", ["That's my truck. So what."]),
  r("fisk", "E008", ["Lot of gray trucks with light bars in a port."]),
  r("fisk", "E020", ["November escorts. Ask Patapsco."]),
  r("fisk", "E021", ["Kane's my client. I call my client."]),
  r("fisk", "E028", ["Found it in the lot.", "His lawyer: 'He's done talking about the phone.'"]),
  r("fisk", "E004", ["Twenty-two bars. Anybody's."]),
  r("fisk", "E005", ["Everybody on that terminal wears those boots."]),
  r("fisk", "E002", ["I don't need to look at that."]),
  // Rourke
  r("rourke", "E033", ["Rourke reads the first page and does not turn it.", "His lawyer, off camera: 'The document speaks for itself.'"]),
  r("rourke", "E037", ["His lawyer, off camera: 'Not a document my client prepared. Next.'"]),
  r("rourke", "E039", ["'The designated channel.' A procedure. That's all I'll say about procedures."]),
  r("rourke", "E040", ["Rourke looks at it for a long time.", "His lawyer, off camera: 'My client has no comment.'"]),
  r("rourke", "E009", ["I don't know this man. I said so."]),
  // Holt
  r("holt", "E030", ["Ms. Dunmore's filing. At my instruction. Standard."]),
  r("holt", "E032", ["My signature. A vendor letter. I've signed hundreds."]),
  r("holt", "E038", ["I've been in a cell since November 15. Whatever moved on November 28 did not move on my login.", "His lawyer: 'And that's all.'"]),
  r("holt", "E037", ["His lawyer: 'He won't comment on that document.'"]),
  r("holt", "E022", ["Schedule C. A disbursement agent. Common in logistics."]),
  // Lindqvist
  r("lindqvist", "E011", ["Hector's red folder. He kept the paper. He always said keep the paper."]),
  r("lindqvist", "E012", ["That's what it says now. I printed it Tuesday. I watched him do it."]),
  r("lindqvist", "E013", ["'SH.' Those are the ones that came on his lists."]),
  r("lindqvist", "E025", ["Every word. I'll say it in court."]),
  r("lindqvist", "E036", ["Eight. There are more. I just can't find the paper for the others."]),
  r("lindqvist", "E010", ["He showed me print five on his phone. On the 28th. I told him it was paperwork."]),
  // Malone
  r("malone", "E010", ["That's me. My truck. That's the night the guy took my picture."]),
  r("malone", "E026", ["My log. Every leg. Forget the numbers, they said. I didn't."]),
  r("malone", "E035", ["Bay 3. Those are my nights."]),
  r("malone", "E009", ["'MALONE HAULING on the door.' He wrote my name down. God help me."]),
  r("malone", "E038", ["Twenty-eight checks of six fifty. That's me. That's every leg."]),
  // Sullivan
  r("sullivan", "E009", ["'It goes to Vince Sullivan at the hall.' Damn it, Hector."]),
  r("sullivan", "E011", ["Signed paper at Gate 1, seal 2287415. That's the seal the shipper put on. Nobody re-keys a seal."]),
  r("sullivan", "E012", ["Five tons of tires showed up overnight. Clerical correction. Sure."]),
  r("sullivan", "E013", ["Nothing after ten. And then 'SH, G4, 0100.' That's a box walking."]),
  r("sullivan", "E014", ["He wrote it up. Like I told him. And they buried it."]),
  r("sullivan", "E015", ["'A checker, not an auditor.' A checker is an auditor. That's the job."]),
  r("sullivan", "E034", ["No checker. Since when does a terminal sign that?"]),
  // Whitaker
  r("whitaker", "E004", ["One bar, hung the wrong way, blood and hair consistent with his in the hook, and no prints. It's a brick, not the wall."]),
  r("whitaker", "E005", ["Consistent with half the boots in Baltimore. It won't hang anybody alone."]),
  r("whitaker", "E006", ["6:44. Inside the ME's window. Somebody turned that phone off."]),
  r("whitaker", "E007", ["C-1147 in at 6:21, twenty-three minutes after him. Whose badge is that?"]),
  r("whitaker", "E009", ["This should be in my evidence room by tonight. I'm glad you found it first."]),
  r("whitaker", "E017", ["Pagano on the gate, Fisk off. His own paper."]),
  r("whitaker", "E018", ["Fisk. And Gaffney added the zone in October. That's two people I want to talk to."]),
  r("whitaker", "E019", ["Gray Super Duty, amber bar. Mabry's truck, near enough."]),
  r("whitaker", "E020", ["Twelve thousand, Monday morning, 'special escort 12/02.' There was no escort."]),
  r("whitaker", "E022", ["An anonymous copy of a real contract is still a real contract."]),
  r("whitaker", "E023", ["'Leave him to me.' And the shift. Gaffney just made my week."]),
  r("whitaker", "E026", ["A trucker who keeps paper. God bless him."]),
  r("whitaker", "E027", ["'SK FREIGHT SEC.' In at 6:12, out at 7:03. That's inside the window."]),
  r("whitaker", "E028", ["Read the Saturday message. 'Nothing that brings police.' Then read Sunday."]),
  r("whitaker", "E033", ["Agent Quinlan is going to want this. Badly."]),
  r("whitaker", "E040", ["No name. No signature. Somebody went to a lot of trouble to be nobody."]),
  // Walsh
  r("walsh", "E029", ["One of Kane's. Remit to Patapsco. I paid it."]),
  r("walsh", "E031", ["My highlighter. I asked. I was told to accept it."]),
  r("walsh", "E032", ["The signatory letter. I should have called the number on it."]),
  r("walsh", "E034", ["My sticky note. 'No checker? Since when.' Nobody answered that either."]),
  r("walsh", "E030", ["Organized in Pittsburgh, managed by a Pittsburgh consultant. And I paid it because a letter said to."]),
  r("walsh", "E038", ["Forty-one thousand in cash withdrawals. No payroll, no fuel. That's not a freight company."]),
  // Bennett
  r("bennett", "E001", ["Took the cash and the phone, left the ring and the cards. That's a retrieval dressed as a robbery."]),
  r("bennett", "E022", ["Came by courier. No name, no note. The contract's real enough."]),
  r("bennett", "E030", ["A Baltimore freight company with a Pittsburgh front desk. Hang on to that."]),
  r("bennett", "E019", ["Not a rare truck in a port. But it's his."]),
  r("bennett", "E040", ["Forty years and I've never seen a crook write down that there's somebody he isn't allowed to call."]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "c_fisk_riverside",
    characterId: "fisk",
    title: "Dwayne Fisk: on the Riverside gate (post schedule)",
    text: "Dwayne Fisk says he worked the Riverside yard main gate himself on Sunday evening. His own post schedule has L. Pagano on that gate, signed in at 3:58 PM and out at 12:04 AM, and Fisk off.",
    when: { all: [{ asked: "fisk_sunday" }, ev("E017")] },
  },
  {
    id: "c_fisk_eastharbor",
    characterId: "fisk",
    title: "Dwayne Fisk: never at East Harbor (Gate 4 camera)",
    text: "Dwayne Fisk says he did not go to East Harbor on Sunday. The Gate 4 camera recorded a gray Super Duty with an amber light bar and 'FISK FREIGHT SEC...' door lettering coming in at 6:12 PM and going out at 7:03 PM.",
    when: { all: [{ asked: "fisk_sunday" }, ev("E027")] },
  },
  {
    id: "c_gaffney_clerical",
    characterId: "gaffney",
    title: "Russell Gaffney: clerical discrepancies",
    text: "Russell Gaffney calls the seal differences clerical. The dock receipt signed at Gate 1 on November 26 shows seal 2287415, and the record now shows seal 3301962 'at gate-in,' re-issued on Tuesday morning under his user name.",
    when: { all: [{ asked: "gaffney_discrepancies" }, ev("E011"), ev("E012")] },
  },
  {
    id: "c_kane_fisk",
    characterId: "kane",
    title: "Gideon Kane: only about posts",
    text: "Gideon Kane says he speaks to Dwayne Fisk only about problems with posts. Fisk's phone records show calls with Kane's cell on Saturday morning, twice on Sunday evening after 7:00 PM, and on Monday morning.",
    when: { all: [{ asked: "kane_fisk" }, ev("E021")] },
  },
  {
    id: "c_lindqvist_errors",
    characterId: "lindqvist",
    title: "Joanne Lindqvist: administrative amendments",
    text: "Joanne Lindqvist called the seal amendments administrative. The record for TMCU 482771-6 was re-issued on Tuesday morning under the supervisor's user name.",
    when: { all: [{ asked: "lindqvist_seals" }, ev("E012")] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  marisol_hire: "why did you call us why hire blackwood why an investigator why not the police why us",
  marisol_hector: "tell me about hector your husband what was he like who was he",
  marisol_worry: "was he worried scared nervous stressed upset bothering him something at work wrong seals numbers changing",
  marisol_notebook: "did he keep notes notebook write things down black notebook writing diary records",
  marisol_night: "did he go out at night wednesday midnight the gate leave the house late night",
  marisol_supervisor: "supervisor boss gaffney warning warned trouble at work auditor written up",
  marisol_vince: "who did he trust friends at work vince sullivan steward union",
  marisol_sunday: "sunday that day his shift when did he leave for work what happened sunday when did you call security",
  marisol_phone: "phone messages texts calls last text last time you heard from him last contact phone records voicemail account",
  marisol_police: "what did the police tell you police say robbery detective whitaker",
  marisol_locker: "locker his locker padlock combination gear locker chains where did he keep his notes where did he hide it",
  marisol_kane: "kane logistics kane the security company do you know kane",
  marisol_sofia: "your daughter sofia how is your daughter kid child family",
  marisol_book: "we found his notebook the notebook back cover goes to vince",
  gaffney_who: "what do you do your job who are you operations supervisor",
  gaffney_hector: "what kind of worker was hector what was hector like good checker employee",
  gaffney_discrepancies: "seal weight discrepancies hector reported his report seals changed weights different explain the discrepancies clerical",
  gaffney_warning: "why did you warn him verbal warning discipline written up auditor",
  gaffney_special: "special handling moves what are special handling sh moves amendment",
  gaffney_kane: "gideon kane do you know kane how well kane logistics the contractor",
  gaffney_fisk: "dwayne fisk do you know fisk security subcontractor",
  gaffney_sunday: "where were you sunday evening night alibi",
  gaffney_lindqvist: "who handles seal amendments joanne lindqvist clerk who keys the seals",
  gaffney_patapsco: "patapsco freight services why paid to patapsco invoices",
  gaffney_moves: "who approved the night moves approve night moves you approved them by phone off the plan",
  gaffney_reissue: "re-issue reissue reissued the record 4827 dock receipt changed tuesday why did you change the record",
  gaffney_badge: "fisk's badge staging area c zone added badge c-1147 why add the zone",
  gaffney_texts: "what did you tell kane told kane about hector texts messages told kane his shift leave him to me",
  gaffney_monday: "was that you monday morning text 7:15 he never answered",
  gaffney_disclosure: "annual disclosure ethics disclosure form financial disclosure question 7",
  gaffney_norfolk: "norfolk elizabeth river stevedoring 2012 repayment agreement kickbacks the file blackmail why did you go along leverage",
  kane_who: "what does kane logistics do your company your business who are you",
  kane_special: "special handling moves night moves what are they amendment no 2",
  kane_patapsco: "patapsco freight services what is patapsco disbursement agent billing",
  kane_fisk: "dwayne fisk how well do you know fisk your subcontractor relationship with fisk",
  kane_meridian: "meridian advisory group contract arrangement agreement consulting client",
  kane_calls: "calls with fisk sunday night phone calls talk to fisk why did fisk call you",
  kane_payment: "12,000 twelve thousand wire payment to fisk monday why did patapsco pay fisk",
  kane_gaffney: "russell gaffney relationship with gaffney how do you know gaffney",
  kane_texts: "texts with gaffney messages leave him to me what's his shift",
  kane_hector: "hector navarro did you know the checker the victim",
  kane_sunday: "where were you sunday evening night alibi",
  kane_cargo: "what was in the containers cargo boxes inside contents",
  kane_riverside: "riverside yard what happens there transfer yard transload",
  kane_bay3: "bay 3 transload new seal riverside log what happens in bay three",
  kane_instruction: "what did you tell fisk to do told fisk saturday the instruction get both make him understand nothing that brings police",
  kane_holt: "adrian holt do you know holt",
  kane_call: "why did you call me you called me the phone call",
  kane_lawyer: "warrants served search anything to say now your lawyer",
  kane_papers: "meridian papers your office riverside file cabinet safe memorandum protocol register insurance",
  fisk_who: "who are you what do you do your company",
  fisk_kane: "who do you work for your clients kane logistics",
  fisk_sunday: "where were you sunday evening night alibi what were you doing riverside gate",
  fisk_hector: "hector navarro did you know him the checker navarro",
  fisk_truck: "what do you drive your truck your pickup vehicle",
  fisk_eastharbor: "gate 4 camera your truck 6:12 east harbor were you at east harbor",
  fisk_badge: "badge c-1147 your badge who used your badge staging area c gate 6:21",
  fisk_staging: "why is staging area c on your badge zone access",
  fisk_schedule: "post schedule pagano on the gate your schedule board sign-in sheet",
  fisk_payment: "12,000 twelve thousand payment patapsco wire money monday special escort",
  fisk_mabry: "witness gray pickup amber light bar fence 6:30 otis mabry",
  fisk_meridian: "meridian advisory group work for meridian schedule b",
  fisk_phone: "dead man's phone victim's phone hector's phone under your seat why did you have his phone the iphone",
  fisk_notebook: "notebook no book what notebook were you looking for",
  fisk_bar: "binder bar lab weapon gear cage the bar",
  fisk_lawyer: "what happened tell me what happened confess talk",
  rourke_who: "what did your practice do corporate intelligence your job meridian",
  rourke_requests: "who asked for profiles requests who requested subjects",
  rourke_gaffney: "russell gaffney do you know gaffney",
  rourke_profile: "the profile reviewed j.r. jr your initials the gaffney file ci-2017-0384",
  rourke_kane: "gideon kane do you know kane logistics baltimore",
  rourke_hector: "hector navarro his death the murder the checker",
  rourke_channel: "designated channel what is the channel who is the channel",
  rourke_index: "compromising information index the index",
  rourke_custody: "why are you in detention charges arrested custody",
  rourke_holt: "adrian holt work with holt financial practice",
  holt_who: "what is your role nominal manager client entities",
  holt_patapsco: "patapsco freight services what is patapsco why did you set it up",
  holt_kane: "gideon kane do you know kane",
  holt_signatory: "authorized signatory letter your signature vendor letter",
  holt_wires: "november 28 wire 46,000 bank records who sent the money wires aholt login",
  holt_fee: "management fee 9,000 holt advisory fee",
  holt_meridian: "meridian relationship with meridian",
  holt_carroway: "carroway the ledger connected to carroway",
  holt_hector: "hector navarro his death the murder the checker",
  holt_dunmore: "carol dunmore what did carol do your office manager",
  holt_above: "who do you answer to who is above you boss who do you report to",
  lindqvist_who: "what do you do your job who are you documentation clerk",
  lindqvist_seals: "seal numbers changed why do seals change amendments dock receipts",
  lindqvist_hector: "did hector ask you about seals hector came to you november 28",
  lindqvist_sh: "what does sh mean special handling the list",
  lindqvist_customs: "customs exam cbp record inspection re-seal",
  lindqvist_statement: "what really happened with the records re-key re-keyed gaffney told you the truth tuesday",
  lindqvist_report: "how many containers changed list of containers the others discrepancy report compiled",
  lindqvist_text: "why did you text me your text message the tray printout",
  lindqvist_gaffney: "what is gaffney like your supervisor your boss",
  lindqvist_kane: "kane logistics do you know kane",
  lindqvist_fisk: "dwayne fisk do you know fisk",
  lindqvist_scared: "are you all right okay scared worried",
  malone_who: "who are you what do you do your truck your company",
  malone_kane: "who do you haul for drive for leased on kane",
  malone_log: "night runs night moves driving at night gate 4 out at 1 am overnight hauls your log",
  malone_waiting: "what happens at the riverside yard bay doors wait waiting sit in the cab",
  malone_pay: "how do you get paid pay rate 650 checks money paid for the moves",
  malone_photo: "did anyone see you car on broening highway picture photograph camera",
  malone_sunday: "where were you sunday glen burnie alibi",
  malone_hector: "hector navarro did you know the checker",
  malone_dispatcher: "dispatch dispatcher what did they tell you about the containers forget the numbers",
  malone_fisk: "dwayne fisk do you know fisk security",
  malone_riverside: "riverside yard gate log bay 3 the log",
  sullivan_who: "who are you what do you do steward retired",
  sullivan_seals: "how do seals work what is a seal seal change re-key container seal",
  sullivan_moveplan: "can a container leave staging at night move plan checker",
  sullivan_gate4: "gate 4 contractor lane what is gate 4 used for",
  sullivan_kane: "who runs security at the terminal kane logistics guards drayage",
  sullivan_gaffney: "russell gaffney what do you think of gaffney supervisor",
  sullivan_hector: "did hector come to you about seals talk to you hall november 25",
  sullivan_lockers: "where would a checker keep something private lockers gear lockers hide",
  sullivan_notebook: "notebook says it goes to you hector's notebook",
  sullivan_union: "union hall trailer the hall",
  whitaker_case: "where does the investigation stand case status theory progress",
  whitaker_report: "police report incident report can I see the report",
  whitaker_photos: "scene photographs photos crime scene pictures",
  whitaker_me: "see the medical examiner autopsy cause of death time of death me how did he die injuries",
  whitaker_canvass: "canvass witnesses anyone anybody somebody see saw anything witness statement",
  whitaker_robbery: "why robbery robbery theory why did you think robbery",
  whitaker_phone: "did you find his phone hector's phone missing phone",
  whitaker_access: "access records badge logs who keeps the records security office reader logs cameras",
  whitaker_bars: "send the binder bars to the lab gear cage bars test the bars weapon lab",
  whitaker_lab: "anything back from the lab results lab report",
  whitaker_cdr: "fisk's phone records call records court order cell sites",
  whitaker_warrant: "search warrant get a warrant search his truck warrants",
  whitaker_patapsco: "patapsco bank records subpoena economic crimes money schedule",
  whitaker_rourke: "interview julian rourke talk to rourke video link quinlan",
  whitaker_holt: "interview adrian holt talk to holt carroway prison bowman",
  whitaker_courier: "courier envelope anonymous contract copy",
  whitaker_fisk: "talk to fisk interview fisk custody",
  whitaker_gaffney: "gaffney's texts screenshots",
  whitaker_kane: "kane logistics gideon kane what do you know about kane",
  walsh_who: "what do you do your job who are you accounts manager",
  walsh_amendment: "amendment no 2 what did you make of the amendment contract",
  walsh_patapsco: "patapsco kane's money goes to patapsco why are invoices paid to patapsco notice of assignment vendor signatory letter",
  walsh_security: "performance security 150,000 who posted the security meridian deposit",
  walsh_paid: "how much paid to patapsco total 141,600",
  walsh_invoice: "invoice kl-1130-18 kane's invoice",
  walsh_holt: "adrian holt who is holt the signatory",
  walsh_gaffney: "who approves the invoices approvals gaffney operations",
  bennett_case: "what do you make of the file your read what do you think",
  bennett_truck: "fisk's truck registration plate mva pull the registration",
  bennett_patapsco: "patapsco records state filing who owns patapsco pull the records",
  bennett_courier: "courier envelope who sent it waybill",
  bennett_kane: "run gideon kane background on kane",
  bennett_fisk: "run dwayne fisk background on fisk",
  bennett_gaffney: "run russell gaffney background on gaffney",
  bennett_meridian: "meridian advisory group records background",
  bennett_again: "anything new any news updates",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
