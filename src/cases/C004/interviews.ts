import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for C004: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give a
 * legitimate reason to question them again (five more questions each,
 * awarded once).
 *
 * Officer Keene and Frankie Moretti have no limit: the lab, the warrant and the
 * river door must stay reachable for the case, and the rescue, to be finished.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  louise: {
    warn: "I have a pupil at four. I don't want to send her away, but I will if I must.",
    last: "Two more questions. Then I'd like to sit with this alone for a while.",
    farewell: "That's all I can bear today. Telephone me when you know something.",
    offer: "Offer to take $5 off her bill for a little more of her time.",
    accept: "You're a terrible businessman. All right. Five more.",
  },
  victor: {
    warn: "I have a station to keep on the air, and you are not on the schedule.",
    last: "Two more, and then I really must ask you to leave.",
    farewell: "Good day. Miss Whitcomb will show you out.",
    offer: "Offer to buy a sponsor's announcement, $5 worth, for more of his time.",
    accept: "A customer. Well. Five more questions, then.",
  },
  henry: {
    warn: "I've told you more than I told the police. I'm running out of things to be ashamed of.",
    last: "Two more. Then I'm going back to the card table to lose some more money.",
    farewell: "That's all. Go and find who did it. I'd like to know too.",
    offer: "Stake him $5 for the next rummy game, for a few more minutes.",
    accept: "Now that's the first kind thing anyone's done for me since Friday. Five more.",
  },
  samuel: {
    warn: "Sir, I've got the board to mind, and the orchestra's on at half past.",
    last: "Two more, please, sir, and then I have to watch the levels.",
    farewell: "I have to get back to the board, sir. I'm sorry. Really.",
    offer: "Offer $5 toward the new microphone he's been wanting, for more of his time.",
    accept: "The new double-button? Gee. All right, sir. Five more.",
  },
  clara: {
    warn: "Mr. Harlan will notice I've stopped typing.",
    last: "Two more, please. Quickly.",
    farewell: "I have to go back to my desk now. Please don't come in the front again.",
    offer: "Offer $5 for her trouble, and to take her to lunch somewhere Mr. Harlan doesn't eat.",
    accept: "Somewhere he doesn't eat. That would be a change. Five more.",
  },
  russo: {
    warn: "You're taking up a good table, friend.",
    last: "Two more. Then the band starts and I can't hear you anyway.",
    farewell: "Enjoy your evening. Somewhere else.",
    offer: "Order a $5 steak dinner you won't eat, for more of his time.",
    accept: "A paying customer. Now we're friends. Five more.",
  },
  rose: {
    warn: "Honey, the band's waiting on me to run the new number.",
    last: "Two more, and then I sing whether you're finished or not.",
    farewell: "That's all I've got. Come hear us Saturday. He'd have liked that.",
    offer: "Put $5 in the band's kitty for a few more minutes of her time.",
    accept: "The boys thank you. Five more.",
  },
  agnes: {
    warn: "I've a pot on the stove and seven lodgers wanting their tea.",
    last: "Two more, and then I'm back in my kitchen.",
    farewell: "Good day to you. Wipe your feet on the way out.",
    offer: "Offer $5 toward Mr. Mercer's back rent, for a little more of her time.",
    accept: "Well. That's decent of you. Five more, and sit down, you're blocking my light.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["keene", "frankie"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("louise_letter", "louise", { callAnswered: "call_louise" }, "Arthur's letter gives you reason to talk to Louise Vale again."),
  grant("samuel_card", "samuel", { deliveryOpened: "samuel_card" }, "Samuel Finch's card gives you reason to question him again."),
  grant("samuel_phono", "samuel", { deduction: "D04" }, "The disc and the line register give you reason to question Samuel Finch again."),
  grant("henry_alibi", "henry", { deduction: "D06" }, "His alibi stands. You can talk to Henry Mercer again."),
  grant("agnes_letters", "agnes", { hasEvidence: "E10" }, "Henry Mercer's letters give you reason to talk to Agnes Doyle again."),
  grant("clara_movements", "clara", { deduction: "D08" }, "Victor Harlan's movements give you reason to talk to Clara Whitcomb again."),
  grant("clara_lock", "clara", { callAnswered: "call_clara" }, "Clara Whitcomb's call gives you reason to talk to her again."),
  grant("victor_recording", "victor", { deduction: "D03" }, "The recording gives you reason to question Victor Harlan again."),
  grant("victor_movements", "victor", { deduction: "D08" }, "His own book and his secretary give you reason to question Victor Harlan again."),
  grant("victor_safe", "victor", { flag: "victor_arrested" }, "Victor Harlan is in custody. You can question him again."),
  grant("russo_partner", "russo", { deduction: "D10" }, "The shipments give you reason to question Dominic Russo again."),
  grant("russo_warehouse", "russo", { flag: "captivity_over" }, "After Monday night you have reason to question Dominic Russo again."),
  grant("rose_weather", "rose", { callAnswered: "call_rose" }, "Rose Marlowe's call gives you reason to talk to her again."),
];
