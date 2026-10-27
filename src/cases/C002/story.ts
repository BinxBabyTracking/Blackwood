import type {
  CallDef,
  CaseDefinition,
  Condition,
  DeliveryDef,
  DocumentDef,
  LabDef,
  OutgoingCallDef,
  ReactiveEventDef,
  StatementDef,
} from "@/game/engine/types";
import { LAB_GLASSES_RECT, LAB_TYPEWRITER_RECT } from "./desk";

/*
 * C002 story content. Times follow docs/C002-timeline.md. Nothing in this
 * file names the culprit before the investigator has found him.
 */

export const intro: CaseDefinition["intro"] = [
  { heading: "Tuesday, October 11, 1988", text: "Wilshire Boulevard, eleventh floor. Eleven in the morning, and the coffee is already cold." },
  {
    text: "The woman across your desk hasn't taken off her coat. Ruth Kessler, a bookkeeper from Long Beach. Her younger sister Laura was taken from her boyfriend's house in Mariposa Bay early yesterday morning by a man in a mask. Or so the boyfriend says.",
  },
  {
    text: "'The police think Tom did something to her. They've had him in a room since yesterday afternoon. I know Tom. He didn't. But nobody is looking for Laura, and every hour that goes by...' She puts a check on the desk. 'Detective Bennett said you'd listen.'",
  },
  {
    text: "Clipped to the folder Bennett sent over this morning: 'Mariposa Bay isn't my town, but Walt Ferris lets me see his file. He likes the boyfriend for it. Maybe he's right. Read it and call me. F.B.'",
  },
];

export const timeline: CaseDefinition["timeline"] = [
  { time: "3:00 AM (Mon)", text: "Monday, October 10. Laura Kessler is taken from 418 Elm Street, Mariposa Bay, according to Tom Hale.", source: "Case file" },
  { time: "1:40 PM (Mon)", text: "Tom Hale reports the abduction to Mariposa Bay Police, more than ten hours later.", source: "Case file" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "Mariposa Bay Police file 88-10-0412: Kessler, Laura (copy)",
    dossier: [
      { label: "Case ID", value: "C002" },
      { label: "Case title", value: "A Short Trip" },
      { label: "Classification", value: "Missing person, reported kidnapping" },
      { label: "Location", value: "Mariposa Bay, California" },
      { label: "Year", value: "1988" },
      { label: "Missing", value: "Laura Kessler, 29" },
      { label: "Client", value: "Ruth Kessler, the missing woman's sister" },
      { label: "Police", value: "Sgt. Walter Ferris, Mariposa Bay Police" },
      { label: "Contact", value: "Det. Frank Bennett, LAPD, by telephone" },
    ],
    people: ["laura", "tom", "ruth", "ferris"],
    peopleHeading: "Persons named in the file",
    evidence: [],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "Summary (Sgt. Ferris)",
        spoken:
          "Mariposa Bay Police Department. File eighty-eight, ten, oh four one two. Summary, by Sergeant Walter Ferris. At one forty on Monday afternoon, October tenth, nineteen eighty-eight, Thomas Hale, thirty-one, of four eighteen Elm Street, reported that his girlfriend, Laura Kessler, twenty-nine, had been taken from his home by a masked intruder at about three that morning. Mister Hale states they were both tied up and drugged, and that a typed ransom letter was left in the kitchen. Miss Kessler has not been seen since.",
        body: "At 1340 hours Monday 10/10/88, Thomas Hale, 31, of 418 Elm Street, reported that his girlfriend Laura Kessler, 29, had been taken from his home by a masked intruder at approx. 0300. Hale states both were tied, blindfolded and made to drink a sedative, and that a typed ransom letter was left on the kitchen table. Miss Kessler has not been seen since.",
      },
      {
        heading: "Concerns (Sgt. Ferris)",
        spoken:
          "Concerns. There was no forced entry at any door or window. Mister Hale waited more than ten hours to call us. That morning he withdrew two thousand dollars in cash. His manner throughout has been flat and unemotional. A polygraph this morning was inconclusive. No ransom call has been received at the house. The investigation is focused on Mister Hale.",
        body: "No forced entry at any door or window. Report delayed more than ten hours. $2,000 cash withdrawn by Hale that morning. Flat, unemotional manner throughout. Polygraph this morning inconclusive. No ransom call received at the residence. Investigation focused on Hale.",
      },
      {
        heading: "The scene",
        spoken:
          "The scene. Four eighteen Elm Street is a one-story house with an attached garage. The bedroom has been photographed. The original ransom letter is held as evidence; a copy was left with Mister Hale. Mister Hale has been released and is at the house.",
        body: "418 Elm Street: one-story house, attached garage, side door from the garage to the yard. Bedroom photographed. Original ransom letter held as evidence; a copy left with Hale. Hale released and at the house.",
      },
      {
        heading: "Laura Kessler",
        spoken:
          "Laura Kessler. Twenty-nine. She teaches music at Mariposa Bay Junior High, and has been seeing Mister Hale for two years. Five feet five, brown hair. She was last seen wearing a nightshirt. Her purse, keys and car were all left at the house. Her sister, Ruth Kessler, lives in Long Beach.",
        body: "Laura Kessler, 29. Music teacher, Mariposa Bay Junior High. With Hale two years. 5'5\", brown hair. Last seen in a nightshirt. Purse, keys and car left at the residence. Next of kin: sister Ruth Kessler, Long Beach.",
      },
      {
        heading: "Note (Det. Bennett)",
        spoken:
          "A note from Detective Bennett. Ferris is a good cop who has made up his mind early. Two things in his own file bother me. The bedroom was photographed, but nobody bagged anything in it. And the boyfriend asked for his own blood test. Guilty men don't usually do that. The tapes of Ferris's interviews with Hale are on your desk. Call me any time. F. B.",
        body: "Ferris is a good cop who has made up his mind early. Two things in his own file bother me: the bedroom was photographed but nobody bagged anything in it, and the boyfriend asked for his own blood test. Guilty men don't usually do that. Tapes of Ferris's interviews with Hale are on your desk. Call me any time. F.B.",
      },
    ],
  },
];

const F = (text: string) => ({ speakerId: "ferris", speaker: "Sgt. Ferris", text });
const T = (text: string) => ({ speakerId: "tom", speaker: "Tom Hale", text });
const officer = "Sgt. Walter Ferris, Mariposa Bay Police";

/* Ferris's two recorded interviews with Tom Hale, Monday 10/10/88. */
export const statements: StatementDef[] = [
  {
    characterId: "tom",
    recordedAt: "Mon 10/10/88, 3:05 PM",
    officer,
    tape: "MBPD 88-10-0412 / Tape 1",
    audio: "rec.tom1",
    transcript: [
      F("Sergeant Ferris, Mariposa Bay Police, Monday the tenth, five past three. Mr. Hale, you say a man took Laura at three this morning. You called us at one forty. Walk me through those ten hours."),
      T("I was asleep until twenty to ten. He made us drink something. When I woke up I was still tied. Then I found the letter."),
      F("And the letter said don't call the police."),
      T("It said they'd know. It said they'd call at one. I did what it said."),
      F("You went to the bank."),
      T("I took out what I had. Two thousand. I thought if they called I'd have something to give them."),
      F("No sign of anybody breaking in, Mr. Hale. No call at one. Just you, and two thousand dollars in cash."),
      T("I know how it sounds. I want her found. Ask me anything you want."),
    ],
  },
  {
    characterId: "tom",
    recordedAt: "Mon 10/10/88, 9:40 PM",
    officer,
    tape: "MBPD 88-10-0412 / Tape 2",
    audio: "rec.tom2",
    transcript: [
      F("Second interview, nine forty. Mr. Hale, you went to County General this evening and asked for a blood test. Whose idea was that?"),
      T("Mine. I still feel like my head's full of sand. I wanted it on paper that he drugged us."),
      F("Did you two argue on Sunday?"),
      T("No. We had dinner. She marked papers. We went to bed."),
      F("You don't seem very upset, for a man whose girlfriend is missing."),
      T("I haven't slept. I don't know what I'm supposed to look like. I'm not going to cry for you so you'll believe me."),
      F("We'll do a polygraph in the morning."),
      T("Fine. Do it. And then go and look for her."),
    ],
  },
];

export const calls: CallDef[] = [
  {
    id: "call_nora",
    from: "nora",
    title: "Call from Nora Pruitt, Mariposa Bay Courier",
    lines: [
      "Is this Blackwood? Nora Pruitt, I cover crime for the Mariposa Bay Courier. Ruth Kessler gave me your number.",
      "A package came to my desk at half past two, addressed to me by name. A typed letter from somebody calling themselves 'the crew', and a cassette. It's Laura Kessler's voice. I played it to her sister over the phone and she's sure.",
      "I called Sergeant Ferris. He says it's part of an act. I'm not so sure. If you want to see it before the police take it, I'm at the paper on Harbor Boulevard.",
    ],
    effects: [
      { timeline: { time: "2:30 PM (Tue)", text: "The Courier receives a typed letter from 'the crew' and a cassette of Laura's voice.", source: "Nora Pruitt (telephone)" } },
    ],
  },
  {
    id: "call_bennett_trace",
    from: "bennett",
    title: "Call from Det. Bennett",
    lines: [
      "Bennett. Your reporter mentioned phone calls to her desk yesterday afternoon, so I called in a favor at Pacific Bell. They pulled every call that came in on her line.",
      "Three of them came from the same payphone, and it isn't in Mariposa Bay. It's up in the San Bernardino Mountains, outside a general store in a place called Tamarack Lake.",
      "The record's on your desk. It gives you a phone booth, not a man. But it's a long way from Elm Street.",
    ],
    effects: [
      { delivery: "trace" },
      { timeline: { time: "3:15 PM (Tue)", text: "First of three calls to Nora Pruitt from the payphone outside the Tamarack Lake General Store.", source: "Pacific Bell record" } },
    ],
  },
  {
    id: "call_ruth_laura",
    from: "ruth",
    title: "Call from Ruth Kessler",
    lines: [
      "It's Ruth. She's here. Laura's here. She knocked on my door twenty minutes ago.",
      "She's all right. She's cold and she's groggy and she keeps shaking, but she's all right. Somebody left her in the park down the street.",
      "Please come. She wants to tell somebody who'll actually listen.",
    ],
    effects: [
      { setFlag: "laura_home" },
      { timeline: { time: "8:30 AM (Wed)", text: "Wednesday, October 12. Laura Kessler knocks on her sister's door in Long Beach.", source: "Ruth Kessler (telephone)" } },
    ],
  },
  {
    id: "call_nora_letter2",
    from: "nora",
    title: "Call from Nora Pruitt",
    lines: [
      "Nora Pruitt again. Have you seen what my own paper printed this morning? Ferris stood up at five o'clock yesterday and called it a hoax.",
      "And this morning another letter came to my desk. Same typewriter, by the look of it. It says they let her go. It knows things that weren't in any paper.",
      "I'm holding it for you. Come by the Courier.",
    ],
    effects: [
      { setFlag: "letter2_waiting" },
      { timeline: { time: "5:00 PM (Wed)", text: "Sgt. Ferris tells reporters the abduction appears to have been staged.", source: "Mariposa Bay Courier" } },
    ],
  },
  {
    id: "call_bennett_oak",
    from: "bennett",
    title: "Call from Det. Bennett, three weeks later",
    lines: [
      "Bennett. It's been a while. Friday, November the fourth.",
      "A woman in Oak Terrace, out in the San Gabriel Valley, woke up at twenty to three this morning with a flashlight in her face. Masked man, stun gun, black cable ties. And a little tape player on her nightstand telling her a crew was watching the house.",
      "She hit him with a lamp and he ran. He left a few things behind. The report's on its way to your desk. I thought you'd want to read it before anybody else connects it to anything.",
    ],
    effects: [
      { setFlag: "oak_terrace" },
      { delivery: "oak_report" },
      { timeline: { time: "2:40 AM (Nov 4)", text: "Friday, November 4. A masked man breaks into Diane Moss's home in Oak Terrace. She fights him off.", source: "Det. Bennett (telephone)" } },
    ],
  },
  {
    id: "call_bennett_arrest",
    from: "bennett",
    title: "Call from Det. Bennett",
    lines: [
      "Bennett. San Bernardino County served a warrant on Cabin 14 at Tamarack Lake at a quarter past six this morning.",
      "Gordon Pell was home. They've arrested him, and he's been brought down to Mariposa Bay for questioning. He has a fresh cut on his scalp.",
      "The deputies' inventory is in a sealed envelope on its way to your desk. I haven't read all of it. I wanted you to see it first.",
    ],
    effects: [
      { setFlag: "gordon_arrested" },
      { delivery: "search" },
      { timeline: { time: "6:15 AM (Nov 7)", text: "Monday, November 7. Deputies search Cabin 14, Tamarack Lake, and arrest Gordon Pell.", source: "Det. Bennett (telephone)" } },
    ],
  },
  {
    id: "call_bennett_board",
    from: "bennett",
    title: "Call from Det. Bennett",
    lines: [
      "Bennett. You've got a stack of paper on this one and nothing on the wall yet.",
      "Put every piece on the board in your office and run string between anything that belongs together: a lab report and a blood test, a tape and a phone record, a letter and the one that came before it.",
      "Ferris made up his mind with one piece. Don't do that. When two of them fit, you'll know it.",
    ],
    effects: [
      {
        note: {
          id: "call:bennett_board",
          kind: "call",
          title: "Det. Bennett: use the board",
          text: "Pin the evidence on the murder board and connect pieces that belong together. When two pieces fit, a deduction follows.",
          characterId: "bennett",
          important: true,
        },
      },
    ],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [];

/* Police lab tests: real time from the moment Det. Bennett sends them; the results arrive on the office desk. */
export const labs: LabDef[] = [
  {
    id: "glasses",
    label: "Toxicology: the kitchen glasses",
    seconds: 180,
    rect: LAB_GLASSES_RECT,
    image: "art.obj_labfolder",
    onReady: [{ delivery: "lab_glasses" }, { message: "The county lab's report on the two glasses is on your desk." }],
  },
  {
    id: "typewriter",
    label: "Questioned documents: the letters and the typewriter",
    seconds: 180,
    rect: LAB_TYPEWRITER_RECT,
    image: "art.obj_labfolder",
    onReady: [{ delivery: "lab_typewriter" }, { message: "The sheriff's lab comparison of the letters is on your desk." }],
  },
];

export const deliveries: DeliveryDef[] = [
  {
    id: "lab_glasses",
    title: "Lab report: the kitchen glasses",
    exterior: "A thin county laboratory folder, stamped RESULTS and clipped shut.",
    text: "Det. Bennett's note on the folder: 'Ventura County's lab ran the two glasses for me. Read the findings and the part about prints. F.B.'",
    evidence: ["E23"],
  },
  {
    id: "lab_typewriter",
    title: "Lab report: the letters",
    exterior: "A San Bernardino County crime laboratory folder, stamped QUESTIONED DOCUMENTS.",
    text: "Det. Bennett's note: 'The sheriff's lab put the three letters next to the Smith-Corona from the cabin. Ferris has had those letters since Tuesday. F.B.'",
    evidence: ["E19"],
  },
  {
    id: "trace",
    title: "Pacific Bell call record",
    exterior: "A carbon copy in a Pacific Bell envelope, with a note from Det. Bennett clipped to it.",
    text: "Det. Bennett's note: 'Pruitt's line, Tuesday afternoon. Look at the area code on three of them. B.'",
    evidence: ["E09"],
  },
  {
    id: "paper",
    title: "Thursday's Mariposa Bay Courier",
    exterior: "A folded copy of the Mariposa Bay Courier, Thursday, October 13, left on your desk.",
    text: "Someone has circled the front-page headline in red pencil.",
    evidence: ["E11"],
  },
  {
    id: "oak_report",
    title: "Oak Terrace police report",
    exterior: "A manila envelope from Oak Terrace Police, forwarded by Det. Bennett.",
    text: "Det. Bennett's note: 'Read the part about the tape player. Then read what fell out of his jacket. B.'",
    evidence: ["E16"],
  },
  {
    id: "search",
    title: "Sheriff's search inventory: Cabin 14",
    exterior: "A sealed San Bernardino County Sheriff's envelope, marked SEARCH WARRANT RETURN.",
    text: "Det. Bennett's note: 'The inventory from the cabin and the van, with the deputies' transcript of a cassette they found in the recorder. F.B.'",
    evidence: ["E18", "E20"],
  },
];

/* Laura has been interviewed about what happened to her. */
const lauraHeard: Condition = { any: [{ asked: "laura_held" }, { asked: "laura_night" }, { asked: "laura_men" }, { asked: "laura_release" }, { asked: "laura_tape" }] };

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "C002",
    title: "A package at the Courier",
    characterId: "nora",
    // Tom has told his story, and the investigator has seen the ransom letter.
    requires: {
      all: [
        { any: [{ asked: "tom_night" }, { asked: "tom_letter" }, { asked: "tom_delay" }, { inspected: "office_recorder" }] },
        { hasEvidence: "E04" },
      ],
    },
    activate: { at: "office" },
    onActivate: [{ incomingCall: "call_nora" }, { message: "Agency telephone ringing." }],
    complete: { callAnswered: "call_nora" },
    onComplete: [{ unlockLocation: "courier" }],
    notebook: {
      call: "call_nora",
      learned: [
        { text: "Nora Pruitt of the Mariposa Bay Courier received a typed letter from 'the crew' and a cassette of Laura's voice on Tuesday afternoon.", requires: { callAnswered: "call_nora" } },
        { text: "Ruth Kessler confirmed the voice on the cassette is her sister's.", requires: { callAnswered: "call_nora" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "C002",
    title: "The phone calls traced",
    characterId: "bennett",
    // The investigator has the cassette and has heard about the calls to Nora's desk.
    requiresEvidence: ["E08"],
    requiresInterviews: ["nora_calls"],
    requires: { always: true },
    activate: { at: "office" },
    onActivate: [{ incomingCall: "call_bennett_trace" }, { message: "Agency telephone ringing." }],
    complete: { hasEvidence: "E09" },
    evidence: ["E09"],
    notebook: {
      call: "call_bennett_trace",
      delivery: "trace",
      learned: [
        { text: "Det. Bennett had Pacific Bell pull the calls to Nora Pruitt's desk on Tuesday afternoon." },
        { text: "Three came from a payphone outside the general store at Tamarack Lake, in the San Bernardino Mountains.", requires: { callAnswered: "call_bennett_trace" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "C002",
    title: "Laura comes home",
    characterId: "laura",
    requires: { any: [{ hasEvidence: "E09" }, { deduction: "D4" }] },
    activate: { at: "office" },
    onActivate: [{ incomingCall: "call_ruth_laura" }, { message: "Agency telephone ringing." }],
    complete: { callAnswered: "call_ruth_laura" },
    notebook: {
      call: "call_ruth_laura",
      learned: [
        { text: "On Wednesday morning Laura Kessler knocked on her sister's door in Long Beach, alive.", requires: { callAnswered: "call_ruth_laura" } },
        { text: "She was left on a bench in Alamitos Park, two blocks from Ruth's apartment.", requires: { any: [{ asked: "laura_release" }, { hasEvidence: "E12" }] } },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "C002",
    title: "The hoax story",
    characterId: "ferris",
    requires: lauraHeard,
    activate: { at: "office" },
    onActivate: [{ delivery: "paper" }, { incomingCall: "call_nora_letter2" }, { message: "Agency telephone ringing. Something has been left on your desk." }],
    complete: { all: [{ hasEvidence: "E11" }, { callAnswered: "call_nora_letter2" }] },
    evidence: ["E11", "E10"],
    notebook: {
      call: "call_nora_letter2",
      delivery: "paper",
      learned: [
        { text: "Sgt. Ferris told reporters on Wednesday evening that the abduction appears to have been staged. The Courier ran it on Thursday's front page." },
        { text: "A second letter from 'the crew' reached Nora Pruitt on Thursday.", requires: { callAnswered: "call_nora_letter2" } },
      ],
    },
  },
  {
    id: "RE05",
    caseId: "C002",
    title: "Oak Terrace",
    characterId: "diane",
    // The hoax story is out, and the investigator has followed the trail to the mountains or worked out that it was one man.
    requires: { all: [{ hasEvidence: "E11" }, { any: [{ deduction: "D5" }, { deduction: "D6" }, { hasEvidence: "E14" }, { hasEvidence: "E15" }] }] },
    activate: { at: "office" },
    onActivate: [{ incomingCall: "call_bennett_oak" }, { message: "Three and a half weeks pass. Friday, November 4, 1988. Agency telephone ringing." }],
    complete: { hasEvidence: "E16" },
    evidence: ["E16"],
    notebook: {
      call: "call_bennett_oak",
      delivery: "oak_report",
      learned: [
        { text: "November 4: a masked man broke into Diane Moss's home in Oak Terrace with a stun gun, cable ties and a tape player that said a crew was watching the house." },
        { text: "She fought him off. A pager fell from his jacket in the side yard.", requires: { hasEvidence: "E16" } },
      ],
    },
  },
  {
    id: "RE06",
    caseId: "C002",
    title: "Cabin 14",
    characterId: "gordon",
    requires: { all: [{ hasEvidence: "E17" }, { any: [{ hasEvidence: "E09" }, { hasEvidence: "E14" }, { hasEvidence: "E15" }] }] },
    activate: { at: "office" },
    onActivate: [{ incomingCall: "call_bennett_arrest" }, { message: "Agency telephone ringing." }],
    complete: { hasEvidence: "E18" },
    evidence: ["E18", "E20"],
    notebook: {
      call: "call_bennett_arrest",
      delivery: "search",
      learned: [
        { text: "San Bernardino County deputies searched Cabin 14 and the van beside it, and arrested Gordon Pell." },
        { text: "Gordon Pell has been brought to the Mariposa Bay Police Station for questioning.", requires: { flag: "gordon_arrested" } },
      ],
    },
  },
];

export const objectives: CaseDefinition["objectives"] = [
  { id: "o_casefile", text: "Read the police file Det. Bennett sent over", visible: { always: true }, done: { flag: "casefile_read" } },
  { id: "o_scene", text: "Examine 418 Elm Street, the bedroom and the kitchen", visible: { flag: "casefile_read" }, done: { all: [{ visited: "hale_bedroom" }, { visited: "hale_kitchen" }] } },
  { id: "o_tom", text: "Hear Tom Hale's account for yourself", visible: { flag: "casefile_read" }, done: { talkedTo: "tom" } },
  { id: "o_bennett", text: "Speak with Det. Bennett on the office telephone", visible: { flag: "casefile_read" }, done: { talkedTo: "bennett" } },
  { id: "o_lab", text: "Get the two glasses to a lab", visible: { hasEvidence: "E02" }, done: { labStarted: "glasses" } },
  { id: "o_ferris", text: "See Sgt. Ferris at the Mariposa Bay Police Station", visible: { flag: "casefile_read" }, done: { talkedTo: "ferris" } },
  { id: "o_courier", text: "See what came to the Courier", visible: { callAnswered: "call_nora" }, done: { talkedTo: "nora" } },
  { id: "o_laura", text: "Talk to Laura at her sister's apartment", visible: { flag: "laura_home" }, done: { talkedTo: "laura" } },
  { id: "o_where", text: "Find where Laura was held", visible: { any: [{ hasEvidence: "E09" }, { hasEvidence: "E12" }] }, done: { visited: "tamarack_store" } },
  { id: "o_board", text: "Connect evidence on the murder board", visible: { evidenceCount: 3 }, done: { boardConnections: 1 } },
  { id: "o_diane", text: "Talk to Diane Moss in Oak Terrace", visible: { flag: "oak_terrace" }, done: { talkedTo: "diane" } },
  { id: "o_conclude", text: "File your final report from the office desk", visible: { flag: "laura_home" }, done: { flag: "case_closed" } },
];

/* The report can be opened once Laura is home and the investigation has substance. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [{ flag: "casefile_read" }, { flag: "laura_home" }, { evidenceCount: 6 }],
};
