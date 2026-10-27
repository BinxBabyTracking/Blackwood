import "server-only";
import type { CaseDefinition, Condition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for C005. Server-only. Nothing here reaches the
 * browser until the player earns it (a confirmed deduction) or closes the case.
 *
 * Deductions are pairs, as the table connects two things at a time; the
 * design's three and four item deductions become several pairs. D16, the
 * final one, needs all five independent chains first: cloth and passage,
 * money, weapon, bells and an eyewitness. No single item decides it.
 */

export const deductions: DeductionDef[] = [
  {
    id: "D01",
    title: "Edmund Died by Violence",
    text: "One curved wound above the ear and a warding bruise on the forearm, no mark of the falling sickness, and a fresh dent with metal in it on the desk's straight edge. Edmund was struck, hard, by something heavy and rounded. It was not a seizure.",
    connections: [["E01", "E02"], ["E02", "E03"], ["E01", "E03"]],
  },
  {
    id: "D02",
    title: "The Barred Room Had Another Way",
    text: "The bar's top face carries two fresh hook marks that the forcing could not have made, and the candle aumbry beside the bracket opens into the cellarer's passage. With a hook through the aumbry, the bar can be dropped from outside. The room was barred by someone who had already left it.",
    connections: [["E04", "E05"]],
  },
  {
    id: "D03",
    title: "Someone Used the Passage",
    text: "Fresh tallow under the aumbry, the cellar hook rubbed bright with oak in its crook, and black habit cloth torn on the nail at a reaching arm's height. Someone in a habit worked the bar through the aumbry from the passage.",
    connections: [["E05", "E06"]],
  },
  {
    id: "D04",
    title: "Matthias May Have Been in the Passage",
    text: "The cloth on the aumbry nail is habit wool, and the cellarer's habit has a fresh three-cornered tear mended on Tuesday. The cook who mended it saw him come out of the passage door as the hand bell rang, and no cask hoop could catch a sleeve. Every habit is the same cloth; this is reason to look, not proof.",
    connections: [["E06", "E07"], ["E07", "E26"], ["E06", "E26"]],
  },
  {
    id: "D05",
    title: "A Charter Is Missing",
    text: "The Fellbeck confirmation came into Edmund's keeping at Michaelmas and never went out again, yet it is not in the chest. His own notes say he had found five things wrong with it and meant to lay them before the abbot at chapter on Tuesday.",
    connections: [["E08", "E14"]],
  },
  {
    id: "D06",
    title: "The Confirmation Does Not Hold",
    text: "The grant of 1189 gives Fellbeck in free alms forever, bounded to the old ford. The confirmation says the land may be taken back at will and bounds it to a mill that was not built until 1268, and it bears the seal the abbey cut in 1290. It cannot be what it claims.",
    connections: [["E09", "E10"], ["E10", "E11"]],
  },
  {
    id: "D07",
    title: "The Witness List Is False",
    text: "The confirmation of 1215 is witnessed by 'Osbert the prior'. The necrology says Osbert died in 1208; in 1215 the prior was Ralph.",
    connections: [["E10", "E12"]],
  },
  {
    id: "D08",
    title: "Edmund Had Found the Forgery",
    text: "Edmund left the exemplar of hands open at Abbot Walter's day and marked the old a, and his notes list the standing saint, the dead prior, the young mill and a scraped rent roll beneath the writing. He knew it was forged, and how.",
    connections: [["E13", "E14"]],
  },
  {
    id: "D09",
    title: "The Cellarer's Money",
    text: "Matthias remitted Lord Roland's pasture rent without the abbot's leave, paid a founder at York for casting, bought the best parchment, ink and wax, and kept a letter from Ashcombe's steward promising him ten marks and a clerkship once the writing was 'found'. The cellarer stood to gain from the forgery.",
    connections: [["E15", "E16"], ["E16", "E17"], ["E15", "E17"]],
  },
  {
    id: "D10",
    title: "The Steward's Hand in It",
    text: "Geoffrey Hale promised the cellarer payment for a writing that 'shall be found among his evidences as we agreed', was paid five marks by his lord for 'finding' it, and was in the abbey at Sext on the day Edmund died, though he denied it. He took part in the forgery. The gate roll has him gone after None, long before the deed.",
    connections: [["E17", "E18"], ["E17", "E25"], ["E18", "E25"]],
  },
  {
    id: "D11",
    title: "The Candlestick",
    text: "Edmund's borrowed candlestick was missing from the book room and is back on the Lady altar with his scriptorium candle on it. Its dented foot matches the wound in curve and width, carries dried blood in its engraving and oak splinters in its scratches, and its metal matches the smear on the desk. It is very likely the weapon.",
    connections: [["E03", "E20"], ["E19", "E20"], ["E20", "E21"], ["E02", "E21"]],
  },
  {
    id: "D12",
    title: "Matthias's Account of Compline Fails",
    text: "Matthias says he was in his stall before the great bell finished tolling. The great bell's rope parted at the first stroke; Compline was rung late on the hand bell; and his stall was empty when the first psalm began. His account of where he was cannot be true.",
    connections: [["E22", "E23"], ["E23", "E24"], ["E22", "E24"]],
  },
  {
    id: "D13",
    title: "Peter Fled in Fear",
    text: "Peter folded his cloak and left his psalter so as not to steal from the abbey, scratched on his tablet that he dared neither lie nor tell, and went to his mother's sister. He reached the mill before first light, soaked and unhurt. He ran from fear; nobody harmed him.",
    connections: [["E27", "E28"], ["E28", "E29"], ["E27", "E29"]],
  },
  {
    id: "D14",
    title: "Peter Saw Matthias at the Passage",
    text: "As the hand bell rang, Peter saw Brother Matthias come out of the passage door without a light, carrying something under his scapular. The cook saw the same from her window. The next morning Matthias warned the boy what it would cost to say so.",
    connections: [["E26", "E30"], ["E30", "E05"], ["E30", "matthias"]],
  },
  {
    id: "D15",
    title: "The Recovered Charter Is Forged",
    text: "The confirmation from the salt bin bears a copied seal of the 1290 design, a hand of our own day, fresh ink, and the ghost of the abbey's own 1319 rent roll scraped from beneath it. It was written in the last ten years, on a leaf from the cellar's rolls.",
    connections: [["E31", "E09"], ["E31", "E11"], ["E31", "E32"], ["E32", "E10"]],
  },
  {
    id: "D16",
    title: "Motive, Opportunity and Access",
    text: "Matthias forged the confirmation for money; Edmund found him out and was going to the abbot. Matthias left the drink with a lie, was not at the Collation, was seen coming out of the passage he swore he had not entered, carrying something heavy, as the late bell rang; his account of Compline fails; and the candlestick that struck Edmund was set back on the altar. Every line leads to the cellarer.",
    connections: [["matthias", "E20"], ["matthias", "E30"], ["matthias", "E31"]],
    requires: { all: [{ deduction: "D04" }, { deduction: "D09" }, { deduction: "D11" }, { deduction: "D12" }, { deduction: "D14" }] },
  },
];

const knowsGeoffrey: Condition = { any: [{ talkedTo: "geoffrey" }, { hasEvidence: "E17" }, { hasEvidence: "E25" }] };
const knowsRoland: Condition = { any: [{ talkedTo: "roland" }, { event: "RE01" }] };

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "killer",
    section: "A",
    title: "Who struck",
    question: "Who killed Brother Edmund?",
    options: [
      { id: "matthias", label: "Brother Matthias" },
      { id: "matthias_roland", label: "Brother Matthias, at Lord Roland's command", requires: knowsRoland },
      { id: "geoffrey", label: "Geoffrey Hale", requires: knowsGeoffrey },
      { id: "abbot", label: "Abbot Benedict" },
      { id: "thomas", label: "Brother Thomas" },
      { id: "seizure", label: "No one: he died of a seizure" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "motive",
    section: "B",
    title: "Why",
    question: "Why was he killed?",
    options: [
      { id: "forgery", label: "To hide the forged confirmation and the bargain behind it" },
      { id: "theft", label: "He had accused the cellarer of stealing from the cellar" },
      { id: "quarrel", label: "A quarrel over the scriptorium" },
      { id: "roland", label: "Lord Roland wanted him silenced to win the land", requires: knowsRoland },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "weapon",
    section: "C",
    title: "With what",
    question: "What struck him?",
    options: [
      { id: "candlestick", label: "The bronze candlestick from the Lady altar", requires: { hasEvidence: "E20" } },
      { id: "desk", label: "A fall against the desk" },
      { id: "hook", label: "The cellar hook" },
      { id: "bar", label: "The door bar" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "barred",
    section: "D",
    title: "The barred door",
    question: "How was the book room found barred?",
    options: [
      { id: "aumbry", label: "The killer left by the door and dropped the bar from the cellarer's passage, through the candle aumbry", requires: { hasEvidence: "E05" } },
      { id: "himself", label: "Edmund barred it himself before he fell" },
      { id: "hid", label: "The killer hid inside until the door was forced" },
      { id: "slammed", label: "The bar fell when the door was slammed" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "forgers",
    section: "E",
    title: "The forgery",
    multi: true,
    question: "Who made the forged confirmation? (choose all that apply)",
    options: [
      { id: "matthias", label: "Brother Matthias" },
      { id: "geoffrey", label: "Geoffrey Hale", requires: knowsGeoffrey },
      { id: "roland", label: "Lord Roland", requires: knowsRoland },
      { id: "abbot", label: "Abbot Benedict" },
      { id: "edmund", label: "Brother Edmund" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "peter",
    section: "F",
    title: "Novice Peter",
    question: "What became of Novice Peter?",
    options: [
      { id: "fled", label: "He fled in fear after he was threatened, and is sheltered at the mill" },
      { id: "killed", label: "He was killed to silence him" },
      { id: "guilty", label: "He ran because he killed Edmund" },
      { id: "sent", label: "The abbot sent him away" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Brother Matthias killed Brother Edmund with the bronze
 * candlestick from the Lady altar, to hide the forged Fellbeck confirmation
 * and the bargain behind it. He barred the book room from the cellarer's
 * passage through the candle aumbry. Matthias and Geoffrey Hale made the
 * forgery; Lord Roland profited but neither forged it nor ordered any death.
 * Peter fled in fear after Matthias threatened him and is sheltered at the mill.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    killer: "matthias",
    motive: "forgery",
    weapon: "candlestick",
    barred: "aumbry",
    forgers: ["matthias", "geoffrey"],
    peter: "fled",
  },
  standard: {
    // One key item for every 5 or 6 pieces of evidence: 32 items, 6 key, up to 10 attached (Final Report Standard).
    minItems: 6,
    maxItems: 10,
    minKey: 6,
    claims: [
      {
        id: "tie",
        label: "Places the person you name where it happened, that night",
        anyOf: ["E06", "E07", "E26", "E30"],
        hint: "Someone in the kitchen court sees everything that passes her window.",
      },
      {
        id: "why",
        label: "Shows why it was done",
        anyOf: ["E10", "E11", "E12", "E14", "E15", "E16", "E17", "E31", "E32"],
        hint: "The cellar keeps more than casks.",
      },
      {
        id: "how",
        label: "Shows how it was done and how it was hidden",
        anyOf: ["E03", "E04", "E05", "E20", "E21"],
        hint: "Look at what stands on the altars, and count it against the sacristan's board.",
      },
      {
        id: "story",
        label: "Tests the account they gave of themselves",
        anyOf: ["E22", "E23", "E24"],
        hint: "Ask who rang the bell for Compline, and how.",
      },
      {
        id: "others",
        label: "Shows who else had a hand in it, and how far",
        anyOf: ["E17", "E18", "E25"],
        hint: "The gate writes down every comer, and the manor writes down every penny.",
      },
      {
        id: "missing",
        label: "Shows what became of the one who went missing",
        anyOf: ["E27", "E28", "E29", "E30"],
        hint: "A boy who runs, runs somewhere he knows.",
      },
    ],
    lines: [
      { id: "physical", label: "Things seen and handled", anyOf: ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E19", "E20", "E21"] },
      { id: "documents", label: "Writings and money", anyOf: ["E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E31", "E32"] },
      { id: "testimony", label: "Testimony, the bells and movements", anyOf: ["E22", "E23", "E24", "E25", "E26", "E27", "E28", "E29", "E30"] },
    ],
    minLines: 3,
    linkToSuspect: ["E26", "E30"],
    linkNote: "Nothing attached puts anyone at the passage door that evening.",
    supporting: [],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted: "Your finding has been accepted. The archdeacon has sent it, with the confirmation and Brother Thomas's account, to the archbishop's officials at York and to the king's justices.",
    reconstruction: [
      {
        heading: "Michaelmas",
        body: "The steward of Ashcombe laid an old writing before the abbot on rent day: a confirmation of 1215 giving the Fellbeck meadows back to the Ashcombes at will. The abbot was afraid of his patron, and gave it to the one man in the house who would read it properly.",
      },
      {
        heading: "Edmund's lamp",
        body: "For three weeks Edmund copied it, and stopped, and held it to the candle, and turned it over. He found the standing saint of the 1290 seal, a prior seven years dead, a mill not yet built, and on the back the ghost of the abbey's own rent roll of 1319. On the Monday he asked the cellarer for the old rolls. The cellarer refused. Edmund told Thomas he would speak at chapter in the morning.",
      },
      {
        heading: "The bargain",
        body: "Brother Matthias wrote the confirmation himself, on a scraped leaf from his own rolls, with ink and parchment bought from the cellar's purse and a copy of the convent's seal cast at York. Geoffrey Hale planned to 'find' it among his lord's papers, and promised Matthias ten marks and a clerkship for his nephew. At Sext on Monday the steward came to the cellar and heard that Edmund knew. He left after None.",
      },
      {
        heading: "The Collation",
        body: "While the brethren listened to the reading, Matthias, who had asked leave to lock the cellar, went to the book room. They argued; a novice passing the door heard Edmund say the abbot would see it at chapter. Matthias struck him once with the bronze candlestick Edmund had borrowed for his eyes, and Edmund died where he fell.",
      },
      {
        heading: "The passage",
        body: "Matthias took the writing, snuffed the candle and went out by the cloister door into the empty walk. In the dark passage he reached through the candle aumbry with the cellar hook and lowered the bar into its bracket, so the room would look as if a sick old man had shut himself in. His sleeve caught on a nail.",
      },
      {
        heading: "The bell",
        body: "In the tower the great bell's rope parted at the first stroke, and Simon rang the hand bell late at the church door. Matthias came out of the passage into the kitchen court and found a boy looking at him, and a cook at her window.",
      },
      {
        heading: "The salt and the altar",
        body: "He buried the writing in the salt bin, set the candlestick beside its twin on the Lady altar with Edmund's short candle still on it, and took his stall after the first psalm. At Prime the next morning he told the boy what he had seen, and what it would cost his aunt to say otherwise.",
      },
      {
        heading: "The beck",
        body: "On Tuesday night Peter folded his cloak so as not to steal it, left his psalter, scratched a message for his ringer, and waded Fell Beck in the dark to his aunt's door. Nobody harmed him. He was afraid, and he would not lie.",
      },
    ],
    bennett: [
      "Hugh Selwood to his examiner, greeting and thanks. I have your finding and I accept it.",
      "Brother Matthias is delivered to the archbishop's prison at York, to answer in the court of the Church for the death of his brother. Geoffrey Hale will answer before the king's justices for the making of a false charter. Lord Roland has withdrawn his claim to Fellbeck, and written, at some length, that he knew nothing. I am inclined to believe him. The tenants keep their meadows.",
      "The abbot will answer at my visitation for calling a death a seizure. I think he will answer honestly now. Peter has come home; he was given his cloak back at the gate, and says he still wishes to be professed. Brother Thomas asks leave to finish Edmund's register. I have given it. You looked at everything and believed nothing that could not be shown. That is all I asked. H.S.",
    ],
    caller: { characterId: "archdeacon", name: "Master Hugh Selwood", tag: "Archdeacon of Wendale · by letter" },
  },
};
