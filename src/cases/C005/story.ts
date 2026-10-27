import type { CallDef, CaseDefinition, Condition, DeliveryDef, DocumentDef, OutgoingCallDef, ReactiveEventDef, StatementDef } from "@/game/engine/types";

/*
 * C005 story content: the intro, the archdeacon's commission, the letters and
 * visits that come to the investigator's chamber, and the eight reactive
 * events. Offices and days follow docs/C005-timeline.md. No clock times are
 * spoken or shown: the abbey tells time by its services.
 *
 * Calls are letters, messengers and visits. Like C001's telephone they come
 * only to the investigator's chamber in the guest-house; away from it, a
 * notice says someone is waiting.
 */

export const briefed: Condition = { flag: "casefile_read" };
/** Peter has fled the abbey (RE03) and not yet been found (RE05). */
export const peterMissing: Condition = { all: [{ event: "RE03" }, { not: { event: "RE05" } }] };

export const intro: CaseDefinition["intro"] = [
  {
    heading: "From the Blackwood archive",
    text: "This file is a reconstruction. The abbey, its people and its records are invented; the method is the agency's own: look, ask, compare, and believe nothing that cannot be shown. You are the archdeacon's examiner. The year is 1327.",
  },
  {
    heading: "Tuesday, October 20, 1327. Kirkby Wendale.",
    text: "A letter under the archdeacon's seal, read by candlelight before dawn. Last evening a brother of Saint Aldwyn's, Edmund, a man of learning and good name, was found dead in the abbey's book room behind a barred door. The lord abbot writes that he was taken by a seizure. The infirmarian who saw him does not say so. A writing that lay in his keeping is also not to be found. Go to the abbey this morning. Look at everything; question anyone.",
  },
  {
    heading: "At Terce",
    text: "Rain on the moor road. The gatekeeper writes your name in his roll and sends a boy running. Abbot Benedict meets you in the outer court with his hands folded in his sleeves.",
  },
  {
    text: "'You are welcome, though I wish you had not been sent. Brother Edmund was old and he worked too late by too little light. His heart failed him, or the falling sickness took him, and he struck his head as he fell. That is all this is. Look, by all means. And then let us bury him in peace.'",
  },
];

/* Seed entries for the journal's timeline. Offices, never clock hours. */
export const timeline: CaseDefinition["timeline"] = [
  { time: "After Compline (Mon)", text: "Brother Edmund is found dead in the book room. The door was barred from within and had to be forced.", source: "The archdeacon's commission" },
  { time: "Terce (Tue)", text: "You arrive at Saint Aldwyn's.", source: "Gate roll" },
];

export const documents: DocumentDef[] = [
  {
    id: "casefile",
    title: "The archdeacon's commission",
    dossier: [
      { label: "Case ID", value: "C005" },
      { label: "Case title", value: "The Abbey of Silent Bells" },
      { label: "Matter", value: "The death of Brother Edmund" },
      { label: "Place", value: "Saint Aldwyn's Abbey, Wendale" },
      { label: "Year", value: "1327" },
      { label: "Found", value: "After Compline, Monday, October 19" },
      { label: "By authority of", value: "Master Hugh Selwood, Archdeacon of Wendale" },
      { label: "Write to", value: "The archdeacon, at Kirkby, by messenger" },
    ],
    people: ["edmund", "abbot", "matthias", "thomas", "anselm", "simon", "peter", "agnes", "william", "roland", "geoffrey"],
    peopleHeading: "Persons named in the commission",
    evidence: [],
    effectsOnRead: [{ setFlag: "casefile_read" }],
    pages: [
      {
        heading: "The archdeacon's summary",
        spoken:
          "The archdeacon's summary. Brother Edmund, fifty-two years old, a monk of Saint Aldwyn's for thirty years, keeper of the register and of the charters in use. Found dead in the book room off the cloister on Monday, the nineteenth of October, after Compline, by Brother Thomas, the librarian. The door was barred from within and had to be forced. The abbot holds that Edmund died of a seizure. Sister Agnes of Thornholme, who saw the body, has not agreed. A writing in Edmund's keeping is missing; the abbot calls it a matter for the lawyers.",
        body: "Brother Edmund, 52, monk of Saint Aldwyn's for thirty years, keeper of the register and of charters in use. Found dead in the book room off the cloister on Monday, October 19, after Compline, by Brother Thomas, the librarian. The door was barred from within and had to be forced. The abbot holds that Edmund died of a seizure. Sister Agnes of Thornholme, who saw the body, has not agreed. A writing in Edmund's keeping is missing; the abbot calls it \"a matter for the lawyers.\"",
      },
      {
        heading: "The abbey",
        spoken:
          "The abbey. A Benedictine house of about twenty monks under Abbot Benedict. The church on the north of the cloister; the chapter house on the east; the book room and the scriptorium on the west and north walks; the cellarer's range, the kitchen and the guest-house on the west, by the outer court and the gate. The abbey keeps its winter day: Vespers, the evening drink, the Collation reading, Compline, and then silence until the night office.",
        body: "A Benedictine house of about twenty monks under Abbot Benedict. The church on the north of the cloister; the chapter house on the east; the book room and the scriptorium carrels on the west and north walks; the cellarer's range, kitchen and guest-house on the west, by the outer court and the gate. The abbey keeps its winter day: Vespers, the evening drink, the Collation reading, Compline, and then silence until the night office.",
      },
      {
        heading: "The people",
        spoken:
          "The people. Abbot Benedict. Brother Matthias, the cellarer. Brother Thomas, the librarian. Brother Anselm, the sacristan. Brother Simon, who rings the bells. Novice Peter, who heard voices in the book room that evening. Sister Agnes, infirmarian, lodging in the guest-house. William Carter, the gatekeeper. The abbey's patron is Lord Roland Ashcombe of Ashcombe Hall; his steward is Geoffrey Hale.",
        body: "Abbot Benedict. Brother Matthias, cellarer. Brother Thomas, librarian. Brother Anselm, sacristan. Brother Simon, who rings the bells. Novice Peter, who heard voices in the book room that evening. Sister Agnes, infirmarian, lodging in the guest-house. William Carter, gatekeeper. The abbey's patron is Lord Roland Ashcombe of Ashcombe Hall; his steward is Geoffrey Hale.",
      },
      {
        heading: "How to proceed",
        spoken:
          "How to proceed. Keep the journal: what you see is set down as observed, what you are told as claimed. Lay what you find on the table in your chamber. Write to me when you need the diocese's records or a second mind. When you are sure, send me your finding. Hugh Selwood.",
        body: "Keep the journal: what you see is set down as observed, what you are told as claimed. Lay what you find on the table in your chamber. Write to me when you need the diocese's records or a second mind. When you are sure, send me your finding. H.S.",
      },
    ],
  },
];

/* No recorded statements in 1327: what people said is in the journal. */
export const statements: StatementDef[] = [];

export const calls: CallDef[] = [
  {
    id: "letter_board",
    from: "archdeacon",
    title: "A letter from the archdeacon",
    lines: [
      "Hugh Selwood to his examiner. Your journal fills and your table stays bare.",
      "Lay out on it what you have found, and run a thread between any two things you believe belong together.",
      "When you are right, the table will show you why. When you are wrong, it costs you nothing but a thread. H.S.",
    ],
    effects: [
      {
        note: {
          id: "call:letter_board",
          kind: "call",
          title: "The archdeacon: use the table",
          text: "Lay the evidence on the deduction table in your chamber and run thread between pieces that belong together. When two pieces fit, a deduction follows.",
          characterId: "archdeacon",
          important: true,
        },
      },
    ],
  },
  {
    id: "letter_warning",
    from: "roland",
    title: "A messenger in Ashcombe livery",
    lines: [
      "Roland, lord of Ashcombe, to the archdeacon's examiner at Saint Aldwyn's.",
      "We hear you busy yourself with a writing touching our meadows at Fellbeck. That writing is our evidence and our right, and it will be tried in the king's court, not by monks and clerks.",
      "Look to the brother's death, which is your business, and leave our rights alone, which are not. We are the patron of this house, as our fathers were. At Ashcombe, under our seal.",
    ],
    effects: [
      { setFlag: "warned" },
      { unlockLocation: "manor" },
      { timeline: { time: "Tue", text: "A messenger in Ashcombe livery brings a warning under Lord Roland's seal: leave the Fellbeck writing alone.", source: "Letter from Ashcombe" } },
    ],
  },
  {
    id: "visit_abbot_archive",
    from: "abbot",
    title: "The abbot at your door",
    lines: [
      "I have heard you are asking about the Ashcombe writing. Let me be plain.",
      "That is a matter of land, between this house and its patron, and it will go to the lawyers. The muniment room stays shut. It is under three keys and the keys stay where they are.",
      "You were sent to look into a death. Look into it.",
    ],
    effects: [{ setFlag: "archive_closed" }],
  },
  {
    id: "visit_thomas_peter",
    from: "thomas",
    title: "Brother Thomas at your door",
    lines: [
      "Peter wasn't at the night office. His bed hasn't been slept in.",
      "His cloak's on the bench in the cloister, folded, with his psalter on it. The beck's in spate. Half the brothers are walking the mill-race with poles.",
      "Please. He's seventeen.",
    ],
    effects: [
      { setFlag: "peter_gone" },
      { timeline: { time: "Night (Tue)", text: "Novice Peter leaves the abbey. His cloak and psalter are left folded on the cloister bench.", source: "Brother Thomas" } },
    ],
  },
  {
    id: "visit_margery",
    from: "margery",
    title: "Margery at your door",
    lines: [
      "You're the one asking about the passage. I've got something to tell you, and I want it written that I came on my own.",
      "The boy was by my fire that night. And I saw who came out of that door.",
    ],
    effects: [
      { giveEvidence: "E26" },
      { timeline: { time: "At the Compline bell (Mon)", text: "Margery sees the cellarer come out of the passage door into the kitchen court, without a lantern, as the hand bell rings.", source: "Margery" } },
    ],
  },
  {
    id: "visit_william_mill",
    from: "william",
    title: "William Carter at your door, with a boy",
    lines: [
      "This is Hal, John Miller's lad from Hollin Bridge. His mother sent him. He's too shy to say it twice, so I'll say it for him.",
      "His mother says to tell the man from the archdeacon, and nobody else, that Peter's at the mill. He's not hurt. He's just frightened.",
      "She says come yourself.",
    ],
    effects: [
      { setFlag: "peter_found" },
      { unlockLocation: "mill" },
      { timeline: { time: "Before first light (Wed)", text: "Peter reaches the mill at Hollin Bridge, soaked and frightened. His aunt, Alice Miller, hides him.", source: "William Carter" } },
    ],
  },
  {
    id: "letter_geoffrey",
    from: "geoffrey",
    title: "A sealed letter from Geoffrey Hale",
    lines: [
      "Geoffrey Hale, steward of Ashcombe, to the archdeacon's examiner. I spoke to you hastily.",
      "I was within the abbey on Monday, at Sext, about the tithe barley, and I spoke with the cellarer. He told me then that Brother Edmund had seen through the writing and would take it to the abbot. I told him to let it be, and that no writing was worth a quarrel. I left after None and I was at Ashcombe by Vespers; my lord's household will say so.",
      "As to the writing: the cellarer brought it to me, and I believed him when he said he had found it in the abbey's old rolls. If I did wrong, it was in trusting him. I have done nothing to any man's body and I will swear it on any relic in England.",
    ],
    effects: [
      { setFlag: "geoffrey_wrote" },
      { timeline: { time: "Sext (Mon)", text: "Geoffrey Hale, by his own letter, speaks with the cellarer in the abbey about Edmund and the writing.", source: "Geoffrey Hale (letter)" } },
    ],
  },
  {
    id: "visit_abbot_search",
    from: "abbot",
    title: "The abbot at your door",
    lines: [
      "The boy's account. The cellarer's own books. I have been a fool, and a proud one.",
      "The cellar is yours. I will come with you, and the prior, so that no one can say afterward you found what you brought.",
    ],
    effects: [{ setFlag: "cellar_searched" }],
  },
];

export const outgoingCalls: OutgoingCallDef[] = [];

export const deliveries: DeliveryDef[] = [
  {
    id: "exam_candlestick",
    title: "Sister Agnes's examination",
    exterior: "A folded sheet sealed with a blob of plain wax, left on your table, with Agnes's name on the outside.",
    text: "Agnes's note on the outside: 'You asked. Here is what my eyes can tell you, and no more. A.'",
    evidence: ["E21"],
  },
];

export const events: ReactiveEventDef[] = [
  {
    id: "RE01",
    caseId: "C005",
    title: "A warning from Ashcombe",
    characterId: "roland",
    requires: { hasEvidence: "E10" },
    activate: { at: "chamber" },
    onActivate: [{ incomingCall: "letter_warning" }],
    complete: { callAnswered: "letter_warning" },
    notebook: {
      call: "letter_warning",
      learned: [
        { text: "Lord Roland warns you, under his seal, to leave the Fellbeck writing to the king's court.", requires: { callAnswered: "letter_warning" } },
        { text: "The letter was written by his steward, Geoffrey Hale; Lord Roland sealed it.", requires: { asked: "roland_warning" } },
      ],
    },
  },
  {
    id: "RE02",
    caseId: "C005",
    title: "The archive closed",
    characterId: "abbot",
    requires: { hasEvidence: "E08" },
    activate: { at: "chamber" },
    onActivate: [{ incomingCall: "visit_abbot_archive" }],
    complete: { callAnswered: "visit_abbot_archive" },
    notebook: {
      call: "visit_abbot_archive",
      learned: [
        { text: "The abbot has forbidden you the muniment room. The Fellbeck writing, he says, is for the lawyers.", requires: { callAnswered: "visit_abbot_archive" } },
        { text: "Shown Edmund's own notes, he gave way. The muniment room is open.", requires: { event: "RE08" } },
      ],
    },
  },
  {
    id: "RE03",
    caseId: "C005",
    title: "Peter is gone",
    characterId: "peter",
    requires: { all: [{ talkedTo: "peter" }, { any: [{ deduction: "D02" }, { deduction: "D05" }] }] },
    activate: { at: "chamber" },
    onActivate: [{ incomingCall: "visit_thomas_peter" }, { message: "Wednesday, October 21. After Prime." }],
    complete: { callAnswered: "visit_thomas_peter" },
    notebook: {
      call: "visit_thomas_peter",
      learned: [
        { text: "Novice Peter did not come to the night office. His bed was not slept in, and his cloak and psalter were left folded on the cloister bench." },
        { text: "Peter left a message in his wax tablet: he goes to his mother's sister.", requires: { hasEvidence: "E28" } },
        { text: "Peter is alive, sheltering at the mill at Hollin Bridge.", requires: { event: "RE05" } },
      ],
    },
  },
  {
    id: "RE04",
    caseId: "C005",
    title: "Margery comes forward",
    characterId: "margery",
    requires: { all: [{ event: "RE03" }, { hasEvidence: "E05" }] },
    activate: { at: "chamber" },
    onActivate: [{ incomingCall: "visit_margery" }],
    complete: { callAnswered: "visit_margery" },
    evidence: ["E26"],
    notebook: {
      call: "visit_margery",
      learned: [{ text: "Margery, the guest-house cook, came on her own to say what she saw from her kitchen on Monday evening.", requires: { callAnswered: "visit_margery" } }],
    },
  },
  {
    id: "RE05",
    caseId: "C005",
    title: "The mill",
    characterId: "alice",
    requires: { any: [{ hasEvidence: "E28" }, { all: [{ hasEvidence: "E27" }, { asked: "william_peter" }] }] },
    activate: { at: "chamber" },
    onActivate: [{ incomingCall: "visit_william_mill" }],
    complete: { callAnswered: "visit_william_mill" },
    evidence: ["E29", "E30"],
    notebook: {
      call: "visit_william_mill",
      learned: [
        { text: "Alice Miller sent her son to say that Peter is at the mill at Hollin Bridge, unhurt and frightened.", requires: { callAnswered: "visit_william_mill" } },
        { text: "Peter fled because he was afraid, not because he was harmed.", requires: { deduction: "D13" } },
      ],
    },
  },
  {
    id: "RE06",
    caseId: "C005",
    title: "The steward's letter",
    characterId: "geoffrey",
    requires: { presented: "geoffrey:E17" },
    activate: { at: "chamber" },
    onActivate: [{ incomingCall: "letter_geoffrey" }],
    complete: { callAnswered: "letter_geoffrey" },
    notebook: {
      call: "letter_geoffrey",
      learned: [
        { text: "Geoffrey Hale now writes that he was within the abbey on Monday at Sext and spoke with the cellarer about Edmund and the writing.", requires: { callAnswered: "letter_geoffrey" } },
        { text: "He writes that the cellarer brought the writing to him. His own letter of September says the opposite.", requires: { all: [{ callAnswered: "letter_geoffrey" }, { hasEvidence: "E17" }] } },
      ],
    },
  },
  {
    id: "RE07",
    caseId: "C005",
    title: "The charter recovered",
    characterId: "abbot",
    requires: { all: [{ hasEvidence: "E30" }, { deduction: "D09" }] },
    activate: { at: "chamber" },
    onActivate: [{ incomingCall: "visit_abbot_search" }, { message: "Thursday, October 22. After Terce." }],
    complete: { hasEvidence: "E31" },
    evidence: ["E31"],
    notebook: {
      call: "visit_abbot_search",
      learned: [
        { text: "The abbot has ordered the cellar searched, with himself and the prior present." },
        { text: "The Fellbeck confirmation was at the bottom of the salt bin, wrapped in oiled cloth.", requires: { hasEvidence: "E31" } },
      ],
    },
  },
  {
    id: "RE08",
    caseId: "C005",
    title: "The archive opened",
    characterId: "abbot",
    requires: { all: [{ deduction: "D01" }, { flag: "abbot_shown_notes" }] },
    onActivate: [{ message: "The abbot sends for the prior's key and Brother Thomas's. The muniment room is open to you." }],
    complete: { always: true },
    notebook: {
      learned: [{ text: "Shown Edmund's own hand, the abbot opened the muniment room, and admitted he had half-promised Lord Roland the meadows if the writing proved good." }],
    },
  },
  {
    id: "EX1",
    caseId: "C005",
    title: "The candlestick and the wound",
    characterId: "agnes",
    requires: { flag: "x1_requested" },
    activate: { all: [{ flag: "x1_traveled" }, { at: "chamber" }] },
    onActivate: [{ delivery: "exam_candlestick" }, { message: "Sister Agnes's examination is on your table." }],
    complete: { hasEvidence: "E21" },
    evidence: ["E21"],
    notebook: {
      delivery: "exam_candlestick",
      learned: [{ text: "Sister Agnes compared the Lady altar candlestick with Edmund's wound." }],
    },
  },
];

export const objectives: CaseDefinition["objectives"] = [
  { id: "o_casefile", text: "Read the archdeacon's commission", visible: { always: true }, done: briefed },
  { id: "o_room", text: "Examine the book room where Edmund died", visible: briefed, done: { visited: "book_room" } },
  { id: "o_body", text: "Ask Sister Agnes what she saw on the body", visible: briefed, done: { talkedTo: "agnes" } },
  { id: "o_cause", text: "Decide whether Edmund was struck or taken ill", visible: briefed, done: { deduction: "D01" } },
  { id: "o_door", text: "Find out how a barred room was left", visible: { inspected: "br_door" }, done: { deduction: "D02" } },
  { id: "o_charter", text: "Find out what the missing writing was", visible: { hasEvidence: "E08" }, done: { deduction: "D05" } },
  { id: "o_compare", text: "Compare the Fellbeck confirmation with the true records at your lectern", visible: { all: [{ hasEvidence: "E09" }, { hasEvidence: "E10" }] }, done: { deduction: "D06" } },
  { id: "o_archive", text: "Get into the muniment room", visible: { event: "RE02" }, done: { event: "RE08" } },
  { id: "o_board", text: "Lay evidence on the deduction table and connect it", visible: { evidenceCount: 3 }, done: { boardConnections: 1 } },
  { id: "o_peter", text: "Find out what became of Peter", visible: { event: "RE03" }, done: { deduction: "D13" } },
  { id: "o_bells", text: "Set the evening in order on the bell timeline, and test it", visible: { hasEvidence: "E23" }, done: { deduction: "D12" } },
  { id: "o_weapon", text: "Find what struck Edmund", visible: { deduction: "D01" }, done: { deduction: "D11" } },
  { id: "o_conclude", text: "Send your finding to the archdeacon", visible: { event: "RE05" }, done: { flag: "case_closed" } },
];

/* The finding can be written once Peter has been found and the investigation has substance. */
export const reportAvailable: CaseDefinition["reportAvailable"] = {
  all: [briefed, { event: "RE05" }, { evidenceCount: 12 }],
};
