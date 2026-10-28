import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { EFFECTS, G, KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * S001C04 "The Informant" interviews, written against docs/S001C04-timeline.md.
 *
 * Rules for this file: nobody confesses; Tate, Prentiss and Castell give
 * their own accounts until the design moves them; nobody says who chose the
 * records Blackwood received, who the source is, who made the 6:15 AM call,
 * or who EO-01 and "A" are. Castell never knows who her source was. Claire
 * knows Dr. Lockhart only as the patron she met once. Dr. Lockhart only
 * deflects or says what is plainly true. Rourke never names or hints at
 * anyone above him. Nothing from the "Closing report only" list is said by
 * anyone. Det. Harris starts at "adults are allowed to leave" and moves with
 * the evidence.
 *
 * Claire Donovan keeps her series id, `donovan` (as in S01 C05 and C06), so
 * the rolling board treats her as one person; her question ids keep the
 * `claire_` prefix. Bennett reuses C003's Bennett art.
 */

const ev = (id: string): Condition => ({ hasEvidence: id });
const rescued = G.rescued;

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The subject: in the case file from the start, interviewable after RE08
  // ---------------------------------------------------------------------
  {
    id: "donovan",
    name: "Claire Donovan",
    role: "Former records analyst, Meridian Records Center",
    portrait: "char.donovan",
    bio: [
      { text: "Thirty-four. Until Friday, December 7, a Records Analyst II at Meridian Advisory Group's Records Center in Chantilly, Virginia, badge 2214." },
      { text: "Lives at Cameron Mews, 1015 Cameron Street, Apt 3C, Alexandria. Cell (703) 555-0129. Drives a blue 2014 Subaru Impreza." },
      { text: "Wrote to Blackwood at 9:14 PM on Tuesday, December 11, asking to meet at the Wren Coffeehouse at 10:00 the next morning. She never came." },
      { text: "Found alive at 12 Saddle Ridge Lane, Bristow, at 6:10 AM on Friday, December 14.", requires: rescued },
    ],
    available: rescued,
    locationId: "police",
    phone: rescued,
    contact: "Alexandria Police Department, through Det. Harris.",
    onBoard: true,
    defaultEvidenceReply: "I'd want to read that properly before I said anything about it.",
    idleLine: "I need to stop for a while. I haven't slept since Wednesday.",
    noAnswer: ["I don't know.", "I was never told that.", "That's above anything I could see."],
    voice: {
      voiceId: "FGY2WhTYpPnrIDTdsKH5",
      direction: "Woman of thirty-four, a records analyst: tired, precise, quiet, ashamed of having been fooled and angry about it underneath. Mid-Atlantic American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "exhausted", label: "Exhausted", requires: { always: true } },
      { id: "resolved", label: "Resolved", requires: { any: [{ asked: "claire_passphrase" }, ev("E037"), ev("E040")] }, cue: "Claire sits up straighter and pulls the blanket off her shoulders." },
    ],
  },

  // ---------------------------------------------------------------------
  // The people who took and held her
  // ---------------------------------------------------------------------
  {
    id: "tate",
    name: "Brandon Tate",
    role: "Owner, Tate Protective Services LLC",
    portrait: "char.tate",
    bio: [
      { text: "Thirty-seven. Owner of Tate Protective Services LLC, Suite 204, 2900 Clarendon Boulevard, Arlington. Former Army military police." },
      { text: "His firm's gray 2016 Chevrolet Tahoe, Virginia plate UXR-4419, carries fleet decal 3.", requires: ev("E030") },
      { text: "Arrested in the kitchen at 12 Saddle Ridge Lane, Bristow, on Friday, December 14. Held at Alexandria police headquarters.", requires: rescued },
    ],
    available: G.tateAvailable,
    known: G.tateKnown,
    locationId: "tate_office",
    moves: [{ when: rescued, locationId: "police" }],
    onBoard: true,
    defaultEvidenceReply: "I don't discuss client matters.",
    idleLine: "We're done. You know where the door is.",
    noAnswer: ["I couldn't tell you.", "That's a client matter.", "No idea."],
    voice: {
      voiceId: "TX3LPaxmHKxFdv7VOQHJ",
      direction: "Man of thirty-seven, an ex-military security contractor: low, flat, controlled, few words, professional courtesy that goes cold. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: { any: [{ presented: "tate:E004" }, { presented: "tate:E030" }, ev("E030")] }, cue: "Tate closes the folder on his desk and folds his hands on top of it." },
      { id: "hostile", label: "Hostile", requires: { any: [{ presented: "tate:E029" }, { all: [{ flag: "tate_story2" }, ev("E029")] }] }, cue: "Tate stands up. He doesn't come around the desk, but he wants you to see he could." },
      { id: "counsel", label: "With counsel", requires: rescued, cue: "Tate sits with his hands flat on the interview table. His lawyer has a legal pad and a pen ready." },
    ],
  },
  {
    id: "rourke",
    name: "Julian Rourke",
    role: "Former director, Meridian Client Services (intelligence); in federal detention",
    portrait: "char.rourke",
    bio: [
      { text: "Forty-six. Formerly director of Meridian Advisory Group's Client Services intelligence practice." },
      { text: "In federal pretrial detention at the Potomac Regional Detention Center, Alexandria, since November 21. Attorney of record: Lewis Fenwick." },
      { text: "Interviewed by recorded video link from the detention center, arranged through Agent Quinlan, with his attorney present.", requires: ev("E032") },
    ],
    available: ev("E032"),
    known: G.rourkeKnown,
    locationId: null,
    medium: "telephone",
    phone: ev("E032"),
    contact: "Potomac Regional Detention Center, by video link through Agent Quinlan. Counsel present.",
    onBoard: true,
    defaultEvidenceReply: "My attorney would like me not to comment on that, and for once I agree with him.",
    idleLine: "We're finished, detective. Mr. Fenwick bills by the hour.",
    noAnswer: ["I have nothing to say about that.", "Ask my lawyer.", "I'm in a cell. I don't know what goes on outside it."],
    voice: {
      voiceId: "SOYHLrjzK2X1ezoPC6cr",
      direction: "Man of forty-six on a detention center video link: polished, cold, precise, contemptuous of the question, never raising his voice. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "contemptuous", label: "Contemptuous", requires: { always: true } },
      {
        id: "refusing",
        label: "Declining to answer",
        requires: G.rourkeRefuses,
        refuses: "Fenwick leans into the frame. \"My client has nothing further to say about that document, or anything connected to it.\"",
        cue: "Fenwick puts a hand on Rourke's sleeve. Rourke sits back and looks at the ceiling.",
      },
    ],
  },
  {
    id: "lockhart",
    name: "Dr. Evelyn Lockhart",
    role: "Founder, the Lockhart Foundation; Clearwater's founding patron",
    portrait: "char.lockhart",
    bio: [
      { text: "Fifty-two. Founder of the Lockhart Foundation, 1140 Fifth Avenue, New York." },
      { text: "The founding patron of the Clearwater Accountability Initiative, named on its donor wall and its program cards." },
      { text: "Received a copied invoice by courier in October and passed it to Blackwood in November, in the Keller case." },
    ],
    available: G.lockhartOpen,
    known: G.lockhartKnown,
    locationId: null,
    medium: "telephone",
    phone: G.lockhartOpen,
    contact: "The Lockhart Foundation, New York. Her office puts you through.",
    onBoard: true,
    defaultEvidenceReply: "I'm afraid I'm not the person to make sense of that. I'm sorry not to be more help.",
    idleLine: "I'm afraid I have a meeting. Do call again if the foundation can help.",
    noAnswer: ["I really couldn't say.", "I'm afraid I don't know.", "That's outside anything I know, I'm sorry."],
    voice: {
      voiceId: "pFZP5JQG7iQjIQuC4Bku",
      direction: "Woman in her early fifties, a New York philanthropist on the telephone: composed, gracious, precise, warm in a measured way, unhurried. Educated American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [{ id: "gracious", label: "Gracious", requires: { always: true } }],
  },

  // ---------------------------------------------------------------------
  // The channel and the people around Claire
  // ---------------------------------------------------------------------
  {
    id: "castell",
    name: "Miriam Castell",
    role: "Program director, Clearwater Accountability Initiative",
    portrait: "char.castell",
    bio: [
      { text: "Forty-two. Program director of the Clearwater Accountability Initiative, Suite 610, 1225 Nineteenth Street NW, Washington. Cell (202) 555-0143." },
      { text: "Clearwater supports whistleblowers. Its founding patron is the Lockhart Foundation." },
      { text: "Booked Laurel Run Cottage, Delaplane, at 6:32 AM on Wednesday, December 12, for 'Claire D.'", requires: ev("E027") },
    ],
    available: { always: true },
    known: G.castellKnown,
    locationId: "clearwater",
    onBoard: true,
    defaultEvidenceReply: "I don't know what you want me to say about that.",
    idleLine: "I have people who depend on this office. I need to stop.",
    noAnswer: ["I don't know.", "Nobody ever told me that.", "I only know what the notes said."],
    voice: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      direction: "Woman of forty-two, a Washington nonprofit director: articulate, warm, fiercely protective, then shaken and quietly frightened. Mid-Atlantic American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "protective", label: "Protective", requires: { always: true } },
      { id: "shaken", label: "Shaken", requires: G.cooperates, cue: "Miriam sits down hard. For a moment she doesn't seem to know where her hands should go." },
      { id: "forthcoming", label: "Forthcoming", requires: ev("E025"), cue: "Miriam pushes the printed pages across the desk and doesn't take her eyes off them." },
    ],
  },
  {
    id: "prentiss",
    name: "Tyler Prentiss",
    role: "Software engineer; Claire's former partner",
    portrait: "char.prentiss",
    bio: [
      { text: "Thirty-six. Software engineer. The Courtland, Apt 1108, Wilson Boulevard, Clarendon, Arlington. Cell (571) 555-0162." },
      { text: "Lived with Claire in 3C until March 19, 2018, when his fob was deactivated." },
      { text: "Spoke to Claire for 22 minutes at 10:31 PM on Monday, December 10.", requires: ev("E008") },
    ],
    available: { always: true },
    known: G.prentissKnown,
    locationId: "prentiss_apt",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is.",
    idleLine: "I need a minute. I keep checking my phone.",
    noAnswer: ["I don't know.", "She never told me that.", "I wish I knew."],
    voice: {
      voiceId: "bIHbv24MWmeRgasZH58o",
      direction: "Man of thirty-six, a software engineer: soft-spoken, evasive and quick at first, then ashamed and earnest. American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "evasive", label: "Evasive", requires: { always: true } },
      { id: "ashamed", label: "Ashamed", requires: G.tylerOpen, cue: "Tyler looks at the phone record for a long time. Then he puts his own phone face down on the table." },
      { id: "helpful", label: "Helpful", requires: ev("E011"), cue: "Tyler pulls a second chair up to his desk and wakes the screen." },
    ],
  },
  {
    id: "patel",
    name: "Gwen Patel",
    role: "ER night nurse; Claire's neighbor in 3D",
    portrait: "char.patel",
    bio: [
      { text: "Thirty-three. Night-shift ER nurse at Inova Alexandria. Lives in Apt 3D at Cameron Mews, across the hall from Claire." },
    ],
    available: { always: true },
    known: { visited: "apt_building" },
    locationId: "apt_building",
    phone: { talkedTo: "patel" },
    contact: "Cameron Mews, Apt 3D. Works nights.",
    onBoard: true,
    defaultEvidenceReply: "I'm sorry, I don't know what that is.",
    idleLine: "I'm on at seven tonight. I have to try to sleep.",
    noAnswer: ["I don't know.", "I never saw that.", "I'm sorry, I sleep through most of the day."],
    voice: {
      voiceId: "cgSgspJ2msm6clMCkdW9",
      direction: "Woman of thirty-three, an ER night nurse: warm, observant, tired, worried for her neighbor, steady under pressure. Mid-Atlantic American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "worried", label: "Worried", requires: { always: true } },
      { id: "helpful", label: "Helpful", requires: { any: [ev("E006"), { flag: "screwdriver_known" }] }, cue: "Gwen opens her door the rest of the way and leans on the frame." },
    ],
  },
  {
    id: "corbett",
    name: "Alan Corbett",
    role: "Former Senior Compliance Officer, Meridian",
    portrait: "char.corbett",
    bio: [
      { text: "Fifty-one. Senior Compliance Officer at Meridian Advisory Group until September 28, 2018. Lives at 214 Hillwood Avenue, Falls Church." },
      { text: "Claire Donovan was his compliance liaison for three years." },
      { text: "Wrote to Meridian's Executive Office on July 30, 2018, about three programs.", requires: ev("E023") },
    ],
    available: { always: true },
    known: G.corbettKnown,
    locationId: "corbett_home",
    onBoard: true,
    defaultEvidenceReply: "I'd want my glasses and an hour with that before I said anything.",
    idleLine: "I've said what I can for today.",
    noAnswer: ["Compliance never saw that.", "I don't know, and I won't guess.", "That was above my pay grade, I was told."],
    voice: {
      voiceId: "iP95p4xoKVk53GoZ742B",
      direction: "Man of fifty-one, a former corporate compliance officer: careful, exact, dry, quietly bitter, then resolute. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [
      { id: "careful", label: "Careful", requires: { always: true } },
      {
        id: "withdrawn",
        label: "Withdrawn",
        requires: G.corbettWithdrawn,
        refuses: "I told you on the phone. Unless you've brought something that's worth what it'll cost me, I can't.",
        cue: "Corbett talks to you through the storm door and doesn't unlatch it.",
      },
      { id: "resolute", label: "Resolute", requires: G.duplicates, cue: "Corbett clears his dining table and goes to get his boxes." },
    ],
  },
  {
    id: "halvorsen",
    name: "Nina Halvorsen",
    role: "Manager, the Wren Coffeehouse",
    portrait: "char.halvorsen",
    bio: [
      { text: "Twenty-nine. Manager of the Wren Coffeehouse, 1108 King Street, Old Town Alexandria. Phone (703) 555-0136." },
    ],
    available: { always: true },
    known: { visited: "cafe" },
    locationId: "cafe",
    onBoard: true,
    defaultEvidenceReply: "I'm sorry, I only know what happens in here.",
    idleLine: "I've got a line at the counter. I'm so sorry.",
    noAnswer: ["I don't know.", "I didn't see that.", "I was in the back, I'm sorry."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Woman of twenty-nine, a coffeehouse manager: quick, kind, apologetic, warm, a little breathless. Mid-Atlantic American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "apologetic", label: "Apologetic", requires: { always: true } },
      { id: "helpful", label: "Helpful", requires: ev("E004"), cue: "Nina wipes her hands on her apron and pulls out the chair across from you." },
    ],
  },
  {
    id: "lang",
    name: "Gerald Lang",
    role: "Owner, Lang Records Systems and Dominion Secure Records",
    portrait: "char.lang",
    bio: [
      { text: "Forty-four. Owner of Lang Records Systems, which built the Meridian Records Center's checkout system in 2014, and of Dominion Secure Records, Lorton Industrial Park." },
      { text: "Keeps the checkout system's nightly backups at Dominion." },
      { text: "Signed the receipt for Claire's carton, P-0388, on Saturday, December 8.", requires: ev("E012") },
    ],
    available: { always: true },
    known: G.langKnown,
    locationId: "storage",
    onBoard: true,
    defaultEvidenceReply: "That's not something I'd know about.",
    idleLine: "I've got a truck at the dock. We'll pick this up later.",
    noAnswer: ["I couldn't tell you.", "That's Meridian's business, not mine.", "I keep the boxes. I don't read them."],
    voice: {
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      direction: "Man of forty-four, a small records-storage business owner: practical, reluctant, worried about his biggest client, then plainly cooperative. Mid-Atlantic American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "reluctant", label: "Reluctant", requires: { always: true } },
      { id: "cooperative", label: "Cooperative", requires: { flag: "carton_warrant" }, cue: "Lang reads the court order twice, folds it and goes to get his cart." },
    ],
  },

  // ---------------------------------------------------------------------
  // Police and the office: no limit
  // ---------------------------------------------------------------------
  {
    id: "harris",
    name: "Det. Ross Harris",
    role: "Alexandria Police, case 18-034417",
    portrait: "char.harris",
    bio: [
      { text: "Forty-five. Alexandria Police Department detective, Wheeler Avenue. Lead on case 18-034417, Claire Donovan." },
      { text: "Reachable at headquarters or by phone." },
    ],
    available: { always: true },
    locationId: "police",
    phone: { always: true },
    contact: "Alexandria PD, Wheeler Avenue. Case 18-034417.",
    onBoard: true,
    defaultEvidenceReply: "Noted. Tell me what you think it means.",
    idleLine: "That's what I've got. Call me when something moves.",
    noAnswer: ["That's not in my file.", "I don't know yet.", "I won't guess on that."],
    voice: {
      voiceId: "CwhRBWXzGAHq8TQ4Fs17",
      direction: "Man of forty-five, a city police detective: brisk, practical, skeptical at first, fair, then urgent. Mid-Atlantic American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "skeptical", label: "Skeptical", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: { any: [{ deduction: "D04" }, ev("E006")] }, cue: "Harris stops leaning back in his chair and pulls the file toward him." },
      { id: "urgent", label: "Urgent", requires: { any: [{ event: "RE07" }, ev("E029"), ev("E028")] }, cue: "Harris is already on his feet, keys in his hand." },
    ],
  },
  {
    id: "collins",
    name: "Det. Nadia Collins",
    role: "MPD, liaison to the federal Rourke task force",
    portrait: "char.collins",
    bio: [
      { text: "Forty-two. Metropolitan Police Department, Washington. Liaison to the federal task force on the Rourke case." },
      { text: "Reachable by phone." },
    ],
    available: { always: true },
    locationId: null,
    medium: "telephone",
    phone: { always: true },
    contact: "MPD, Washington. Liaison to the federal task force on the Rourke case.",
    onBoard: true,
    defaultEvidenceReply: "Read it to me. I'll tell you if it means anything on my side.",
    idleLine: "I've got a task force meeting. Call me if something moves.",
    noAnswer: ["That's not mine to know.", "That's on the federal side. Ask Quinlan.", "I don't know yet."],
    voice: {
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      direction: "Woman of forty-two, a big-city police detective on the phone: dry, quick, decent, no time wasted. Mid-Atlantic American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [{ id: "professional", label: "Professional", requires: { always: true } }],
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
  // Claire Donovan: after the rescue, at APD
  // =====================================================================
  q("donovan", "About her", "claire_how", "How are you?", [
    "Alive. They checked me over at the hospital in Manassas. My wrists are the worst of it.",
    "I'm more angry than hurt. Give me a minute and I'll be useful.",
  ]),
  q("donovan", "The archive", "claire_job", "What was your job at Meridian?", [
    "Records analyst, six years, at the Records Center in Chantilly. Badge 2214. About forty thousand boxes of what Meridian doesn't use anymore.",
    "My job was knowing where every page in that building was. I was good at it.",
  ]),
  q("donovan", "The archive", "claire_records", "How do the Records Center's records work?", [
    "Collection, box, item. That's the address of every page. The copier won't run without a badge, and it prints that address along the bottom of every copy.",
    "Executive Office items are filed in with everything else. The file copies only ever show a reference, EO-01. Never a signature. That's Policy 7.",
  ]),
  q("donovan", "The releases", "claire_releases", "What did you copy, and when?", [
    "Three pages. The Tri-County invoice on Friday, October 26. The client list on Monday, November 19. The Kane agreement on Monday, December 3. Each one went to Miriam.",
    "I kept a duplicate of every one, because a records person keeps a copy of anything that leaves.",
  ], {
    reveals: "Claire copied three Meridian pages for Miriam Castell: the Tri-County invoice (Oct 26), the client list (Nov 19) and the Kane agreement (Dec 3), and kept duplicates of each.",
    effects: [
      tl("Fri 10/26", "Claire copies the Tri-County invoice at the Records Center.", "Claire Donovan"),
      tl("Mon 11/19", "Claire copies the intelligence client list.", "Claire Donovan"),
      tl("Mon 12/3", "Claire copies the Kane contractor agreement.", "Claire Donovan"),
    ],
  }),
  q("donovan", "The releases", "claire_castell", "How did Miriam Castell approach you?", [
    "Coffee near Dupont Circle, Friday, September 14. She said a senior person inside Meridian, someone who wanted it cleaned up, had given her my name.",
    "I never met that person. Every request came through Miriam, and I believe she was honest with me. I still do.",
  ], { reveals: "Miriam Castell approached Claire on September 14 on behalf of a 'senior source inside Meridian' Claire never met.", effects: [tl("Fri 9/14", "Miriam Castell meets Claire for coffee near Dupont Circle.", "Claire Donovan")] }),
  q("donovan", "People", "claire_lockhart", "Do you know Dr. Evelyn Lockhart?", [
    "I met her once. Clearwater's donor breakfast, October 18, for about five minutes. She asked what I did, and when I told her she said the people who keep the records are an institution's conscience.",
    "She was kind. She didn't know who I was.",
  ]),
  q("donovan", "The releases", "claire_eo", "Why did you start keeping the Executive Office items?", [
    "Because a man in Carroway was dead, and I'd copied the invoice out of his fund's file. After that I started keeping what nobody asked for.",
    "Nobody ever wanted the cover sheet. The cover sheet is the only page that says who said yes.",
  ], { reveals: "After Martin Keller's death Claire began keeping the Executive Office item filed beside each released page: 'The cover sheet is the only page that says who said yes.'" }),
  q("donovan", "The releases", "claire_memo", "What did Alan Corbett's July memo have to do with it?", [
    "I saw it go out. I was his compliance liaison. Three programs, three names, in an order.",
    "Holt, then Rourke, then Kane. The arrests came in that order. That's when I stopped sleeping.",
  ]),
  q("donovan", "The releases", "claire_resign", "Why did you resign?", [
    "Because I'd worked out that I was a delivery service. I left the letter and my badge on Benjamin's desk Friday morning.",
  ]),
  q("donovan", "Wednesday", "claire_wednesday", "What happened on Wednesday morning?", [
    "Miriam called me at about seven. She said Meridian security knew I'd written to you and would be at the meeting, and I needed to go somewhere for a few days. She sent me a cottage and a code.",
    "I went to the café first, then turned my phone off and drove out there. I went because I wanted to. Nobody made me.",
  ], { reveals: "Claire says she went to the cottage willingly on Wednesday morning, after Miriam Castell called to say Meridian security knew about the meeting." }),
  q("donovan", "Wednesday", "claire_note", "Why did you leave a note at the café?", [
    "I couldn't stand you up with nothing, and I couldn't write more in a café with that car outside.",
    "I didn't know the car was there until I walked out.",
  ]),
  q("donovan", "The cottage", "claire_door", "Why did you open the cottage door that night?", [
    "About nine, a knock. A man said through the door that Miriam had sent him, there was a problem, and I had to move tonight.",
    "He said Miriam sent him. That's the only reason I opened the door.",
  ], { reveals: "At about 9 PM Wednesday a man told Claire 'Miriam sent me,' and she opened the cottage door." }),
  q("donovan", "The cottage", "claire_kitchen", "What happened when you tried to leave?", [
    "I said I wanted to call Miriam first. He took my phone. I ran for the back door and the bolt wouldn't give.",
    "He caught me in the kitchen and put plastic ties on my wrists. Then he went through my document wallet at the table.",
  ], { reveals: "Claire tried to leave the cottage by the back door; the man caught her in the kitchen, restrained her with zip ties and took her phone and document wallet." }),
  q("donovan", "The cottage", "claire_questions", "What did he want from you?", [
    "Everything I had. He kept asking who asked me to copy them, and who in Pittsburgh I'd talked to. Over and over.",
    "He talked on the phone to someone he called W.",
  ]),
  q("donovan", "The basement", "claire_basement", "Where did he take you?", [
    "About one in the morning he put a sleep mask over my eyes and drove maybe half an hour. A room in a basement, a padlock on the outside.",
    "He questioned me again Thursday night. I never told him about Lorton.",
  ]),
  q("donovan", "The man", "claire_man", "Did you know the man?", [
    "No. White, late thirties, shaved head. He never gave me a name.",
  ]),
  q("donovan", "The man", "claire_sent", "Who do you think sent him?", [
    "I don't know. He wanted to know who asked me to copy them. So whoever sent him didn't know either.",
    "That's the one thing I'm sure of.",
  ]),
  q("donovan", "The source", "claire_source", "Who was Miriam's source?", [
    "I don't know. I've tried. Someone who could read Alan's memo, which is a short list I can't see the top of.",
  ]),
  q("donovan", "The drive", "claire_tyler", "What did Tyler Prentiss do for you?", [
    "He set up the drive with a split key, a keyfile on his machine and my passphrase. Neither half works alone. And he kept an envelope for me, in case.",
  ]),
  q("donovan", "The wallet", "claire_wallet", "What was in your document wallet?", [
    "The three things nobody asked for: two cover sheets and a routing slip. My timeline. A page about how it started. He took it at the cottage.",
  ]),
  q("donovan", "The drive", "claire_passphrase", "What's the passphrase for your drive?", [
    "I'll write it down for you, not say it. Tyler has the other half, the keyfile. The drive is in Lorton, in carton P-0388.",
    "It needs both halves. That was the point.",
  ], {
    requires: rescued,
    reveals: "Claire gave her half of the drive's key, her passphrase.",
    effects: EFFECTS.passphrase,
    variants: [{ requires: { all: [{ flag: "tyler_key" }, { flag: "carton_warrant" }] }, reply: ["I'll write it down for you, not say it.", "You have Tyler's half and the carton. Then you have everything. Send it."] }],
  }),
  q("donovan", "The source", "claire_a", "Who is EO-01? Who signs as 'A'?", [
    "I don't know. 'A' and EO-01 are all the file copies ever show. That's Policy 7.",
  ]),
  q("donovan", "The archive", "claire_archive", "Your archive is open.", [
    "Forty-seven pages from three boxes. Three were asked for. One per program, each naming the man at the bottom and nobody else.",
    "Whoever chose the three knew what was in the other forty-four.",
  ], { requires: ev("E037") }),
  q("donovan", "The wallet", "claire_coversheets", "Tell me about the cover sheets you kept.", [
    "Same reference on both. Two divisions. Above both men.",
  ], { requires: ev("E040") }),
  q("donovan", "The archive", "claire_sequence", "Alan Corbett rebuilt the sequence of the boxes.", [
    "Of course he did. He kept his own index. He always said someday they'd claim he never raised it.",
  ], { requires: ev("E022") }),

  // =====================================================================
  // Brandon Tate
  // =====================================================================
  q("tate", "Introductions", "tate_who", "Who are you?", [
    "Brandon Tate. I own Tate Protective Services. Former Army MP.",
  ], { variants: [{ requires: rescued, reply: ["Brandon Tate. Everything else goes through my lawyer, and he's sitting right here."] }] }),
  q("tate", "His firm", "tate_firm", "What does your firm do?", [
    "Protective details, site security, investigations support. We're licensed and insured. Our clients pay for discretion.",
  ]),
  q("tate", "Claire", "tate_claire", "Do you know Claire Donovan?", [
    "Never heard of her.",
  ], { requires: G.tateStory1, reveals: "Brandon Tate says he has never heard of Claire Donovan." }),
  q("tate", "The Tahoe", "tate_tahoe", "Where was your Tahoe on Wednesday?", [
    "Tahoe 3 is a pool vehicle. On Wednesday it was on a client protective detail.",
    "I don't discuss clients. That's what they pay for.",
  ], {
    requires: G.tateFree,
    reveals: "Tate says Tahoe 3 is a pool vehicle and was on a client protective detail on Wednesday, which he won't discuss.",
    variants: [{ requires: { flag: "tate_story2" }, reply: ["Wednesday was a client matter then, and it's a client matter now."] }],
  }),
  q("tate", "His firm", "tate_meridian", "Has your firm worked for Meridian Advisory Group?", [
    "We did some work for Meridian a couple of years ago. Nothing since.",
  ], { requires: G.tateFree, reveals: "Tate says his firm did some work for Meridian 'a couple of years ago, nothing since.'" }),
  q("tate", "Wednesday", "tate_wednesday", "Where were you on Wednesday?", [
    "Working. I don't discuss clients.",
  ], { requires: G.tateFree }),
  q("tate", "Claire", "tate_client", "You say Claire Donovan is your client.", [
    "Ms. Donovan contacted my firm on Wednesday evening. She believed she was in danger and asked to be moved somewhere nobody knew. We did that.",
    "She's safe. That's all you need to know.",
  ], { requires: G.tateStory2, reveals: "Tate now says Claire contacted his firm on Wednesday evening and asked to be moved somewhere nobody knew, and that she is safe." }),
  q("tate", "Claire", "tate_where", "Where is Claire now?", [
    "Somewhere safe. She asked that nobody be told where, and that includes you and the police.",
    "If she wants to talk to you, she'll call you.",
  ], { requires: G.tateStory2 }),
  q("tate", "The cottage", "tate_struggle", "Why was the cottage kitchen torn up, with a cut zip tie on the floor?", [
    "She was frightened. Frightened people break things.",
  ], { requires: { all: [G.tateStory2, ev("E029")] } }),
  q("tate", "In custody", "tate_counsel", "Did you take Claire Donovan from the cottage?", [
    "No comment.",
  ], { requires: rescued }),
  q("tate", "In custody", "tate_sent", "Who sent you after her?", [
    "No comment.",
  ], { requires: rescued }),
  q("tate", "In custody", "tate_basement", "Why was she locked in a basement room?", [
    "She wanted to go. I couldn't let her, for her own safety.",
  ], { requires: ev("E035"), reveals: "Shown the basement room, Tate says: 'She wanted to go. I couldn't let her, for her own safety.'" }),
  q("tate", "In custody", "tate_note", "Whose note was in your desk drawer?", [
    "I don't know whose handwriting that is.",
  ], { requires: ev("E032") }),
  q("tate", "In custody", "tate_phone", "Who is 'W' in your prepaid phone?", [
    "No comment.",
  ], { requires: ev("E031") }),
  q("tate", "In custody", "tate_lease", "Why did you lease a house on Saddle Ridge Lane?", [
    "No comment.",
  ], { requires: ev("E033") }),

  // =====================================================================
  // Julian Rourke: video link from detention, counsel present
  // =====================================================================
  q("rourke", "Introductions", "rourke_who", "Can you tell me about yourself, Mr. Rourke?", [
    "I'm in a cell, detective. I speak to my lawyer and the walls.",
    "You've got Mr. Fenwick's indulgence for a few minutes. Use them.",
  ]),
  q("rourke", "Tate", "rourke_contact", "Do you know Brandon Tate?", [
    "A vendor. Meridian used a great many vendors.",
  ], { reveals: "Julian Rourke says he knows Brandon Tate only as 'a vendor.'" }),
  q("rourke", "Whitlock", "rourke_whitlock", "Who is Dean Whitlock?", [
    "Mr. Whitlock works for my defense.",
  ], { allowWhenRefusing: true }),
  q("rourke", "The note", "rourke_note", "Did you write this note?", [
    "Fenwick leans in: \"Don't answer that.\"",
    "Rourke doesn't.",
  ]),
  q("rourke", "The leak", "rourke_handed", "Who leaked your client list?", [
    "You think you found me. Someone handed me to you.",
    "I'd like to know who as much as you would.",
  ]),
  q("rourke", "The leak", "rourke_hearing", "The client list page was in the government's proffer at your detention hearing.", [
    "Fenwick: \"My client isn't going to discuss his detention hearing.\"",
    "Rourke smiles at the camera and says nothing.",
  ]),
  q("rourke", "Meridian", "rourke_meridian", "Who is EO-01? Who signs Executive Office slips as 'A'?", [
    "Fenwick: \"We're not here to discuss Meridian's internal records.\"",
    "Rourke doesn't even look at him. He just waits.",
  ]),
  q("rourke", "Tate", "rourke_calls", "Tate's prepaid phone took calls from Whitlock after his visits to you.", [
    "Then ask Mr. Whitlock who he calls. I don't have a telephone, detective. I have a cell.",
  ], { requires: ev("E031") }),
  q("rourke", "Tate", "rourke_lyons", "Garrett Lyons's old number is in Tate's phone.", [
    "Mr. Lyons is in custody, as you know. So is his phone.",
  ], { requires: ev("E031") }),

  // =====================================================================
  // Dr. Evelyn Lockhart: by telephone
  // =====================================================================
  q("lockhart", "Her call", "lockhart_call", "Why did you call?", [
    "Miriam Castell telephoned me this afternoon, very upset. She tells me someone Clearwater has been helping is missing, and that you're looking for her.",
    "Is she safe? Is there anything at all the foundation can do?",
  ], { variants: [{ requires: rescued, reply: ["I've heard she's been found, and that she's safe. I can't tell you how relieved I am.", "If the foundation can do anything for her now, I hope you'll tell me."] }] }),
  q("lockhart", "Clearwater", "lockhart_clearwater", "Why does your foundation fund Clearwater?", [
    "Because I believe institutions behave better when someone is watching. We fund Clearwater openly. Our name is on their wall.",
  ]),
  q("lockhart", "The envelope", "lockhart_envelope", "Tell me about the envelope you received in October.", [
    "One of these envelopes reached my office in October. I passed it to your colleague in November.",
    "Miriam tells me now that it went out from her own office. She never told me so at the time.",
  ]),
  q("lockhart", "The envelope", "lockhart_why_sent", "Why did you send the envelope on to Blackwood?", [
    "When I read about Martin Keller, I thought the people looking into his death should have it.",
  ]),
  q("lockhart", "Claire", "lockhart_claire", "Have you met Claire Donovan?", [
    "I think I met her once, at Clearwater's breakfast in October. A thoughtful young woman.",
  ]),
  q("lockhart", "Clearwater", "lockhart_source", "Do you know who Clearwater's source inside Meridian is?", [
    "Miriam has always protected her sources, and I've never asked her to do otherwise.",
  ]),
  q("lockhart", "Claire", "lockhart_cottage", "Did you know Miriam had sent Claire to a cottage?", [
    "Miriam told me today she'd found Claire somewhere to stay.",
    "I wish she'd gone to the police.",
  ]),
  q("lockhart", "Meridian", "lockhart_eo", "Do you know who EO-01 is, or who signs as 'A'?", [
    "I'm afraid I can't help you with Meridian's internal shorthand.",
  ]),
  q("lockhart", "Meridian", "lockhart_meridian", "What do you know about Meridian Advisory Group?", [
    "I had a hand in starting it, years ago. I gather it has had a difficult autumn.",
  ]),
  q("lockhart", "Her call", "lockhart_help", "Can the foundation help?", [
    "Anything that's in my power. My office will put you through to me at any hour.",
  ]),
  q("lockhart", "The envelope", "lockhart_courier", "The courier account that sent you the envelope is Clearwater's.", [
    "So Miriam tells me. I'd rather she had told me at the time.",
  ], { requires: ev("E018") }),
  q("lockhart", "Claire", "lockhart_timeline", "Claire wrote a timeline: the arrests followed an internal Meridian memo.", [
    "I'm not able to judge a company's internal memoranda, I'm afraid.",
    "I'm glad she wrote it down, and gladder that she's safe.",
  ], { requires: ev("E039") }),

  // =====================================================================
  // Miriam Castell
  // =====================================================================
  q("castell", "Clearwater", "castell_who", "What does Clearwater do?", [
    "We support people who report wrongdoing inside institutions. Lawyers, hearings, a quiet place to think.",
  ]),
  q("castell", "Claire", "castell_whereabouts", "Where is Claire Donovan?", [
    "Somewhere safe, by her own choice.",
    "I won't tell you where. That's not a judgment about you. It's the only way this work is ever safe.",
  ], { requires: G.castellGuarded, reveals: "Miriam Castell says Claire is 'somewhere safe, by her own choice,' and won't say where." }),
  q("castell", "Sources", "castell_sources", "Who are your sources at Meridian?", [
    "I don't discuss sources. That's the only promise this office makes, and I keep it.",
  ], { requires: G.castellGuarded }),
  q("castell", "Claire", "castell_claire", "How do you know Claire?", [
    "She's someone Clearwater has been helping. That's as far as I'll go.",
  ], { variants: [{ requires: G.cooperates, reply: ["The first note named her. I asked her to coffee near Dupont Circle on Friday, September 14. She agreed at the end of the month.", "She's the most careful person I've ever worked with. I made her careless."] }] }),
  q("castell", "Clearwater", "castell_lockhart", "What is the Lockhart Foundation's part in Clearwater?", [
    "Our founding patron. It's on the wall behind you and on every program card. There's nothing hidden about it.",
  ]),
  q("castell", "Claire", "castell_breakfast", "Claire came to your donor breakfast in October.", [
    "October 18, at Merrion House. I wanted her to see the people who keep us going. I wrote my cell on the back of her card.",
  ]),
  q("castell", "Sources", "castell_notes", "How did your source contact you?", [
    "In early September a typed note came by bike messenger. Unsigned. From someone senior at Meridian who wanted it cleaned up, it said. It named Claire.",
    "Every note after that came the same way, a different messenger each time. The first one told me to burn them. I did.",
  ], { requires: G.cooperates, reveals: "Castell's source reached her through unsigned typed notes, hand-delivered by different bike messengers, from 'someone senior at Meridian who wants it cleaned up.' She burned each one.", effects: [tl("Early Sep", "Miriam Castell receives the first unsigned typed note, naming Claire.", "Miriam Castell")] }),
  q("castell", "Sources", "castell_identity", "Who is the source?", [
    "I don't know. I've never met them. I believed it was someone senior inside Meridian, and nothing I've seen says otherwise.",
    "I'm beginning to understand how little I knew.",
  ], { requires: G.cooperates }),
  q("castell", "Claire", "castell_messages", "Can I see your messages with Claire?", [
    "I printed the whole thread this morning and initialed every page. Read Wednesday's first.",
  ], { requires: G.cooperates, reveals: "Castell handed over her messages with Claire.", effects: [{ giveEvidence: "E025" }], volunteer: { after: 1 } }),
  q("castell", "The cottage", "castell_booking", "Where did you send Claire?", [
    "Laurel Run Cottage, in Delaplane. I booked it at 6:32 on Wednesday morning on Clearwater's card. Here's the confirmation, with the code.",
    "Go. Please go.",
  ], { requires: G.cooperates, reveals: "Castell booked Laurel Run Cottage, Delaplane, for Claire at 6:32 AM on Wednesday.", effects: [{ giveEvidence: "E027" }, tl("6:32 AM (Wed 12/12)", "Miriam Castell books Laurel Run Cottage for 'Claire D.'", "Miriam Castell")] }),
  q("castell", "The pages", "castell_courier", "How were the pages sent?", [
    "By Capital Courier, on Clearwater's account. The note said to leave the sender blank, so I did. Here's the account statement.",
  ], {
    requires: G.cooperates,
    reveals: "Castell sent each page by Capital Courier on Clearwater's account 20417, sender left blank.",
    effects: [{ giveEvidence: "E018" }],
    variants: [{ requires: { flag: "courier_known" }, reply: ["Your colleague has already found the account number, hasn't he? 20417. It's ours. Here's the statement. I circled the three."] }],
  }),
  q("castell", "The pages", "castell_first", "Why did the first page go to the Lockhart Foundation?", [
    "The note said the fund's founding donor should have it, so the fund would have to look at itself. It made sense to me.",
    "I never told Dr. Lockhart it came from us, until today. The second and third were for the investigators. For you.",
  ], { requires: G.cooperates }),
  q("castell", "Wednesday", "castell_call", "Who called you before you booked the cottage?", [
    "At 6:15 a man called, blocked number. Courteous, unhurried. He said he spoke for the source. Meridian security knew about the meeting, Claire mustn't go, here was a cottage, someone would come for her papers Friday.",
    "I'd never heard his voice before. I couldn't tell it again.",
  ], { requires: G.cooperates, reveals: "At 6:15 AM Wednesday a man 'speaking for the source' told Castell that Meridian security knew about the meeting, gave her the cottage listing, and said someone would come for Claire's papers on Friday.", effects: [tl("6:15 AM (Wed 12/12)", "A blocked call to Miriam Castell from a man 'speaking for the source.'", "Miriam Castell")] }),
  q("castell", "Wednesday", "castell_claire_call", "What did you tell Claire?", [
    "I called her at 6:58 and told her what the man told me. Then I sent the booking and the code.",
    "She wrote back that she was leaving a note for you first. She wouldn't stand you up with nothing.",
  ], { requires: G.cooperates }),
  q("castell", "Claire", "castell_monday", "What happened when Claire came to see you on Monday?", [
    "She sat where you're sitting and told me she was done. She'd talk to the investigators herself.",
    "I asked her to wait while I asked the source. I thought I was protecting her.",
  ], { requires: G.cooperates }),
  q("castell", "Sources", "castell_tuesday", "Who knew Claire was meeting us?", [
    "She called me Tuesday night at 7:40 to say she was writing to you. The first note gave me a number for messages. I left word that she was meeting you.",
    "I told them. I told whoever they are.",
  ], { requires: G.cooperates, reveals: "On Tuesday night Castell left word on the source's message number that Claire was meeting Blackwood." }),
  q("castell", "The pages", "castell_one_page", "Why was it only ever one page?", [
    "Because one true page is a lead and fifty is a leak. The note said it, and I said it to her as if it were mine.",
  ], { requires: G.cooperates }),
  q("castell", "Clearwater", "castell_patron", "Have you told Dr. Lockhart?", [
    "I'll call her after you've gone. She ought to hear it from me, not from the papers.",
  ], { requires: G.cooperates }),
  q("castell", "The cottage", "castell_sent", "The man at the cottage told Claire 'Miriam sent me.'", [
    "I didn't send anyone. Nobody. The man on the phone said someone would come Friday. Friday, not Wednesday night.",
    "He used my name to open her door.",
  ], { requires: { all: [G.cooperates, ev("E029")] } }),
  q("castell", "The pages", "castell_register", "Claire's register marks every page 'to M.C.'", [
    "Every one. Each time she handed me an envelope I sent it the way the note said, the same day or the next.",
  ], { requires: ev("E038") }),

  // =====================================================================
  // Tyler Prentiss
  // =====================================================================
  q("prentiss", "About him", "prentiss_who", "Who are you?", [
    "Tyler Prentiss. Software engineer. I work from home most days.",
  ]),
  q("prentiss", "Claire", "prentiss_split", "What happened between you and Claire?", [
    "We split up in March. I moved out of 3C. It was nobody's fault.",
  ]),
  q("prentiss", "Claire", "prentiss_last_contact", "When did you last see Claire?", [
    "In the summer. We're friendly. We're not in touch much.",
  ], { requires: G.tylerHiding, reveals: "Tyler Prentiss says he last saw Claire in the summer." }),
  q("prentiss", "Claire", "prentiss_where", "Do you know where Claire is?", [
    "No idea. Honestly.",
  ], { variants: [{ requires: G.tylerOpen, reply: ["No. That part's true. Her phone's been off since Wednesday morning, and my last three texts never delivered."] }] }),
  q("prentiss", "Claire", "prentiss_admit", "You talked to Claire for 22 minutes on Monday night.", [
    "Yeah. Okay. She came over on Thursday, the sixth, with a USB drive. Monday night she called me frightened. Tuesday at 12:30 she brought me a sealed envelope.",
    "I'm sorry. I should have said that the first time.",
  ], {
    requires: G.tylerOpen,
    reveals: "Tyler admits Claire came to him on Thursday, Dec 6, with a drive; called him frightened on Monday night; and left a sealed envelope with him on Tuesday at 12:30.",
    effects: [tl("Thu 12/6", "Claire brings Tyler Prentiss a USB drive to encrypt.", "Tyler Prentiss"), tl("12:30 PM (Tue 12/11)", "Claire leaves a sealed envelope with Tyler Prentiss.", "Tyler Prentiss")],
  }),
  q("prentiss", "The envelope", "prentiss_envelope", "Can I see the envelope she left with you?", [
    "'Only if I go quiet for two days.' It's been two days. Open it with me.",
  ], { requires: G.tylerOpen, reveals: "Tyler handed over Claire's sealed envelope: her inventory of what exists, and where.", effects: [{ giveEvidence: "E011" }], volunteer: { after: 1 } }),
  q("prentiss", "Claire", "prentiss_texts", "Can I see your messages with her?", [
    "Photograph the thread. All of it. The last three never delivered.",
  ], { requires: G.tylerOpen, effects: [{ giveEvidence: "E013" }] }),
  q("prentiss", "The drive", "prentiss_drive", "How did you encrypt her drive?", [
    "A split key. One half is a keyfile on my machine. The other half is her passphrase. Neither one opens it alone.",
    "She wanted it so nobody could make her open it, and nobody could make me.",
  ], { requires: G.tylerOpen }),
  q("prentiss", "About him", "prentiss_lied", "Why did you lie to me?", [
    "I helped her lock up confidential corporate files. I'm waiting on a security clearance for a defense contractor job.",
    "That's the whole reason. It's not a good one.",
  ], { requires: G.tylerOpen }),
  q("prentiss", "Claire", "prentiss_monday", "What did Claire say on Monday night?", [
    "That she'd told M. she was done, and M. wanted her to wait for somebody. She trusted M. She didn't trust whoever M. listens to.",
    "Then she texted, 'If I disappear it isn't because I wanted to.'",
  ], { requires: G.tylerOpen }),
  q("prentiss", "The drive", "prentiss_key", "Will you give us your half of the key?", [
    "Yes. I'll copy the keyfile for your people myself, and I'll sit with them while they use it.",
  ], { requires: G.tylerKey, reveals: "Tyler agreed to give his half of the drive's key to Blackwood.", effects: EFFECTS.tylerKey }),

  // =====================================================================
  // Gwen Patel
  // =====================================================================
  q("patel", "About her", "patel_who", "Who are you?", [
    "Gwen Patel, from 3D. I'm an ER nurse at Inova Alexandria. Nights.",
  ]),
  q("patel", "Claire", "patel_claire", "What's Claire like?", [
    "Quiet. Kind. Always reading. She signs for my packages and I water her plants. Three years.",
  ]),
  q("patel", "Wednesday", "patel_wednesday", "When did you last see Claire?", [
    "Wednesday, a little before eight. I'd just got home. She was in the hall locking her door, the small black bag on her shoulder, her green coat.",
    "I asked if she was going somewhere nice. She said, 'Just a few days away,' and smiled. It wasn't her real smile. She went down toward the garage on her own.",
  ], { reveals: "Gwen Patel saw Claire leave alone a little before 8 AM on Wednesday with a small black bag: 'Just a few days away.'", effects: [tl("~7:55 AM (Wed 12/12)", "Gwen Patel sees Claire leave alone with a small travel bag.", "Gwen Patel")] }),
  q("patel", "Wednesday", "patel_statement", "Did you give the police a statement?", [
    "Detective Harris took it this afternoon. I asked for a copy for you. Here.",
  ], { reveals: "Gwen Patel handed over her statement to APD.", effects: [{ giveEvidence: "E007" }], volunteer: { after: 1 } }),
  q("patel", "Visitors", "patel_smoke", "Has anyone strange been in the building?", [
    "Monday afternoon, about two. A man in our hall I didn't know. White, late thirties, shaved head, navy work jacket, a clipboard.",
    "He said he was from the management company, checking smoke detectors. Nobody checked mine.",
  ], { reveals: "On Monday at about 2 PM a stranger claiming to check smoke detectors was in the third-floor hall: white, late thirties, shaved head, navy work jacket, clipboard." }),
  q("patel", "Wednesday", "patel_noises", "Did you hear anything from Claire's apartment?", [
    "Wednesday, around noon. Drawers and doors, on and off, for about half an hour. I thought Claire had come back for something.",
    "I didn't get up. I wish I had.",
  ]),
  q("patel", "Claire", "patel_tyler", "Does Claire have anyone close to her?", [
    "Her ex, Tyler. He lives in Clarendon. He still came by in the fall. I think they were still friends.",
  ]),
  q("patel", "Saturday", "patel_screwdriver", "Tell me about the screwdriver Claire borrowed.", [
    "Saturday afternoon. My little one with the bits in the handle. She said the bottom board of her bookcase was loose, and brought it back in ten minutes.",
    "She's never fixed anything in her life.",
  ], { requires: { flag: "screwdriver_known" } }),

  // =====================================================================
  // Alan Corbett
  // =====================================================================
  q("corbett", "About him", "corbett_who", "Who are you, Mr. Corbett?", [
    "Alan Corbett. Until September I was Meridian's Senior Compliance Officer. Nine years.",
  ]),
  q("corbett", "The archive", "corbett_records", "How does Meridian's Records Center work?", [
    "Let me write it down for you, and for the detective. If I'm going to say it, I'd rather it be on paper with my name under it.",
    "Collection, box, item. That's the address of every page. Read the rest.",
  ], { reveals: "Alan Corbett wrote out how the Records Center works.", effects: [{ giveEvidence: "E014" }], volunteer: { after: 2 } }),
  q("corbett", "The archive", "corbett_footer", "What is the line printed along the bottom of the copies?", [
    "The footer. The copier prints it on everything: COPY, MAG-RM, then collection, box and item. It won't run without a badge, and it logs every job to that badge.",
    "A page with that footer is a copy whose original is still in the building.",
  ]),
  q("corbett", "The archive", "corbett_eo", "What does EO-01 mean?", [
    "Executive Office items: cover sheets, routing slips, approvals. Under Policy 7 their file copies carry a reference, EO-01, instead of a signature.",
    "A reference, not a person. I asked once who signs as EO-01. I was told it was above my pay grade. Eight weeks later I didn't have one.",
  ], { reveals: "Corbett: EO-01 is the Executive Office's authorizing reference; he asked once who signs as EO-01 and was told it was 'above my pay grade.'" }),
  q("corbett", "Claire", "corbett_claire", "How do you know Claire Donovan?", [
    "She was my compliance liaison for three years, and a friend. The most careful records analyst I've worked with.",
    "If she took a page out of that building, she knew exactly what it was.",
  ]),
  q("corbett", "The archive", "corbett_badge", "What could Claire's badge open?", [
    "R3. Restricted collections, finance, client services, logistics, but only with the Records Administrator's signed approval in the stack register at the front desk.",
  ]),
  q("corbett", "The archive", "corbett_sayer", "Who is Benjamin Sayer?", [
    "The Records Administrator. Nothing goes into a restricted stack without his signature in the register.",
  ]),
  q("corbett", "The archive", "corbett_lang", "Who keeps the checkout records?", [
    "Gerald Lang. His company built the barcode checkout system in 2014. He keeps the nightly backups at his storage business in Lorton.",
  ]),
  q("corbett", "About him", "corbett_left", "Why did you leave Meridian?", [
    "My position was eliminated on September 28. There's a severance agreement. I'll leave it there.",
  ], { requires: { not: ev("E022") } }),
  q("corbett", "The pages", "corbett_sequence", "Can you read the footers on Claire's duplicates?", [
    "Give me a minute. I kept my own compliance review index, in case they ever said I didn't raise it.",
    "In each box, the page that went out is the one that names the division man. The page filed directly behind it is an Executive Office item every time, and none of them left. Here. I've written it out.",
  ], { requires: G.duplicates, reveals: "Corbett reconstructed the three boxes: each released page named the division head; the Executive Office item filed behind each was never released.", effects: [{ giveEvidence: "E022" }] }),
  q("corbett", "The memo", "corbett_memo", "What concerns did you raise before you left?", [
    "On July 30 I sent the Executive Office a memo. Three programs: Holt's Pittsburgh affiliate arrangement, Rourke's intelligence practice, Kane's logistics in Baltimore. I recommended an independent review.",
    "It came back stamped 'No further action by Compliance.' Eight weeks later I was gone. Here's my copy.",
  ], { requires: ev("E022"), reveals: "Corbett's July 30 memo to the Executive Office named three programs: Holt, Rourke and Kane.", effects: [{ giveEvidence: "E023" }, tl("Mon 7/30", "Alan Corbett's memo to Meridian's Executive Office names three programs: Holt, Rourke, Kane.", "Alan Corbett")] }),
  q("corbett", "The memo", "corbett_order", "The arrests came in the order of your memo.", [
    "Holt, Rourke, Kane. That's the order I wrote them in.",
    "I've been trying not to think about that.",
  ], { requires: ev("E023") }),
  q("corbett", "The archive", "corbett_secrm", "Who is SEC-RM on the checkout log?", [
    "Meridian Security's records account. Shared. Somebody wanted to know who'd pulled those boxes, and they found out.",
  ], { requires: ev("E017") }),

  // =====================================================================
  // Nina Halvorsen
  // =====================================================================
  q("halvorsen", "About her", "halvorsen_who", "Who are you?", [
    "Nina Halvorsen. I manage the Wren. I'm so sorry about this morning.",
  ]),
  q("halvorsen", "Claire", "halvorsen_claire", "Do you know Claire Donovan?", [
    "She's a regular. Oat milk cortado, the back booth, always a book. Two or three mornings a week.",
  ]),
  q("halvorsen", "Claire", "halvorsen_booking", "When did Claire book the booth?", [
    "Tuesday night, by voicemail, 9:31. 'A meeting, might run long.' I wrote it in the book.",
  ]),
  q("halvorsen", "This morning", "halvorsen_morning", "What happened when Claire came in this morning?", [
    "At 8:14, with a little bag on her shoulder. She asked me for an envelope and wrote at the counter, standing up. Sealed it.",
    "She said, 'If someone asks for the Donovan booth, give them this.' Then she left. Seven, eight minutes, maybe.",
  ], { reveals: "Claire came into the Wren at 8:14 AM on Wednesday, wrote and sealed a note, and asked Nina to give it to 'whoever asks for the Donovan booth.'", effects: [tl("8:14 AM (Wed 12/12)", "Claire comes into the Wren and leaves a sealed note.", "Nina Halvorsen")] }),
  q("halvorsen", "This morning", "halvorsen_seemed", "How did Claire seem?", [
    "Shaky. Her hand was shaking while she wrote. She's usually the calmest person in here.",
  ]),
  q("halvorsen", "This morning", "halvorsen_suv", "Was anyone waiting outside?", [
    "A gray SUV, a big one, parked at the hydrant across the street with the engine running. A man at the wheel. He never got out.",
    "It pulled out right after she left, the same way she went. Delivery trucks use that hydrant. That's the only reason I looked.",
  ], { reveals: "A gray SUV waited at the hydrant across King Street with its engine running and pulled out right after Claire left." }),
  q("halvorsen", "This morning", "halvorsen_camera", "Do you have a camera on the front?", [
    "Over the door. It catches the sidewalk and the street. I printed the stills for you. Here.",
  ], { reveals: "Nina Halvorsen printed the Wren's exterior camera stills.", effects: [{ giveEvidence: "E004" }], volunteer: { after: 1 } }),
  q("halvorsen", "This morning", "halvorsen_missed", "Why didn't anyone give me the note at ten?", [
    "I was in the back with a delivery from about quarter to ten. The barista didn't know about it.",
    "I didn't see you at the booth until 10:50. I'm so sorry.",
  ]),
  q("halvorsen", "This morning", "halvorsen_tahoe", "The SUV was a gray Tahoe registered to Tate Protective Services.", [
    "Gray, big, a little white 3 in the back window. That's the one. I'd know it again.",
  ], { requires: ev("E030") }),

  // =====================================================================
  // Gerald Lang
  // =====================================================================
  q("lang", "About him", "lang_who", "Who are you?", [
    "Gerald Lang. Lang Records Systems, and this place, Dominion Secure Records.",
  ]),
  q("lang", "Meridian", "lang_meridian", "Is Meridian a client of yours?", [
    "Meridian is most of my business. So you'll understand if I'm careful.",
  ]),
  q("lang", "The system", "lang_system", "How does the Records Center's checkout system work?", [
    "I built it in 2014. Every box out and in on a barcode, and every copier job logged to a badge. The nightly backup comes here.",
  ]),
  q("lang", "The carton", "lang_carton", "Can I see Claire Donovan's carton?", [
    "Private cartons go to the depositor in person, or on a court order. Not to an investigator. Not to anybody.",
  ], { variants: [{ requires: { flag: "carton_warrant" }, reply: ["The order's served. I'll bring it out to the table. Sealed by the depositor; I'll cut the tape in front of you."] }] }),
  q("lang", "The carton", "lang_claire", "Do you remember Claire Donovan?", [
    "I don't talk about private customers. That's the whole business.",
  ], { variants: [{ requires: ev("E012"), reply: ["That's my signature on the receipt. Saturday morning, 10:12. One carton, one drive. She sealed it herself and asked me to write 'in person' twice."] }] }),
  q("lang", "The system", "lang_checkout", "Can you print badge 2214's history from the backup?", [
    "With the order served and the register in front of me, yes. Box history and copier jobs, October through Friday.",
    "And the system audit, while I'm at it. Somebody else ran reports on her.",
  ], { requires: G.langCheckout, reveals: "Gerald Lang printed the checkout and copier history for badge 2214 from the backup.", effects: [{ giveEvidence: "E017" }] }),
  q("lang", "The system", "lang_secrm", "Who is SEC-RM?", [
    "I don't know who SEC-RM is this month. It's a shared account for Meridian Security.",
  ], { requires: ev("E017") }),
  q("lang", "The carton", "lang_drive", "What about the drive in the carton?", [
    "Sealed in a static bag. Encrypted, I'd bet. Not my business to try it.",
  ], { requires: { flag: "carton_warrant" } }),

  // =====================================================================
  // Det. Ross Harris: no limit
  // =====================================================================
  q("harris", "The case", "harris_case", "Where does the case stand?", [
    "An adult who packed a bag, quit her job and switched off her phone is allowed to leave. I've got a report and a welfare check. That's what I've got.",
  ], {
    repeatable: true,
    variants: [
      { requires: ev("E006"), reply: ["Somebody's been in her apartment on a copy of her fob. That isn't leaving. I'm taking it seriously."] },
      { requires: { event: "RE07" }, reply: ["That Tahoe never went home. I'm working it as an abduction now."] },
      { requires: rescued, reply: ["She's safe. Tate's in a room downstairs. Now I want the why."] },
    ],
  }),
  q("harris", "Reports", "harris_welfare", "Can I see the welfare check?", [
    "Ofc. Ridley went in at 1:20 with the manager. No forced entry, a bag and a toothbrush gone, and somebody looked hard for something. Here are the photographs.",
  ], { reveals: "Det. Harris handed over the welfare check photographs of Apt 3C.", effects: [{ giveEvidence: "E005" }], volunteer: { after: 1 } }),
  q("harris", "Reports", "harris_phone", "Can you get Claire's phone records?", [
    "You've seen the apartment. That's enough for an exigent request. Here's what the carrier sent back.",
    "Since 8:52 it's straight to voicemail.",
  ], { requires: { visited: "claire_apt" }, reveals: "Det. Harris handed over Claire's phone record.", effects: [{ giveEvidence: "E008" }] }),
  q("harris", "The SUV", "harris_plate", "Can you run the partial plate from the café camera?", [
    "UXR-4, gray full-size SUV, a fleet decal 3. There aren't many of those. It's a 2016 Tahoe registered to Tate Protective Services LLC, 2900 Clarendon Boulevard, Arlington.",
    "A security company. I'd like to know what it was doing at a hydrant on King Street.",
  ], { requires: ev("E004"), reveals: "The SUV from the café camera is a gray Tahoe registered to Tate Protective Services LLC, Arlington.", effects: EFFECTS.tateKnown }),
  q("harris", "The carton", "harris_carton", "Can you get a court order for Claire's carton at Dominion?", [
    "On that receipt, yes. Missing person, possible indication of whereabouts. A judge will sign that this afternoon.",
    "Lang will have it within the hour. Go.",
  ], { requires: ev("E012"), reveals: "Det. Harris obtained a court order for Claire's carton, P-0388, at Dominion Secure Records.", effects: EFFECTS.carton }),
  q("harris", "The cottage", "harris_lock", "Can you get the cottage's lock records?", [
    "Fauquier pulled it from the rental company. Read it top to bottom. She let herself in. Somebody else locked it from outside.",
  ], { requires: { visited: "safe_house" }, reveals: "Det. Harris handed over the cottage's smart lock log.", effects: [{ giveEvidence: "E028" }] }),
  q("harris", "The SUV", "harris_vehicle", "Can you get plate-reader hits on the Tahoe?", [
    "Already did. Registration and the regional plate readers, Wednesday into Thursday.",
    "It followed her out there in the morning, came back to town for that lobby entry, and went back out at night. Here.",
  ], { requires: { all: [ev("E004"), { visited: "safe_house" }] }, reveals: "Det. Harris handed over the Tahoe's vehicle record and plate-reader hits.", effects: [{ giveEvidence: "E030" }, ...EFFECTS.tateKnown] }),
  q("harris", "Saddle Ridge", "harris_alarm", "Can you get the alarm records for Saddle Ridge Lane?", [
    "Shenandoah Alarm, and the doorbell camera across the road. I had both by eleven.",
    "Armed all day with someone inside, and the basement isn't on the motion zone.",
  ], { requires: ev("E033"), reveals: "Det. Harris obtained the Saddle Ridge Lane alarm history and the neighbor's doorbell camera clips.", effects: [{ giveEvidence: "E034" }] }),
  q("harris", "Claire", "harris_statement", "Can I see Claire's statement?", [
    "I took it at 11:30, after the hospital. She's as precise as you'd think. Here.",
  ], { requires: rescued, reveals: "Det. Harris handed over Claire's statement.", effects: [{ giveEvidence: "E036" }] }),
  q("harris", "The apartment", "harris_fob", "Can a building fob be copied?", [
    "Those clone in a second with a forty-dollar reader. Stand behind somebody in a line and you've got it.",
  ], { requires: ev("E006") }),
  q("harris", "Tate", "harris_tate", "What do you know about Brandon Tate?", [
    "Licensed security business, Clarendon Boulevard. Former Army MP. Nothing on him with us.",
  ], { requires: G.tateKnown }),
  q("harris", "Tate", "harris_warrant", "Can you get a warrant for Tate's office?", [
    "Not on a car at a hydrant. Show me that car where she went.",
  ], { requires: G.tateKnown, variants: [{ requires: { flag: "tate_warrant" }, reply: ["Signed. Office and vehicles. He's not answering and he's not there."] }] }),
  q("harris", "Reports", "harris_numbers", "Who do the numbers Claire called belong to?", [
    "(202) 555-0143 is Miriam Castell, Clearwater Accountability Initiative, in D.C. (571) 555-0162 is Tyler Prentiss, Arlington. The other one's the Wren.",
  ], { requires: ev("E008") }),
  q("harris", "Saddle Ridge", "harris_entry", "Can you get into the house on Saddle Ridge Lane?", [
    "Call me and tell me where she is. When I've got the lease and the alarm in hand, I've got a judge and Prince William's tactical team.",
  ], { requires: ev("E033") }),
  q("harris", "Claire", "harris_claire", "How is Claire?", [
    "Alive. Bruised wrists, dehydrated, furious. The hospital in Manassas cleared her and she's here in our family room.",
  ], { requires: rescued }),

  // =====================================================================
  // Det. Nadia Collins: by phone, no limit
  // =====================================================================
  q("collins", "About her", "collins_who", "What's your part in this?", [
    "MPD liaison to the federal task force on the Rourke case. Ellery, if you remember. You do.",
  ]),
  q("collins", "Rourke", "collins_rourke", "Where is Julian Rourke being held?", [
    "Potomac Regional Detention Center, in Alexandria. Federal pretrial, Marshals Service contract. Lyons and Hurst are held elsewhere.",
  ]),
  q("collins", "Rourke", "collins_hearing", "What came out at Rourke's detention hearing?", [
    "The government's proffer included a page of the client list that came to your office by courier. Footer and all.",
    "His lawyer had it in his hands on November 26.",
  ], { reveals: "At Rourke's detention hearing on November 26 the government's proffer included the client list page, copier footer and all.", effects: [tl("Mon 11/26", "Rourke's detention hearing: the client list page, with its footer, is in the government's proffer.", "Det. Collins")] }),
  q("collins", "Rourke", "collins_interview", "Can I interview Julian Rourke?", [
    "Not on curiosity. Bring me something that ties him to this and Quinlan will set up a video interview. His lawyer will be in the room.",
  ], { variants: [{ requires: ev("E032"), reply: ["Quinlan's set it up. Recorded video link from the detention center, Fenwick in the room. Call when you're ready."] }] }),
  q("collins", "The note", "collins_note", "Whose handwriting is on the note from Tate's desk?", [
    "Julian Rourke's. I spent a month reading it out of his safe.",
  ], { requires: { flag: "note_found" } }),
  q("collins", "The note", "collins_whitlock", "Who is Dean Whitlock?", [
    "Not on Fenwick's staff. Fenwick's office says he was 'retained separately by the family.' Rourke has no family on record.",
  ], { requires: ev("E032") }),
  q("collins", "Rourke", "collins_lyons", "Garrett Lyons's number is in Tate's prepaid phone.", [
    "Lyons's cell came off him on November 21. That call on the twentieth was the day before.",
  ], { requires: ev("E031") }),
  q("collins", "About her", "collins_quinlan", "What is Agent Quinlan doing?", [
    "She has the federal side. Anything inside that detention center, the logs, the visits, goes through her.",
  ]),

  // =====================================================================
  // Bennett: records by phone; no limit
  // =====================================================================
  q("bennett", "The case", "bennett_case", "What do you make of it?", [
    "Forty years of this. A woman who books a booth and leaves a note didn't plan to vanish.",
    "Find out who told her not to come.",
  ], {
    repeatable: true,
    variants: [
      { requires: { flag: "courier_known" }, reply: ["Same footer, same courier account, two of three to our door. Find out who pays for 20417."] },
      { requires: rescued, reply: ["She's safe. Now read what she kept. That's the part nobody wanted us to see."] },
    ],
  }),
  q("bennett", "Records", "bennett_claire", "Run Claire Donovan for me.", [
    "No record. Alexandria address, a blue 2014 Subaru. She's exactly as quiet on paper as she sounded in that email.",
  ]),
  q("bennett", "Records", "bennett_meridian", "What can you find on Meridian Advisory Group?", [
    "A private consulting firm. Private companies don't file much worth reading. You know more about it than the records do by now.",
  ]),
  q("bennett", "Records", "bennett_clearwater", "What can you find on Clearwater?", [
    "Washington nonprofit, whistleblower support. Its founding patron is the Lockhart Foundation. It says so on its own website.",
  ], { requires: G.castellKnown }),
  q("bennett", "Records", "bennett_castell", "Run Miriam Castell for me.", [
    "No record. She testifies on the Hill and files complaints with inspectors general. Respectable, as these things go.",
  ], { requires: G.castellKnown }),
  q("bennett", "Records", "bennett_tate", "Run Brandon Tate for me.", [
    "Tate Protective Services LLC, licensed security business, Arlington. Tate's a former Army MP. No record.",
  ], { requires: G.tateKnown }),
  q("bennett", "Records", "bennett_packets", "What did you find in our own files?", [
    "The two courier packets from November 20 and December 4, and Dr. Lockhart's invoice copy from the Keller case. Same gray footer on all three.",
    "Capital Courier, account 20417, on every waybill.",
  ], { requires: { flag: "courier_known" } }),
  q("bennett", "Records", "bennett_whitlock", "Run Dean Whitlock for me.", [
    "No investigator's license I can find in Virginia, Maryland or the District. A defense investigator nobody licensed.",
  ], { requires: { any: [ev("E031"), ev("E032")] } }),
  q("bennett", "Records", "bennett_lockhart", "What do the records say about the Lockhart Foundation?", [
    "The same foundation that sent us the Keller invoice. Private, Fifth Avenue, and Clearwater's founding patron. That's what's on paper.",
  ], { requires: G.lockhartKnown }),
  q("bennett", "The drive", "bennett_drive", "Can you get Claire's drive opened?", [
    "Her passphrase, his keyfile, the drive out of the carton. That's everything. Send it to me and I'll have it open by tonight.",
  ], { requires: G.bennettDrive, reveals: "Bennett sent Claire's drive off to be decrypted.", effects: [{ startLab: "decrypt" }] }),
  q("bennett", "The case", "bennett_again", "Anything new on your side?", ["Nothing new. I'm waiting on you."], {
    repeatable: true,
    variants: [
      { requires: { labStarted: "decrypt" }, reply: ["The drive's with our people. You'll have the index on your desk when it opens."] },
      { requires: { labReady: "decrypt" }, reply: ["The drive's open. It's on your desk. Read the last folder first."] },
    ],
  }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  // Claire
  r("donovan", "E003", ["I pressed so hard I nearly went through the page. I started a second line and couldn't finish it."]),
  r("donovan", "E038", ["My register. Every page, every date, where it went. A records person keeps a copy of anything that leaves."]),
  r("donovan", "E025", ["'Trust the source. I do.' I did too. Because she did."]),
  r("donovan", "E022", ["That's Alan's hand. The pages behind the pages. He saw it in one sitting."]),
  r("donovan", "E039", ["I wrote that the Thursday night before I quit. I kept asking the same question at the bottom."]),
  r("donovan", "E040", ["Same reference. Two divisions. Above both men."]),
  r("donovan", "E041", ["Filed behind the client list. Dated the day after Holt was arrested."]),
  r("donovan", "E035", ["I counted the days on the door frame. It's a stupid thing to be proud of."]),
  r("donovan", "E028", ["9:02. That's when I opened it. Because he said her name."]),
  r("donovan", "E024", ["She wrote on the back of that card. 'Call me any hour.' I did."]),
  // Tate
  r("tate", "E004", ["A vehicle on a public street. I don't discuss client details."], { requires: { not: rescued } }),
  r("tate", "E030", ["My vehicle was working for a client. Client confidentiality. That's all you get."], { requires: { not: rescued } }),
  r("tate", "E029", ["She was frightened. Frightened people break things."], { requires: { all: [{ flag: "tate_story2" }, { not: rescued }] } }),
  r("tate", "E029", ["I don't know what you think that has to do with me."], { requires: { all: [{ not: { flag: "tate_story2" } }, { not: rescued }] } }),
  r("tate", "E035", ["She wanted to go. I couldn't let her, for her own safety."], { reveals: "Shown the basement room, Tate says: 'She wanted to go. I couldn't let her, for her own safety.'" }),
  r("tate", "E032", ["I don't know whose handwriting that is."]),
  r("tate", "E031", ["No comment."]),
  r("tate", "E033", ["No comment."]),
  r("tate", "E034", ["No comment."]),
  r("tate", "E036", ["My lawyer says no comment. So, no comment."]),
  r("tate", "E028", ["Somebody opened a door. People do."], { requires: { not: rescued } }),
  // Rourke
  r("rourke", "E032", ["Fenwick reads it before Rourke does. \"My client won't be answering questions about this document.\"", "Rourke doesn't look at it again."]),
  r("rourke", "E031", ["A prepaid telephone. I'm told they're popular. I wouldn't know."]),
  r("rourke", "E020", ["My client list, with the names masked. Somebody has manners. Somebody else didn't."]),
  r("rourke", "E017", ["Box histories. Meridian kept records of its records. I'm not surprised anyone looked."]),
  // Lockhart
  r("lockhart", "E018", ["Clearwater's account. So Miriam tells me. I'd rather she had told me at the time."]),
  r("lockhart", "E024", ["Our breakfast card. Miriam does those every year. I'm afraid I meet a great many people at them."]),
  r("lockhart", "E042", ["I'm glad she remembers it kindly. I do think the people who keep the records matter."]),
  r("lockhart", "E039", ["I'm not able to judge a company's internal memoranda, I'm afraid. I'm glad she's safe."]),
  r("lockhart", "E040", ["I'm afraid I can't help you with Meridian's internal shorthand."]),
  r("lockhart", "E041", ["I'm afraid I can't help you with Meridian's internal shorthand."]),
  r("lockhart", "E023", ["A compliance memorandum. I'm not the person to interpret it, I'm afraid."]),
  // Castell
  r("castell", "E004", ["That car. That car was outside while she was writing to you?"], { requires: G.castellGuarded }),
  r("castell", "E005", ["Somebody took her apartment apart. Oh, God. Nobody was supposed to know where she lived."], { requires: G.castellGuarded }),
  r("castell", "E006", ["Her own fob, twice, while her car was gone. Somebody has her key."], { requires: G.castellGuarded }),
  r("castell", "E007", ["A man in her hallway on Monday, pretending to check smoke detectors?"], { requires: G.castellGuarded }),
  r("castell", "E029", ["Her coat. In December. She'd never have left without her coat.", "I sent her there. I sent her there."], { requires: G.cooperates }),
  r("castell", "E024", ["My handwriting. 'Call me any hour.' I meant it."]),
  r("castell", "E038", ["'To M.C.' Every one. She was more careful than I was."]),
  r("castell", "E025", ["Read Wednesday. 'You're doing the right thing.' I wrote that."]),
  r("castell", "E027", ["I booked that at 6:32 in the morning, from my kitchen table."]),
  // Prentiss
  r("prentiss", "E008", ["Twenty-two minutes. Yeah. That was me.", "Okay. I'll tell you."]),
  r("prentiss", "E011", ["'Opens with T.'s half and mine.' That's me. That's my half."]),
  r("prentiss", "E013", ["'Claire call me.' It never delivered. I sent it from my desk and watched it not go."]),
  r("prentiss", "E006", ["3C-2 was mine. They turned it off when I left. That's not me."]),
  r("prentiss", "E012", ["'Mine's in my head.' She means the passphrase. She never wrote it down anywhere, I promise you."]),
  // Patel
  r("patel", "E006", ["Monday at 2:13. That's him. That's the smoke detector man.", "He had her fob?"]),
  r("patel", "E004", ["That's her green coat. That's the bag."]),
  r("patel", "E005", ["That's what I heard. Every drawer."]),
  // Corbett
  r("corbett", "E019", ["Fourteen, oh four one two, one one seven. Finance. The Pittsburgh affiliate file. I know that box.", "Sit down. Let me get my index."]),
  r("corbett", "E020", ["Twenty-two, oh one eight seven. Client Services. The superseded schedules.", "Sit down. Let me get my index."]),
  r("corbett", "E021", ["Thirty-one, oh oh five six. The Baltimore contractor file.", "Sit down. Let me get my index."]),
  r("corbett", "E017", ["SEC-RM ran a box history on the client list box. Somebody wanted a name."]),
  r("corbett", "E016", ["Retention audit. That's a real purpose; we used it all the time. And that's Benjamin's approval."]),
  r("corbett", "E015", ["RC-3. I helped write the copy rules in that binder."]),
  r("corbett", "E041", ["'A.' On an Executive Office slip. I never saw one of those that wasn't filed under the reference."]),
  r("corbett", "E040", ["EO-01. Two divisions. In nine years Compliance never saw past that reference."]),
  // Halvorsen
  r("halvorsen", "E003", ["That's the envelope she asked me for. I didn't read it, I swear."]),
  r("halvorsen", "E002", ["My booth book. 'Always reads.' I wrote that so the new staff would leave her alone."]),
  r("halvorsen", "E030", ["The 3 in the window. That's it."]),
  // Lang
  r("lang", "E012", ["My signature. Release to the depositor in person, or on court order. I meant both halves of that."]),
  r("lang", "E016", ["The stack register. If she was in those boxes, the backup has every minute of it."]),
  r("lang", "E019", ["That footer comes off RM-C2. The backup will show the job."]),
  r("lang", "E020", ["That footer comes off RM-C2. The backup will show the job."]),
  r("lang", "E021", ["That footer comes off RM-C2. The backup will show the job."]),
  r("lang", "E017", ["Nobody ran a report on fourteen, oh four one two. Just the other two boxes, and her badge."]),
  // Harris
  r("harris", "E003", ["'You're looking at the wrong people.' Meaning she knew who the right ones were."]),
  r("harris", "E004", ["A partial plate and a fleet decal. That I can run."]),
  r("harris", "E006", ["Two lobby entries while her car was out. Somebody has a copy of her fob."]),
  r("harris", "E007", ["She left on her own feet. Somebody went in behind her."]),
  r("harris", "E012", ["A storage receipt. Missing person, possible indication of whereabouts. That's a court order."]),
  r("harris", "E027", ["A cottage in Fauquier, and a door code. I'll have the sheriff's office meet you."]),
  r("harris", "E029", ["Nobody walks out of a house in December without a coat."]),
  r("harris", "E033", ["Staff lodging, first and last in cash. Get me the alarm and we'll know if anyone's home."]),
  r("harris", "E031", ["Lyons's old cell, and a W. I'm running W."]),
  // Collins
  r("collins", "E032", ["That's Rourke's hand. Block capitals, the slanting initial. I'd know it anywhere."]),
  r("collins", "E020", ["That's the page from the proffer. His lawyer had it in his hands on November 26."]),
  r("collins", "E031", ["Lyons's old number. Rourke's people stay Rourke's people."]),
  // Bennett
  r("bennett", "E001", ["Came into the general inbox at 9:14. 'Someone has been choosing what you see.' I didn't like that sentence then either."]),
  r("bennett", "E015", ["That gray line along the bottom of the copies. Give me an hour with our files."]),
  r("bennett", "E018", ["Account 20417. Clearwater. Two of the three to our door."]),
  r("bennett", "E038", ["She kept a register. God bless records people."]),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "c_prentiss_contact",
    characterId: "prentiss",
    title: "Tyler Prentiss: last saw her in the summer",
    text: "Tyler Prentiss says he last saw Claire Donovan in the summer. Her phone record shows a 22-minute call to his number at 10:31 PM on Monday, December 10, and ten texts with him between December 10 and 12.",
    when: { all: [{ asked: "prentiss_last_contact" }, ev("E008")] },
  },
  {
    id: "c_tate_never",
    characterId: "tate",
    title: "Brandon Tate: never heard of her",
    text: "Brandon Tate said he had never heard of Claire Donovan. He later telephoned to say she had contacted his firm on Wednesday evening and that he had moved her somewhere safe.",
    when: { all: [{ asked: "tate_claire" }, { flag: "tate_story2" }] },
  },
  {
    id: "c_tate_willing",
    characterId: "tate",
    title: "Brandon Tate: she asked to be moved",
    text: "Brandon Tate says Claire Donovan asked to be moved and stays where he took her by her own choice. The physical evidence shows a struggle and restraint with heavy-duty zip ties.",
    when: { all: [{ flag: "tate_story2" }, { any: [ev("E029"), ev("E035")] }] },
  },
  {
    id: "c_tate_meridian",
    characterId: "tate",
    title: "Brandon Tate: no Meridian work since",
    text: "Brandon Tate says his firm did some work for Meridian a couple of years ago and nothing since. His invoice book bills Meridian Advisory Group, Client Services, for 112 hours of surveillance support in October 2018, approved by G. Lyons.",
    when: { all: [{ asked: "tate_meridian" }, ev("E031")] },
  },
  {
    id: "c_castell_safe",
    characterId: "castell",
    title: "Miriam Castell: somewhere safe",
    text: "Miriam Castell said Claire Donovan was somewhere safe, by her own choice. At the cottage Castell booked, the kitchen shows a struggle and a cut zip tie, and Claire's coat, keys and car were left behind.",
    when: { all: [{ asked: "castell_whereabouts" }, ev("E029")] },
  },
  {
    id: "c_rourke_contact",
    characterId: "rourke",
    title: "Julian Rourke: a vendor",
    text: "Julian Rourke says he knows Brandon Tate only as a vendor. A note in Rourke's handwriting, found in Tate's desk drawer, gives instructions to find Claire Donovan, take her papers and 'use the house.'",
    when: { all: [{ asked: "rourke_contact" }, ev("E032")] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  claire_how: "how are you are you all right okay hurt injured feeling",
  claire_job: "your job what did you do at meridian work records analyst position role employment",
  claire_records: "how do the records work records center system footer copier boxes collections policy 7 explain",
  claire_releases: "what did you copy which pages documents releases leaked leak copies copied dates when duplicates invoice client list kane agreement",
  claire_castell: "miriam castell approach recruit how did it start clearwater asked you coffee dupont september first contact contacted reached out",
  claire_lockhart: "evelyn lockhart dr lockhart the patron donor breakfast meet met know",
  claire_eo: "executive office items cover sheets routing slip kept why keep what nobody asked for martin keller",
  claire_memo: "alan corbett memo july order arrests pattern holt rourke kane three names",
  claire_resign: "why resign quit leave meridian resignation letter badge",
  claire_wednesday: "wednesday morning what happened why go into hiding why leave home cottage miriam called hide",
  claire_note: "the note cafe wren why leave a note wrong people warning",
  claire_door: "open the door that night 9:02 knock miriam sent me let him in",
  claire_kitchen: "tried to leave escape run back door kitchen zip ties restrained tied caught",
  claire_questions: "what did he want what did he ask questioned interrogate who asked you to copy pittsburgh",
  claire_basement: "where did he take you moved bristow basement room sleep mask held lorton",
  claire_man: "did you know the man recognize him who was he describe name",
  claire_sent: "who sent him who was he working for behind him orders",
  claire_source: "who was the source miriam's source senior person who chose who was behind the requests",
  claire_tyler: "tyler prentiss what did tyler do help ex boyfriend",
  claire_wallet: "document wallet what was in it papers he took",
  claire_passphrase: "passphrase password drive key encrypted open the drive unlock decrypt your half",
  claire_a: "eo-01 eo 01 who is a who signs as a executive office reference",
  claire_archive: "archive is open decrypted drive forty seven pages what it shows",
  claire_coversheets: "cover sheets authorization records same reference two divisions",
  claire_sequence: "corbett rebuilt sequence missing documents reconstruction boxes",
  tate_who: "who are you your name introduce",
  tate_firm: "what does your firm do business company tate protective services work",
  tate_claire: "do you know claire donovan heard of her met her know her",
  tate_tahoe: "your tahoe suv vehicle truck car tahoe 3 pool vehicle where was it",
  tate_meridian: "meridian advisory group worked for meridian client contract",
  tate_wednesday: "where were you wednesday alibi december 12",
  tate_client: "claire is your client she contacted you hired you story protective detail moved her",
  tate_where: "where is claire now where is she where did you take her",
  tate_struggle: "cottage kitchen broken chair zip tie struggle damage torn up",
  tate_counsel: "did you take her abduct kidnap from the cottage",
  tate_sent: "who sent you who are you working for who hired you orders",
  tate_basement: "basement room locked padlock why locked her up held her",
  tate_note: "the note desk drawer handwriting who wrote",
  tate_phone: "prepaid phone w who is w calls burner",
  tate_lease: "lease saddle ridge lane house bristow why rent",
  rourke_who: "who are you yourself about you introduce",
  rourke_contact: "brandon tate do you know tate vendor contact relationship",
  rourke_whitlock: "dean whitlock who is whitlock defense investigator visits",
  rourke_note: "did you write the note your handwriting this note find her",
  rourke_handed: "who leaked the client list leak claire donovan who sold you out who handed you",
  rourke_hearing: "detention hearing proffer client list page footer",
  rourke_meridian: "eo-01 eo 01 who is a executive office above you boss who signs",
  rourke_calls: "tate's phone calls whitlock after visits prepaid",
  rourke_lyons: "garrett lyons number in tate's phone",
  lockhart_call: "why did you call is she safe calling about miriam told you",
  lockhart_clearwater: "why fund clearwater support funding patron donor",
  lockhart_envelope: "the envelope you received october invoice copy who sent it to you came from",
  lockhart_why_sent: "why did you send it to blackwood pass it on forward",
  lockhart_claire: "claire donovan have you met her do you know her",
  lockhart_source: "clearwater's source inside meridian who is the source",
  lockhart_cottage: "the cottage did you know miriam sent her hiding somewhere to stay",
  lockhart_eo: "eo-01 eo 01 who is a signs as a executive office reference",
  lockhart_meridian: "meridian advisory group what do you know about meridian holt rourke kane arrests",
  lockhart_help: "can the foundation help anything you can do",
  lockhart_courier: "courier account capital courier 20417 clearwater's account",
  lockhart_timeline: "claire's timeline arrests memo corbett order",
  castell_who: "what does clearwater do who are you your organization nonprofit",
  castell_whereabouts: "where is claire where is she hiding is she safe location",
  castell_sources: "your sources at meridian who are your sources informant",
  castell_claire: "how do you know claire donovan your relationship with claire helping her friend met first",
  castell_lockhart: "lockhart foundation patron donor funding who funds you",
  castell_breakfast: "donor breakfast october merrion house card",
  castell_notes: "how did the source contact you get in touch touch notes instructions typed messenger reach you communicate",
  castell_identity: "who is the source identity name who is it",
  castell_messages: "messages with claire texts thread correspondence see your messages",
  castell_booking: "where did you send claire cottage booking address hiding place where is she staying",
  castell_courier: "how were the pages sent send sent documents papers courier capital courier account shipping mailed delivery delivered",
  castell_first: "why the lockhart foundation first package first page new york donor",
  castell_call: "who called you wednesday morning phone call 6:15 man blocked number caller voice why did claire go away",
  castell_claire_call: "what did you tell claire told her 6:58 warn her code",
  castell_monday: "monday came to see you done talk to investigators herself december 10",
  castell_tuesday: "who knew about the meeting tell anyone did you tell the source tuesday",
  castell_one_page: "why only one page each time single page",
  castell_patron: "have you told dr lockhart told your patron",
  castell_sent: "man at the cottage miriam sent me did you send someone",
  castell_register: "claire's register to m.c. copy register handed you",
  prentiss_who: "who are you your job what do you do",
  prentiss_split: "you and claire relationship broke up split up ex",
  prentiss_last_contact: "when did you last see claire last talk last contact last time in touch",
  prentiss_where: "where is claire do you know where she is",
  prentiss_admit: "22 minutes monday night call phone record you talked to her you lied",
  prentiss_envelope: "envelope she left sealed envelope give it to me open it",
  prentiss_texts: "your messages with her texts thread phone",
  prentiss_drive: "the drive encryption encrypt usb split key how does it work",
  prentiss_lied: "why did you lie why lie hide it",
  prentiss_monday: "what did she say monday night frightened scared",
  prentiss_key: "your half of the key keyfile give us the key unlock",
  patel_who: "who are you your job neighbor",
  patel_claire: "what's claire like tell me about claire",
  patel_wednesday: "when did you last see claire wednesday morning leave saw her leaving",
  patel_statement: "statement police statement detective harris copy",
  patel_smoke: "anyone strange stranger in the building smoke detector man visitor hallway",
  patel_noises: "hear anything from her apartment noises sounds next door",
  patel_tyler: "anyone close to her boyfriend ex family friends tyler",
  patel_screwdriver: "screwdriver borrowed bookcase saturday",
  corbett_who: "who are you your job compliance",
  corbett_records: "how does the records center work archive records system explain write it down",
  corbett_footer: "footer line at the bottom of the copies mag-rm copy marking copier",
  corbett_eo: "eo-01 eo 01 executive office items policy 7 reference signature",
  corbett_claire: "how do you know claire donovan liaison friend",
  corbett_badge: "claire's badge access r3 what could she open restricted",
  corbett_sayer: "benjamin sayer records administrator who is sayer",
  corbett_lang: "who keeps the checkout records gerald lang backups",
  corbett_left: "why did you leave meridian fired position eliminated severance",
  corbett_sequence: "read the footers duplicates sequence reconstruct boxes what was left out missing pages",
  corbett_memo: "concerns raised memo warned executive office why did you leave july 30 review",
  corbett_order: "arrests order of your memo holt rourke kane",
  corbett_secrm: "sec-rm sec rm checkout log security account",
  halvorsen_who: "who are you your job manager",
  halvorsen_claire: "do you know claire donovan regular customer",
  halvorsen_booking: "when did she book the booth reservation voicemail",
  halvorsen_morning: "what happened when claire came in this morning she was here today envelope",
  halvorsen_seemed: "how did claire seem mood nervous upset scared",
  halvorsen_suv: "anyone waiting outside car suv street hydrant somebody watching vehicle",
  halvorsen_camera: "camera footage video security camera cctv stills recording front door",
  halvorsen_missed: "why didn't anyone give me the note at ten where were you missed",
  halvorsen_tahoe: "tahoe tate protective services registered gray suv",
  lang_who: "who are you your business company",
  lang_meridian: "is meridian a client of yours customer business",
  lang_system: "how does the checkout system work barcode backups logs",
  lang_carton: "claire's carton see the carton open p-0388 box storage",
  lang_claire: "do you remember claire donovan depositor customer receipt",
  lang_checkout: "print badge 2214 history checkout log backup box history copier jobs",
  lang_secrm: "sec-rm who is sec rm account",
  lang_drive: "the drive in the carton storage drive usb",
  harris_case: "where does the case stand status theory missing person update",
  harris_welfare: "welfare check apartment photos photographs report",
  harris_phone: "claire's phone records cell phone calls carrier",
  harris_plate: "run the partial plate license plate cafe camera suv owner registered",
  harris_carton: "court order warrant carton dominion storage lorton",
  harris_lock: "cottage lock records smart lock log door code",
  harris_vehicle: "plate reader hits tahoe vehicle record movements where did the tahoe go",
  harris_alarm: "alarm records saddle ridge lane doorbell camera neighbor",
  harris_statement: "claire's statement her statement interview",
  harris_fob: "fob copied clone key fob building fob",
  harris_tate: "brandon tate what do you know about tate background record",
  harris_warrant: "warrant for tate's office search tate",
  harris_numbers: "whose numbers who do they belong to 202 571 subscriber owner",
  harris_entry: "get into the house saddle ridge go in raid entry rescue her",
  harris_claire: "how is claire is she okay hospital",
  collins_who: "your part in this who are you what do you do",
  collins_rourke: "where is rourke held detention center jail custody",
  collins_hearing: "rourke's detention hearing proffer what came out",
  collins_interview: "interview rourke talk to rourke speak to rourke",
  collins_note: "handwriting on the note from tate's desk whose handwriting",
  collins_whitlock: "dean whitlock who is whitlock defense investigator",
  collins_lyons: "garrett lyons number in tate's phone",
  collins_quinlan: "agent quinlan fbi what is quinlan doing federal",
  bennett_case: "what do you make of it what do you think your read",
  bennett_claire: "run claire donovan background on claire",
  bennett_meridian: "meridian advisory group records background",
  bennett_clearwater: "clearwater records nonprofit background",
  bennett_castell: "run miriam castell background on castell",
  bennett_tate: "run brandon tate background on tate tate protective",
  bennett_packets: "our own files packets courier waybills footers agency",
  bennett_whitlock: "run dean whitlock background on whitlock license",
  bennett_lockhart: "lockhart foundation records filings",
  bennett_drive: "get the drive opened decrypt send the drive",
  bennett_again: "anything new any news updates",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
