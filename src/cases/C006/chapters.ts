import type { ChapterDef, ObjectiveDef } from "@/game/engine/types";

/*
 * C006's six chapters and their objectives. Intros, conclusions and
 * summaries are spoiler-safe: they never say who did what. Objective done
 * conditions use deductions, evidence and events, never the clock.
 * Optional lines of inquiry are listed under each chapter but never block it.
 */

export const objectives: ObjectiveDef[] = [
  // Chapter 1: The Girl in the Mill
  { id: "o1_file", text: "Review the discovery report in the case file.", visible: { always: true }, done: { hasEvidence: "E012" } },
  { id: "o1_crib", text: "Examine Tool Crib 4 at the East Mill.", visible: { always: true }, done: { all: [{ hasEvidence: "E013" }, { hasEvidence: "E014" }] } },
  { id: "o1_identity", text: "Establish whose remains were found.", visible: { always: true }, done: { hasEvidence: "E017" } },
  { id: "o1_movements", text: "Reconstruct Emily's last known movements.", visible: { always: true }, done: { all: [{ deduction: "D01" }, { deduction: "D04" }] } },
  { id: "o1_witnesses", text: "Interview Sarah and the people who knew Emily in 1996.", visible: { always: true }, done: { all: [{ talkedTo: "sarah" }, { any: [{ talkedTo: "rebecca" }, { talkedTo: "andrew" }, { talkedTo: "wade" }] }] } },
  { id: "o1_runaway", text: "Test the 1996 runaway theory.", visible: { always: true }, done: { deduction: "D05" } },
  { id: "o1_meeting", text: "Find what brought Emily to the mill.", visible: { always: true }, done: { all: [{ deduction: "D02" }, { deduction: "D03" }, { deduction: "D07" }] } },
  { id: "o1_opt_studio", text: "Optional: visit the photo studio where Emily worked.", visible: { always: true }, done: { hasEvidence: "E005" } },
  { id: "o1_opt_cause", text: "Optional: learn from the forensic anthropologist how she died.", visible: { always: true }, done: { deduction: "D06" } },

  // Chapter 2: The 1996 Incident
  { id: "o2_accident", text: "Investigate the June 1996 deaths in Gallery B.", visible: { chapter: 2 }, done: { deduction: "D13" } },
  { id: "o2_records", text: "Examine the plant's maintenance records.", visible: { chapter: 2 }, done: { all: [{ hasEvidence: "E023" }, { hasEvidence: "E024" }] } },
  { id: "o2_workers", text: "Interview the surviving workers and the union.", visible: { chapter: 2 }, done: { all: [{ talkedTo: "ray" }, { talkedTo: "earl" }] } },
  { id: "o2_altered", text: "Find a record that was altered.", visible: { chapter: 2 }, done: { deduction: "D14" } },
  { id: "o2_knew", text: "Establish what management knew, and when.", visible: { chapter: 2 }, done: { all: [{ deduction: "D11" }, { deduction: "D12" }, { deduction: "D16" }] } },
  { id: "o2_figures", text: "Identify who signed off on Gallery B.", visible: { chapter: 2 }, done: { all: [{ deduction: "D17" }, { hasEvidence: "E023" }, { talkedTo: "stroud" }] } },
  { id: "o2_emily", text: "Work out what Emily had found.", visible: { chapter: 2 }, done: { all: [{ hasEvidence: "E006" }, { any: [{ hasEvidence: "E026" }, { hasEvidence: "E031" }] }] } },
  { id: "o2_opt_motive", text: "Optional: find out what the plant stood to lose.", visible: { chapter: 2 }, done: { deduction: "D20" } },
  { id: "o2_opt_blame", text: "Optional: test the company's explanation.", visible: { chapter: 2 }, done: { deduction: "D15" } },

  // Chapter 3: Another Body
  { id: "o3_death", text: "Investigate Glenn Sutter's death.", visible: { chapter: 3 }, done: { all: [{ event: "RE06" }, { hasEvidence: "E043" }] } },
  { id: "o3_movements", text: "Reconstruct Glenn's last movements.", visible: { chapter: 3 }, done: { deduction: "D21" } },
  { id: "o3_robbery", text: "Decide whether it was a robbery.", visible: { chapter: 3 }, done: { deduction: "D22" } },
  { id: "o3_targeted", text: "Find who was at the storage facility that night.", visible: { chapter: 3 }, done: { deduction: "D23" } },
  { id: "o3_trent", text: "Look into Michael Trent and who he works for.", visible: { chapter: 3 }, done: { deduction: "D24" } },
  { id: "o3_page", text: "Find what Glenn was keeping.", visible: { chapter: 3 }, done: { hasEvidence: "E032" } },

  // Chapter 4: The Disappearance
  { id: "o4_movements", text: "Find out what happened to Len Greer on Sunday night.", visible: { chapter: 4 }, done: { event: "RE12" } },
  { id: "o4_house", text: "Examine Len's house.", visible: { chapter: 4 }, done: { all: [{ hasEvidence: "E063" }, { hasEvidence: "E064" }] } },
  { id: "o4_fled", text: "Decide whether Len fled or was taken.", visible: { chapter: 4 }, done: { deduction: "D26" } },
  { id: "o4_vehicle", text: "Trace the vehicle.", visible: { chapter: 4 }, done: { deduction: "D27" } },
  { id: "o4_property", text: "Find where he could be held.", visible: { chapter: 4 }, done: { deduction: "D28" } },
  { id: "o4_recover", text: "Get Det. Mitchell there in time.", visible: { chapter: 4 }, done: { event: "RE15" } },
  { id: "o4_testimony", text: "Take Len's statement.", visible: { chapter: 4 }, done: { all: [{ hasEvidence: "E077" }, { deduction: "D29" }, { deduction: "D30" }] } },

  // Chapter 5: The Hollow Creek Conspiracy
  { id: "o5_orders", text: "Connect the 1996 cover-up to the man who ordered it.", visible: { chapter: 5 }, done: { all: [{ deduction: "D19" }, { deduction: "D33" }] } },
  { id: "o5_money", text: "Follow the money, then and now.", visible: { chapter: 5 }, done: { any: [{ deduction: "D18" }, { hasEvidence: "E091" }] } },
  { id: "o5_hands", text: "Tie the 2018 violence together.", visible: { chapter: 5 }, done: { all: [{ deduction: "D25" }, { deduction: "D34" }] } },
  { id: "o5_witnesses", text: "Revisit the 1996 witnesses with what you know now.", visible: { chapter: 5 }, done: { all: [{ hasEvidence: "E086" }, { hasEvidence: "E083" }] } },
  { id: "o5_false", text: "Find which 1996 statements were false.", visible: { chapter: 5 }, done: { all: [{ hasEvidence: "E086" }, { deduction: "D09" }] } },
  { id: "o5_wade", text: "Test Wade Reeves's account of August 1996.", visible: { chapter: 5 }, done: { all: [{ deduction: "D08" }, { deduction: "D10" }] } },
  { id: "o5_separate", text: "Decide whether the cover-up explains Emily's death.", visible: { chapter: 5 }, done: { deduction: "D31" } },

  // Chapter 6: The Last Shift
  { id: "o6_evening", text: "Reconstruct Emily's last evening at the East Mill.", visible: { chapter: 6 }, done: { all: [{ hasEvidence: "E096" }, { hasEvidence: "E097" }] } },
  { id: "o6_opportunity", text: "Establish who was with her, and why.", visible: { chapter: 6 }, done: { deduction: "D32" } },
  { id: "o6_concealed", text: "Show how she was hidden.", visible: { chapter: 6 }, done: { hasEvidence: "E095" } },
  { id: "o6_whole", text: "Put the whole picture together.", visible: { chapter: 6 }, done: { deduction: "D35" } },
  { id: "o6_report", text: "File the final case report.", visible: { chapter: 6 }, done: { flag: "case_closed" } },
];

export const chapters: ChapterDef[] = [
  {
    number: 1,
    title: "The Girl in the Mill",
    intro: "Twenty-two years ago a nineteen-year-old girl drove away from her mother's house and was never seen again. Last week three teenagers found her in a locked room at the old steel mill. Her sister wants to know how she got there.",
    objectives: ["o1_file", "o1_crib", "o1_identity", "o1_movements", "o1_witnesses", "o1_runaway", "o1_meeting"],
    optional: ["o1_opt_studio", "o1_opt_cause"],
    conclusion: "Emily Lasko did not run away. She went to the mill to meet someone, and someone made sure she was never found. But one question remains: who was waiting for her inside the gate?",
    summary: "The remains are Emily's. The runaway theory does not survive her own car. She went to the East Mill that night, and she was hidden there on purpose.",
  },
  {
    number: 2,
    title: "The 1996 Incident",
    intro: "Emily spent her last summer photographing a memo her father was never meant to have. Two months before she vanished, three men died under the West End furnaces. The town was told it was their own fault.",
    objectives: ["o2_accident", "o2_records", "o2_workers", "o2_altered", "o2_knew", "o2_figures", "o2_emily"],
    optional: ["o2_opt_motive", "o2_opt_blame"],
    conclusion: "The men in Gallery B were warned about and written off. Someone rewrote the record, and someone signed for an inspection that never happened. Emily knew some of it. Who else knew she knew?",
    summary: "The 1996 investigation of the gallery deaths was compromised: warnings ignored, a repair deferred, a log rewritten, a borough sign-off on an inspection nobody made.",
  },
  {
    number: 3,
    title: "Another Body",
    intro: "One of the men who signed the 1996 record wants to talk. For the first time in twenty-two years, someone from inside the plant is ready to say what happened in Gallery B.",
    objectives: ["o3_death", "o3_movements", "o3_robbery", "o3_targeted", "o3_trent", "o3_page"],
    conclusion: "This was not a robbery. Someone is still guarding what happened in 1996, and they are willing to kill for it. The question now is who else knows enough to be next.",
    summary: "Glenn Sutter was killed the night before he was to talk. What was taken, and what was missed, says why.",
  },
  {
    number: 4,
    title: "The Disappearance",
    intro: "A frightened man calls on a Sunday afternoon. He says he has papers. He'll be at the office at ten tomorrow. He asks you not to call him back.",
    objectives: ["o4_movements", "o4_house", "o4_fled", "o4_vehicle", "o4_property", "o4_recover", "o4_testimony"],
    conclusion: "Len Greer is alive, and he has finally said it out loud: the 1996 records were falsified on purpose, and he was paid to look away. The cover-up has a name. Does Emily's story share it?",
    summary: "Len Greer was taken from his home, found alive, and has told what he did in 1996 and who asked him to.",
  },
  {
    number: 5,
    title: "The Hollow Creek Conspiracy",
    intro: "The papers are out of the safe deposit box, the phone records are back, and the money has a trail. Everything about 1996 points to one office. Almost everything.",
    objectives: ["o5_orders", "o5_money", "o5_hands", "o5_witnesses", "o5_false", "o5_wade", "o5_separate"],
    conclusion: "The cover-up explains three dead men, a murdered witness and a stolen one. It does not explain a girl with a ring in her pocket on her way to end something. There are two stories here.",
    summary: "The conspiracy of 1996 and the violence of 2018 are connected. Emily's death, it turns out, is a different question with a different answer.",
  },
  {
    number: 6,
    title: "The Last Shift",
    intro: "The police are letting you back into the East Mill with work lights and a tape measure. Twenty-two years is a long time, but a building remembers what was done in it.",
    objectives: ["o6_evening", "o6_opportunity", "o6_concealed", "o6_whole", "o6_report"],
    conclusion: "Case closed.",
    summary: "Every crime has its own answer, and the report keeps them apart.",
  },
];
