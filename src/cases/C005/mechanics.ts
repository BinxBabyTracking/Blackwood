import "server-only";
import type { ComparisonDef, Condition, SequenceDef } from "@/game/engine/types";

/*
 * C005's two special mechanics. Server-only: where each card belongs and
 * which observation is right never reach the browser.
 *
 * The bell timeline: cards from what the player has learned, laid into the
 * spaces of Monday evening. Testing reports only contradictions the cards as
 * placed now show (findings), never where a card belongs.
 *
 * The manuscript comparison, in two stages: the grant of 1189 against
 * Edmund's copy of the confirmation (what the words say), then the forged
 * original from the salt bin against the true records (what the leaf, the
 * ink, the hand and the seal show). Completing stage 2 gives Thomas's dossier.
 */

/** When the bell timeline first appears in the chamber: once there is something to put on it. */
export const bellsAvailable: Condition = {
  any: [{ hasEvidence: "E23" }, { hasEvidence: "E25" }, { hasEvidence: "E26" }, { asked: "simon_compline" }, { asked: "thomas_monday" }, { asked: "abbot_evening" }],
};

export const sequences: SequenceDef[] = [
  {
    id: "bells",
    title: "The Bell Timeline",
    intro:
      "Monday evening, by the abbey's offices. Lay each card in the space where it belongs, and within a space, earliest first. Cards in red are claims, a person's account of themselves: put a claim where its speaker says it belongs. Then test the timeline. It will not tell you where anything goes; it will only show you accounts that cannot stand beside what you have placed.",
    available: bellsAvailable,
    nothingNew: "The bells tell you nothing new yet.",
    spaces: [
      { id: "before_vespers", label: "Before Vespers" },
      { id: "after_vespers", label: "After Vespers" },
      { id: "before_compline", label: "Before Compline" },
      { id: "compline_bell", label: "At the Compline bell" },
      { id: "during_compline", label: "During Compline" },
      { id: "after_compline", label: "After Compline" },
      { id: "before_matins", label: "Before the night office" },
    ],
    cards: [
      { id: "G1", text: "Geoffrey the steward leaves by the gate", source: "The gate roll", kind: "observed", unlock: { hasEvidence: "E25" }, space: "before_vespers" },
      { id: "G2", text: "\"I never set foot in the abbey that day.\"", source: "Geoffrey Hale", kind: "claimed", unlock: { asked: "geoffrey_monday" } },
      { id: "B1", text: "Edmund goes to the book room with his candle", source: "Brother Thomas", kind: "observed", unlock: { asked: "thomas_monday" }, space: "after_vespers" },
      { id: "B2", text: "The cellarer leaves the drink 'to lock the cellar'", source: "Abbot Benedict", kind: "observed", unlock: { asked: "abbot_evening" }, space: "after_vespers" },
      { id: "B3", text: "Raised voices in the book room", source: "Novice Peter", kind: "observed", unlock: { asked: "peter_voices" }, space: "before_compline" },
      { id: "B4", text: "Peter sits by the kitchen fire", source: "Margery", kind: "observed", unlock: { hasEvidence: "E26" }, space: "before_compline" },
      { id: "P1", text: "\"I came straight back with the oil.\"", source: "Novice Peter", kind: "claimed", unlock: { asked: "peter_oil" } },
      { id: "R1", text: "The great bell's rope parts at the first stroke", source: "Brother Simon", kind: "observed", unlock: { hasEvidence: "E23" }, space: "compline_bell" },
      { id: "R2", text: "The hand bell is rung late at the church door", source: "Brother Simon", kind: "observed", unlock: { hasEvidence: "E23" }, space: "compline_bell" },
      { id: "M1", text: "Matthias comes out of the passage door into the kitchen court", source: "Margery and Peter", kind: "observed", unlock: { any: [{ hasEvidence: "E26" }, { hasEvidence: "E30" }] }, space: "compline_bell" },
      { id: "M2", text: "\"I was in my stall before the great bell finished tolling.\"", source: "Brother Matthias", kind: "claimed", unlock: { asked: "matthias_compline" } },
      { id: "C1", text: "The cellarer's stall is empty at the first psalm", source: "Brother Anselm", kind: "observed", unlock: { hasEvidence: "E24" }, space: "during_compline" },
      { id: "C2", text: "Edmund's stall is empty", source: "Brother Anselm", kind: "observed", unlock: { hasEvidence: "E24" }, space: "during_compline" },
      { id: "D1", text: "The book room door is found barred, and forced", source: "Thomas's sketch", kind: "observed", unlock: { hasEvidence: "E01" }, space: "after_compline" },
    ],
    findings: [
      {
        id: "T1",
        title: "Matthias's account of Compline cannot be true",
        text: "Matthias says he was in his stall before the great bell finished tolling. The great bell never tolled for Compline that night; it rang one stroke. When the hand bell rang he was coming out of the passage, and his stall was empty at the first psalm.",
        needs: [{ card: "M2", anyOf: ["compline_bell", "during_compline", "before_compline"] }, { card: "R1" }, { card: "R2" }, { card: "M1" }, { card: "C1" }],
        effects: [{ deduce: "D12" }],
      },
      {
        id: "T2",
        title: "Geoffrey was within the walls, but gone before Vespers",
        text: "Geoffrey says he never came within the walls that day. The gate roll has him in at Sext and out after None. He was here, but gone long before the deed.",
        needs: [{ card: "G2", anyOf: ["before_vespers", "after_vespers", "before_compline", "compline_bell", "during_compline", "after_compline", "before_matins"] }, { card: "G1" }],
        effects: [{ setFlag: "finding_geoffrey" }],
      },
      {
        id: "T3",
        title: "Peter lingered at the fire",
        text: "Peter says he came straight back with the oil. Margery had him by her fire from soon after the voices until the hand bell. That is where his half hour went, and why he was in the kitchen court when the cellarer came out.",
        needs: [{ card: "P1", anyOf: ["before_compline", "compline_bell", "after_vespers"] }, { card: "B3" }, { card: "B4" }, { card: "M1" }],
        ordered: ["B3", "B4", "M1"],
        effects: [{ setFlag: "finding_peter" }],
      },
      {
        id: "T4",
        title: "The hour of the deed",
        text: "After the cellarer left the drink and before the hand bell rang. Edmund was alive and arguing when Peter passed the book room door; when the bell rang, the cellarer was coming out of the passage behind it.",
        needs: [{ card: "B1" }, { card: "B2" }, { card: "B3" }, { card: "M1" }],
        ordered: ["B1", "B2", "B3", "M1"],
        effects: [{ setFlag: "finding_window" }],
      },
    ],
  },
];

const nothing = "Nothing here differs in substance.";
const opt = (...texts: string[]) => texts.map((text, i) => ({ id: String.fromCharCode(97 + i), text }));

export const comparisons: ComparisonDef[] = [
  {
    id: "words",
    title: "The Grant and the Confirmation",
    intro:
      "On the left, Sir Hugh's grant of 1189. On the right, Edmund's copy of the confirmation of 1215 that claims to explain it. Choose a passage, compare the two, and say what differs. Brother Thomas will tell you when you are right, and only then is it entered in your journal.",
    available: { all: [{ hasEvidence: "E09" }, { hasEvidence: "E10" }] },
    expert: "thomas",
    left: { title: "The grant of 1189", evidence: "E09" },
    right: { title: "The confirmation of 1215 (Edmund's copy)", evidence: "E10" },
    wrong: "Brother Thomas looks again and sees nothing amiss there.",
    completeText: "Brother Thomas: the confirmation says the opposite of the grant it claims to confirm, bounds the land to a mill that did not yet stand, and is witnessed by a prior who did not hold the office.",
    onComplete: [{ deduce: "D06" }, { when: { hasEvidence: "E12" }, then: [{ deduce: "D07" }] }],
    regions: [
      {
        id: "greeting",
        label: "The greeting",
        leftText: "\"Know all men present and to come that I, Hugh of Ashcombe, have given and granted...\"",
        rightText: "\"To all the sons of Holy Mother Church, Walter, by the grace of God abbot of Saint Aldwyn's, and the convent of that place, greeting.\"",
        options: opt("The greeting is in a later form.", "The greeting names the archbishop.", nothing),
        answer: "c",
        discrepancy: false,
        comment: "Agreed. A grant and a confirmation open differently; that is only form.",
      },
      {
        id: "tenure",
        label: "How the land is held",
        leftText: "\"...to hold in free, pure and perpetual alms, quit of all service, forever.\"",
        rightText: "\"...we hold the meadows and pasture of Fellbeck... at their will, to be resumed by them and their heirs whenever they please.\"",
        options: opt("One gives the land forever; the other says it may be taken back at will.", "One is in Latin, the other in French.", "One names the abbot; the other doesn't."),
        answer: "a",
        discrepancy: true,
        comment: "Free alms is forever. A confirmation can't take back a gift; it can only say what the gift was. This says the opposite.",
      },
      {
        id: "bounds",
        label: "The bounds",
        leftText: "\"...from the moor gate down to the old ford of Fell Beck.\"",
        rightText: "\"...from the moor gate to the mill of Hollin Bridge.\"",
        options: opt("One runs from the moor gate; the other from the church.", "One runs to the old ford; the other to the mill of Hollin Bridge.", nothing),
        answer: "b",
        discrepancy: true,
        comment: "There was no mill at Hollin Bridge in 1215. Ask the chronicle, or ask the miller's wife; her husband's grandfather saw it built.",
      },
      {
        id: "witnesses",
        label: "The witnesses",
        leftText: "\"John, abbot of the same place; Osbert the subprior; Sir Walter of Kirkby; Sir Robert of Thorne; Ralph the clerk.\"",
        rightText: "\"Osbert the prior; Roger the sacrist; Henry the cellarer; and the whole convent.\"",
        options: opt("Osbert witnesses neither.", "Osbert is subprior in 1189, and prior in 1215.", "The witnesses are the same men."),
        answer: "b",
        discrepancy: true,
        comment: "A man can go from subprior to prior. Whether he could be prior in 1215 is a question for the necrology.",
      },
      {
        id: "date",
        label: "The date",
        leftText: "(The grant of 1189 carries no date in its text, as was usual then.)",
        rightText: "\"Given in our chapter, in the year of grace 1215, the seventh year of our abbacy.\"",
        options: opt("The seventh year of Walter is not 1215.", "The date names no feast.", nothing),
        answer: "c",
        discrepancy: false,
        comment: "Agreed. Walter was elected in 1209; 1215 is his seventh year. Whoever wrote it knew that much.",
      },
    ],
  },
  {
    id: "leaf",
    title: "The Forged Confirmation",
    intro:
      "On the left, the true records: the grant of 1189, the seal drawer and the exemplar of hands. On the right, the sealed confirmation from the salt bin, held to a low candle. Find what the leaf itself gives away. When you have found it all, Brother Thomas will set it down and sign every point.",
    available: { all: [{ hasEvidence: "E31" }, { hasEvidence: "E09" }] },
    expert: "thomas",
    left: { title: "The true records" },
    right: { title: "The confirmation from the salt bin", evidence: "E31" },
    wrong: "Brother Thomas looks again and sees nothing amiss there.",
    completeText: "Brother Thomas has set down every point in a dossier, signed: the confirmation was written within these ten years, on a leaf of this house's own rolls, under a copied seal.",
    onComplete: [{ giveEvidence: "E32" }],
    regions: [
      {
        id: "seal",
        label: "The seal",
        leftText: "Before 1290 the convent's seal shows Saint Aldwyn seated on a bench, a book on his knee. After, he stands under a pointed canopy.",
        rightText: "Red-brown wax on two silk cords: Saint Aldwyn standing under a pointed canopy, holding a staff. The impression is soft, and a little small.",
        leftImage: "cmp.seal_old",
        rightImage: "cmp.seal_forged",
        options: opt("The wax is the wrong color for the convent.", "The saint stands under a canopy, as on our seals since 1290.", "The seal hangs on the wrong side."),
        answer: "b",
        discrepancy: true,
        comment: "He sat for a hundred years and then he stood. This one stands, seventy-five years too early. And it's soft and small; not our matrix. A copy.",
      },
      {
        id: "parchment",
        label: "The parchment",
        leftText: "The grant of 1189: thick, yellowed, soft at the folds, the same on both sides.",
        rightText: "Thin and rough on the back. Held low to the candle, faint letters show under the writing: \"...Fellbeck... xl s...\"",
        leftImage: "cmp.leaf_old",
        rightImage: "cmp.leaf_forged",
        options: opt("The leaf is a different animal's skin.", "The leaf has been cut down from a larger sheet.", "The leaf has been scraped, and old letters show under a low candle."),
        answer: "c",
        discrepancy: true,
        comment: "A palimpsest. 'Fellbeck... forty shillings.' That's a rent entry. That's one of our own rolls.",
      },
      {
        id: "ink",
        label: "The ink",
        leftText: "Brown and soft, sunk into the skin, faded at the edges of each stroke.",
        rightText: "Dark and crisp, lying on the scraped surface.",
        leftImage: "cmp.ink_old",
        rightImage: "cmp.ink_forged",
        options: opt("The ink is dark and crisp and lies on the surface; the old ink is brown and sunk in.", "The ink is red.", "The ink has run in the damp."),
        answer: "a",
        discrepancy: true,
        comment: "Ink takes a lifetime to brown like that. This is young.",
      },
      {
        id: "hand",
        label: "The hand",
        leftText: "The old hand of Walter's day: a single round a, a tall s in the middle of words, a straight-backed d.",
        rightText: "A careful imitation of the old hand. Here and there the a has two bowls, the d loops back over itself.",
        leftImage: "cmp.hand_old",
        rightImage: "cmp.hand_forged",
        options: opt("It is written by a left-handed scribe.", "The a has two bowls and the d loops back, as we write now.", "It is in a woman's hand."),
        answer: "b",
        discrepancy: true,
        comment: "He's tried to write the old hand and his own hand keeps showing through. Look at the exemplar.",
      },
      {
        id: "cords",
        label: "The seal cords",
        leftText: "Sir Hugh's seal hangs on a leather tag. Abbey charters of Walter's day hang on tags and on silk.",
        rightText: "The seal hangs on two silk cords.",
        options: opt("Silk cords instead of a leather tag.", "The cords are cut and retied.", nothing),
        answer: "c",
        discrepancy: false,
        comment: "Agreed. Both were used in Walter's day. That proves nothing.",
      },
      {
        id: "initial",
        label: "The first letter",
        leftText: "A plain capital in the same ink as the text.",
        rightText: "A plain capital in the same ink as the text.",
        options: opt("The first letter is gilded.", "The first letter is missing.", nothing),
        answer: "c",
        discrepancy: false,
        comment: "Agreed. Plain in both.",
      },
    ],
  },
];
