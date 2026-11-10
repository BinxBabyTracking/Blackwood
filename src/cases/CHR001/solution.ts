import "server-only";
import type { CaseDefinition, DeductionDef } from "@/game/engine/types";

/*
 * RESTRICTED STORY LOGIC for CHR001. Server-only. Deductions CD01 to CD10
 * follow the case design (v0.1, a draft for approval). The report, its
 * standard and the endings are placeholders until the timeline and build
 * contract are written.
 */

export const deductions: DeductionDef[] = [
  { id: "CD01", code: "CD01", title: "Aldric Was Murdered", text: "One round blow to the back of the head, and clean gears: the Keeper did not die in an accident.", connections: [["CE003", "CE004"], ["CE003", "CE005"], ["CE001", "CE003"]] },
  { id: "CD02", code: "CD02", title: "The Chronometer Was Stolen", text: "The case was opened with a key, the Keeper's keys are gone, and someone carried the watch away under the village.", connections: [["CE007", "CE008"], ["CE008", "CE013"], ["CE013", "CE029"]] },
  { id: "CD03", code: "CD03", title: "A Way In Unseen", text: "Someone came up through the tower cellar from the steam tunnels, by way of the stables' boiler room, while the apprentice was away.", connections: [["CE010", "CE012"], ["CE011", "CE012"], ["CE009", "CE010"], ["CE006", "CE015"]] },
  { id: "CD04", code: "CD04", title: "The Thornes Are Losing Years", text: "The Thorne family gives far more of its life to Christmas Eve than any other, and Mira is paying for it.", connections: [["CE017", "CE018"], ["CE016", "CE017"], ["CE018", "CE028"]] },
  { id: "CD05", code: "CD05", title: "The Chronometer Is Faulty", text: "One gear was cut wrong four centuries ago. It slips, and takes twelve times its share.", connections: [["CE020", "CE021"], ["CE017", "CE020"]] },
  { id: "CD06", code: "CD06", title: "The Keeper Knew", text: "Aldric found the faulty gear last spring.", connections: [["CE021", "CE020"], ["CE021", "aldric"]] },
  { id: "CD07", code: "CD07", title: "Aldric Was Building a Replacement", text: "A new chronometer, its crystal ordered, its reservoir built, a meeting booked with Santa to show it.", connections: [["CE022", "CE023"], ["CE022", "CE025"], ["CE022", "CE026"], ["CE023", "CE024"]] },
  { id: "CD08", code: "CD08", title: "He Thought the Keeper Would Not Help", text: "Garrick read the Register, asked Aldric to stop the Chronometer, and heard only \"not tonight.\"", connections: [["CE016", "CE027"], ["CE027", "CE028"], ["CE027", "aldric"]] },
  { id: "CD09", code: "CD09", title: "The Fatal Blow", text: "The crank on the wrong peg, the rag from the Thorne workshop and the wound together.", connections: [["CE005", "CE006"], ["CE003", "CE005"]] },
  { id: "CD10", code: "CD10", title: "Christmas Without the Stolen Years", text: "The new chronometer spends time banked all year from the village clocks, not from anyone's life.", connections: [["CE022", "CE030"], ["CE025", "CE030"]] },
];

export const conclusionChoices: CaseDefinition["conclusionChoices"] = [
  {
    id: "culprit",
    section: "A",
    title: "The Attack on the Keeper",
    question: "Who struck Aldric?",
    options: [
      { id: "garrick", label: "Garrick Thorne" },
      { id: "corwin", label: "Corwin Sleet" },
      { id: "glint", label: "Dr. Hesper Glint" },
      { id: "pip", label: "Pip Larkspur" },
    ],
  },
];

export const solution: CaseDefinition["solution"] = {
  answers: { culprit: "garrick" },
  standard: {
    minItems: 4,
    maxItems: 7,
    lines: [
      { id: "scene", label: "The scene", anyOf: ["CE003", "CE004", "CE005", "CE006"] },
      { id: "access", label: "The way in", anyOf: ["CE010", "CE011", "CE012", "CE015"] },
      { id: "motive", label: "The reason", anyOf: ["CE016", "CE017", "CE018", "CE027", "CE028"] },
    ],
    minLines: 3,
    linkToSuspect: ["CE006", "CE012", "CE015", "CE027"],
    supporting: ["CE001", "CE002", "CE009", "CE019", "CE020", "CE021", "CE022"],
    maxUnrelated: 1,
    undecided: [],
  },
  resolution: {
    accepted: "Report accepted. (Placeholder until the CHR001 timeline and build contract are written.)",
    reconstruction: [],
    bennett: [],
    caller: { characterId: "juniper", name: "Chief Inspector Juniper Ashby", tag: "Jingle Division" },
  },
};
