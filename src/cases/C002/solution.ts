import "server-only";
import type { CaseDefinition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for C002. Server-only. Nothing here reaches the
 * browser until the player earns it (a confirmed deduction) or closes the case.
 */

export const deductions: DeductionDef[] = [
  {
    id: "D1",
    title: "Both Were Drugged",
    text: "The same sleep preparation dried in both glasses, the glasses were wiped, and Tom Hale's own blood test shows a sedative at a level that fits about three in the morning. Two people were made to drink.",
    connections: [["E23", "E03"], ["E23", "E02"]],
  },
  {
    id: "D2",
    title: "The Delay Explained",
    text: "Tom was unconscious until 9:40. The letter told him not to call the police and promised a call at one o'clock; he withdrew what he had and waited for it. When no call came, he called the police at 1:40.",
    connections: [["E04", "E22"], ["E04", "E05"], ["E05", "E22"]],
  },
  {
    id: "D3",
    title: "Someone Else Was There",
    text: "A neighbor logged a dark van at Tom's curb from about three until twenty to four, leaving with no headlights. The cut ties under the bed and Tom's account describe an intruder the police file never mentions.",
    connections: [["E06", "E01"], ["E06", "E05"], ["howard", "E05"]],
  },
  {
    id: "D4",
    title: "She Was Alive on Monday",
    text: "On the cassette Laura reads the date and Monday's Daily Star headline. The letter that came with it was typed like the ransom letter. Whoever had her on Monday sent both.",
    connections: [["E08", "E07"], ["E08", "E04"]],
  },
  {
    id: "D5",
    title: "A Mountain Hideout",
    text: "The calls to the Courier came from a payphone at Tamarack Lake, where a lumber mill blows a whistle at noon on weekdays. The whistle is on Laura's tape, and she heard it on Monday and Tuesday at midday after a long climb into the pines.",
    connections: [["E08", "E09"], ["E09", "E14"], ["E12", "E09"], ["E08", "E14"]],
  },
  {
    id: "D6",
    title: "One Man, Not a Crew",
    text: "Laura heard only one man, who kept talking about 'the crew'. Tom heard one set of footsteps. The letters insist on a professional crew. The crew was a story told by one man.",
    connections: [["E12", "E07"], ["E12", "E10"], ["E12", "E04"]],
  },
  {
    id: "D7",
    title: "The Hoax Theory Fails",
    text: "The police called it staged. But a lab found the same sedative in two wiped glasses, Tom's blood confirms it, and Laura was alive on tape reading Monday's headline. A staged story doesn't drug its own teller.",
    connections: [["E11", "E03"], ["E11", "E08"], ["E11", "E23"]],
  },
  {
    id: "D8",
    title: "Same Method",
    text: "Oak Terrace: a night entry through an unlocked garage side door, a stun gun, a toy pistol, black cable ties, a thermos of something orange and sweet, and a tape announcing a crew. It is the same method as Elm Street.",
    connections: [["E16", "E12"], ["E16", "E13"], ["E16", "E05"]],
  },
  {
    id: "D9",
    title: "Whose Pager",
    text: "The pager dropped in Oak Terrace is on Vera Pell's account at Cabin 14, Tamarack Lake, with the store payphone as its contact. Her son Gordon, a repairman, lives there and signs her store account.",
    connections: [["E17", "E14"], ["E17", "E15"], ["E17", "E09"]],
  },
  {
    id: "D10",
    title: "The Same Typewriter",
    text: "The ransom letter and both letters to the Courier were typed on the Smith-Corona found at Cabin 14, the machine whose ribbon Gordon Pell bought on October 3.",
    connections: [["E19", "E04"], ["E19", "E07"], ["E19", "E10"]],
  },
  {
    id: "D11",
    title: "The Recorded Threat",
    text: "The cassette labeled MSG in the cabin's recorder is the 'crew' message played in Tom Hale's bedroom, word for word.",
    connections: [["E20", "E05"], ["E20", "tom"]],
  },
];

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "culprit",
    section: "A",
    title: "Responsible",
    question: "Who was responsible for Laura Kessler's disappearance?",
    options: [
      { id: "tom", label: "Tom Hale" },
      { id: "laura", label: "Laura Kessler (staged it herself)" },
      { id: "tom_laura", label: "Tom Hale and Laura Kessler together" },
      { id: "crew", label: "An organized crew" },
      // Offered once the investigator knows his name.
      { id: "gordon", label: "Gordon Pell", requires: { any: [{ hasEvidence: "E14" }, { hasEvidence: "E15" }, { hasEvidence: "E17" }, { talkedTo: "gordon" }] } },
      { id: "unknown", label: "Unknown / Insufficient Evidence" },
    ],
  },
  {
    id: "motive",
    section: "B",
    title: "Motive",
    question: "What was the motive?",
    options: [
      { id: "ransom", label: "To collect a ransom" },
      { id: "publicity", label: "Publicity, or a book deal" },
      { id: "jealousy", label: "Jealousy" },
      { id: "quarrel", label: "To hide a quarrel that went wrong" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "weapon",
    section: "C",
    title: "Method",
    question: "How was Laura taken?",
    options: [
      { id: "night_entry", label: "A night break-in: both drugged with a sedative drink, and she was driven away" },
      { id: "willing", label: "She left willingly" },
      { id: "tom_drove", label: "Tom drove her somewhere" },
      { id: "street", label: "A crew snatched her off the street" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "location",
    section: "D",
    title: "Where She Was Held",
    question: "Where was Laura held?",
    options: [
      { id: "motel", label: "A motel in San Bernardino" },
      { id: "garage", label: "Tom's garage" },
      { id: "ruth", label: "Ruth Kessler's apartment" },
      // Offered once the investigator has found the cabin.
      { id: "cabin14", label: "Cabin 14, Tamarack Lake", requires: { any: [{ hasEvidence: "E14" }, { hasEvidence: "E15" }, { hasEvidence: "E17" }, { visited: "cabin14" }] } },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Gordon Pell, for a ransom, by a night break-in with a
 * sedative drink, holding her at Cabin 14, Tamarack Lake.
 */
export const solution: CaseDefinition["solution"] = {
  culprit: "gordon",
  motive: "ransom",
  weapon: "night_entry",
  location: "cabin14",
  standard: {
    minItems: 4,
    maxItems: 6,
    minKey: 4,
    lines: [
      { id: "night", label: "The night at Elm Street", anyOf: ["E01", "E02", "E03", "E05", "E06", "E22", "E23"] },
      { id: "communications", label: "The letters, tapes and calls", anyOf: ["E04", "E07", "E08", "E09", "E10", "E19", "E20"] },
      { id: "hideout", label: "Where she was held", anyOf: ["E12", "E13", "E14", "E15", "E18"] },
      { id: "second", label: "The second crime", anyOf: ["E16", "E17"] },
    ],
    minLines: 2,
    linkToSuspect: ["E17", "E18", "E19", "E20"],
    supporting: ["E11", "E21"],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted:
      "Your findings have been accepted. The agency has forwarded your report to Det. Frank Bennett, LAPD, and to Sgt. Walter Ferris, Mariposa Bay Police.",
    reconstruction: [
      {
        heading: "The plan",
        body: "Gordon Pell, a television repairman living alone in his mother's cabin at Tamarack Lake, needed money. He chose houses where a side door was left unlocked on trash night, wrote the addresses in a spiral notebook, and bought what he needed on his mother's store account: cable ties, blank cassettes, electrical tape, a typewriter ribbon, orange juice. He recorded a message in a flat voice announcing 'a crew'.",
      },
      {
        heading: "Monday, 3:05 AM",
        body: "He let himself into 418 Elm Street through the garage side door Tom had left unlocked. A flashlight, a stun gun and a black-painted toy pistol; cable ties and taped swim goggles; the tape about the crew; two kitchen glasses of orange juice and his mother's sleep preparation. He left the typed letter on the kitchen table and carried Laura to his van. Across the street Howard Lisk wrote down the time and the first two letters of the plate.",
      },
      {
        heading: "Cabin 14",
        body: "By twenty past six he was back at the cabin. Laura was kept in the back bedroom behind a boarded window, blindfolded, with a space heater and a mattress, and given something to drink at night. At 7:50 he filled the van at the store and bought the morning paper. At noon he recorded her reading its headline while the mill whistle blew across the lake. That afternoon he mailed the tape and a letter from San Bernardino.",
      },
      {
        heading: "Why the call never came",
        body: "Tom did what the letter said, and the call at one o'clock never came. On Tuesday Pell bought a roll of quarters and called the Courier three times from the store payphone. By Tuesday night the story was in the paper and the police were involved. He decided no ransom could be collected safely, and before dawn on Wednesday drove Laura down the mountain and left her on a bench in Alamitos Park, two blocks from her sister's door.",
      },
      {
        heading: "The hoax",
        body: "On Wednesday evening the Mariposa Bay Police told reporters the abduction appeared to have been staged. It rested on what the police had not looked at: two glasses on a nightstand, a neighbor's note, three letters typed on one machine.",
      },
      {
        heading: "Oak Terrace",
        body: "On November 4 he tried again, in Oak Terrace, the same way. Diane Moss hit him with a lamp. He ran, bleeding, and his mother's pager fell from his jacket by the gate. Three days later deputies found the typewriter, the 'MSG' cassette, the goggles, the mask with his blood inside it, and the van with a plate beginning 2K.",
      },
    ],
    bennett: [
      "I read your report. So did Walt Ferris, twice. It holds up: the glasses, the tape, the whistle, the pager, the typewriter.",
      "The District Attorney has it now, with the sheriff's inventory. After that it's up to a court. Nothing on paper is a conviction.",
      "And the Mariposa Bay Police withdrew their statement this afternoon. Ferris called Tom and Laura himself. That's your doing. Thank you.",
    ],
  },
};
