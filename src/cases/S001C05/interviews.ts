import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for S001C05: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give a
 * legitimate reason to question them again (five more questions each, awarded
 * once). Grants follow docs/S001C05-timeline.md, "Re-interview grants".
 *
 * Bennett and Det. Caruso have no limit: the public records, the police file,
 * both labs, the vehicle records, Knox's phone, the bank subpoena and the
 * warrants go through them, so the case can never be made unsolvable by
 * running out.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  lockhart: {
    warn: "I have the board to speak to before the end of the day, I'm afraid.",
    last: "I'll need to go in a moment. I'm sorry.",
    farewell: "I really must go. Do call again if I can help.",
    offer: "Offer a $5 gift to the foundation's scholarship fund, in Nathaniel Ogden's name, for a few more minutes.",
    accept: "That's very kind. Nathaniel would have approved of the scholarship fund. Go on.",
  },
  marchetti: {
    warn: "I bill in six-minute increments. You're well into the fourth.",
    last: "Two more, and then I have a client waiting.",
    farewell: "We're finished. Anything further, put it in writing to my office.",
    offer: "Offer $5 toward her firm's pro bono docket for five more minutes.",
    accept: "Five dollars for the pro bono docket. How generous. Five minutes.",
  },
  knox: {
    warn: "I've got a crew to pay and a client to call.",
    last: "Couple more. Then we're done.",
    farewell: "That's it. We're done here.",
    offer: "Offer $5 for a coffee from the cart on Northern Boulevard, for a few more minutes.",
    accept: "Black. Fine. Make it quick.",
  },
  claudia: {
    warn: "I'm sorry. I'm very tired.",
    last: "Just a little longer. Then I need to sit by myself.",
    farewell: "I can't do any more today. Please, call me when you know something.",
    offer: "Offer a $5 donation to the museum's education program, in Nathaniel's name, if she can bear a few more questions.",
    accept: "He'd have liked that. All right. A few more.",
  },
  wexler: {
    warn: "If anyone from the foundation calls, I have to pick up.",
    last: "I really should get back to the desk.",
    farewell: "I can't. Not right now. I'm sorry.",
    offer: "Offer $5 for lunch from the deli downstairs so he can keep talking.",
    accept: "I haven't eaten since yesterday. Okay. A few more.",
  },
  bellamy: {
    warn: "I have a call with the auditors this afternoon.",
    last: "Two more, if you would. Then I must get back.",
    farewell: "That's all I can do today. My assistant will see you out.",
    offer: "Offer a $5 gift to the foundation's community lending program for a little more of his time.",
    accept: "I'll record it properly, of course. Go ahead.",
  },
  lane: {
    warn: "I still have four hundred guests' coats and cars to account for.",
    last: "I have to get back to the event office.",
    farewell: "I'm sorry, I can't any more right now. You know where my office is.",
    offer: "Offer $5 toward flowers for the event staff, for a few more minutes.",
    accept: "They've earned flowers this week. Okay. Quickly.",
  },
  porter: {
    warn: "I've got a shift change in a little while.",
    last: "Couple more. Then I'm back on the monitors.",
    farewell: "That's it for now. You know where the office is.",
    offer: "Offer $5 for coffee and a bagel from the cart on Park Avenue.",
    accept: "Everything bagel. Five more.",
  },
  mendes: {
    warn: "The captain's going to wonder where I am.",
    last: "I really have to get back on the floor.",
    farewell: "I can't, I'm sorry. They'll see me talking.",
    offer: "Offer to put $5 in the banquet staff's tip pool so she can step away a little longer.",
    accept: "Oh. Thank you. Okay, a couple more.",
  },
  abernathy: {
    warn: "I have a client call on the hour.",
    last: "Let's take two more, and then I really must.",
    farewell: "I need to get back to work. Call me again if you find more paper.",
    offer: "Offer $5 toward the NYU clinic's coffee fund for a little more of his time.",
    accept: "The clinic runs on coffee. All right. Go on.",
  },
  donovan: {
    warn: "The agents don't like me on the phone for long.",
    last: "I should hang up soon.",
    farewell: "I have to go. I'm sorry. Call me again if you need to.",
    offer: "Offer $5 for the coffee she'll want after this call.",
    accept: "I'll take it. Okay. A few more.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["bennett", "caruso"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("lockhart_holding", "lockhart", { deduction: "D13" }, "What the foundation holds gives you reason to talk to Dr. Lockhart again."),
  grant("lockhart_directs", "lockhart", { deduction: "D14" }, "Who directs the structure gives you reason to talk to Dr. Lockhart again."),
  grant("lockhart_minutes", "lockhart", { hasEvidence: "E042" }, "The 2009 committee minutes give you reason to talk to Dr. Lockhart again."),
  grant("lockhart_candidate", "lockhart", { event: "RE10" }, "Your working theory gives you reason to talk to Dr. Lockhart again."),
  grant("marchetti_engagement", "marchetti", { hasEvidence: "E027" }, "Her engagement letter to Knox Protective gives you reason to question Elena Marchetti again."),
  grant("marchetti_arranged", "marchetti", { deduction: "D08" }, "Her messages to Knox give you reason to question Elena Marchetti again."),
  grant("marchetti_message", "marchetti", { hasEvidence: "E045" }, "Her December 18 telephone message gives you reason to question Elena Marchetti again."),
  grant("marchetti_index", "marchetti", { hasEvidence: "E046" }, "Her restricted matter index gives you reason to question Elena Marchetti again."),
  grant("knox_account", "knox", { deduction: "D05" }, "His broken account gives you reason to question Gabriel Knox again."),
  grant("knox_vehicle", "knox", { hasEvidence: "E024" }, "His vehicle and toll record gives you reason to question Gabriel Knox again."),
  grant("knox_witness", "knox", { hasEvidence: "E029" }, "Olivia Mendes's statement gives you reason to question Gabriel Knox again."),
  grant("knox_lab", "knox", { hasEvidence: "E032" }, "The lab report on the bookend and the briefcase gives you reason to question Gabriel Knox one last time."),
  grant("claudia_memo", "claudia", { hasEvidence: "E019" }, "Nathaniel's memorandum gives you reason to talk to Claudia Ogden again."),
  grant("claudia_briefcase", "claudia", { hasEvidence: "E031" }, "The recovered briefcase gives you reason to talk to Claudia Ogden again."),
  grant("wexler_drive", "wexler", { hasEvidence: "E020" }, "The backup drive gives you reason to talk to Simon Wexler again."),
  grant("wexler_talks", "wexler", { event: "RE05" }, "Simon Wexler's call gives you reason to talk to him again."),
  grant("bellamy_opinion", "bellamy", { hasEvidence: "E036" }, "Counsel's 2009 opinion gives you reason to talk to Lionel Bellamy again."),
  grant("bellamy_restricted", "bellamy", { event: "RE06" }, "Marchetti's letter restricting the files gives you reason to talk to Lionel Bellamy again."),
  grant("lane_card", "lane", { hasEvidence: "E001" }, "The note card in Nathaniel's pocket gives you reason to talk to Victoria Lane again."),
  grant("porter_staffing", "porter", { hasEvidence: "E023" }, "Knox's own staffing sheet gives you reason to talk to James Porter again."),
  grant("mendes_cameras", "mendes", { hasEvidence: "E008" }, "The corridor camera log gives you reason to talk to Olivia Mendes again."),
  grant("abernathy_restricted", "abernathy", { event: "RE06" }, "Marchetti's restriction on the files gives you reason to call Lawrence Abernathy again."),
  grant("abernathy_instrument", "abernathy", { hasEvidence: "E035" }, "The trust protector authorization gives you reason to call Lawrence Abernathy again."),
  grant("donovan_index", "donovan", { hasEvidence: "E046" }, "Marchetti's matter index gives you reason to call Claire Donovan again."),
];
