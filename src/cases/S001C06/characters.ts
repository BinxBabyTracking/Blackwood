import type { CharacterDef, Condition, ContradictionDef, DialogueQuestion, EvidenceReaction } from "@/game/engine/types";
import { PATIENCE, UNLIMITED } from "./interviews";
import { G, KNOWLEDGE, PERSONA } from "./knowledge";

/*
 * S001C06 "The Architect" interviews, written against docs/S001C06-timeline.md.
 *
 * Rules for this file: nobody confesses; Pike, Dr. Lockhart, Kane and (at
 * first) Caroline Oduya keep their own accounts, lies included. Dr. Lockhart
 * is composed and never confesses on the record: she acknowledges only her
 * signature on trust documents, that she knows Pike, and that she funds
 * Clearwater. Nobody says she is the Architect, nobody says she ordered
 * anything, and nobody says anyone ordered a killing; the murders are the
 * killers' own acts. Nothing from the "Closing report only" list is said: no
 * method for the fire, nothing said on her calls with Pike, nothing about what
 * she intended for Benjamin. People in custody are recorded video interviews
 * with counsel, and counsel is written into their replies.
 *
 * Every handover is an authored answer with `giveEvidence` plus a knowledge
 * fact with the same gate and effect (knowledge.ts). The seventeen recovery
 * routes (R01 to R17) work the same way: each is its own answer about its own
 * subject, open from chapter 2 while that record has not been given in this
 * case. Gates are written only as `requires`, from the shared `G`, so each
 * answer and its facts carry the same condition.
 */

const ev = (id: string): Condition => ({ hasEvidence: id });
const all = (...c: Condition[]): Condition => ({ all: c });
const any = (...c: Condition[]): Condition => ({ any: c });
const not = (c: Condition): Condition => ({ not: c });

const pikeShownTexts: Condition = any({ presented: "pike:E020" }, { asked: "pike_texts" });

export const characters: CharacterDef[] = [
  // ---------------------------------------------------------------------
  // The missing witness
  // ---------------------------------------------------------------------
  {
    id: "sayer",
    name: "Benjamin Sayer",
    role: "Former Records Administrator, Meridian Advisory Group",
    portrait: "char.sayer",
    bio: [
      { text: "Fifty-eight. Records Administrator at Meridian Advisory Group until he resigned at 3:55 PM on Friday, December 21, 2018. Lives alone at 4417 North 19th Street, Arlington, with a cat named Dewey." },
      { text: "Wrote to Blackwood at 6:12 AM on Thursday, December 27, signing himself 'The former Records Administrator.' Left his house on foot by the back alley at about 8:10 AM." },
      { text: "Recovered unharmed by the FBI and the Pennsylvania State Police from a tenant house in Fulton County on Saturday, December 29. Interviewed with his lawyer, Irene Chen, present.", requires: G.re08 },
      { text: "Gave the passphrase to his drive at the Solvang Document Laboratory, on the record, with counsel and an FBI examiner present.", requires: { flag: "passphrase_given" } },
    ],
    available: G.re08,
    locationId: null,
    moves: [
      { when: G.re08, locationId: "fbi" },
      { when: all(G.re08, G.ch4), locationId: "exam_facility" },
    ],
    onBoard: true,
    defaultEvidenceReply: "I can tell you whether that passed through my hands. That one didn't.",
    idleLine: "I'd like to stop for a while. Ms. Chen agrees.",
    noAnswer: ["That never came across my desk.", "I don't know. I won't guess.", "I can tell you what I logged. I didn't log that."],
    voice: {
      voiceId: "pqHfZKP75CvOlQylNhV4",
      direction: "Man of fifty-eight, a lifelong records administrator: exhausted, quiet, exact, corrects himself on small details, never overstates; steadier and resolved later. Mid-Atlantic American.",
      settings: { stability: 0.7, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [
      { id: "exhausted", label: "Exhausted", requires: { always: true } },
      { id: "exact", label: "Exact", requires: { asked: "sayer_account" }, cue: "Benjamin squares the pages of his statement on the table and lines up his pen beside them." },
      { id: "resolved", label: "Resolved", requires: G.re09, cue: "Benjamin sits up straighter. For the first time he looks at you before he looks at his lawyer." },
    ],
  },

  // ---------------------------------------------------------------------
  // The Lockhart Foundation and Meridian
  // ---------------------------------------------------------------------
  {
    id: "lockhart",
    name: "Dr. Evelyn Lockhart",
    role: "Founder, the Lockhart Foundation; settlor of the Cardinal Point Trust",
    portrait: "char.lockhart",
    bio: [
      { text: "Fifty-two. Founder of the Lockhart Foundation, 1140 Fifth Avenue, New York. Founded Meridian Advisory Group in 2007." },
      { text: "The foundation announced a restructuring at 10:00 AM on Thursday, December 27." },
      { text: "Settlor and Trust Protector of the Cardinal Point Trust, a Delaware statutory trust formed June 30, 2009.", requires: ev("E043") },
      { text: "Agreed to a voluntary interview, with counsel, at the FBI New York Field Office, 26 Federal Plaza.", requires: G.re12 },
    ],
    available: G.ch2,
    locationId: "lockhart_foundation",
    moves: [{ when: G.re12, locationId: "interview_room" }],
    phone: all(G.ch2, not(G.re12)),
    contact: "The Lockhart Foundation, (212) 555-0100. Her office puts you through.",
    onBoard: true,
    defaultEvidenceReply: "I'm not sure what you'd like me to say about that.",
    idleLine: "I have a board to look after. Do call my office.",
    noAnswer: ["I really couldn't say.", "I'm afraid I don't know.", "That would be a question for the company, not for me."],
    voice: {
      voiceId: "pFZP5JQG7iQjIQuC4Bku",
      direction: "Woman in her early fifties, a New York philanthropist: composed, gracious, precise, warm in a measured way, unhurried; cooler and shorter as she is pressed, never rattled. Educated American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "gracious", label: "Gracious", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: G.ch5, cue: "Dr. Lockhart folds her hands and answers the question asked, and not one word more." },
      { id: "cold", label: "Cold", requires: G.re10, idleLine: "I think we've said what we have to say to each other.", cue: "Dr. Lockhart looks at you for a long moment, pleasantly, the way she might look at a painting she has decided not to buy." },
      { id: "composed", label: "Composed", requires: G.re12, idleLine: "My attorney will be in touch.", cue: "Dr. Lockhart sits very straight beside her attorney, her hands still on the table. Agent Quinlan closes the door." },
    ],
  },
  {
    id: "marchetti",
    name: "Elena Marchetti",
    role: "Attorney; Meridian's outside counsel; on bail",
    portrait: "char.marchetti",
    bio: [
      { text: "Fifty. Principal of Marchetti Law Group PLLC, 27th floor, 600 Lexington Avenue. Outside counsel to Meridian Advisory Group and the Lockhart Foundation." },
      { text: "Arrested on December 22 on the Ogden matter. On bail since December 24: passport surrendered, ankle monitor, no contact with Lockhart Foundation or Meridian personnel. Interviewed with her defense lawyer present." },
      { text: "Forwarded the December 21 instruction to Benjamin Sayer at 11:40 AM: 'B., per the Chair. Please schedule. E.M.'", requires: ev("E045") },
    ],
    available: G.re05,
    locationId: "marchetti_office",
    onBoard: true,
    defaultEvidenceReply: "Her lawyer: 'My client won't comment on that document.'",
    idleLine: "Her lawyer: 'That's all for today.'",
    noAnswer: ["Her lawyer: 'She won't answer that.'", "I don't know, and I wouldn't guess in front of my lawyer.", "That's for a proffer, not for you."],
    voice: {
      voiceId: "XB0fDUnXU5powFXDhCwa",
      direction: "Woman of fifty, a Manhattan trusts lawyer now a defendant: controlled and fluent, then anxious, then clipped and defensive; picks every word. Educated New York American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "controlled", label: "Controlled", requires: { always: true } },
      { id: "anxious", label: "Anxious", requires: any({ asked: "marchetti_cutoff" }, G.d16), cue: "Ms. Marchetti turns her pen end over end on the desk. Her lawyer puts a hand flat beside hers." },
      { id: "defensive", label: "Defensive", requires: any(ev("E058"), { presented: "marchetti:E035" }), cue: "Ms. Marchetti stops looking at you and starts looking at her lawyer." },
    ],
  },
  {
    id: "pike",
    name: "Conrad Pike",
    role: "Principal, Pike Risk Services LLC",
    portrait: "char.pike",
    bio: [
      { text: "Fifty-four. Principal of Pike Risk Services LLC, Suite 610, an office tower on Leesburg Pike, Tysons, Virginia. Twenty years Army military police, then corporate security. Cell (703) 555-0177." },
      { text: "Meridian's security consultant since 2016.", requires: any(ev("E017"), ev("E021")) },
      { text: "Engaged by Meridian on December 22 under special assignment 2018-12, 'at the request of the Office of the Chair.'", requires: ev("E017") },
      { text: "Present, with his lawyer, while the FBI searched his offices on Sunday morning, December 30.", requires: G.ch5 },
    ],
    available: G.pikeKnown,
    known: G.pikeKnown,
    locationId: "pike_office",
    onBoard: true,
    defaultEvidenceReply: "That's not something I'm going to comment on.",
    idleLine: "We're done. You know where the door is.",
    noAnswer: ["I don't know.", "Not my department.", "Ask the company."],
    voice: {
      voiceId: "TxGEqnHWrfWFTfGW9XjX",
      direction: "Man of fifty-four, a former Army military police officer who runs a corporate security firm: flat, clipped, short sentences, never raises his voice; colder and then silent once lawyered. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "professional", label: "Professional", requires: { always: true } },
      { id: "guarded", label: "Guarded", requires: G.pikeAdmits, cue: "Pike sits back and folds his arms. He has started answering a half second later than before." },
      { id: "hostile", label: "Hostile", requires: pikeShownTexts, cue: "Pike's jaw sets. He looks at the door, then at you, and doesn't look away." },
      { id: "refusing", label: "Declining to answer", requires: G.pikeRefuses, refuses: "I want my lawyer. Until he's here, I'm not answering.", cue: "Pike picks up his desk phone, presses one button and says, 'Get my lawyer on the line.'" },
    ],
  },
  {
    id: "donovan",
    name: "Claire Donovan",
    role: "Former Meridian records analyst; cooperating witness",
    portrait: "char.donovan",
    bio: [
      { text: "Thirty-four. Former records analyst at the Meridian Records Center. Cooperating witness with the FBI since the events of The Informant." },
      { text: "Received an anonymous text at 2:15 PM on Thursday, December 27: 'Some records burn.'", requires: G.re02 },
    ],
    available: G.re02,
    locationId: "fbi",
    phone: G.re02,
    contact: "Cooperating witness. Through SA Quinlan's office.",
    onBoard: true,
    defaultEvidenceReply: "I can only speak to my own part. I don't know about that.",
    idleLine: "I need to stop for now. Please call again.",
    noAnswer: ["I don't know.", "I never saw that.", "I won't guess about that."],
    voice: {
      voiceId: "FGY2WhTYpPnrIDTdsKH5",
      direction: "Woman in her mid thirties, a records analyst and cooperating witness: shaken and quiet at first, then steady and exact, then angry in a controlled way. Mid-Atlantic American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "shaken", label: "Shaken", requires: { always: true } },
      { id: "steady", label: "Steady", requires: { asked: "donovan_part" }, cue: "Claire takes a breath and puts both hands flat on the table." },
      { id: "angry", label: "Angry", requires: any(ev("E037"), ev("E052")), cue: "Claire's voice drops. She is very still, and very angry." },
    ],
  },

  // ---------------------------------------------------------------------
  // The operators, in custody: recorded video with counsel
  // ---------------------------------------------------------------------
  {
    id: "holt",
    name: "Adrian Holt",
    role: "Formerly Holt Advisory LLC; held without bail",
    portrait: "char.holt",
    bio: [
      { text: "Forty-nine. Formerly principal of Holt Advisory LLC, Pittsburgh. Held without bail in Carroway County since November 15, 2018." },
      { text: "Recorded video interview with his lawyer present, set up from SA Quinlan's office." },
      { text: "Requester code F-2 in Meridian's executive register.", requires: ev("E031") },
    ],
    available: G.ch2,
    locationId: "fbi",
    medium: "in person",
    onBoard: true,
    defaultEvidenceReply: "His lawyer: 'My client won't comment on that.'",
    idleLine: "His lawyer: 'That's all for today.'",
    noAnswer: ["I couldn't say.", "That isn't something I'd know.", "His lawyer: 'He won't answer that.'"],
    voice: {
      voiceId: "cjVigY5qzO86Huf0OWal",
      direction: "Man of about fifty, a Pittsburgh financial adviser on a recorded video link from jail: still polished and articulate, tired, calculating, careful with every word. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "polished", label: "Polished", requires: { always: true } },
      { id: "calculating", label: "Calculating", requires: ev("E031"), cue: "Holt glances off screen at his lawyer, and the lawyer opens a folder." },
    ],
  },
  {
    id: "rourke",
    name: "Julian Rourke",
    role: "Formerly Meridian's director of corporate intelligence; in federal detention",
    portrait: "char.rourke",
    bio: [
      { text: "Forty-six. Formerly director of corporate intelligence at Meridian Advisory Group, Washington. In federal detention since November 21, 2018." },
      { text: "Recorded video interview with his lawyer present, set up from SA Quinlan's office." },
      { text: "Requester code I-3 in Meridian's executive register.", requires: ev("E031") },
    ],
    available: G.ch2,
    locationId: "fbi",
    medium: "in person",
    onBoard: true,
    defaultEvidenceReply: "His lawyer: 'My client has no comment on that document.'",
    idleLine: "His lawyer: 'We're done for today.'",
    noAnswer: ["No.", "His lawyer: 'Next question.'", "Ask someone who kept score."],
    voice: {
      voiceId: "SOYHLrjzK2X1ezoPC6cr",
      direction: "Man of about fifty, a corporate intelligence director on a video link from detention: precise, coldly contemptuous, few words, then silence. Educated American.",
      settings: { stability: 0.7, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "contemptuous", label: "Contemptuous", requires: { always: true } },
      {
        id: "silent",
        label: "Silent",
        requires: any({ presented: "rourke:E047" }, { presented: "rourke:E034" }, { asked: "rourke_index" }),
        refuses: "His lawyer: 'My client has said everything he is going to say. Talk to the U.S. Attorney.'",
        cue: "Rourke looks off screen at his lawyer and stays looking there.",
      },
    ],
  },
  {
    id: "kane",
    name: "Gideon Kane",
    role: "Formerly Kane Logistics Inc.; in federal detention",
    portrait: "char.kane",
    bio: [
      { text: "Forty-eight. Formerly president of Kane Logistics Inc., Baltimore. In federal detention since December 5, 2018." },
      { text: "Recorded video interview with his lawyer present, set up from SA Quinlan's office." },
      { text: "Requester code L-4 in Meridian's executive register.", requires: ev("E031") },
    ],
    available: G.ch2,
    locationId: "fbi",
    medium: "in person",
    onBoard: true,
    defaultEvidenceReply: "His lawyer: 'He's not commenting on that.'",
    idleLine: "His lawyer: 'That's it for today.'",
    noAnswer: ["Couldn't tell you.", "Not my business.", "His lawyer: 'He won't answer that.'"],
    voice: {
      voiceId: "N2lVS1w4EtoT3dr4eOWO",
      direction: "Man of fifty-five, a Baltimore logistics executive on a video link from detention: blunt, flat, short; defensive and louder when pressed on the killing. American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "blunt", label: "Blunt", requires: { always: true } },
      { id: "defensive", label: "Defensive", requires: any({ asked: "kane_harbor" }, { presented: "kane:E048" }, { presented: "kane:E035" }), cue: "Kane leans toward the camera. His lawyer puts a hand on his arm." },
    ],
  },

  // ---------------------------------------------------------------------
  // Counsel, accountants and the earlier cases' people
  // ---------------------------------------------------------------------
  {
    id: "chen",
    name: "Irene Chen",
    role: "Attorney, Washington; Benjamin Sayer's counsel",
    portrait: "char.chen",
    bio: [
      { text: "Forty-eight. White-collar and whistleblower counsel, Washington. Office (202) 555-0161." },
      { text: "Returned Benjamin Sayer's call at 4:40 PM on Wednesday, December 26, and opened a file.", requires: ev("E006") },
      { text: "Present at the Solvang Document Laboratory in Baltimore for the imaging of Benjamin's drive.", requires: G.ch4 },
    ],
    available: G.chenOn,
    locationId: null,
    moves: [{ when: G.ch4, locationId: "exam_facility" }],
    phone: G.chenOn,
    contact: "Law Office of Irene Chen, (202) 555-0161.",
    onBoard: true,
    defaultEvidenceReply: "I won't comment on that.",
    idleLine: "I have to get back to my client. You have my number.",
    noAnswer: ["I can't discuss that.", "I don't know.", "That's privileged, and it isn't mine to waive."],
    voice: {
      voiceId: "ThT5KcBeYPX3keUQqHPh",
      direction: "Woman of forty-eight, a white-collar defense lawyer: precise, careful, reserved, protective of her client. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "precise", label: "Precise", requires: { always: true } },
      { id: "protective", label: "Protective", requires: G.re08, cue: "Chen moves her chair a few inches closer to her client's." },
    ],
  },
  {
    id: "ames",
    name: "Walter Ames",
    role: "Partner, Ames and Kiley CPAs; forensic accountant to the federal prosecutors",
    portrait: "char.ames",
    bio: [
      { text: "Forty-three. Partner at Ames and Kiley, Certified Public Accountants, Pittsburgh. Since the Baltimore case, forensic accountant to the federal prosecutors." },
      { text: "Working in the records room of Brandywine Fiduciary Company, Rodney Square, Wilmington.", requires: G.ch4 },
    ],
    available: G.ch2,
    locationId: null,
    moves: [{ when: G.ch4, locationId: "financial_archive" }],
    phone: G.ch2,
    contact: "Ames and Kiley CPAs, Pittsburgh. Working for the prosecutors.",
    onBoard: true,
    defaultEvidenceReply: "I'd want to sit with that before I said anything about it.",
    idleLine: "I have the trustee's people waiting. Come back any time.",
    noAnswer: ["The records don't tell me that.", "I won't guess at that.", "That's a question for the prosecutors, not an accountant."],
    voice: {
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      direction: "Man in his early forties, a forensic accountant: careful, kind, exact, explains money plainly, never overstates. American.",
      settings: { stability: 0.65, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [
      { id: "careful", label: "Careful", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: G.ch4, cue: "Ames clears a space on the records room table and uncaps a pen." },
    ],
  },
  {
    id: "wexler",
    name: "Simon Wexler",
    role: "Analyst, Ogden Fiduciary Partners; keeper of Nathaniel Ogden's research",
    portrait: "char.wexler",
    bio: [
      { text: "Twenty-nine. Analyst at Ogden Fiduciary Partners, 1185 Sixth Avenue, New York. Keeps Nathaniel Ogden's research copies." },
    ],
    available: G.ch2,
    locationId: null,
    medium: "telephone",
    phone: G.ch2,
    contact: "Ogden Fiduciary Partners, Sixth Avenue.",
    onBoard: true,
    defaultEvidenceReply: "I'd rather not guess about that.",
    idleLine: "I need to think. Can we stop for now?",
    noAnswer: ["I don't know.", "Nathaniel didn't tell me that.", "I'm not sure. I'm sorry."],
    voice: {
      voiceId: "TX3LPaxmHKxFdv7VOQHJ",
      direction: "Man of about thirty, a junior financial analyst on the phone: quick, nervous, earnest, eager to help once he trusts you. New York American.",
      settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    },
    demeanor: [
      { id: "nervous", label: "Nervous", requires: { always: true } },
      { id: "earnest", label: "Earnest", requires: { asked: "wexler_copies" }, cue: "Over the line you hear Simon open a binder and start turning pages." },
    ],
  },
  {
    id: "caruso",
    name: "Det. Anthony Caruso",
    role: "NYPD Manhattan South Homicide",
    portrait: "char.caruso",
    bio: [
      { text: "Forty-nine. NYPD Manhattan South Homicide Squad. Lead on the Ogden case." },
      { text: "Holding Meridian's former New York office in Long Island City for the FBI.", requires: G.re11 },
    ],
    available: G.ch2,
    locationId: "nypd",
    moves: [{ when: G.re11, locationId: "storage_office" }],
    phone: G.ch2,
    contact: "NYPD Manhattan South Homicide. The Ogden case.",
    onBoard: false,
    defaultEvidenceReply: "Noted. Tell me what you think it means.",
    idleLine: "That's what I've got. Call me when something moves.",
    noAnswer: ["That's not in my file.", "I don't know yet.", "I won't guess on that."],
    voice: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
      direction: "Man of about fifty, a New York homicide detective: dry, patient, plain, quietly engaged. New York American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "dry", label: "Dry", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: G.re11, cue: "Caruso has his coat on and a radio clipped to his belt." },
    ],
  },
  {
    id: "quinlan",
    name: "SA Teresa Quinlan",
    role: "FBI Washington Field Office",
    portrait: "char.quinlan",
    bio: [
      { text: "Forty-five. Special Agent, FBI Washington Field Office, 601 4th Street NW." },
      { text: "Received Benjamin Sayer's email from Blackwood at 9:10 AM on Thursday and asked Arlington County Police for a welfare check." },
    ],
    available: { always: true },
    locationId: "fbi",
    phone: { always: true },
    contact: "FBI Washington Field Office.",
    onBoard: false,
    defaultEvidenceReply: "I'll have it logged. Tell me what you think it shows.",
    idleLine: "I have a warrant to run. Call me.",
    noAnswer: ["I won't speculate.", "I don't know.", "That's not something I'll say yet."],
    voice: {
      voiceId: "Xb7hH8MSUJpSbSDYk0k2",
      direction: "Woman in her mid forties, an FBI special agent: brisk, plain, calm, exact about what the law allows, sparing with words. American.",
      settings: { stability: 0.7, similarity_boost: 0.8, style: 0.05 },
    },
    demeanor: [
      { id: "brisk", label: "Brisk", requires: { always: true } },
      { id: "engaged", label: "Engaged", requires: G.re08, cue: "Quinlan has stopped checking her phone while you talk." },
    ],
  },
  {
    id: "corbett",
    name: "Alan Corbett",
    role: "Former senior compliance officer, Meridian Advisory Group",
    portrait: "char.corbett",
    bio: [
      { text: "Fifty-one. Formerly senior compliance officer at Meridian Advisory Group. His position was eliminated on September 28, 2018. Lives at 214 Hillwood Avenue, Falls Church." },
    ],
    available: G.corbettKnown,
    known: G.corbettKnown,
    locationId: null,
    medium: "telephone",
    phone: G.corbettKnown,
    contact: "Falls Church. Former Meridian compliance.",
    onBoard: true,
    defaultEvidenceReply: "Read me the heading and the signature block. That's usually where the problem is.",
    idleLine: "I need to stop. Call me back if you need the rules.",
    noAnswer: ["Compliance never saw that.", "I don't know.", "That was above my pay grade, as they liked to say."],
    voice: {
      voiceId: "iP95p4xoKVk53GoZ742B",
      direction: "Man of about fifty, a former compliance officer on the phone: wary and clipped at first, then candid, dry and exact about rules. Northern Virginia American.",
      settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1 },
    },
    demeanor: [
      { id: "wary", label: "Wary", requires: { always: true } },
      { id: "candid", label: "Candid", requires: { asked: "corbett_call" }, cue: "Corbett lets out a breath on the line. 'All right. Ask.'" },
    ],
  },
  {
    id: "oduya",
    name: "Caroline Oduya",
    role: "Owner, Oduya Records Consulting",
    portrait: "char.oduya",
    bio: [
      { text: "Forty-four. Owner of Oduya Records Consulting, Suite 300, 1840 Sunrise Valley Drive, Reston. (703) 555-0186." },
      { text: "Built Meridian's records system, Custodia RMS, in 2010 and 2011, and kept its monthly offsite backups until December 23." },
      { text: "Booked Glenmore Court Residences, Unit 3C, Silver Spring, on December 26 for Benjamin Sayer, in her firm's name.", requires: ev("E008") },
    ],
    available: G.oduyaKnown,
    known: G.oduyaKnown,
    locationId: "oduya_office",
    phone: { talkedTo: "oduya" },
    contact: "Oduya Records Consulting, Reston.",
    onBoard: true,
    defaultEvidenceReply: "I don't know what that is. I can tell you about systems, not about paper.",
    idleLine: "I have a client restore running. Can we stop?",
    noAnswer: ["I don't know.", "The system wouldn't record that.", "I never saw inside that part of it."],
    voice: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      direction: "Woman in her mid forties, a records systems consultant and small business owner: guarded and brisk at first, then guilty and quieter, then practical and helpful. Northern Virginia American.",
      settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 },
    },
    demeanor: [
      { id: "guarded", label: "Guarded", requires: { always: true } },
      { id: "guilty", label: "Guilty", requires: G.oduyaAdmitted, cue: "Caroline sits down hard and looks at the printout in her hand." },
      { id: "helpful", label: "Helpful", requires: ev("E040"), cue: "Caroline rolls a second chair up to her terminal for you." },
    ],
  },
  {
    id: "bennett",
    name: "Frank Bennett",
    role: "Blackwood records, by phone",
    portrait: "char.bennett",
    bio: [
      { text: "Forty years with the LAPD, retired. Blackwood keeps him on to pull records and backgrounds, and to keep the old case files." },
      { text: "Reachable by phone, any time." },
    ],
    available: { always: true },
    locationId: "office",
    medium: "telephone",
    contact: "Blackwood records. Backgrounds, records, the old files.",
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
  // SA Teresa Quinlan: the federal contact; no limit
  // =====================================================================
  q("quinlan", "The case", "quinlan_case", "Where does the investigation stand?", [
    "Benjamin Sayer is gone from his house, the building where he kept his records burned overnight, and those records were under a federal hold. That's three things I don't like in one morning.",
    "Bring me what you find. I'll tell you what I can do with it.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D04" }, reply: ["The fire marshal says set, and the disposal order lifted a hold nobody had the power to lift. That's obstruction territory. Keep going."] },
      { requires: G.re07, reply: ["You've put him on a farm in Fulton County with a truck on the lane. Tell me why he can't wait and I'll move."] },
      { requires: G.re08, reply: ["He's out, he's alive, and the drive is sealed. Now it has to be proved genuine, on the record, with his lawyer watching."] },
      { requires: G.re09, reply: ["The archive is authenticated. From here it's what the records say, and what you can show they mean."] },
      { requires: G.d16, reply: ["The register says what it says, and it will have to say it to a jury."] },
      { requires: G.re12, reply: ["She's agreed to come in with counsel. Ask her about the paper. Don't expect her to help you."] },
    ],
  }),
  q("quinlan", "Benjamin's house", "quinlan_welfare", "What did the welfare check at Benjamin's house find?", [
    "Arlington sent Ptl. Ocampo at 11:20 with the neighbor's key. No forced entry, no struggle. Clothes gone, toothbrush and razor gone, his cell phone switched off in a kitchen drawer with the charger still in the wall.",
    "He packed. Here's the report and the photographs.",
  ], {
    reveals: "Arlington County Police found no forced entry or struggle at 4417 North 19th Street; Benjamin had packed and left his cell phone behind.",
    effects: [{ giveEvidence: "E003" }, tl("11:20 AM (Thu 12/27)", "Arlington County Police welfare check at Benjamin Sayer's house: no forced entry, no struggle, luggage gone.", "Welfare check")],
  }),
  q("quinlan", "Benjamin's house", "quinlan_neighbor", "Did the neighbors see anything?", [
    "Dolores Haverty, next door, seventy-one. A big gray SUV with two men in it, engine running, Sunday night, Christmas Eve and Christmas night. She wrote the end of the plate on her grocery list.",
    "And she saw him go out the back this morning with a bag and a little suitcase. Here's her statement.",
  ], {
    reveals: "Dolores Haverty saw a gray SUV with two men outside Benjamin's house on December 23, 24 and 25, wrote down '7731', and saw him leave by the back alley at about 8:10 AM on Thursday.",
    effects: [{ giveEvidence: "E005" }, tl("8:10 AM (Thu 12/27)", "Benjamin leaves by the back alley on foot with a satchel and a rolling case; Dolores Haverty sees him.", "Canvass statement")],
  }),
  q("quinlan", "The law", "quinlan_hold", "What is the legal hold on Meridian's records?", [
    "A preservation letter from the U.S. Attorney's Office here in D.C., Monday, November 26. Served on Meridian through its outside counsel, Elena Marchetti.",
    "It means nothing covered gets destroyed. Not on a schedule, not by accident, not because somebody's restructuring.",
  ]),
  q("quinlan", "The law", "quinlan_legal", "Is what the foundation and Meridian are doing legal?", [
    "Announcing a restructuring is legal. Selling positions is legal. Closing bank accounts is legal. Shredding on a normal schedule is legal.",
    "Shredding or burning records under a federal hold, or changing the schedule to do it, is obstruction. Following a witness to take records off him is witness tampering. That's the line. Keep your report on the right side of it.",
  ]),
  q("quinlan", "Arrangements", "quinlan_video", "Can I interview Holt, Rourke and Kane?", [
    "Recorded video from the room down the hall, each with his lawyer on the line. Holt is held in Carroway County; Rourke and Kane are federal.",
    "Rourke won't say a word without a proffer agreement. Ask anyway. It costs you nothing but a question.",
  ], { requires: G.ch2 }),
  q("quinlan", "Arrangements", "quinlan_search", "What happened in the search of Meridian headquarters?", [
    "Warrant executed at nine on Friday, 1620 K Street. The executive floor and records administration on six are open to you while we work.",
    "The Chair's suite was already empty when we got there.",
  ], { requires: G.ch2 }),
  q("quinlan", "The recovery", "quinlan_recover", "Can you send people to get Benjamin out of the tenant house?", [
    "Give me where he is and why he can't wait, and I'll have troopers there in an hour.",
  ], {
    requires: G.recover,
    repeatable: true,
    variants: [{
      requires: G.recoverReady,
      reply: [
        "A truck blocking the lane and a man at his back door with a pry bar. That's enough.",
        "State Police out of McConnellsburg and my people from Washington. Stay where you are and stay out of sight.",
      ],
    }],
  }),
  q("quinlan", "Lab", "quinlan_phones", "Can CART pull the contractors' phones?", [
    "Two prepaid handsets out of the Tahoe. CART will image them tonight under the warrant.",
    "You'll have the extraction when it's done.",
  ], { requires: G.re08, reveals: "SA Quinlan sent the contractors' two prepaid phones to CART for extraction.", effects: [{ startLab: "phones" }] }),
  q("quinlan", "Lab", "quinlan_signatures", "Can the laboratory compare the A-1 signatures with known signatures?", [
    "Dr. Solvang can do it with what you've brought: the approvals and specimen cards off the drive, against signatures nobody disputes, out of the trust's own file.",
    "She'll state an opinion, not a certainty. That's how it should be.",
  ], { requires: G.signatures, reveals: "SA Quinlan asked Dr. Solvang to compare the A-1 approvals and specimen cards with undisputed signatures.", effects: [{ startLab: "signatures" }] }),
  q("quinlan", "Lab", "quinlan_chain", "Can the laboratory certify the chain of authority?", [
    "Every program, every approval, the funding, the cards and the signature opinion, side by side and certified. Dr. Solvang and our examiner will sign it together.",
    "It will say what the records establish, and what they don't.",
  ], { requires: G.chain, reveals: "SA Quinlan asked the laboratory to certify the chain of authority across the authenticated records.", effects: [{ startLab: "chain" }] }),
  q("quinlan", "Lab", "quinlan_lab", "Is anything back from the laboratory?", [
    "Nothing's out with the lab. Give me something to send.",
  ], {
    repeatable: true,
    variants: [
      { requires: { labStarted: "phones" }, reply: ["CART has the contractors' phones. You'll get the extraction when it's done."] },
      { requires: { labReady: "phones" }, reply: ["The phone extraction is on your desk. Read every line."] },
      { requires: { labStarted: "imaging" }, reply: ["The drive is being imaged at Solvang, write-blocked, with our examiner in the room."] },
      { requires: { labReady: "imaging" }, reply: ["Imaging and integrity report is in. Read the last paragraph as carefully as the first."] },
      { requires: { labStarted: "signatures" }, reply: ["Dr. Solvang has the signatures. She doesn't hurry and I don't ask her to."] },
      { requires: { labReady: "signatures" }, reply: ["The signature report is back. 'Strong support,' and she means every word of both."] },
      { requires: { labStarted: "chain" }, reply: ["The chain of authority is being certified. It takes the time it takes."] },
      { requires: { labReady: "chain" }, reply: ["The certified chain is on your desk, limits and all."] },
    ],
  }),
  q("quinlan", "Exhibits", "quinlan_rourke_safe", "What was in Julian Rourke's safe?", [
    "Item fourteen. We had it since November and couldn't read it: a yellow carbon form with codes and no names.",
    "Against the register it reads fine now. Here.",
  ], { requires: G.rourkeSafe, reveals: "SA Quinlan handed over item 14 from Rourke's safe: his yellow copy of EX-2017-022.", effects: [{ giveEvidence: "E047" }] }),
  q("quinlan", "Exhibits", "quinlan_kane_safe", "What was in Gideon Kane's safe?", [
    "Item nine, from the safe at Riverside on December 5. Another yellow carbon. 'Pressure only,' in the same words as the register.",
    "It doesn't reach the killing of Hector Navarro, and Kane says so himself. Here.",
  ], { requires: G.kaneSafe, reveals: "SA Quinlan handed over item 9 from Kane's safe: his yellow copy of EX-2018-019.", effects: [{ giveEvidence: "E048" }] }),
  q("quinlan", "Exhibits", "quinlan_castell", "How were the leaks run through Miriam Castell and Clearwater?", [
    "Miriam Castell has been cooperating since she came in. Her file is yours now: the typed notes she received, and Clearwater's own log of what Claire handed over and what was held back.",
    "Read them in date order.",
  ], {
    requires: G.ch5,
    reveals: "SA Quinlan handed over Miriam Castell's file: the typed notes she received and Clearwater's release log.",
    effects: [{ giveEvidence: "E052" }, { giveEvidence: "E056" }],
  }),
  q("quinlan", "Exhibits", "quinlan_witnesses", "How do the witnesses hold up against the records?", [
    "We've put every witness against the paper. Where somebody has a reason to shade it, the record carries the point, not the testimony.",
    "Here's the summary. Read the line on Ms. Marchetti twice.",
  ], { requires: G.witnesses, reveals: "SA Quinlan handed over the FBI's witness corroboration summary.", effects: [{ giveEvidence: "E058" }] }),
  q("quinlan", "Earlier files", "quinlan_index", "Can I have the compromising information index from the Rourke case?", [
    "The index is an exhibit in the case against Rourke. I can release a copy to you for this.",
    "Here. It's logged.",
  ], { requires: G.route("R03"), reveals: "SA Quinlan released a copy of the Compromising Information Index from the Rourke case.", effects: [{ giveEvidence: "R03" }] }),
  q("quinlan", "Earlier files", "quinlan_briggs", "How was Russell Briggs pressured in Baltimore?", [
    "The intelligence reference on Briggs went into the federal case after Baltimore. That's how the pressure was built.",
    "You can have a copy for this. Here.",
  ], { requires: G.route("R04"), reveals: "SA Quinlan released a copy of the intelligence reference on Russell Briggs.", effects: [{ giveEvidence: "R04" }] }),
  q("quinlan", "The case", "quinlan_architect", "Is Dr. Lockhart the Architect?", [
    "I don't do your reasoning for you. Bring me paper that says who, and paper that says the paper is real.",
  ], { variants: [{ requires: G.d16, reply: ["The register says what it says, and it will have to say it to a jury."] }] }),
  q("quinlan", "People", "quinlan_pike", "What do you know about Conrad Pike?", [
    "Pike Risk Services, Tysons. Twenty years Army military police, then corporate security. No record. Meridian's security man since 2016.",
    "We know his name. Knowing his name isn't a warrant.",
  ], { requires: G.pikeKnown }),
  q("quinlan", "People", "quinlan_marchetti", "What is Elena Marchetti's status?", [
    "Arrested December 22 in New York on the Ogden matter, out on bail since Christmas Eve. Passport surrendered, ankle monitor, no contact with anyone at the foundation or Meridian.",
    "She wants a deal and she's afraid she's next. Both can be true and she can still be useful.",
  ]),
  q("quinlan", "The recovery", "quinlan_contractors", "Who are the men you detained at the farm?", [
    "Kurt Sobczak, forty-four, and Travis Dunleavy, thirty-seven. Both contract for Pike Risk Services. Held on state charges, trespass and stalking, pending federal process.",
    "Neither one has said a word. They're waiting for someone to tell them what to say.",
  ], { requires: G.re08 }),
  q("quinlan", "The recovery", "quinlan_benjamin", "How is Benjamin Sayer?", [
    "Cold, tired and very precise. He'll give us nothing until his lawyer says so, which is the right answer.",
    "Talk to him at the field office. When the drive goes to the laboratory, he goes with it.",
  ], { requires: G.re08 }),
  q("quinlan", "The fire", "quinlan_fire", "What does the FBI know about the fire?", [
    "The fire marshal's preliminary finding is incendiary, deliberately set, and the one sprinkler zone that protected Bay C was out of service. She referred it to us because of the hold.",
    "I won't go one word past her report.",
  ]),
  q("quinlan", "The interview", "quinlan_interview", "What should I expect from Dr. Lockhart's interview?", [
    "She came in voluntarily, with counsel. She can stand up and leave whenever she likes.",
    "Put the paper in front of her, one piece at a time. Don't expect a confession, and don't need one.",
  ], { requires: G.re12 }),

  // =====================================================================
  // Bennett: records by phone; no limit
  // =====================================================================
  q("bennett", "The case", "bennett_case", "What do you make of this?", [
    "A records man who sends one page and then disappears either got scared or got careful. Read the page. He picked it.",
  ], {
    repeatable: true,
    variants: [
      { requires: { deduction: "D04" }, reply: ["Somebody lifted a hold they had no power to lift and then the building burned. Paper that gets burned twice is paper somebody's afraid of."] },
      { requires: G.re08, reply: ["You found a man by reading his phone bill and a farmer's lease. Good. Now the drive."] },
      { requires: G.d16, reply: ["Big name at the top of a small form. Don't let the name do your thinking. Let the paper."] },
    ],
  }),
  q("bennett", "Records", "bennett_plate", "Can you run the partial plate from the SUV?", [
    "Dark gray Tahoe ending 7731, Virginia plates. One plate on the road fits: UFK-7731, a 2017 Tahoe registered to Pike Risk Services LLC in Tysons.",
    "Toll records put it out late on the 23rd, 26th and 28th. I'm sending you the abstract.",
  ], { requires: ev("E005"), reveals: "Bennett traced the SUV to UFK-7731, a dark gray 2017 Tahoe registered to Pike Risk Services LLC.", effects: [{ giveEvidence: "E021" }] }),
  q("bennett", "Records", "bennett_numbers", "Can you run the numbers on Benjamin's phone records?", [
    "The Reston number is Oduya Records Consulting, the 202 is Irene Chen's law office, the 571 is the Records Center's manager.",
    "The 717 is a rural landline in south-central Pennsylvania. He called it twice in November and never again. Give me a reason to knock on a farmer's door and I'll make the call.",
  ], { requires: G.numbersEarly }),
  q("bennett", "Records", "bennett_717", "Who is the 717 number Benjamin called in November?", [
    "Lester Burkholder, a farmer up in Fulton County, north of McConnellsburg. I called him. A Mr. B. Sayer signed a winter lease on his tenant house on November 24, six months cash. No phone up there, no signal.",
    "Burkholder faxed the lease. He also says his trail camera caught a truck on the lane that isn't anybody's he knows. I'd send someone, and not alone.",
  ], {
    requires: G.number717,
    reveals: "Bennett found the 717 number: Lester Burkholder, whose Fulton County tenant house Benjamin leased on November 24.",
    effects: [{ giveEvidence: "E025" }, tl("Sat 11/24", "Benjamin signs a winter lease on the Burkholder tenant house, Juniper Gap Road, Fulton County.", "Lease")],
  }),
  q("bennett", "Earlier files", "bennett_keller", "Do you still have Dr. Lockhart's envelope from the Keller case?", [
    "The Keller file is sealed in our records room. Her note and the copied invoice are in it, the first thing anybody sent us in this whole business.",
    "I've pulled a copy for you. Logged.",
  ], { requires: G.route("R02"), reveals: "Bennett pulled a copy of Dr. Lockhart's referral note and enclosure from the sealed Keller file.", effects: [{ giveEvidence: "R02" }] }),
  q("bennett", "Earlier files", "bennett_old_files", "What if I don't have the records from the earlier cases?", [
    "Anything you didn't keep from the earlier files, the people who were there still have copies. Ask them.",
    "Ask about the thing itself. Nobody's going to read you a catalog.",
  ], { requires: G.ch2 }),
  q("bennett", "Earlier files", "bennett_rolling", "Can you help me with the rolling board?", [
    "That board's where the old cases talk to each other. I don't pin things for people.",
  ]),
  q("bennett", "Records", "bennett_pike", "Run Conrad Pike for me.", [
    "No record. Twenty years Army military police, then corporate security. Pike Risk Services, Suite 610, Leesburg Pike, Tysons.",
    "Meridian has been his biggest client since 2016.",
  ], { requires: G.pikeKnown }),
  q("bennett", "Records", "bennett_sayer", "Run Benjamin Sayer for me.", [
    "No record. Fifty-eight. Meridian's records people since 2008. Owns the house on North 19th outright. No car registered. A cat named Dewey.",
    "A man with no car who leaves on foot has already planned which way he's walking.",
  ]),
  q("bennett", "Records", "bennett_oduya", "Run Caroline Oduya and her firm.", [
    "Oduya Records Consulting, Reston. Records systems for mid-size firms. She built Meridian's around 2010. No record, pays her bills.",
  ], { requires: G.oduyaKnown }),
  q("bennett", "Records", "bennett_lockhart", "What do the records say about Dr. Lockhart?", [
    "The Lockhart Foundation, 1140 Fifth Avenue. Public filings, grants, board, all clean.",
    "The old press releases say she founded Meridian in 2007. She's been off its paperwork since 2009.",
  ]),
  q("bennett", "Records", "bennett_trust", "What can you find on the Cardinal Point Trust?", [
    "Delaware statutory trust, 2009. Trustee is Brandywine Fiduciary in Wilmington. Delaware doesn't make a trust tell you who's behind it. That's the point of Delaware.",
    "Walter Ames is the man for trust paper.",
  ]),
  q("bennett", "Records", "bennett_patuxent", "Run Patuxent Secure Destruction.", [
    "Licensed shredding outfit in Laurel, Maryland. Real company, real trucks. They do what the paperwork tells them.",
  ], { requires: G.patuxent }),
  q("bennett", "The case", "bennett_again", "Anything new on your side?", ["Nothing new. I'm waiting on you."], { repeatable: true }),

  // =====================================================================
  // Claire Donovan: cooperating witness
  // =====================================================================
  q("donovan", "The warning", "donovan_text", "Tell me about the text you received.", [
    "Thursday afternoon, a quarter past two. A number I didn't know. Three words: 'Some records burn.'",
    "I read about Chantilly an hour later. Agent Quinlan has someone outside my building now.",
  ], { effects: [tl("2:15 PM (Thu 12/27)", "Claire Donovan receives an anonymous text: 'Some records burn.'", "Claire Donovan")] }),
  q("donovan", "Her part", "donovan_part", "What was your part in the leaks?", [
    "I copied three records in the autumn and gave them to Miriam Castell at Clearwater.",
    "I've written it all down for the FBI. You should have it too.",
  ], { reveals: "Claire Donovan handed over her written account of copying three records for Miriam Castell.", effects: [{ giveEvidence: "E051" }] }),
  q("donovan", "Her part", "donovan_copying", "How did the copying work?", [
    "I pulled the originals from the collections, copied them on the Records Center copier and put them back. Every copy from that machine carries a MAG-RM footer. I took them to Miriam.",
    "Miriam told me they were what the investigators needed next. I believed her. I still think she believed it.",
  ]),
  q("donovan", "Her part", "donovan_footer", "What is the MAG-RM footer?", [
    "The Records Center copier stamps every page: MAG-RM, the machine, the date. Anybody who knew the building could tell where a copy came from. That was never a secret.",
  ]),
  q("donovan", "Her part", "donovan_castell", "What did Miriam Castell tell you?", [
    "That I was helping. That the investigators needed the next thing, and then the next. She never said who decided what came next. I never asked.",
  ]),
  q("donovan", "People", "donovan_lockhart", "Have you met Dr. Lockhart?", [
    "Once, at a Clearwater donor breakfast in October. She thanked me for my courage.",
    "I was flattered. I went home and told my mother.",
  ], {
    variants: [{
      requires: G.claireUnderstands,
      reply: ["Once. At a breakfast in October. She thanked me for my courage.", "If those notes are hers, she had already chosen what my courage would copy."],
    }],
  }),
  q("donovan", "People", "donovan_benjamin", "What was Benjamin Sayer like as your supervisor?", [
    "He was my supervisor from 2012. Careful, kind, the kind of man who labels his own pencils.",
    "He signed my pulls without a word. I thought he was protecting me.",
  ]),
  q("donovan", "Her part", "donovan_ex", "Did you ever see the EX series?", [
    "Never. Bay C was Benjamin's, and only his card opened it.",
    "I saw EX numbers on cover sheets filed behind some of the pages I copied. On December 1 I offered three of those pages to Miriam. She gave them back.",
  ]),
  q("donovan", "Earlier files", "donovan_copies", "Did you keep copies of the earlier records?", [
    "I kept copies of everything I ever touched; that was the point.",
    "Ask me for the one you need.",
  ]),
  q("donovan", "Earlier files", "donovan_courier", "Do you have the Capital Courier statement for the account that carried the leaks?", [
    "Account 20417. I kept the statement, because I was the one handing over the envelopes.",
    "Here's my copy.",
  ], { requires: G.route("R08"), reveals: "Claire Donovan provided her copy of the Capital Courier statement for account 20417.", effects: [{ giveEvidence: "R08" }] }),
  q("donovan", "Earlier files", "donovan_register", "Do you have your own register of what you copied?", [
    "My copy register. Every page I copied, the date, the box, where it went.",
    "Here.",
  ], { requires: G.route("R10"), reveals: "Claire Donovan provided her copy register.", effects: [{ giveEvidence: "R10" }] }),
  q("donovan", "Earlier files", "donovan_timeline", "Do you have your timeline of the order the executives were exposed in?", [
    "The timeline I wrote when I saw the arrests came in an order. I wrote it to make sure I wasn't imagining it.",
    "Take it.",
  ], { requires: G.route("R11"), reveals: "Claire Donovan provided her Executive Exposure Timeline.", effects: [{ giveEvidence: "R11" }] }),
  q("donovan", "Earlier files", "donovan_comparison", "Do you have your notes comparing the disclosures?", [
    "My comparison notes. What went out, what was filed behind it, and what never went anywhere.",
    "Here.",
  ], { requires: G.route("R17"), reveals: "Claire Donovan provided her comparison notes.", effects: [{ giveEvidence: "R17" }] }),
  q("donovan", "People", "donovan_corbett", "Who could explain Meridian's retention rules and legal holds?", [
    "Alan Corbett. He was the senior compliance officer until they eliminated his job in September.",
    "Retention, holds, what a schedule change needs: he can recite it. Call him.",
  ]),
  q("donovan", "Her part", "donovan_release", "The release program chose what you copied.", [
    "Then I wasn't a whistleblower. I was a delivery service.",
    "The records were real. Every one. That's the part that makes it worse.",
  ], { requires: ev("E037") }),
  q("donovan", "The warning", "donovan_safe", "Are you safe?", [
    "Agent Quinlan has a car outside and a number I can call. I've stopped answering my phone to anyone else.",
    "I keep thinking whoever sent that text knows where I live.",
  ]),

  // =====================================================================
  // Caroline Oduya: records consultant
  // =====================================================================
  q("oduya", "Her firm", "oduya_who", "What does your firm do for Meridian?", [
    "We built their records system, Custodia, in 2010 and 2011, and kept their monthly offsite backups.",
    "Kept, past tense. They let us go on the 23rd.",
  ]),
  q("oduya", "Benjamin", "oduya_benjamin", "Have you heard from Benjamin Sayer?", [
    "Not since he left Meridian. I'm sure he's fine. Ben's a very private man.",
  ], { requires: G.oduyaLying, reveals: "Caroline Oduya says she hasn't heard from Benjamin since he left Meridian." }),
  q("oduya", "Benjamin", "oduya_booking", "Did you book somewhere for Benjamin to stay?", [
    "Yes. All right. He called me Wednesday morning, the 26th, and asked me to find him somewhere for a week and not ask why. I booked a short-stay flat in Silver Spring on my firm's card, in my firm's name.",
    "Here's the confirmation. Glenmore Court, Unit 3C, the 27th to January 3. I'm sorry I said otherwise.",
  ], {
    requires: G.oduyaBooking,
    reveals: "Caroline Oduya booked Glenmore Court Residences, Unit 3C, Silver Spring, for Benjamin on December 26, December 27 to January 3.",
    effects: [{ giveEvidence: "E008" }, tl("10:05 AM (Wed 12/26)", "Caroline Oduya books Glenmore Court 3C, Silver Spring, for Benjamin, in her firm's name.", "Caroline Oduya")],
  }),
  q("oduya", "Benjamin", "oduya_pretext", "Did anyone else ask about the booking?", [
    "Thursday at 3:40 in the afternoon. Someone rang my front office from 'Glenmore Court billing,' said the card had been declined and asked to confirm the address and the code. Gil read them out.",
    "Glenmore says they never called. I wrote it on the printout. I've been sick about it since.",
  ], {
    requires: ev("E008"),
    reveals: "At 3:40 PM on Thursday a caller posing as 'Glenmore Court billing' got the apartment's address and guest code from Oduya's office.",
    effects: [tl("3:40 PM (Thu 12/27)", "A caller posing as 'Glenmore billing' gets the Glenmore Court address and code from Oduya's office.", "Caroline Oduya")],
  }),
  q("oduya", "The system", "oduya_custodia", "How does Custodia work?", [
    "Custodia RMS is a records management system: every collection is a volume, every file has a record, every action is logged.",
    "Meridian's executive volume was restricted. Only the Records Administrator's account could open it. I built the lock; I never saw inside.",
  ]),
  q("oduya", "The system", "oduya_exvol", "What is EXVOL?", [
    "The executive volume. The register and the scans of the forms, on its own encrypted partition.",
    "In twelve years I never had a reason to read it, and I never did.",
  ]),
  q("oduya", "The system", "oduya_exports", "Who exported the executive volume?", [
    "Ben did, every Friday afternoon since January 2014, to the same encrypted drive. The system logged it every time.",
    "Ben's drive was the only external device the system ever saw.",
  ]),
  q("oduya", "The system", "oduya_digests", "What is a digest?", [
    "A fingerprint of a file. Run the same file through the same calculation and you get the same long number; change one comma and you get a different one.",
    "Custodia used MD5 at first and SHA-256 from 2014. If Ben wrote his digests down, anyone can check them against the files.",
  ]),
  q("oduya", "Her firm", "oduya_terminated", "What happened to your contract with Meridian?", [
    "Pike's office terminated it by email on Sunday the 23rd and demanded every backup tape back, immediately.",
    "The contract gives me thirty days to return media. I've returned all but one. The November 30 tape is in my safe.",
  ]),
  q("oduya", "The backup", "oduya_tape", "Do you still have a backup of Meridian's records?", [
    "The November 30 tape. It's in that safe. On the 24th my backup agent reported the executive volume missing from the live system altogether.",
    "I'm not putting that tape in a machine for anyone until there's something to compare it against and someone from the FBI watching me do it.",
  ], { requires: G.oduyaTapeWaiting }),
  q("oduya", "The backup", "oduya_backup", "Can you restore the backup tape and pull the audit log?", [
    "Agent Quinlan's examiner sat beside me while I restored it. Here's the audit log for the executive volume, and the alert from the 24th.",
    "Every Friday, Ben's export. Then on the 23rd, at 9:14 at night, the account cpike_admin deleted the volume. Without his drive and my tape there would be nothing.",
  ], {
    requires: G.oduyaTapeReady,
    reveals: "Caroline Oduya restored the November 30 backup and handed over Custodia's audit log: account cpike_admin deleted the executive volume at 9:14 PM on December 23.",
    effects: [{ giveEvidence: "E040" }, tl("9:14 PM (Sun 12/23)", "Account cpike_admin deletes the executive volume on Custodia.", "Audit log")],
  }),
  q("oduya", "People", "oduya_pike", "Do you know Conrad Pike?", [
    "Only as the name on the termination email, and a voice on the phone on the 23rd asking how many tapes I had and where they were. I said I'd check the contract.",
    "I didn't like the voice.",
  ], { requires: G.pikeKnown }),
  q("oduya", "Benjamin", "oduya_friend", "How do you know Benjamin?", [
    "Twelve years. He was Meridian's contact on the system, and then he was my friend.",
    "He sends me a card every Christmas with a bird on it.",
  ]),
  q("oduya", "Benjamin", "oduya_why", "Why did you help him?", [
    "Because he asked, and in twelve years Ben never asked me for anything. He said he needed a quiet week and that I shouldn't ask why.",
    "Then I gave the address away to the first stranger who rang my office. I feel responsible for whatever happened next.",
  ], { requires: ev("E008") }),
  q("oduya", "People", "oduya_corbett", "Who else would understand Meridian's records rules?", [
    "Alan Corbett, their old compliance officer. He and Ben argued about retention schedules for years and liked each other the whole time.",
  ]),

  // =====================================================================
  // Alan Corbett: former compliance officer, by telephone
  // =====================================================================
  q("corbett", "About him", "corbett_who", "Who are you, Mr. Corbett?", [
    "Alan Corbett. I was Meridian's senior compliance officer until September 28, when they eliminated my position and handed me a severance agreement.",
  ]),
  q("corbett", "About him", "corbett_call", "Has anyone from Meridian contacted you?", [
    "On Thursday. A man who didn't give his name called to 'remind' me of my confidentiality agreement. He read me the clause number.",
    "I've read the Baltimore papers. I know what reminders mean.",
  ]),
  q("corbett", "The EX series", "corbett_bayc", "Did compliance have access to Bay C?", [
    "Never. Compliance saw the ordinary collections. Bay C and the EX series were Benjamin's.",
    "Benjamin was the only one who saw both halves.",
  ]),
  q("corbett", "The EX series", "corbett_ex", "Did the EX series really exist?", [
    "It existed. I saw EX numbers on transmittals and cover sheets for years. I asked once what was in it and was told it was above my pay grade.",
    "I never saw a page of it.",
  ]),
  q("corbett", "Retention", "corbett_retention", "How does Meridian's retention policy work?", [
    "Every collection has a period in the schedule. When it's up, the Records Administrator signs a disposal authorization, and only then does anything go to a shredder.",
  ]),
  q("corbett", "Retention", "corbett_hold", "What does a legal hold do?", [
    "It stops everything. Whatever the schedule says, nothing covered is destroyed until the authority that issued the hold releases it in writing.",
    "No officer of the company can lift it. Not the managing director, not counsel, nobody.",
  ]),
  q("corbett", "Retention", "corbett_schedule", "What does it take to change the retention schedule?", [
    "Two signatures: the Records Administrator and counsel. Section 8. I made them put it in.",
  ]),
  q("corbett", "Retention", "corbett_altered", "Is the December 23 revision of the schedule valid?", [
    "No. Signed 'for' a Records Administrator who had resigned, no counsel's signature, and the hold clause simply left off.",
    "That isn't a schedule. It's a permission slip somebody wrote for himself.",
  ], { requires: ev("E015") }),
  q("corbett", "People", "corbett_benjamin", "What was Benjamin Sayer like?", [
    "Exact. Kind in a dry way. He kept his own counsel and other people's records.",
    "He'd have made a terrible liar, which may be why he never tried.",
  ]),
  q("corbett", "People", "corbett_claire", "Do you know Claire Donovan?", [
    "She was my compliance liaison and she's my friend. The most careful records analyst I ever worked with.",
  ]),
  q("corbett", "Earlier files", "corbett_sequence", "Can you show me the missing document sequence?", [
    "I already reconstructed it, from my compliance index: which pages went out, and which page sat behind each one and never did.",
    "Here's a copy.",
  ], { requires: G.route("R09"), reveals: "Alan Corbett provided his reconstruction of the missing document sequence.", effects: [{ giveEvidence: "R09" }] }),

  // =====================================================================
  // Irene Chen: Benjamin's counsel
  // =====================================================================
  q("chen", "Her client", "chen_retained", "When did Benjamin retain you?", [
    "He called my office on the 21st and got the holiday voicemail. I returned the call on Wednesday the 26th at 4:40 and opened a file.",
    "He retained me for a proffer. That's as much as I'll say about what he wants.",
  ], { effects: [tl("4:40 PM (Wed 12/26)", "Irene Chen returns Benjamin's call and opens a file.", "Irene Chen")] }),
  q("chen", "Her client", "chen_where", "Do you know where Benjamin is?", [
    "No. He was careful not to tell me, and I was careful not to ask.",
  ]),
  q("chen", "Authentication", "chen_authentication", "How do we prove his records are genuine?", [
    "Authentication is a chain, not a signature. Where the records were made, who held them, and what independent record agrees with them.",
    "A signature on a page proves very little by itself. A chain that never breaks proves a great deal.",
  ]),
  q("chen", "Authentication", "chen_drive", "How should his drive be handled?", [
    "Sealed in front of counsel. Imaged at an independent laboratory, with an FBI examiner present, on the record.",
    "Any other way and the defense will say the FBI wrote it. They'd be entitled to.",
  ]),
  q("chen", "Her client", "chen_proffer", "What does Benjamin want?", [
    "A proffer: a written agreement about how his statements are used, before he gives his account and the archive.",
    "He isn't asking for anything he wouldn't deserve if he'd done nothing at all.",
  ]),
  q("chen", "Her client", "chen_danger", "Is Benjamin in danger?", [
    "He told me there was a car outside his house at night. He thought he was in danger. I believed him.",
  ]),
  q("chen", "Her client", "chen_copy", "Was he entitled to take a copy of the records?", [
    "He kept a copy of records under a federal preservation demand, to preserve them, and he means to deliver it to the government.",
    "I'll argue that all day, in any court you like.",
  ]),
  q("chen", "Authentication", "chen_passphrase", "Is Benjamin ready to give the passphrase?", [
    "Here, on the record, with the examiner present and me beside him. Not one minute before.",
    "Ask him.",
  ], { requires: G.ch4 }),
  q("chen", "Her client", "chen_why", "Why did Benjamin choose you?", [
    "He said he'd read my name in a court filing in November and liked that I didn't talk to reporters.",
  ]),

  // =====================================================================
  // Conrad Pike: the security man
  // =====================================================================
  q("pike", "About him", "pike_who", "Who are you, Mr. Pike?", [
    "Conrad Pike. Pike Risk Services. Twenty years Army military police, then corporate security.",
    "I advise companies on keeping their people and their property safe.",
  ]),
  q("pike", "Meridian", "pike_meridian", "What do you do for Meridian?", [
    "Security consulting since 2016. Facilities, travel, access control. Ordinary work.",
  ]),
  q("pike", "The Records Center", "pike_records_center", "What were you doing at the Records Center?", [
    "After the fire I was reviewing security at the Records Center for the company. That's my job.",
    "Somebody has to look at what failed.",
  ], { requires: G.pikeFirstStory, reveals: "Pike says he was reviewing security at the Records Center for the company after the fire." }),
  q("pike", "The disposal", "pike_disposal", "Why were the Records Center's records disposed of on December 26?", [
    "It was a scheduled records action, under counsel's instruction of the 21st. The company was restructuring.",
    "I secured the site while a licensed vendor did the work. That's all.",
  ], { requires: G.pikeAdmits, reveals: "Pike says the December 26 disposal was a scheduled records action under counsel's instruction." }),
  q("pike", "Access", "pike_card", "Your card opened the dock and the Bay C cage that night.", [
    "Cards get lent. Contractors need doors.",
    "Ask the facility manager who he let in.",
  ], { requires: ev("E012"), reveals: "Pike says of his access card: 'Cards get lent. Contractors need doors.'" }),
  q("pike", "Benjamin", "pike_sayer", "Do you know Benjamin Sayer?", [
    "Never met the man. I left one message about company property he took home. He didn't call back.",
    "That's the extent of it.",
  ], { requires: G.pikeFirstStory, reveals: "Pike says he has never met Benjamin Sayer and only left him one message about company property." }),
  q("pike", "Meridian", "pike_assignment", "What exactly was your assignment from Meridian?", [
    "Security during the restructuring. The company had a lot of property moving, and some of it walked out the door.",
  ], {
    variants: [{
      requires: G.pikeAssignmentTold,
      reply: [
        "All right. You've read the engagement. I was retained on the 22nd to recover company records a former employee took home, and to locate him discreetly so the company's lawyers could write to him.",
        "That's lawful. Companies do it every week.",
      ],
    }],
  }),
  q("pike", "Benjamin", "pike_locate", "Why were you looking for Benjamin Sayer?", [
    "To locate him discreetly, so the company's lawyers could write to him about what he took.",
    "Nobody was going to touch him.",
  ], { requires: G.pikeAdmits, reveals: "Pike says he wanted Benjamin located 'discreetly' so the company's lawyers could write to him." }),
  q("pike", "Meridian", "pike_client", "Who is your client?", ["My client is the company."], { reveals: "Pike says: 'My client is the company.'" }),
  q("pike", "The hold", "pike_hold", "Did you know the records were under a legal hold?", [
    "Counsel told me the hold had been lifted. I'm not a lawyer.",
    "I follow counsel's instruction and I write down that I did.",
  ], { requires: G.pikeHold }),
  q("pike", "Benjamin", "pike_men", "Who were the men watching Benjamin Sayer's house?", [
    "No idea. Arlington's full of SUVs.",
  ], {
    requires: G.pikeMenAsked,
    variants: [{ requires: G.pikeExceeded, reply: ["Men I engaged, on a lawful assignment. If they went past what they were told, they exceeded instructions.", "That's on them."] }],
  }),
  q("pike", "Benjamin", "pike_tahoe", "Your firm's Tahoe was parked outside Benjamin Sayer's house.", [
    "It's a company vehicle. Several people drive it. I don't log every place it parks.",
  ], { requires: ev("E021") }),
  q("pike", "Benjamin", "pike_texts", "You texted your contractors to recover the package, 'whatever it takes.'", ["I want my lawyer."], { requires: ev("E020") }),
  q("pike", "Benjamin", "pike_whiteboard", "What does your whiteboard mean?", [
    "Planning notes. A drive and a book were company property. Recovering them was the job.",
    "Every investigator in this town has a board like that. Including you.",
  ], { requires: ev("E022") }),
  q("pike", "The server", "pike_wipe", "Your admin account deleted the executive volume on December 23.", [
    "Decommissioning, per the restructuring. I had the access because the company gave it to me.",
  ], { requires: ev("E040") }),
  q("pike", "The vendor", "pike_shredder", "Why did your firm pay Patuxent?", [
    "We booked the vendor and billed the company. Holiday week, after hours, rush terms. That costs.",
  ], { requires: ev("E018") }),
  q("pike", "The fire", "pike_fire", "What caused the fire?", [
    "The fire marshal will tell you. I'm not going to guess about a fire.",
  ]),
  q("pike", "Blackwood", "pike_pittsburgh", "Why were you reporting on Blackwood?", [
    "Due diligence. A company under investigation wants to know who's investigating it.",
    "Nothing in that file is anything you didn't do in public.",
  ], { requires: ev("E055") }),
  q("pike", "Meridian", "pike_note", "Your orders came in a note signed 'A.'", [
    "Paper in somebody else's box isn't my paper.",
    "My lawyer will read it before I say a word about it.",
  ], { requires: ev("E059") }),
  q("pike", "Meridian", "pike_chair", "Who is the Chair you reported to?", [
    "My client is the company. The company tells me who to report to.",
    "I'm not going to help you with names.",
  ], { requires: G.pikeChair }),
  q("pike", "Benjamin", "pike_glenmore", "How did your men get the apartment's door code?", [
    "I don't know what my men knew or how they knew it.",
  ], { requires: ev("E023") }),

  // =====================================================================
  // Elena Marchetti: with her defense lawyer
  // =====================================================================
  q("marchetti", "The meeting", "marchetti_terms", "What are the terms of this meeting?", [
    "Her lawyer: 'No questions about the New York charges. On Meridian's records and the events of December 21, she'll answer if I let her.'",
    "I'm not here to make anyone's case for them. I'm here to make sure it isn't made on me.",
  ]),
  q("marchetti", "The Chair", "marchetti_chair", "Who is 'the Chair'?", [
    "Everyone who mattered knew who signed for the Chair. Nobody said it.",
    "Her lawyer: 'And my client won't be the first to say it today.'",
  ]),
  q("marchetti", "December 21", "marchetti_dec21", "What happened on December 21?", [
    "The note came by courier at 9:10 that morning. I forwarded it to Ben at 11:40, as I was told to: 'Per the Chair. Please schedule.'",
    "At 11:55 I wrote to my own file that it conflicted with the U.S. Attorney's hold. I did not countersign the new schedule. I want that understood.",
  ], { effects: [tl("11:40 AM (Fri 12/21)", "Elena Marchetti forwards the Chair's instruction to Benjamin: 'B., per the Chair. Please schedule. E.M.'", "Elena Marchetti")] }),
  q("marchetti", "December 21", "marchetti_file", "What did you keep, and what can you prove?", [
    "My lawyer has it. The note as I received it, my forward to Ben and my note to file.",
    "Her lawyer slides a folder across the desk: 'Produced voluntarily. My client's statement is clipped to the front.'",
  ], { requires: G.re05, reveals: "Elena Marchetti's lawyer produced her preservation file: the December 21 note, her forward to Benjamin and her note to file.", effects: [{ giveEvidence: "E045" }] }),
  q("marchetti", "After her arrest", "marchetti_cutoff", "What happened after your arrest?", [
    "Dr. Lockhart's office stopped taking my calls. Not Pryor's office. Hers.",
    "Then Mr. Pike took the matter over. Nobody consulted me.",
  ], { reveals: "Elena Marchetti says that after her arrest Dr. Lockhart's office stopped taking her calls and Pike took the matter over." }),
  q("marchetti", "People", "marchetti_pike", "What do you know about Conrad Pike?", [
    "S-6. Security. The kind of man you call when a problem needs two men and a car, not a brief.",
    "I never instructed him. Not once.",
  ], { requires: G.pikeKnown }),
  q("marchetti", "Ogden", "marchetti_ogden", "What did Dr. Lockhart want done about Nathaniel Ogden's research?", [
    "She told me on the telephone to have it dealt with. 'At any cost.' Those were her words.",
    "Her lawyer: 'My client will say that under oath, with an agreement.'",
  ], { reveals: "Elena Marchetti claims Dr. Lockhart told her by telephone to have Nathaniel Ogden's research dealt with 'at any cost.'" }),
  q("marchetti", "After her arrest", "marchetti_deal", "Are you cooperating with the government?", [
    "I'm a defendant in New York. My lawyer is talking to the U.S. Attorney here. I'd be lying if I said I wasn't afraid of being next.",
    "Her lawyer: 'That's enough on that.'",
  ]),
  q("marchetti", "December 21", "marchetti_hold", "Did you know the legal hold covered the EX series?", [
    "It came to me on November 26, as Meridian's outside counsel, and I sent it to Ben the same day.",
    "He applied it to everything, including the EX series. Correctly.",
  ]),
  q("marchetti", "The Chair", "marchetti_c5", "What does C-5 mean?", [
    "Her lawyer: 'Don't answer that.'",
    "I'll let whatever card you have speak for itself.",
  ], { variants: [{ requires: ev("E038"), reply: ["Her lawyer leans in. She waves him off.", "Yes. C-5 was mine. Counsel. I drafted what I was instructed to draft."] }] }),
  q("marchetti", "The Chair", "marchetti_structure", "How did the ownership structure work?", [
    "Arm's length on paper. The foundation, the trust and the company, each with its own signers. It's what careful people do with money.",
    "I drafted what I was instructed to draft. Whose instruction is a question for a proffer.",
  ]),
  q("marchetti", "People", "marchetti_benjamin", "What do you think of Benjamin Sayer?", [
    "Ben was the most honest man in that building. That was always going to be a problem for someone.",
  ]),

  // =====================================================================
  // Adrian Holt: recorded video, with counsel
  // =====================================================================
  q("holt", "Approvals", "holt_approvals", "Who approved your programs?", [
    "They came back on a form. You asked; the form came back approved or it didn't. An EX-7, if you want the number.",
    "His lawyer: 'He's answered that.'",
  ], { requires: G.holtNoRegister }),
  q("holt", "Approvals", "holt_yellow", "Do you still have your copy of the Carroway authorization?", [
    "His lawyer opens a folder: 'My client kept his authority, as anyone would.'",
    "My yellow copy of the FY2018 Carroway form. Approved A-1, January 8. I never knew whose hand wrote that. I assumed it was older money than mine.",
  ], { requires: ev("E031"), reveals: "Adrian Holt's lawyer produced his yellow copy of EX-2018-007, approved A-1.", effects: [{ giveEvidence: "E046" }] }),
  q("holt", "Approvals", "holt_a1", "Who is A-1?", [
    "I never knew who signed A-1. I assumed there was money behind it older than mine.",
    "In my world you don't ask who signs. You ask whether the signature clears.",
  ], { reveals: "Holt says he never knew who signed A-1." }),
  q("holt", "Carroway", "holt_keller", "What happened to Martin Keller?", [
    "I've said what I'm going to say about Carroway. My lawyer has the transcript.",
    "His lawyer: 'Next question.'",
  ]),
  q("holt", "Approvals", "holt_code", "Who did you answer to?", [
    "F-2 was mine. Above me there was a code. Above the code I didn't ask, and nobody offered.",
  ]),
  q("holt", "His position", "holt_deal", "Are you cooperating?", [
    "His lawyer: 'My client's position will be communicated to the U.S. Attorney, not to a private investigator.'",
    "I'm a practical man. Draw your own conclusions.",
  ]),
  q("holt", "People", "holt_lockhart", "What about Dr. Lockhart?", [
    "The founding donor. A gracious woman. I'm told she sent you the copy that started all this.",
    "I've had a great deal of time to think about that.",
  ]),
  q("holt", "Approvals", "holt_budget", "Your 2018 reserved budget was $1,550,000.", [
    "Budgets came down with the approvals. I spent what I was given and accounted for it to the code above me. That's what finance does.",
  ], { requires: ev("E033") }),
  q("holt", "People", "holt_pike", "Do you know Conrad Pike?", [
    "S-6. Security. I met him twice. He doesn't make small talk.",
  ], { requires: G.pikeKnown }),
  q("holt", "Carroway", "holt_leak", "Who leaked the Carroway invoice?", [
    "Someone who could reach the Records Center and wanted me gone. That's a short list I was never shown the top of.",
    "His lawyer: 'Speculation. We're done with that.'",
  ]),

  // =====================================================================
  // Julian Rourke: recorded video, with counsel; gives nothing
  // =====================================================================
  q("rourke", "His position", "rourke_talk", "Will you talk to me?", [
    "Not without a proffer agreement. You can tell the U.S. Attorney I said so.",
    "Ask the people who kept score.",
  ]),
  q("rourke", "His position", "rourke_index", "Your intelligence program was approved on an EX-7.", ["My lawyer will be speaking to the U.S. Attorney."], { requires: G.rourkeShown }),
  q("rourke", "Ellery", "rourke_ellery", "What happened to Jonathan Ellery?", ["His lawyer: 'No.'"]),
  q("rourke", "His position", "rourke_a1", "Who signed A-1?", ["You're asking a man in a jumpsuit to do your filing for you. No."]),
  q("rourke", "People", "rourke_lockhart", "What about Dr. Lockhart?", [
    "I don't discuss donors. I don't discuss anything.",
    "His lawyer: 'He means that.'",
  ]),

  // =====================================================================
  // Gideon Kane: recorded video, with counsel
  // =====================================================================
  q("kane", "Orders", "kane_orders", "Who gave you orders?", [
    "Nobody gave me orders. I ran a freight business. I had customers and I had contracts.",
  ], { reveals: "Gideon Kane says nobody gave him orders." }),
  q("kane", "Orders", "kane_harbor", "Your Harbor program was approved by A-1.", [
    "Pressure is not killing. I wanted a terminal that ran on time and a man who stopped asking about my containers.",
    "I never told anyone to kill that man. Write that down twice.",
  ], { requires: G.kaneShown, reveals: "Kane: 'Pressure is not killing. I never told anyone to kill that man.'" }),
  q("kane", "Baltimore", "kane_navarro", "What about Hector Navarro?", [
    "Fisk did what Fisk did. I've told my lawyer, and my lawyer's told everybody else.",
    "His lawyer: 'He won't go further.'",
  ]),
  q("kane", "Orders", "kane_meridian", "What was your arrangement with Meridian?", [
    "A security services agreement. Paper. Lawyers wrote it and lawyers can read it to you.",
  ]),
  q("kane", "Orders", "kane_a1", "Who is A-1?", ["Never heard of it."], { requires: G.kaneNoForm, reveals: "Kane says he has never heard of A-1." }),
  q("kane", "Orders", "kane_form", "Your own copy of the Harbor form says 'APPROVED A-1.'", [
    "A box on a form. I don't know who filled it in.",
    "I had a form that said yes. That's all a form ever does.",
  ], { requires: ev("E048") }),
  q("kane", "His position", "kane_deal", "Are you cooperating?", ["His lawyer: 'We're talking to the government. Not to you.'"]),

  // =====================================================================
  // Walter Ames: the accountant
  // =====================================================================
  q("ames", "About him", "ames_role", "What are you working on now?", [
    "Since Baltimore I've worked for the federal prosecutors, following the money from all of your cases into one set of books.",
    "I'm careful about what I tell you. Not because I don't trust you. Because a defense lawyer will ask.",
  ]),
  q("ames", "The trust file", "ames_trust", "What does the trust file show?", [
    "A Delaware statutory trust, 2009. On paper the trustee owns Meridian and Dr. Lockhart owns nothing. Article VII gives the trust protector the power to direct distributions, appoint the managers and direct the business.",
    "The trustee acts on her written direction and isn't required to ask why. Control, cleanly hidden.",
  ], { requires: G.ch4 }),
  q("ames", "The money", "ames_match", "Do the trust's distributions match the reserved budgets?", [
    "Four directions in 2018, $1,100,000 each, $4,400,000 in all. The 2018 reserved budgets total $4,400,000. To the dollar.",
    "I've done this for twenty years. Numbers don't match like that by accident.",
  ], { requires: ev("E033"), reveals: "Walter Ames: the four 2018 trust directions ($4,400,000) match the 2018 reserved budgets to the dollar." }),
  q("ames", "The money", "ames_control", "Does financial control prove criminal command?", [
    "No. Control is not a crime by itself. A trust can direct money to a company that does perfectly lawful things.",
    "What it shows is who could direct the money. Whether what was directed was criminal is what the other records are for.",
  ]),
  q("ames", "Terms", "ames_settlor", "What is a trust protector?", [
    "The person who set up the trust, or who speaks for the settlor, and keeps certain powers. Here the settlor and the representative are the same person.",
  ]),
  q("ames", "Earlier files", "ames_carroway", "Do you have your schedule of the Carroway onward payments?", [
    "My payment pattern schedule from the Carroway audit. I kept a copy; accountants always do.",
    "Here.",
  ], { requires: G.route("R01"), reveals: "Walter Ames provided his Meridian payment pattern schedule from the Carroway audit.", effects: [{ giveEvidence: "R01" }] }),
  q("ames", "Earlier files", "ames_freight", "How does the freight money connect to the finance network?", [
    "I traced it for the prosecutors after Baltimore: the intermediaries that paid the freight side, and where the money went next.",
    "Here's the network as I drew it.",
  ], { requires: G.route("R06"), reveals: "Walter Ames provided his tracing of the intermediary payment network.", effects: [{ giveEvidence: "R06" }] }),
  q("ames", "Meridian", "ames_pryor", "Who runs Meridian on paper?", [
    "Malcolm Pryor, the managing director. He's abroad and represented.",
  ]),

  // =====================================================================
  // Simon Wexler: Nathaniel Ogden's research, by telephone
  // =====================================================================
  q("wexler", "Nathaniel", "wexler_nathaniel", "What did Nathaniel think about the trust?", [
    "He thought the trust at the bottom was hers, but the paper stopped at the trustee's door.",
    "He said that the week before the gala. I think about it every day.",
  ]),
  q("wexler", "Nathaniel", "wexler_copies", "Do you still have Nathaniel's research?", [
    "Every working copy he kept, on the backup and in his binders. Detective Caruso has the originals.",
    "Ask me for what you need and I'll find it.",
  ]),
  q("wexler", "Nathaniel", "wexler_brandywine", "Did Nathaniel ever reach the trustee?", [
    "He called Brandywine in Wilmington twice. They told him the trustee acts on written direction and doesn't discuss its clients.",
    "He said it was the most honest thing anyone told him all year.",
  ]),
  q("wexler", "About him", "wexler_safe", "How are you holding up?", [
    "Not well. I jump when the phone rings. Detective Caruso says that's normal. I don't think it is.",
  ]),
  q("wexler", "Earlier files", "wexler_trustee", "Do you have Nathaniel's findings on the trustee's authority?", [
    "The foundation trustee authorization. Nathaniel's research copy.",
    "Here.",
  ], { requires: G.route("R13"), reveals: "Simon Wexler provided Nathaniel Ogden's copy of the Foundation Trustee Authorization.", effects: [{ giveEvidence: "R13" }] }),
  q("wexler", "Earlier files", "wexler_control", "Do you have the control agreement showing how control ran through intermediaries?", [
    "The corporate control agreement, his copy, with his notes in the margin.",
    "Here.",
  ], { requires: G.route("R14"), reveals: "Simon Wexler provided Nathaniel Ogden's copy of the Corporate Control Agreement.", effects: [{ giveEvidence: "R14" }] }),
  q("wexler", "Earlier files", "wexler_comparison", "Do you have Nathaniel's comparison of the exposed executives?", [
    "His comparison of the three men who went down this autumn, side by side. He started it the night Kane was arrested.",
    "Here.",
  ], { requires: G.route("R16"), reveals: "Simon Wexler provided Nathaniel Ogden's Executive Exposure Comparison.", effects: [{ giveEvidence: "R16" }] }),

  // =====================================================================
  // Det. Anthony Caruso: NYPD; no limit
  // =====================================================================
  q("caruso", "The Ogden case", "caruso_case", "Where does the Ogden case stand?", [
    "Gabriel Knox is charged with the murder of Nathaniel Ogden. That part's done.",
    "The rest of it is yours and the feds'.",
  ]),
  q("caruso", "The Ogden case", "caruso_knox", "What does Knox say about who sent him?", [
    "He says 'counsel' like it's a person's name. He means Marchetti. He says the job was to scare a man and take his papers, not kill him.",
    "I've heard 'it went wrong' from every man who ever meant it to go exactly how it went.",
  ]),
  q("caruso", "Earlier files", "caruso_briefcase", "Can I have the Lockhart correspondence from Ogden's briefcase?", [
    "The letters from the recovered briefcase. They're evidence in my case, but the DA signed off on a copy for yours.",
    "Here.",
  ], { requires: G.route("R15"), reveals: "Det. Caruso released a copy of the Evelyn Lockhart correspondence from the recovered briefcase.", effects: [{ giveEvidence: "R15" }] }),
  q("caruso", "People", "caruso_marchetti", "Where does Marchetti stand in your case?", [
    "Out on bail since Christmas Eve. The DA has her for New York and your feds want her for everything else.",
    "Her lawyer is shopping for the best deal in two cities.",
  ]),
  q("caruso", "Long Island City", "caruso_storage", "What's happening at the Long Island City office?", [
    "The super, Vito Scarpa, called the precinct this morning. Men and boxes went up to the fourth floor overnight, and there's a shredding truck booked for Monday.",
    "We're holding the floor for the FBI. Nobody's opened a carton. That's for you and Quinlan.",
  ], { requires: G.re11 }),
  q("caruso", "People", "caruso_foundation", "Can you get us into the foundation?", [
    "The FBI has a subpoena on the foundation and I have a guest pass. Dr. Lockhart's people are very polite about it.",
    "Polite people with good lawyers. Watch your step on Fifth Avenue.",
  ], { requires: G.ch5 }),
  q("caruso", "The Ogden case", "caruso_again", "Anything new on your side?", ["Nothing new on my side. Call me when something moves."], {
    repeatable: true,
    variants: [{ requires: G.re11, reply: ["We're still holding the Long Island City floor. Nobody in or out but you and the FBI."] }],
  }),

  // =====================================================================
  // Benjamin Sayer: after RE08, with counsel
  // =====================================================================
  q("sayer", "His account", "sayer_account", "Will you give me your account?", [
    "Ms. Chen and I have prepared it. It's sworn. I kept the executive's records. I was never one of them.",
    "Here's the statement. I'd ask you to read it to the end before you decide what I am.",
  ], {
    reveals: "Benjamin Sayer handed over his sworn statement, taken at the FBI Washington Field Office with counsel present.",
    effects: [{ giveEvidence: "E028" }, tl("7:40 PM (Sat 12/29)", "Benjamin Sayer gives his sworn statement at the FBI Washington Field Office, Irene Chen present.", "Benjamin Sayer")],
  }),
  q("sayer", "The register", "sayer_register", "How did the register work?", [
    "The Executive Authorization Register. Number, date, matter, the code that asked, the code that approved, and the digest of the scan.",
    "Four hundred and twelve entries, from April 6, 2009 to the 21st of this month.",
  ]),
  q("sayer", "The register", "sayer_ex7", "What is an EX-7?", [
    "A two-part carbon form. The requester filled it in and signed; it came to me sealed, I sent it to the approving code, and it came back signed 'APPROVED' with the code and the date.",
    "The white original went to Bay C. The yellow copy went back to the requester as his authority, to be returned when the matter closed. Most never returned them.",
  ]),
  q("sayer", "The register", "sayer_codes", "What were the executive codes?", [
    "A-1, the Chair. Then the operating codes: F-2 finance, I-3 intelligence, L-4 logistics, C-5 counsel, S-6 security. I held no code. I kept the book.",
    "Each code had a card with a name and a specimen signature. The cards were in Bay C, and on my drive.",
  ]),
  q("sayer", "The register", "sayer_specimen", "Who signed the A-1 specimen card?", [
    "I watched it signed twice, at 1140 Fifth Avenue: April 6, 2009, and March 8, 2016. Dr. Lockhart signed it in front of me both times.",
    "That's what I saw. I never saw her sign a reserved matter. What the card means is for the records to show.",
  ], { requires: G.ch4, reveals: "Benjamin says he watched Dr. Lockhart sign the A-1 specimen card at 1140 Fifth Avenue in 2009 and 2016, and never saw her sign a reserved matter." }),
  q("sayer", "The register", "sayer_a_notes", "What were the A notes?", [
    "The Chair's instructions. Typed on plain paper, signed 'A.' in ink, sealed, carried by courier. I logged a duplicate in the EX-CORR series and sent the original on.",
    "Operators never contacted the Chair directly. That was the rule.",
  ]),
  q("sayer", "The register", "sayer_architect", "Who is the Architect?", [
    "The Chair signed notes 'A.' Operators knew the Chair only as the Architect. The notes came sealed by courier from the Foundation's address, and I logged each one the day it arrived.",
    "In October I began an index: every note, and where each one was acted on. I can't tell you what anyone meant. I can show you where it happened. Here.",
  ], { reveals: "Benjamin handed over his index of every 'A.' note he logged and where each was acted on.", effects: [{ giveEvidence: "E050" }] }),
  q("sayer", "The archive", "sayer_digests", "How can you prove your copy is genuine?", [
    "Every scan has a digest, a fingerprint. Every Friday I wrote that week's digests in a bound ledger, in ink, in my own hand. A system can be changed. A book I wrote in 2014 can't be.",
    "Compare my ledger, the drive and any backup you can find. If they agree, the records are what they were the day they were filed.",
  ]),
  q("sayer", "The archive", "sayer_exports", "Why did you copy the executive volume?", [
    "In the autumn of 2013 I logged a form for the surveillance of a congressional staffer, and I didn't want to be the only record of it.",
    "If they were going to be kept, someone honest had to keep them. From January 2014, every Friday, I exported the volume to one encrypted drive and wrote the digests by hand.",
  ]),
  q("sayer", "The leaks", "sayer_october", "When did you understand what the leaks were?", [
    "On October 4 a note came, signed 'A.': approve Claire Donovan's pulls without query, log them as ordinary. I knew Claire. When I saw which records were leaving, and that the instruction came from A-1, I understood what was being done.",
    "I did nothing then. I am not proud of that.",
  ], { effects: [tl("Thu 10/4", "A note signed 'A.' tells the Records Administrator to approve Claire Donovan's pulls without query.", "Benjamin Sayer")] }),
  q("sayer", "December", "sayer_dec21", "What happened on December 21?", [
    "Ms. Marchetti forwarded me a note from the Chair at 11:40: lift the hold, clear the Center, end the EX series. 'Per the Chair. Please schedule.'",
    "I wrote back at 3:30 that I would not destroy records under a legal hold, and attached my resignation. I ran the last export at 3:52, resigned at 3:55 and walked out with the drive and the ledger.",
  ], { effects: [tl("3:55 PM (Fri 12/21)", "Benjamin Sayer resigns after refusing in writing to destroy records under the hold; he leaves with the drive and the ledger.", "Benjamin Sayer")] }),
  q("sayer", "December", "sayer_fled", "Why did you run?", [
    "Because I was watched. A gray car with two men, Sunday night, Christmas Eve, Christmas night. Calls with nobody on the line.",
    "I was not taken. I want that written down. I left on my own feet, through the alley, because someone was always going to say I ran because I stole.",
  ]),
  q("sayer", "December", "sayer_route", "How did you get to Fulton County?", [
    "A friend booked me a flat in Silver Spring. That night a car sat outside, so I left at half past one by the garage ramp, took the early bus to Frederick and a cab up to Fulton County.",
    "I leased the tenant house in November. I chose the route a long time ago. I'd hoped never to use it.",
  ]),
  q("sayer", "December", "sayer_siege", "What happened at the tenant house?", [
    "Saturday at eight I saw the truck in the lane. I pushed the dresser against the back door, put the drive and the ledger in the root cellar and sat on the steps above them.",
    "Someone tried the back door at a quarter past nine. Then I waited for whoever came next.",
  ]),
  q("sayer", "The archive", "sayer_drive", "What's on the drive?", [
    "Everything I kept, encrypted. It stays sealed until it's at an independent laboratory, with an FBI examiner and Ms. Chen in the room, on the record.",
    "Then I'll give the passphrase. Not before. Ms. Chen agrees.",
  ], { requires: G.driveElsewhere }),
  q("sayer", "The archive", "sayer_passphrase", "Will you give the passphrase to unlock the drive?", [
    "Ms. Chen nods. All right. The examiner has the drive on the write blocker.",
    "I'll say it once, for the record.",
  ], {
    requires: G.passphrase,
    reveals: "Benjamin gave the passphrase to his drive at the Solvang laboratory, on the record, with Irene Chen and an FBI examiner present. Imaging has begun.",
    effects: [{ setFlag: "passphrase_given" }, { startLab: "imaging" }, tl("9:00 PM (Sat 12/29)", "At the Solvang Document Laboratory, Benjamin gives the passphrase with counsel present; imaging begins.", "Solvang laboratory")],
  }),
  q("sayer", "His account", "sayer_limits", "Can your account be trusted?", [
    "I can tell you what came through my hands. I can't tell you what anyone meant.",
    "Don't take my word for the rest. Take the ledger's, and the backup's, and the paper's.",
  ]),
  q("sayer", "People", "sayer_marchetti", "What was Elena Marchetti's part?", [
    "C-5, counsel. Structures, filings, the hold. On the 21st she forwarded the Chair's note and asked me to schedule it.",
    "I think she knew what it was. I think she sent it anyway.",
  ]),
  q("sayer", "People", "sayer_pike", "What do you know about Conrad Pike?", [
    "S-6, from November 2016. He left a message on my machine on the 23rd about company property, in a voice that wanted me to know he knew where the machine was.",
  ]),
  q("sayer", "Earlier files", "sayer_clients", "Do you have the shared client register, the clients common to the cases?", [
    "The shared client reference. I kept a printed copy in my satchel with the ledger.",
    "Ms. Chen, may I? Here.",
  ], { requires: G.route("R05"), reveals: "Benjamin provided the Shared Meridian Client Reference from his archive.", effects: [{ giveEvidence: "R05" }] }),
  q("sayer", "Earlier files", "sayer_checkout", "Do you have the checkout log showing who pulled the leaked originals?", [
    "The checkout log. Every pull Claire made, with my initials approving it. I printed it in November because I wanted a record of what I'd done.",
    "Here.",
  ], { requires: G.route("R07"), reveals: "Benjamin provided the archive checkout log of Claire Donovan's pulls.", effects: [{ giveEvidence: "R07" }] }),
  q("sayer", "Earlier files", "sayer_upward", "Do you have the authorization record that pointed above the operators?", [
    "The one that points up. I kept the original, not a copy. It was never going to be released, so I made sure it was kept.",
    "Here.",
  ], { requires: G.route("R12"), reveals: "Benjamin provided the original Unidentified Authorization Record from his archive.", effects: [{ giveEvidence: "R12" }] }),

  // =====================================================================
  // Dr. Evelyn Lockhart: telephone from chapter 2, in person later
  // =====================================================================
  q("lockhart", "The foundation", "lockhart_restructuring", "Why is the foundation restructuring?", [
    "Prudence. Ms. Marchetti was arrested on the 22nd; she was counsel to the foundation and to the company. A board that didn't reorganize after that would be negligent.",
    "We announced it publicly, at ten in the morning, which is rather the opposite of hiding.",
  ]),
  q("lockhart", "Meridian", "lockhart_meridian", "What is your connection to Meridian Advisory Group?", [
    "I founded it in 2007, a small consulting firm with good intentions. In 2009 I stepped out of every role.",
    "Malcolm Pryor runs it, and has for years.",
  ], { reveals: "Dr. Lockhart says she stepped out of every role at Meridian in 2009." }),
  q("lockhart", "Meridian", "lockhart_trust", "What is the Cardinal Point Trust?", [
    "My family trust. It's a passive investor; it owns the company through the usual layers, and a trustee in Wilmington administers it.",
    "I don't run anything.",
  ], { requires: G.trustBefore, reveals: "Dr. Lockhart calls the Cardinal Point Trust 'a passive investor.'" }),
  q("lockhart", "Meridian", "lockhart_settlor", "You are the settlor of the trust, with reserved powers.", [
    "I'm the settlor, and the trust protector. Settlors sign documents; trustees act on them.",
    "Trusts are not crimes.",
  ], { requires: ev("E043") }),
  q("lockhart", "People", "lockhart_sayer", "Do you know Benjamin Sayer?", [
    "Barely. A records man at the company, I believe, who I'm told took company property when he left.",
    "I hope he's well. I hope the property is returned.",
  ]),
  q("lockhart", "People", "lockhart_pike", "Do you know Conrad Pike?", [
    "The company's security consultant. I've met him, as one meets the people who check the locks.",
  ], { requires: G.pikeKnown, reveals: "Dr. Lockhart says she knows Pike only as 'the company's security consultant.'" }),
  q("lockhart", "The foundation", "lockhart_clearwater", "Tell me about your support for Clearwater.", [
    "I fund the Clearwater Accountability Initiative, and proudly. Accountability is not a fashionable cause.",
    "What its program did was its own work. I don't direct my grantees.",
  ], { reveals: "Dr. Lockhart says Clearwater's program 'was its own work.'" }),
  q("lockhart", "The foundation", "lockhart_envelope", "Tell me about the envelope you sent Blackwood in the Keller case.", [
    "It reached my office with no name and no letter. A copied invoice. I didn't know what to make of it, and then I read about Mr. Keller, and I sent it to you.",
    "I've told this to everyone who's asked. It hasn't changed.",
  ], { reveals: "Dr. Lockhart repeats that the copied invoice reached her office with no name and no letter." }),
  q("lockhart", "Meridian", "lockhart_a1", "What is A-1?", ["I don't know what that is."], { requires: G.beforeD16, reveals: "Dr. Lockhart says she doesn't know what A-1 is." }),
  q("lockhart", "Meridian", "lockhart_identity", "The register's specimen card names you as A-1.", [
    "Codes on a form are not a person.",
    "A card with my name typed on it is a card. Anyone can type.",
  ], { requires: G.d16 }),
  q("lockhart", "Meridian", "lockhart_architect", "Who is the Architect?", [
    "It sounds like something from a thriller. I'm afraid I can't help you.",
  ], { variants: [{ requires: G.d16, reply: ["A word in a company's protocol is not a person either. I'd be careful whom you hang it on."] }] }),
  q("lockhart", "Meridian", "lockhart_fire", "What do you know about the fire at Chantilly?", [
    "I read about it. A dreadful thing, and a blessing nobody was hurt.",
    "The company's insurers and the fire marshal will sort it out.",
  ]),
  q("lockhart", "People", "lockhart_donovan", "Have you met Claire Donovan?", [
    "Once, at a Clearwater breakfast in October. A brave young woman. I thanked her for her courage, and I meant it.",
  ]),
  q("lockhart", "People", "lockhart_marchetti", "What is your relationship with Elena Marchetti?", [
    "Elena was the foundation's outside counsel for many years. I haven't spoken to her since her arrest, as I understand her bail requires.",
    "I'm very sorry for her family.",
  ]),
  q("lockhart", "People", "lockhart_operators", "What about Holt, Rourke and Kane?", [
    "Men I'm told worked for a company I left a long time ago. You put them where they are.",
    "The courts will deal with them.",
  ]),
  q("lockhart", "Meridian", "lockhart_directions", "You signed the 2018 directions to the trustee.", [
    "I signed directions to my trustee, yes. That's what a trust protector does.",
    "What a company does with a distribution is the company's business.",
  ], { requires: ev("E033") }),
  q("lockhart", "The foundation", "lockhart_courier", "Your courier account carried notes to Castell and Marchetti.", [
    "My office sends a great deal by courier: grant letters, board papers, birthday cards.",
    "I don't read waybills.",
  ], { requires: ev("E042") }),
  q("lockhart", "People", "lockhart_calls", "You called Conrad Pike on December 22, 26 and 28.", [
    "After Ms. Marchetti's arrest I wanted to know the company's records and property were safe. I asked the company's security consultant.",
    "That is what one asks.",
  ], { requires: ev("E042") }),
  q("lockhart", "Meridian", "lockhart_signature", "The laboratory compared your signature with the A-1 approvals.", [
    "Your examiner says 'support,' I'm told. Not certainty.",
    "I've signed a great many things in thirty years.",
  ], { requires: ev("E041") }),
  q("lockhart", "Meridian", "lockhart_command", "The register shows A-1 approved every reserved matter.", [
    "You've built a very tidy chart. I'd be careful with tidy charts; juries distrust them.",
    "I've answered your questions about my trust and my foundation. I'm not going to answer for a register I've never seen.",
  ], { requires: G.d21 }),
  q("lockhart", "The interview", "lockhart_confess", "Admit that you are the Architect.", [
    "You have a theory and a thief's hard drive. I have forty years of charity and no criminal record.",
    "Charge me or let me go.",
  ], { requires: G.re12 }),
];

const r = (characterId: string, evidenceId: string, reply: string[], extra: Partial<EvidenceReaction> = {}): EvidenceReaction => ({
  characterId,
  evidenceId,
  reply,
  ...extra,
});

export const reactions: EvidenceReaction[] = [
  // Quinlan
  r("quinlan", "E001", ["He wrote to you, not to us. A man who chooses his reader that carefully chose his page carefully too."]),
  r("quinlan", "E002", ["Three entries, one level of approval. He's telling you where to look without saying a name."]),
  r("quinlan", "E011", ["'Incendiary.' And the one sprinkler zone that mattered was out. That's the line in the report I'll be reading to a grand jury."]),
  r("quinlan", "E013", ["'Lifted per Counsel.' Counsel can't lift a federal hold. Nobody at that company can."]),
  r("quinlan", "E015", ["A schedule signed for a vacant office with the hold clause missing. Somebody wanted a piece of paper to stand behind."]),
  r("quinlan", "E020", ["'Principal says recover.' I want to know who the principal is as much as you do. The texts don't say."]),
  r("quinlan", "E026", ["A pry bar at the back door and a truck across the lane. That's not a lawyer's letter."]),
  r("quinlan", "E029", ["Sealed in front of his counsel. Good. Nobody touches it until the laboratory."]),
  r("quinlan", "E030", ["'It does not, by itself, establish the truth of any statement.' Good examiner. That's your job, not hers."]),
  r("quinlan", "E057", ["Read the limits paragraph out loud before you write anything. It's the part a defense lawyer reads first."]),
  r("quinlan", "E059", ["Typed, signed 'A.', December 22. Kept back in a box marked for a man who'd already resigned."]),
  // Bennett
  r("bennett", "E005", ["Gray Tahoe, Virginia, ends in 7731. Ask me to run it."]),
  r("bennett", "E006", ["Phone bills are honest. People aren't. Ask me about any number on there."]),
  r("bennett", "E010", ["'You will find it the way I would have: from the records.' He's daring you. Read his phone bill again."]),
  r("bennett", "E001", ["Signed with a job title, not a name. Careful man. Careful men leave careful trails."]),
  r("bennett", "E021", ["Pike's own truck. On the 23rd, the 26th and the 28th. Men who use their own trucks aren't worried yet."]),
  // Donovan
  r("donovan", "E037", ["'Records to be copied by C. Donovan.' My name, typed, in September. Before Miriam ever asked me."], { reveals: "Claire sees her own name in the release program, dated before Castell first approached her." }),
  r("donovan", "E052", ["'Thank Claire; tell her nothing.' She thanked me in person, too."]),
  r("donovan", "E056", ["December 1. 'Not now, not ever.' Those were the pages that pointed up, and they gave them back to me."]),
  r("donovan", "E051", ["That's what I wrote. Every word."]),
  r("donovan", "E002", ["The register. I never saw a page of it. I saw its numbers."]),
  // Oduya
  r("oduya", "E004", ["'C.O. booked.' That's me. All right. Ask me about the booking. I'll tell you."]),
  r("oduya", "E001", ["That's Ben. 'Please do not call my house.' He wrote like that in emails about server patches. All right. Ask me."]),
  r("oduya", "E006", ["My number, Wednesday morning, 9:31. I'm a bad liar. Ask me about the booking."]),
  r("oduya", "E022", ["My name on his board. 'ODUYA card.' He knew how Ben would ask for help before Ben did."]),
  r("oduya", "E040", ["Ben every Friday for five years, and then cpike_admin on a Sunday night. That's the whole story of that system."]),
  r("oduya", "E023", ["Code 4471 at 2:10 in the morning. Gil read them that code. I read Gil the booking."]),
  // Corbett
  r("corbett", "E014", ["Revision 4. Section 6 is mine. 'No officer of the company may release a hold.' I wrote that sentence."]),
  r("corbett", "E015", ["'C. Pike for Records Administrator (vacant).' You can't sign for a vacancy. That's not how signatures work."]),
  r("corbett", "E013", ["'Lifted per Counsel.' A hold isn't counsel's to lift. It never was."]),
  // Chen
  r("chen", "E029", ["Sealed in front of me, item one. My note is clipped to the bag. It stays that way until Baltimore."]),
  r("chen", "E030", ["Two independent records that agree with his. That's a chain."]),
  r("chen", "E028", ["My client's statement. He read it four times before he signed it. He found two typos."]),
  // Pike
  r("pike", "E012", ["My card. Cards get lent."]),
  r("pike", "E016", ["Two men, no faces, no plate. You've got a picture of a door."]),
  r("pike", "E017", ["A lawful engagement, signed by the managing director. Read the scope."]),
  r("pike", "E020", ["I want my lawyer."], { reveals: "Shown the contractors' texts, Pike asked for his lawyer." }),
  r("pike", "E021", ["Company vehicle. Several people drive it."]),
  r("pike", "E022", ["Planning notes. Every security firm keeps a board."]),
  r("pike", "E026", ["If the men I engaged went past their instructions, that's on them."]),
  r("pike", "E027", ["Contractors. They'll have their own lawyers."]),
  r("pike", "E013", ["Counsel's instruction. It says so on the order."]),
  r("pike", "E015", ["Somebody had to sign for the office. I signed."]),
  r("pike", "E018", ["We paid the vendor and billed the company."]),
  r("pike", "E040", ["Decommissioning. Per the restructuring."]),
  r("pike", "E055", ["Due diligence. My client wanted to know who was looking at it."]),
  r("pike", "E059", ["Paper in somebody else's box isn't my paper."]),
  r("pike", "E011", ["Read the fire marshal's report. I did. It doesn't name anybody."]),
  // Marchetti
  r("marchetti", "E045", ["My file. Exactly as I kept it."]),
  r("marchetti", "E032", ["'The hold is an inconvenience, not a bar.' That's the note I forwarded. I wrote my objection to file within fifteen minutes."]),
  r("marchetti", "E035", ["'No physical harm.' That's what the form says. That isn't what I was told on the phone."], { reveals: "Shown EX-2018-071, Marchetti says the written 'no physical harm' isn't what she was told on the phone." }),
  r("marchetti", "E036", ["Her lawyer: 'My client won't comment on a document she didn't write.'"]),
  r("marchetti", "E038", ["Her lawyer reads it and sits back. 'We'll discuss this privately.'"]),
  r("marchetti", "E058", ["'Uncorroborated.' Of course it is. Nobody writes that kind of thing down."]),
  r("marchetti", "E059", ["'Legal is no longer available to you.' That's me. That's the day after they arrested me."]),
  // Holt
  r("holt", "E031", ["There's my code, approved like everything else. I'd like a moment with my lawyer."]),
  r("holt", "E046", ["My copy. I kept my authority, as anyone would."]),
  r("holt", "E033", ["My budget. To the dollar, I'm sure."]),
  r("holt", "E038", ["So that's who. His lawyer: 'My client has no comment.'"]),
  // Rourke
  r("rourke", "E034", ["My lawyer will be speaking to the U.S. Attorney."]),
  r("rourke", "E047", ["My lawyer will be speaking to the U.S. Attorney."]),
  // Kane
  r("kane", "E035", ["'Pressure only.' It says so right there. Pressure is not killing."]),
  r("kane", "E048", ["My copy. 'Pressure only.' I never told anyone to kill that man."]),
  // Ames
  r("ames", "E043", ["Article VII. There's the control, in the trustee's own file."]),
  r("ames", "E033", ["Four directions, $1,100,000 each. Put this next to the trust file and add."]),
  r("ames", "E041", ["A document examiner's 'strong support.' That's as strong as they ever say."]),
  // Wexler
  r("wexler", "E043", ["That's the file Nathaniel couldn't get. 'The trustee shall act on the written direction.' He'd have read that line out loud."]),
  r("wexler", "E036", ["'The trail ends at the trustee's door.' That's almost exactly what he said."]),
  // Caruso
  r("caruso", "E059", ["Typed, signed with one letter, December 22. Two days after my victim died. I'll want a copy."]),
  r("caruso", "E053", ["A plan for who goes down in what order. I've seen gangs do it. Never on letterhead."]),
  // Sayer
  r("sayer", "E002", ["My page. I printed it at 3:47 on the 21st, before I resigned. I chose it because every line on it was approved at the same level."]),
  r("sayer", "E007", ["My transmittal. I wrote it so that whoever found it would know I hadn't hidden anything from the hold. Only from the shredder."]),
  r("sayer", "E019", ["The corner of an EX-7. I filed that form. I can't tell you which one from that."]),
  r("sayer", "E029", ["My drive and my ledger. Thank you for not opening it."]),
  r("sayer", "E030", ["They match. I knew they would. It's still a relief to read it."]),
  r("sayer", "E040", ["cpike_admin, 9:14 on a Sunday night. Two days after I walked out."]),
  r("sayer", "E045", ["Her note to file. I didn't know she'd written one. I'm glad she did."]),
  r("sayer", "E059", ["'Hold for Administrator.' It was waiting for me. I'd already resigned."]),
  r("sayer", "E032", ["My duplicates. Each one logged the day it came."]),
  r("sayer", "E004", ["I wrote 'Do not write any of this down,' and then I wrote it down. I'm a records man."]),
  // Lockhart, before the final interview
  r("lockhart", "E043", ["My signature, on my trust. Settlors sign things."]),
  r("lockhart", "E033", ["Directions to my trustee. I'd expect to have signed those."]),
  r("lockhart", "E044", ["Our grants are public. We're proud of every one."]),
  r("lockhart", "E017", ["A company engagement letter. I've never seen it. There are a great many A's in the world."]),
  r("lockhart", "E002", ["A page with codes on it. I don't know what any of it means."]),
  r("lockhart", "E028", ["Mr. Sayer stole, and now he is buying his freedom with what he stole."]),
  r("lockhart", "E045", ["Ms. Marchetti is buying her freedom. I'd expect her to say a great deal."]),
  r("lockhart", "E051", ["Ms. Donovan copied documents for strangers. I admired her courage. I'm less sure now what it was."]),
  r("lockhart", "E030", ["A disgruntled man's homemade drive, examined at his own lawyer's insistence."]),
  r("lockhart", "E038", ["A card with my name typed on it. Anyone can type a name."]),
  r("lockhart", "E041", ["Support, not certainty. I've signed a great many things."]),
  r("lockhart", "E031", ["A register I've never seen, kept by a man who took it home."]),
  r("lockhart", "E057", ["A chart drawn from a thief's drive. Very tidy."]),
  r("lockhart", "E052", ["Notes on my stationery. My stationery is in a great many offices."]),
  r("lockhart", "E037", ["A form I've never seen, about a program I've never heard of."]),
  r("lockhart", "E042", ["My office sends a great deal by courier. I telephone a great many people."]),
  r("lockhart", "E059", ["I asked that company property be recovered and that an obsolete records center be cleared. Companies do that.", "If Mr. Pike broke the law, Mr. Pike will answer."]),
  r("lockhart", "E053", ["A long pause. 'Where did you get these.'", "Then, controlled: 'I will say nothing further without my attorney reviewing each document.'"], { reveals: "Shown the Exposure Sequence Directive, Dr. Lockhart asked where it came from and said nothing further without her attorney." }),
  r("lockhart", "E054", ["A long pause. 'Where did you get these.'", "Then, controlled: 'I will say nothing further without my attorney reviewing each document.'"], { reveals: "Shown the Operator Risk Review, Dr. Lockhart asked where it came from and said nothing further without her attorney." }),
  // Lockhart, at 26 Federal Plaza (RE12)
  r("lockhart", "E038", ["A code on a card. Your examiner says 'support,' not 'certainty.' I signed a great many cards in my life."], { requires: G.re12 }),
  r("lockhart", "E041", ["A code on a card. Your examiner says 'support,' not 'certainty.' I signed a great many cards in my life."], { requires: G.re12 }),
  r("lockhart", "E031", ["Approvals on forms I am told are mine, kept by a man who stole them and is buying his freedom with them.", "Show a jury the forms. They are not me."], { requires: G.re12 }),
  r("lockhart", "E057", ["Approvals on forms I am told are mine, kept by a man who stole them and is buying his freedom with them.", "Show a jury the forms. They are not me."], { requires: G.re12 }),
  r("lockhart", "E052", ["I passed along what a nonprofit asked me to pass along. That the information was true is to my credit, surely."], { requires: G.re12 }),
  r("lockhart", "E037", ["I passed along what a nonprofit asked me to pass along. That the information was true is to my credit, surely."], { requires: G.re12 }),
];

export const contradictions: ContradictionDef[] = [
  {
    id: "X_PIKE_REVIEW_LOG",
    characterId: "pike",
    title: "Conrad Pike: reviewing security after the fire (access log)",
    text: "Conrad Pike says he was at the Records Center after the fire, reviewing security for the company. The access log shows his card, S6-0001, at the dock door at 6:11 PM and 10:38 PM on December 26 and at the Bay C cage at 10:58 PM, before the smoke alarm at 11:47 PM.",
    when: { all: [{ asked: "pike_records_center" }, ev("E012")] },
  },
  {
    id: "X_PIKE_REVIEW_CAMERA",
    characterId: "pike",
    title: "Conrad Pike: reviewing security after the fire (cameras)",
    text: "Conrad Pike says he was at the Records Center after the fire. The cameras show a dark SUV at the dock at 10:36 PM, two men entering with a duffel and a toolbox at 10:38 PM, the Bay C camera lost at 10:41 PM, the men leaving at 11:31 PM and haze inside the dock at 11:47 PM.",
    when: { all: [{ asked: "pike_records_center" }, ev("E016")] },
  },
  {
    id: "X_PIKE_LENT",
    characterId: "pike",
    title: "Conrad Pike: cards get lent",
    text: "Conrad Pike says his access card may have been lent to a contractor. His own message at 4:48 PM on December 26 reads: 'Tonight 2230. Trucks take 14/22/31. Bay C is ours, nobody near it after.'",
    when: { all: [{ asked: "pike_card" }, ev("E020")] },
  },
  {
    id: "X_PIKE_NEVER_NEAR",
    characterId: "pike",
    title: "Conrad Pike: never met Benjamin Sayer",
    text: "Conrad Pike says his only contact with Benjamin Sayer was one phone message about company property. His firm's dark gray Tahoe, UFK-7731, matches the SUV a neighbor saw outside Benjamin's house with two men in it on December 23, 24 and 25, and toll records put it on the road late on the 23rd, 26th and 28th.",
    when: { all: [{ asked: "pike_sayer" }, ev("E021")] },
  },
  {
    id: "X_PIKE_CLIENT",
    characterId: "pike",
    title: "Conrad Pike: my client is the company",
    text: "Conrad Pike says his client is the company. The whiteboard in his own office reads 'PKG = drive + ledger. PRIORITY.' and 'Report: CHAIR ONLY.'",
    when: { all: [{ asked: "pike_client" }, ev("E022")] },
  },
  {
    id: "X_PIKE_DISCREET_FARM",
    characterId: "pike",
    title: "Conrad Pike: located discreetly (the farm)",
    text: "Conrad Pike says Benjamin was only to be located discreetly so the company's lawyers could write to him. The trail camera shows two men closing on the tenant house at 6:48 AM, a man trying its back door with a pry bar at 9:15 AM and the SUV moved to block the lane at 11:30 AM.",
    when: { all: [{ asked: "pike_locate" }, ev("E026")] },
  },
  {
    id: "X_PIKE_DISCREET_TEXTS",
    characterId: "pike",
    title: "Conrad Pike: located discreetly (his texts)",
    text: "Conrad Pike says nobody was going to touch Benjamin. His messages read: 'Find him. The package matters more than he does.' 'Go. Principal says recover, no negotiating. Whatever it takes, no marks.' 'Wait him out. Nobody in or out.'",
    when: { all: [{ asked: "pike_locate" }, ev("E020")] },
  },
  {
    id: "X_PIKE_COUNSEL",
    characterId: "pike",
    title: "Conrad Pike: under counsel's instruction",
    text: "Conrad Pike says the December 26 disposal was a scheduled records action under counsel's instruction. The December 23 schedule revision is signed 'C. Pike for Records Administrator (vacant),' carries no counsel's signature, and leaves the legal hold clause off entirely.",
    when: { all: [{ asked: "pike_disposal" }, ev("E015")] },
  },
  {
    id: "X_ODUYA_CALLS",
    characterId: "oduya",
    title: "Caroline Oduya: hasn't heard from Benjamin (phone records)",
    text: "Caroline Oduya says she hasn't heard from Benjamin since he left Meridian. His caller ID shows ODUYA RECORDS at 9:31 AM on December 26, and his cell statement shows calls to her office on December 14 and December 21.",
    when: { all: [{ asked: "oduya_benjamin" }, ev("E006")] },
  },
  {
    id: "X_ODUYA_NOTES",
    characterId: "oduya",
    title: "Caroline Oduya: hasn't heard from Benjamin (his notes)",
    text: "Caroline Oduya says she hasn't heard from Benjamin. His travel notes read: 'Thu. S.S. (C.O. booked, to 1/3).'",
    when: { all: [{ asked: "oduya_benjamin" }, ev("E004")] },
  },
  {
    id: "X_LOCKHART_TRUST",
    characterId: "lockhart",
    title: "Dr. Lockhart: a passive investor",
    text: "Dr. Lockhart calls the Cardinal Point Trust a passive investor. Its instrument makes her the Trust Protector, with reserved powers to direct distributions, appoint and remove managers and 'direct the business of the trust's holdings,' and requires the trustee to act on her written direction without inquiry.",
    when: { all: [{ asked: "lockhart_trust" }, ev("E043")] },
  },
  {
    id: "X_LOCKHART_STEPPED_AWAY",
    characterId: "lockhart",
    title: "Dr. Lockhart: stepped out of every role in 2009",
    text: "Dr. Lockhart says she stepped out of every role at Meridian in 2009. Four Trust Protector directions in 2018, each signed 'E. R. Lockhart,' released $4,400,000 from the trust to Meridian's reserved programs account, matching the 2018 reserved budgets to the dollar.",
    when: { all: [{ asked: "lockhart_meridian" }, ev("E033")] },
  },
  {
    id: "X_LOCKHART_A1",
    characterId: "lockhart",
    title: "Dr. Lockhart: doesn't know what A-1 is",
    text: "Dr. Lockhart says she doesn't know what A-1 is. The executive specimen card for A-1 reads 'Chair. Name: Evelyn R. Lockhart,' with specimen signatures dated April 6, 2009 and March 8, 2016.",
    when: { all: [{ asked: "lockhart_a1" }, ev("E038")] },
  },
  {
    id: "X_LOCKHART_ENVELOPE",
    characterId: "lockhart",
    title: "Dr. Lockhart: the envelope came with no name",
    text: "Dr. Lockhart says the copied invoice in the Keller case reached her office with no name and no letter. A typed note to Miriam Castell on Lockhart Foundation paper, signed 'E.L.' and dated October 11, 2018, reads: 'The finance item, number 14-0412-117, to me at the Foundation first. I'll pass it on.'",
    when: { all: [{ asked: "lockhart_envelope" }, ev("E052")] },
  },
  {
    id: "X_LOCKHART_CLEARWATER",
    characterId: "lockhart",
    title: "Dr. Lockhart: Clearwater's program was its own work",
    text: "Dr. Lockhart says Clearwater's program was its own work and she does not direct her grantees. Four typed notes to Miriam Castell, signed 'E.L.' and carried by the foundation's own courier account, tell Castell what to release, where to send it and when to stop: 'Thank Claire; tell her nothing.'",
    when: { all: [{ asked: "lockhart_clearwater" }, ev("E052")] },
  },
  {
    id: "X_LOCKHART_PIKE",
    characterId: "lockhart",
    title: "Dr. Lockhart: Pike is the company's security consultant",
    text: "Dr. Lockhart says she knows Conrad Pike only as the company's security consultant. Her foundation phone and cell called Pike Risk Services on December 22 at 7:12 PM for 18 minutes, December 26 at 3:55 PM and December 28 at 9:40 AM.",
    when: { all: [{ asked: "lockhart_pike" }, ev("E042")] },
  },
  {
    id: "X_KANE_ORDERS",
    characterId: "kane",
    title: "Gideon Kane: nobody gave him orders",
    text: "Gideon Kane says nobody gave him orders. The Harbor program forms, EX-2016-031 and EX-2018-019, were requested by L-4 (G. Kane) and each approved by A-1.",
    when: { all: [{ asked: "kane_orders" }, ev("E035")] },
  },
  {
    id: "X_KANE_A1",
    characterId: "kane",
    title: "Gideon Kane: never heard of A-1",
    text: "Gideon Kane says he has never heard of A-1. His own yellow copy of EX-2018-019, seized from his safe at Riverside, reads 'APPROVED A-1' and is stamped 'REQUESTER'S COPY.'",
    when: { all: [{ asked: "kane_a1" }, ev("E048")] },
  },
  {
    id: "X_MARCHETTI_OGDEN",
    characterId: "marchetti",
    title: "Elena Marchetti: 'at any cost'",
    text: "Elena Marchetti says she was told by telephone to have Nathaniel Ogden's research dealt with 'at any cost.' The written authorization for her request, EX-2018-071 of December 17, reads: 'Ogden research: recover materials, persuade silence. No physical harm.'",
    when: { all: [{ asked: "marchetti_ogden" }, ev("E035")] },
  },
];

/*
 * Other ways a player might ask for each answer, in their own words. Used
 * only to match free-form questions; never shown.
 */
const KEYWORDS: Record<string, string> = {
  quinlan_case: "where does it stand status update progress what now what's going on overview",
  quinlan_welfare: "welfare check police officer arlington his house home inside searched packed photographs photos report what did they find",
  quinlan_neighbor: "neighbors neighbor next door canvass witness street dolores haverty saw anything suv gray car two men statement",
  quinlan_hold: "legal hold preservation letter preserve hold order u.s. attorney november 26 subpoena",
  quinlan_legal: "legal illegal law crime lawful restructuring restructure obstruction tampering allowed against the law theyre they're what they are up to",
  quinlan_video: "interview holt rourke kane video custody jail talk to the operators prisoners detention",
  quinlan_search: "search warrant headquarters hq k street meridian offices raid",
  quinlan_recover: "get him out rescue recover recovery send troopers police state police go in extract save him farm tenant house help him",
  quinlan_phones: "phones cell phones handsets contractors extraction cart analyze examine texts messages prepaid",
  quinlan_signatures: "compare signatures signature comparison handwriting examiner solvang a-1 approvals known signature",
  quinlan_chain: "certify chain of authority command chain reconstruction certified certification",
  quinlan_lab: "lab laboratory results back yet status anything back report",
  quinlan_rourke_safe: "rourke's safe rourke safe item fourteen intelligence exhibit yellow form seized seizure",
  quinlan_kane_safe: "kane's safe kane safe riverside item nine yellow form seized seizure",
  quinlan_castell: "castell miriam clearwater leaks leaked how were the leaks run her file cooperating notes release log",
  quinlan_witnesses: "witnesses hold up corroboration corroborated credible believable testimony summary",
  quinlan_index: "blackmail index compromising information index rourke case intelligence exhibits dirt leverage file",
  quinlan_briggs: "briggs russell pressured pressure baltimore intelligence link reference terminal",
  quinlan_architect: "architect is lockhart the architect is it her who is behind it",
  quinlan_pike: "conrad pike background who is pike pike risk services",
  quinlan_marchetti: "marchetti elena status bail arrested arrest deal",
  quinlan_contractors: "men detained arrested contractors sobczak dunleavy farm who were they",
  quinlan_benjamin: "benjamin sayer how is he doing okay condition where is he now",
  quinlan_fire: "fire arson burned burn blaze fire marshal what caused",
  quinlan_interview: "interview lockhart expect federal plaza confrontation voluntary",
  bennett_case: "what do you make of this your read what do you think thoughts",
  bennett_plate: "run plate license plate partial plate 7731 suv tahoe registration dmv owner vehicle trace owns owner owned whose",
  bennett_numbers: "phone records numbers calls who did he call run the numbers phone bill",
  bennett_717: "717 number pennsylvania who did he call fulton county farmer where did benjamin go lease burkholder area code",
  bennett_keller: "keller file envelope lockhart sent keller case first delivery referral note invoice sealed",
  bennett_old_files: "earlier records old cases previous files missing don't have lost records earlier cases",
  bennett_rolling: "rolling board series board help pin connect old cases",
  bennett_pike: "run conrad pike background check pike record history",
  bennett_sayer: "run benjamin sayer background check record history",
  bennett_oduya: "run caroline oduya background firm reston",
  bennett_lockhart: "dr lockhart records filings foundation background evelyn",
  bennett_trust: "meridian holdings trust delaware trust trustee brandywine who owns",
  bennett_patuxent: "patuxent secure destruction shredding company shredder vendor laurel",
  bennett_again: "anything new news updates heard anything",
  donovan_text: "text message threat threatened warning some records burn phone",
  donovan_part: "your part role leaks what did you do involvement account statement your side",
  donovan_copying: "copying how did you copy copy copies copied process pulled where did the copies go made after went took them",
  donovan_footer: "mag-rm footer stamp copier mark",
  donovan_castell: "miriam castell what did she say tell you clearwater",
  donovan_lockhart: "dr lockhart evelyn met meet ever met breakfast",
  donovan_benjamin: "benjamin sayer supervisor boss what was he like",
  donovan_ex: "ex series bay c ex numbered pages cover sheets",
  donovan_copies: "kept copies earlier records keep copy old files duplicates everything",
  donovan_courier: "courier statement capital courier account 20417 carried the leaks waybill delivery envelopes",
  donovan_register: "copy register record of what you copied log of copies list of copies what you copied",
  donovan_timeline: "timeline order exposed exposure sequence arrests order executives arrested arrest men wrote write down written",
  donovan_comparison: "comparison notes comparing disclosures compare notes",
  donovan_corbett: "retention rules legal holds who could explain compliance corbett",
  donovan_release: "release program chose selected what you copied chosen",
  donovan_safe: "safe okay are you all right protection scared",
  oduya_who: "your firm what do you do meridian client company work",
  oduya_benjamin: "heard from benjamin contact talked to ben spoken to him seen him",
  oduya_booking: "book booking booked stay place to stay apartment flat silver spring where did benjamin go where is he help him hide reservation glenmore",
  oduya_pretext: "anyone else ask call called asking about booking apartment code address billing who called",
  oduya_custodia: "custodia records system rms how does it work software",
  oduya_exvol: "exvol executive volume what is",
  oduya_exports: "exported export exports executive volume friday drive copied external device",
  oduya_digests: "digest digests hash fingerprint sha-256 md5 checksum",
  oduya_terminated: "contract terminated fired let go dropped termination",
  oduya_tape: "backup tape still have copy offsite november 30",
  oduya_backup: "restore backup tape audit log logs pull restore it access log modification log",
  oduya_pike: "conrad pike know pike",
  oduya_friend: "how do you know benjamin relationship friend ben",
  oduya_why: "why did you help him why help",
  oduya_corbett: "records rules who else understands retention compliance",
  corbett_who: "who are you what did you do your job compliance",
  corbett_call: "contacted called anyone contact you threatened confidentiality reminder",
  corbett_bayc: "bay c access compliance cage",
  corbett_ex: "ex series exist existed real",
  corbett_retention: "retention policy rules schedule how long kept disposal",
  corbett_hold: "legal hold what does a hold do lift hold release",
  corbett_schedule: "change schedule retention schedule signatures needed revise",
  corbett_altered: "december 23 revision revised schedule valid altered schedule pike signed",
  corbett_benjamin: "benjamin sayer what was he like",
  corbett_claire: "claire donovan know her",
  corbett_sequence: "missing document sequence gaps released missing documents numbers reconstruct reconstruction",
  chen_retained: "retained hired when did he hire you client",
  chen_where: "where is benjamin know where is he location",
  chen_authentication: "prove genuine authentic authentication real records prove it",
  chen_drive: "drive handled handle sealed laboratory examiner",
  chen_proffer: "proffer what does he want deal agreement immunity",
  chen_danger: "danger dangerous at risk afraid safe",
  chen_copy: "entitled allowed take copy theft stole stealing legal right",
  chen_passphrase: "passphrase password ready unlock decrypt",
  chen_why: "why you why did he choose you pick",
  pike_who: "who are you background yourself",
  pike_meridian: "what do you do for meridian work relationship",
  pike_records_center: "records center chantilly what were you doing there that night why were you there",
  pike_disposal: "disposal disposed shredding destroyed december 26 why records destroyed shred shredded records why",
  pike_card: "card access card badge s6-0001 dock bay c cage opened",
  pike_sayer: "benjamin sayer know met him contact",
  pike_assignment: "assignment job retained engaged hired to do task special assignment",
  pike_locate: "why looking for benjamin find him locate searching follow followed hunt after him send men after",
  pike_client: "client who hired you employer work for boss",
  pike_hold: "legal hold know about the hold aware",
  pike_men: "men watching house surveillance suv two men outside",
  pike_tahoe: "tahoe your vehicle truck suv parked outside his house car",
  pike_texts: "texts messages texted contractors whatever it takes package",
  pike_whiteboard: "whiteboard board notes office wall",
  pike_wipe: "deleted wiped executive volume cpike_admin admin account server",
  pike_shredder: "patuxent pay paid shredder invoice vendor",
  pike_fire: "fire caused cause arson burned",
  pike_pittsburgh: "reporting on blackwood pittsburgh file watching us monitoring reports",
  pike_note: "note signed a orders instructions letter",
  pike_chair: "chair who did you report to the chair",
  pike_glenmore: "apartment door code glenmore silver spring 4471 how did they know",
  marchetti_terms: "terms ground rules limits meeting conditions",
  marchetti_chair: "who is the chair chair identity",
  marchetti_dec21: "december 21 what happened instruction note forwarded 21st 21 friday",
  marchetti_file: "what did you keep prove proof file records documents preservation evidence what can you show",
  marchetti_cutoff: "after your arrest cut off calls stopped happened next",
  marchetti_pike: "conrad pike what do you know",
  marchetti_ogden: "ogden nathaniel research dealt with lockhart want at any cost",
  marchetti_deal: "cooperating deal cooperation government afraid",
  marchetti_hold: "legal hold covered ex series november 26",
  marchetti_c5: "c-5 code your code",
  marchetti_structure: "ownership structure how did it work trust foundation company arm's length",
  marchetti_benjamin: "benjamin sayer ben think of him",
  holt_approvals: "approved approve approval approvals who approved your programs signed off authorization",
  holt_yellow: "copy yellow copy authorization keep kept carroway form your copy still have",
  holt_a1: "a-1 who is a-1 signed a-1 code above you hand signature",
  holt_keller: "martin keller death killed what happened carroway",
  holt_code: "answer to report to boss above you superior f-2",
  holt_deal: "cooperating deal talk government",
  holt_lockhart: "dr lockhart evelyn",
  holt_budget: "budget reserved budget money 2018 1,550,000",
  holt_pike: "conrad pike know",
  holt_leak: "leaked leak invoice who leaked who exposed",
  rourke_talk: "talk will you talk cooperate answer",
  rourke_index: "intelligence program ex-7 approved authorization index",
  rourke_ellery: "jonathan ellery what happened",
  rourke_a1: "a-1 who signed who is code signature",
  rourke_lockhart: "dr lockhart evelyn",
  kane_orders: "orders who gave you orders boss told you instructions",
  kane_harbor: "harbor program approved a-1 pressure briggs authorization",
  kane_navarro: "hector navarro killed death what about",
  kane_meridian: "meridian arrangement agreement relationship",
  kane_a1: "a-1 who is heard of code mean",
  kane_form: "your copy form harbor form approved a-1 yellow",
  kane_deal: "cooperating deal talk government",
  ames_role: "working on now what are you doing job role",
  ames_trust: "trust file show trust document article vii what does the trust say",
  ames_match: "distributions match reserved budgets add up 4,400,000 trust money budget",
  ames_control: "financial control prove criminal command crime control prove",
  ames_settlor: "trust protector settlor what is",
  ames_carroway: "carroway money payment schedule intermediaries onward payments your schedule payment pattern",
  ames_freight: "freight money finance network connect connects intermediary network",
  ames_pryor: "who runs meridian managing director pryor on paper",
  wexler_nathaniel: "nathaniel trust think thought believe",
  wexler_copies: "research still have copies nathaniel's work files",
  wexler_brandywine: "trustee reach brandywine contact the trustee",
  wexler_safe: "holding up okay how are you",
  wexler_trustee: "trustee authority findings trustee authorization foundation trustee",
  wexler_control: "control agreement intermediaries corporate control how control was exercised",
  wexler_comparison: "comparison exposed executives compare executives",
  caruso_case: "ogden case status where stands knox charged",
  caruso_knox: "knox say who sent him counsel scare",
  caruso_briefcase: "briefcase letters correspondence lockhart letters recovered briefcase ogden's briefcase",
  caruso_marchetti: "marchetti stand case bail",
  caruso_storage: "long island city storage office boxes shredding truck super queens",
  caruso_foundation: "get into the foundation fifth avenue access",
  caruso_again: "anything new news updates",
  sayer_account: "account statement your story what happened from the start tell us everything sworn statement",
  sayer_register: "register how did it work authorization register ex-ar entries",
  sayer_ex7: "ex-7 form what is two-part yellow copy white authorization form forms how did work",
  sayer_codes: "codes executive codes f-2 i-3 l-4 c-5 s-6 a-1 what were",
  sayer_specimen: "specimen card signed a-1 card who signed signature card",
  sayer_a_notes: "a notes notes signed a instructions ex-corr",
  sayer_architect: "architect who is a the architect identity",
  sayer_digests: "prove genuine digests ledger custody ledger authentic real",
  sayer_exports: "why copy why did you copy keep copies exports why keep",
  sayer_october: "october understand leaks when did you know realize donovan pulls",
  sayer_dec21: "december 21 what happened resign resigned refused instruction 21st 21 friday last day",
  sayer_fled: "why run why did you run flee fled leave left hide disappear",
  sayer_route: "how did you get fulton county route bus cab frederick silver spring travel",
  sayer_siege: "tenant house farm what happened saturday truck barricade cellar",
  sayer_drive: "drive what's on the drive contents encrypted",
  sayer_passphrase: "passphrase password unlock decrypt open the drive code",
  sayer_limits: "trusted trust believe your account reliable",
  sayer_marchetti: "marchetti elena part role",
  sayer_pike: "conrad pike know about",
  sayer_clients: "shared client register clients common client reference",
  sayer_checkout: "checkout log who pulled leaked originals pulls check out",
  sayer_upward: "authorization record pointed above operators upward unidentified authorization",
  lockhart_restructuring: "restructuring restructure why reorganize reorganization announcement",
  lockhart_meridian: "meridian connection relationship founded role involvement malcolm pryor who runs runs it",
  lockhart_trust: "meridian holdings trust family trust what is the trust",
  lockhart_settlor: "settlor reserved powers representative trust powers",
  lockhart_sayer: "benjamin sayer know him",
  lockhart_pike: "conrad pike know how do you know",
  lockhart_clearwater: "clearwater support fund funding grant castell",
  lockhart_envelope: "envelope keller case invoice sent us copy send did you send",
  lockhart_a1: "a-1 what is a-1 code mean means stand for executive code",
  lockhart_identity: "specimen card names you a-1 you are a-1 identity register names",
  lockhart_architect: "architect who is the architect",
  lockhart_fire: "fire chantilly records center burned",
  lockhart_donovan: "claire donovan met meet",
  lockhart_marchetti: "elena marchetti relationship lawyer counsel",
  lockhart_operators: "holt rourke kane operators executives men",
  lockhart_directions: "directions trustee signed 2018 distributions",
  lockhart_courier: "courier account waybill notes castell marchetti capital courier 18850",
  lockhart_calls: "called pike phone calls december 22 26 28 telephone",
  lockhart_signature: "signature laboratory compared match handwriting",
  lockhart_command: "register approved every reserved matter command",
  lockhart_confess: "admit confess you are the architect truth guilty",
};
for (const qq of questions) if (KEYWORDS[qq.id]) qq.keywords = [KEYWORDS[qq.id]];

for (const c of characters) {
  c.knowledge = KNOWLEDGE[c.id];
  c.persona = PERSONA[c.id];
  c.patience = PATIENCE[c.id];
  if (UNLIMITED.includes(c.id)) c.questionLimit = null;
}
