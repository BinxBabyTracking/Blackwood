import "server-only";
import type { CaseDefinition, Condition, DeductionDef, EndingDef } from "@/game/engine/types";
import { dead, WITNESSES } from "./rules";

/*
 * RESTRICTED STORY LOGIC for HALLOW001, The Thirteenth Guest. Server-only.
 * Nothing here reaches the browser until the player earns it (a confirmed
 * deduction) or closes the case. Deductions follow docs/HALLOW001-timeline.md.
 *
 * Every deduction has more than one pair, so different lines of reasoning get
 * there, and none depends only on evidence Lucian Marsh can destroy (HE027,
 * HE035) or create (HE036, HE037, HE038).
 */

const has = (...ids: string[]): Condition[] => ids.map((id) => ({ hasEvidence: id }));
const made = (...ids: string[]): Condition[] => ids.map((id) => ({ deduction: id }));
const josieKnown: Condition = { any: [{ talkedTo: "josie" }, { hasEvidence: "HE017" }, { hasEvidence: "HE034" }] };
/** Enough is known about 1998 to ask what happened then (the report's options stay hidden until it is). */
const knows1998: Condition = { any: [{ hasEvidence: "HE008" }, { hasEvidence: "HE018" }, { hasEvidence: "HE034" }, { hasEvidence: "HE017" }, { flag: "josie_found" }] };
/** Enough is known about the foundation's money to name it as a motive. */
const knowsMoney: Condition = { any: [{ hasEvidence: "HE019" }, { hasEvidence: "HE020" }, { hasEvidence: "HE027" }, { hasEvidence: "HE031" }, { hasEvidence: "HE038" }] };

export const deductions: DeductionDef[] = [
  {
    id: "HD01",
    code: "HD01",
    title: "The Blackout Was Deliberate",
    text: "The house went dark from 10:13 to 10:20 because the new main switch in the cellar was pulled down to OFF by hand. It cannot trip, nothing else failed, and it was fitted a week ago as a lever \"anyone can throw.\"",
    connections: [["HE006", "HE030"], ["HE006", "HE007"], ["HE006", "amos"]],
  },
  {
    id: "HD02",
    code: "HD02",
    title: "There Was Another Way Into the Study",
    text: "The fourth bookcase in the study is a door, hinged, its screws freshly taken out, onto a back stair inside the wall that runs down to the service corridor. Someone used it tonight: one set of prints, up and down.",
    connections: [["HE004", "HE021"], ["HE004", "HE005"], ["HE005", "HE021"]],
  },
  {
    id: "HD03",
    code: "HD03",
    title: "The Locked Room Was Staged",
    text: "The study door was bolted from inside, and nothing on the corridor side could have bolted it. Whoever struck Ambrose did not leave by the door: they came and went by the servants' stair behind the shelves, and left the room looking sealed.",
    connections: [["HE001", "HE004"], ["HE001", "HE021"], ["HE001", "HE005"]],
    requires: { any: has("HE005", "HE021") },
  },
  {
    id: "HD04",
    code: "HD04",
    title: "The Thirteenth Guest Was Expected",
    text: "Ambrose invited twelve guests in writing and ordered thirteen places. The thirteenth was set at the foot of the table, for a guest who would come late, on foot, and was not to be asked anything. She was not an intruder.",
    connections: [["HE011", "HE012"], ["HE010", "HE011"], ["HE010", "HE012"], ["HE011", "HE013"]],
  },
  {
    id: "HD05",
    code: "HD05",
    title: "The Veiled Woman Was Josie Lisle",
    text: "The woman in black who sat in the thirteenth place, stood outside the study at 10:15 and hid in the Rose Room is Josephine Lisle, Annabel Lisle's younger sister, who came on Ambrose's own invitation.",
    connections: [["HE016", "HE034"], ["HE014", "HE017"], ["HE016", "HE017"], ["josie", "HE014"], ["josie", "HE016"]],
    requires: josieKnown,
  },
  {
    id: "HD06",
    code: "HD06",
    title: "Annabel Found the Foundation's Secret",
    text: "In October 1998 Annabel Lisle, working in the foundation's archive, found that it had bought three pieces of land from companies run by its own treasurer, Lucian Marsh, at nearly three to more than four times their appraised value, and that the books had been changed to hide it.",
    connections: [["HE018", "HE019"], ["HE019", "HE020"], ["annabel", "HE019"]],
  },
  {
    id: "HD07",
    code: "HD07",
    title: "Annabel Died at the Estate in 1998",
    text: "Annabel Lisle did not run away. She died at the estate on Halloween 1998, and her death was hidden.",
    connections: [["HE022", "HE025"], ["HE023", "HE025"], ["HE025", "HE035"], ["HE023", "HE035"], ["HE022", "HE035"], ["HE020", "HE025"]],
  },
  {
    id: "HD08",
    code: "HD08",
    title: "Ambrose Helped Hide It",
    text: "Ambrose Blackthorn knew. He let her body be hidden under the carriage house, let the chamber be bricked over the week after, closed the back stair, and kept twenty years of silence, and the note telling him to burn the evidence.",
    connections: [["HE025", "HE026"], ["HE026", "HE035"], ["HE024", "HE026"], ["HE022", "HE026"]],
  },
  {
    id: "HD09",
    code: "HD09",
    title: "Marsh Had Reason to Silence Ambrose",
    text: "Ambrose meant to give his attorney the foundation's records and a statement about a death in 1998 on November 1, and had told one trustee he would. The records he meant to hand over show Lucian Marsh profiting from the foundation he kept the books for.",
    connections: [["HE027", "HE031"], ["HE031", "HE038"], ["HE019", "HE031"], ["HE031", "HE035"], ["HE020", "HE031"]],
  },
  {
    id: "HD10",
    code: "HD10",
    title: "Marsh Could Reach the Study in the Dark",
    text: "Lucian Marsh signed out the key to the stair's sealed lower door at 7:10 PM and never signed it back. That door opens on the servants' stair, which runs up behind the study shelves and was used tonight.",
    connections: [["HE029", "HE005"], ["HE029", "HE028"], ["HE009", "HE029"], ["HE029", "HE021"]],
  },
  {
    id: "HD11",
    code: "HD11",
    title: "Marsh Killed Ambrose Blackthorn",
    text: "Lucian Marsh pulled the main switch at 10:13, went up the servants' stair in the dark, came through the hinged bookcase into a study Ambrose had bolted against him, and struck him with the brass griffin from the shelf. He went back down the stair, out through the cellar onto the terrace, and in again through the conservatory at 10:19.",
    connections: [["crane", "HE002"], ["crane", "HE005"], ["crane", "HE003"]],
    requires: { all: made("HD01", "HD03", "HD09", "HD10") },
  },
  {
    id: "HD12",
    code: "HD12",
    title: "The Killer Turned on a Witness",
    text: "During the investigation the killer went after one of the people who could expose him: a warning left in a witness's coat, or an attack on a witness left alone.",
    connections: [["HE036", "crane"], ["HE037", "crane"], ["HE036", "HE023"], ["HE037", "HE014"]],
    requires: { any: [{ flag: "bridget_threatened" }, { flag: "attack_made" }] },
  },
  {
    id: "HD13",
    code: "HD13",
    title: "Marsh Caused Annabel's Death",
    text: "Annabel Lisle confronted Lucian Marsh with the land records and died at the foot of the servants' stair the same night. By Marsh's own account to Ambrose, she fell. Her death was hidden, with Ambrose's help, and for twenty years the foundation Marsh was robbing called her a runaway.",
    connections: [["HE023", "HE035"], ["HE026", "HE035"], ["crane", "HE035"]],
    requires: { all: made("HD06", "HD07") },
  },
];

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "culprit",
    section: "A",
    title: "The Killer",
    question: "Who killed Ambrose Blackthorn?",
    options: [
      { id: "crane", label: "Lucian Marsh" },
      { id: "felix", label: "Felix Blackthorn" },
      { id: "constance", label: "Constance Blackthorn" },
      { id: "josie", label: "Josie Lisle", requires: josieKnown },
      { id: "penrose", label: "Dr. Isaac Penrose" },
      { id: "intruder", label: "An intruder from outside" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "method",
    section: "B",
    title: "The Locked Room",
    question: "How did the killer get in and out of a study bolted from inside?",
    options: [
      { id: "stair", label: "By the servants' stair behind the hinged bookcase" },
      { id: "key", label: "Locked the door behind them from the corridor" },
      { id: "hid", label: "Hid in the room until the door was forced" },
      { id: "window", label: "Through a window" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "blackout",
    section: "C",
    title: "The Blackout",
    question: "Why did the lights go out at 10:13?",
    options: [
      { id: "switched", label: "The new main switch in the cellar was pulled by hand" },
      { id: "storm", label: "The storm, or an overload" },
      { id: "fault", label: "A fault in the old wiring" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "guest",
    section: "D",
    title: "The Thirteenth Guest",
    question: "Who was the woman in the black veil?",
    options: [
      { id: "josie", label: "Josie Lisle, Annabel's sister, invited by Ambrose", requires: josieKnown },
      { id: "intruder", label: "A stranger who walked in off the road" },
      { id: "performer", label: "A performer hired for Halloween" },
      { id: "constance", label: "Constance Blackthorn, in disguise" },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "annabel",
    section: "E",
    title: "Halloween 1998",
    question: "What happened in this house on Halloween 1998?",
    options: [
      { id: "crane_concealed", label: "Annabel Lisle died at the estate after confronting Lucian Marsh, and her death was hidden with Ambrose's help", requires: knows1998 },
      { id: "ran", label: "Annabel Lisle ran away from home", requires: knows1998 },
      { id: "ambrose", label: "Ambrose Blackthorn killed Annabel Lisle", requires: knows1998 },
      { id: "open_accident", label: "Annabel Lisle died in an accident nobody concealed", requires: knows1998 },
      { id: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "why",
    section: "F",
    title: "The Motive",
    question: "Why was Ambrose killed?",
    options: [
      { id: "silence", label: "To stop him exposing the foundation's thefts and what happened in 1998", requires: knowsMoney },
      { id: "inheritance", label: "For his son's inheritance" },
      { id: "revenge", label: "Revenge for something in the past" },
      { id: "affair", label: "To hide an affair" },
      { id: "unknown", label: "Unknown" },
    ],
  },
];

/*
 * Canonical solution: Lucian Marsh killed Ambrose Blackthorn in the study,
 * coming and going by the servants' stair, after pulling the main switch, to
 * stop him exposing the foundation thefts and Annabel Lisle's death in 1998.
 * The veiled woman was Josie Lisle. Annabel died at the estate after
 * confronting Marsh, and Ambrose helped hide it.
 */
export const solution: CaseDefinition["solution"] = {
  answers: {
    culprit: "crane",
    method: "stair",
    blackout: "switched",
    guest: "josie",
    annabel: "crane_concealed",
    why: "silence",
  },
  standard: {
    // 36 core items (and up to two the killer can add). Every collected item goes with the report.
    minItems: 6,
    maxItems: 12,
    minKey: 6,
    claims: [
      {
        id: "tie",
        label: "Places the person you name at the scene, or ties them to that night",
        anyOf: ["HE009", "HE028", "HE029", "HE037"],
        hint: "Look at who came and went below stairs, and ask who saw whom in the dark.",
      },
      {
        id: "how",
        label: "Shows how it was done or how it was covered up",
        anyOf: ["HE001", "HE004", "HE005", "HE006", "HE021", "HE030"],
        hint: "The study and the cellar keep their own record of those seven minutes.",
      },
      {
        id: "why",
        label: "Shows why they did it",
        anyOf: ["HE019", "HE020", "HE027", "HE031", "HE035", "HE038"],
        hint: "Follow the foundation's money, in 1997 and since.",
      },
      {
        id: "story",
        label: "Tests the story they told: an alibi, a timeline or a statement",
        anyOf: ["HE028", "HE029", "HE014"],
        hint: "Ask who else was where the suspect says he was.",
      },
      {
        id: "past",
        label: "Shows what happened in this house twenty years ago",
        anyOf: ["HE018", "HE022", "HE023", "HE025", "HE026", "HE035"],
        hint: "The people who worked in this house in 1998 remember more than they have said.",
      },
      {
        id: "guest",
        label: "Shows who sat in the thirteenth place",
        anyOf: ["HE016", "HE017", "HE034", "HE012"],
        hint: "Someone at the table knew her face, and she left something behind upstairs.",
      },
    ],
    lines: [
      { id: "scene", label: "The study and the stair", anyOf: ["HE001", "HE002", "HE003", "HE004", "HE005", "HE007", "HE008", "HE009"] },
      { id: "night", label: "The night: alibis, keys and the blackout", anyOf: ["HE006", "HE012", "HE014", "HE015", "HE028", "HE029", "HE030"] },
      { id: "money", label: "The foundation's money", anyOf: ["HE019", "HE020", "HE027", "HE031", "HE038"] },
      { id: "past", label: "Halloween 1998", anyOf: ["HE017", "HE018", "HE022", "HE023", "HE024", "HE025", "HE026", "HE035"] },
    ],
    minLines: 3,
    linkToSuspect: ["HE009", "HE028", "HE029", "HE037"],
    linkNote: "Nothing attached ties the person you name to the stair, the cellar or the study between 10:13 and 10:20 PM.",
    supporting: ["HE010", "HE011", "HE013", "HE016", "HE032", "HE033", "HE034", "HE036"],
    maxUnrelated: 2,
    undecided: ["unknown"],
  },
  resolution: {
    accepted: "Your findings have been accepted. The agency has forwarded your report to Det. Lt. Joan Mahoney, Massachusetts State Police, and through her to the Berkshire District Attorney.",
    reconstruction: [
      {
        heading: "Ridgeline Road",
        body: "In 1997 the Blackthorn Foundation bought thirty-one acres on Ridgeline Road from Hollins Ridge Associates for $410,000. It was appraised at $95,000. Hollins Ridge Associates was Lucian Marsh, the foundation's treasurer. Elm Hollow and the Patten farm went the same way. Marsh had Harriet Lowell enter each at the price paid, citing a second appraiser who never existed, and Ambrose signed what Marsh put in front of him.",
      },
      {
        heading: "Halloween 1998",
        body: "Annabel Lisle, seventeen, was the cleverest of the archive volunteers. In October she found the two figures for Ridgeline Road, and Harriet told her, frightened, that the books had been changed. On Halloween, at 8:15, she found Marsh's own letters in the archive. At 8:40 she confronted him at the library door, and Bridget Duffy heard him tell her it was not her business. At 8:47 she went through the library's service door into the passage below the house, and Marsh followed her.",
      },
      {
        heading: "The stone steps",
        body: "At the foot of the servants' stair, at about 8:51, Marsh caught her by the arm and shoved her. She fell backward down the four stone steps and struck her head on the edge of the last one. She died there. Marsh carried her into the old coal room and took her papers. At half past nine Ambrose found him in the passage, shaking, and Marsh told him she had fallen. After forty minutes alone in his study, Ambrose agreed to help him.",
      },
      {
        heading: "Twenty years",
        body: "At 11:20 that night Marsh backed his Volvo to the carriage house with the lights off, and Annabel was put into the drainage chamber under the inspection pit. On Wednesday the masons bricked it over \"for safety.\" Beatrice Holloway told the police the girl had talked about leaving home, and the case was filed as a runaway. Ambrose closed the back stair in 1999 and kept Marsh's note telling him to burn it. Marsh kept the books. From 2014 he paid himself $1,380,000 more, as Marsh Advisory, for advice nobody received.",
      },
      {
        heading: "The thirteenth place",
        body: "In October 2018 Ambrose learned that the carriage house renovation would open the chamber on November 5, and that Marsh had never stopped stealing. He invited ten people who had been at the 1998 party, with his attorney to witness and a historian for the house, and wrote separately to Josie Lisle, Annabel's sister, to come as she liked and take the thirteenth place. On October 22 he told Marsh he would tell the truth on Halloween and give his records to Everett Byrne on November 1. Two days later Marsh had the cellar's old main breaker replaced with a lever anyone could throw.",
      },
      {
        heading: "7:10 to 10:13 PM",
        body: "At 7:10 Marsh signed the sealed lower stair door key out of Oscar Wren's key book. At 7:15 he took the four brass screws out of the hinged bookcase in the study, oiled its hinge, cut the paint around the door at the foot of the stair, and cut the padlock on the lane gate past the maze, in case he needed another way out. At 10:08 he left the table for \"a call from Boston\" and went down to the cellar. At 10:11 Ambrose went up to his study and bolted the door behind him. At 10:13 Marsh pulled the switch, and the house went dark.",
      },
      {
        heading: "10:15 PM",
        body: "By penlight Marsh went up the servants' stair, pressed the catch, and swung the fourth bookcase into the study. Ambrose turned from his desk toward the shelves. Marsh took the brass griffin from the shelf beside the hidden door and struck him once. At the bolted door Josie Lisle, who had come at Ambrose's invitation, heard him cry out and fall, and screamed. Marsh took the folder of Marsh Advisory invoices from the desk and went back down the stair.",
      },
      {
        heading: "10:16 to 10:20 PM",
        body: "Felix Blackthorn and Oscar Wren ran up the main stair and saw a veiled woman vanish into the guest wing. Below, Marsh pushed the folder in behind the port bins and went out by the cellar's areaway door onto the terrace, as Amos Duffy came down the kitchen stair to find the switch. At 10:19 Marsh came in through the conservatory's garden door, wet, past Dr. Penrose and Constance Blackthorn, who were there for reasons of their own. \"Did the lights go?\" At 10:20 Amos put the switch back up.",
      },
    ],
    bennett: [
      "Mahoney. Your report's with the DA, and it holds.",
      "Lucian Marsh is charged with the murder of Ambrose Blackthorn. On what you found under the carriage house and in that globe, the DA's looking at manslaughter for Annabel Lisle too, and the Attorney General has the foundation's books.",
      "Josie Lisle asked me to tell you something. She said nobody has said her sister's name out loud in that house for twenty years, and tonight everybody did.",
      "Go home and sleep. It's Halloween for another few hours somewhere.",
    ],
    caller: { characterId: "mahoney", name: "Det. Lt. Joan Mahoney", tag: "Massachusetts State Police · by telephone" },
  },
  endings: [
    {
      id: "empty_chair_two",
      title: "The Empty Chair",
      loss: true,
      lossReason: "A witness was killed and Lucian Marsh walked out of the house before you could prove what he did.",
      when: { all: [{ flag: "crane_escaped" }, { flag: "second_murder" }] },
      accepted:
        "Your findings have been accepted. The agency has forwarded your report to Det. Lt. Joan Mahoney, Massachusetts State Police. A warrant has been issued for Lucian Marsh for two murders. He left the estate during the investigation and has not been found.",
      reconstruction: [
        {
          heading: "The empty chair",
          body: "Lucian Marsh did not only watch. While the investigation went on in other rooms he silenced a witness on the back stairs, and later, when the house knew too much about him, he walked out of it. Nobody saw him go. You know what he did, twice over. You could not keep him in the house long enough to prove it to his face.",
        },
      ],
      bennett: [
        "Mahoney. Your report holds. The warrant's signed: two murders, and the DA wants to talk about Annabel Lisle as well.",
        "His car turned up at the train station in Pittsfield at two in the morning. That's all we have.",
        "I keep going over it. Two officers, a house full of witnesses, one man who wanted one of them quiet and then wanted out. There's no shame in it. There's no comfort either.",
        "We'll find him. You did the part that lets us put him away when we do.",
      ],
    },
    {
      id: "empty_chair",
      title: "The Empty Chair",
      loss: true,
      lossReason: "Lucian Marsh walked out of the house before you could prove what he did.",
      when: { flag: "crane_escaped" },
      accepted:
        "Your findings have been accepted. The agency has forwarded your report to Det. Lt. Joan Mahoney, Massachusetts State Police. A warrant has been issued for Lucian Marsh, who left the estate during the investigation and has not been found.",
      reconstruction: [
        {
          heading: "The empty chair",
          body: "Somewhere between the questions, Lucian Marsh decided the house knew too much about him and walked out of it. Nobody saw him go. By the time anyone looked, his place at the table was empty for the second time that night, and the road was empty with it. You know what he did. You could not keep him in the house long enough to prove it to his face.",
        },
      ],
      bennett: [
        "Mahoney. Your report holds. The warrant's signed: murder, for Ambrose Blackthorn, and the DA wants to talk about Annabel Lisle.",
        "Marsh's car turned up at the train station in Pittsfield at two in the morning. That's all we have. He's sixty-one with a lot of money and a head start.",
        "We'll find him. Men like that think they're the only clever person in the room. They get careless.",
        "You did the hard part. Josie Lisle knows what happened to her sister now. That's not nothing.",
      ],
    },
    ...WITNESSES.map(
      (w): EndingDef => ({
        id: `second_body_${w.id}`,
        title: "A Second Body",
        loss: true,
        lossReason: `${w.name} was killed on the back stairs while you investigated elsewhere.`,
        when: dead(w.id),
        accepted:
          "Your findings have been accepted. The agency has forwarded your report to Det. Lt. Joan Mahoney, Massachusetts State Police. Lucian Marsh is charged with two murders.",
        reconstruction: [
          {
            heading: "The back stairs",
            body: `While the house was held and the investigation went on in other rooms, Lucian Marsh decided ${w.name} knew too much. He found them alone near the back stairs and struck them from behind with a brass stair rod. Nobody was watching them. Nobody could have been everywhere. The case was solved anyway, from what was already found, but two people are dead who were alive at dinner.`,
          },
        ],
        bennett: [
          "Mahoney. Your report holds. Lucian Marsh is charged with the murder of Ambrose Blackthorn, and with the murder of " + w.name + ".",
          "I keep going over it. Two officers, four witnesses, one man who wanted one of them quiet. There's no shame in it. There's no comfort in it either.",
          "The DA's looking at Annabel Lisle too. Josie Lisle knows what happened to her sister now.",
          "Get some sleep. You'll think about this one for a while. So will I.",
        ],
      }),
    ),
    {
      id: "last_witness",
      title: "The Last Witness",
      when: { flag: "attack_interrupted" },
      accepted:
        "Your findings have been accepted. The agency has forwarded your report to Det. Lt. Joan Mahoney, Massachusetts State Police. Lucian Marsh was arrested during an attempt on a witness's life that your officer prevented.",
      reconstruction: [
        {
          heading: "The officer on the stair",
          body: "Lucian Marsh decided one of the witnesses had to be silenced, and went after them on the back stairs with a brass stair rod. He did not know an officer had been quietly keeping an eye on them, because you had asked for one, and asked for it quietly. He was on the floor in handcuffs before he could swing twice.",
        },
      ],
      bennett: [
        "Mahoney. Your report holds. Lucian Marsh is charged with the murder of Ambrose Blackthorn and the attempted murder of a witness. My officer's still talking about it.",
        "You put an officer where nobody would think to look for one. That's the whole job, some nights.",
        "The DA's looking at Annabel Lisle too. Josie Lisle knows what happened to her sister now.",
        "Go home. That one's alive because of you.",
      ],
    },
    {
      id: "truth_before_midnight",
      title: "The Truth Before Midnight",
      when: { any: [{ flag: "arrested_before_midnight" }, { not: { clockAt: "00:00" } }] },
      accepted:
        "Your findings have been accepted. The agency has forwarded your report to Det. Lt. Joan Mahoney, Massachusetts State Police. Lucian Marsh was in custody before midnight, and nobody else was hurt.",
      reconstruction: [
        {
          heading: "Before midnight",
          body: "Lucian Marsh spent the investigation among the other guests, watching, choosing how to save himself. He ran out of time before he could. He was in custody before midnight, before the lanterns went out into the maze, before anyone else in that house was hurt. Ambrose Blackthorn's thirteenth guest heard her sister's name said aloud in his dining room at last, by the police.",
        },
      ],
    },
    {
      id: "long_night",
      title: "The Long Night",
      when: { always: true },
      accepted:
        "Your findings have been accepted. The agency has forwarded your report to Det. Lt. Joan Mahoney, Massachusetts State Police. Lucian Marsh is in custody, and nobody else was hurt.",
      reconstruction: [
        {
          heading: "After midnight",
          body: "It took the whole of Halloween night and some of the morning after. Midnight came and went with Lucian Marsh still free in the house, still watching, and the witnesses still within his reach. Nobody else was hurt. When he was finally taken out to the cruiser, the rain had stopped and the lanterns were guttering out in the greenhouse.",
        },
      ],
    },
  ],
};
