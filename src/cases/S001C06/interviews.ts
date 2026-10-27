import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for S001C06: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give a
 * legitimate reason to question them again (five more questions each, awarded
 * once). Grants follow docs/S001C06-timeline.md, "Re-interview grants".
 *
 * SA Quinlan, Det. Caruso and Bennett have no limit: the exhibits, the labs,
 * the recovery and the records go through them, so the case can never be made
 * unsolvable by running out. Rourke has no grant; he gives nothing.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  sayer: {
    warn: "I'm sorry. I haven't slept properly since Sunday.",
    last: "Ms. Chen is looking at her watch. Two more, perhaps.",
    farewell: "I'd like to stop now. Ms. Chen agrees. Thank you for finding me.",
    offer: "Offer $5 for a hot meal from the vending machines down the hall, and a few more minutes.",
    accept: "Soup, if they have it. Thank you. Go on.",
  },
  lockhart: {
    warn: "I'm afraid I have a board call shortly.",
    last: "I'll need to go in a moment.",
    farewell: "I really must go. My office will take any further questions in writing.",
    offer: "Offer a $5 gift to the Lockhart Foundation's winter appeal for a few more minutes of her time.",
    accept: "How generous. Of course. A few more.",
  },
  marchetti: {
    warn: "Her lawyer: 'We're nearly at the limit of what we agreed.'",
    last: "Her lawyer: 'Two more, and then we're done.'",
    farewell: "Her lawyer: 'That's all for today. Put anything further in writing.'",
    offer: "Offer $5 toward the coffee her lawyer keeps sending his paralegal out for, for a few more minutes.",
    accept: "Her lawyer: 'Black, two sugars. Five minutes.'",
  },
  pike: {
    warn: "I've got a client meeting at the top of the hour.",
    last: "Two more. Then you're leaving.",
    farewell: "We're done. If you want more, have the FBI ask.",
    offer: "Offer $5 for a coffee from the cart in the lobby, for a few more minutes.",
    accept: "Black. Five minutes.",
  },
  donovan: {
    warn: "I'm getting tired. I'm sorry.",
    last: "A couple more. Then I need to stop.",
    farewell: "I can't do any more today. Please call again.",
    offer: "Offer $5 for a sandwich from the deli across 4th Street, for a little more time.",
    accept: "Turkey on rye. Okay. Go ahead.",
  },
  holt: {
    warn: "His lawyer: 'We're close to the end of the time we agreed.'",
    last: "His lawyer: 'Two more questions.'",
    farewell: "His lawyer: 'That's all for today.'",
    offer: "Offer $5 to his commissary account for a few more minutes on the record.",
    accept: "Five dollars. In here that's real money. Go on.",
  },
  rourke: {
    warn: "His lawyer: 'We're nearly done here.'",
    last: "His lawyer: 'Two more, then we end the call.'",
    farewell: "His lawyer: 'We're ending the call.'",
    offer: "Offer $5 to his commissary account for a few more minutes.",
    accept: "His lawyer: 'He'll allow it. He won't say anything, but he'll allow it.'",
  },
  kane: {
    warn: "His lawyer: 'We're running out of time.'",
    last: "His lawyer: 'Two more.'",
    farewell: "His lawyer: 'That's it. We're done.'",
    offer: "Offer $5 to his commissary account for a few more minutes.",
    accept: "Five bucks. Fine. Go.",
  },
  chen: {
    warn: "I have another client this afternoon.",
    last: "Two more, and then I need to get back to Mr. Sayer.",
    farewell: "That's all I can give you today. You have my number.",
    offer: "Offer $5 toward her firm's pro bono fund for a few more minutes.",
    accept: "I'll log it. All right, a few more.",
  },
  ames: {
    warn: "The trustee's people close the records room at five.",
    last: "Let's take two more, and then I really must get back to the ledgers.",
    farewell: "I need to get back to work. Call me any time.",
    offer: "Offer $5 toward his firm's pro bono hours for nonprofits, for a little more time.",
    accept: "A line item. You know the way to an accountant's heart. All right.",
  },
  wexler: {
    warn: "I should get off the phone. People are looking at me.",
    last: "A couple more. Then I have to go.",
    farewell: "I need to stop. Please call again if you need anything.",
    offer: "Offer $5 for his coffee on the walk back to the office, for a few more minutes.",
    accept: "That's kind. Okay. A few more.",
  },
  corbett: {
    warn: "I'm supposed to be helping my wife with the gutters.",
    last: "Two more, and then I'm on a ladder.",
    farewell: "That's all. Call me back if you need the rules again.",
    offer: "Offer $5 toward a new pair of work gloves, for a few more minutes.",
    accept: "Ha. Fine. The gutters can wait.",
  },
  oduya: {
    warn: "I have a client restore running in the back.",
    last: "A couple more. Then I need to check that restore.",
    farewell: "I have to get back to work. You know where I am.",
    offer: "Offer $5 for lunch from the place downstairs, for a little more time.",
    accept: "I haven't eaten since Thursday. Okay. Go on.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["quinlan", "caruso", "bennett"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string, questions?: number): ReinterviewDef => ({ id, characterId, when, note, ...(questions ? { questions } : {}) });

export const reinterviews: ReinterviewDef[] = [
  grant("pike_texts", "pike", { hasEvidence: "E020" }, "His contractors' messages give you reason to question Conrad Pike again."),
  grant("pike_whiteboard", "pike", { hasEvidence: "E022" }, "The whiteboard in his own office gives you reason to question Conrad Pike again."),
  grant("pike_pittsburgh", "pike", { hasEvidence: "E055" }, "His PITTSBURGH file gives you reason to question Conrad Pike again."),
  grant("pike_note", "pike", { hasEvidence: "E059" }, "The December 22 note to him gives you reason to question Conrad Pike again."),
  grant("marchetti_castell", "marchetti", { hasEvidence: "E052" }, "The notes to Miriam Castell give you reason to question Elena Marchetti again."),
  grant("marchetti_witnesses", "marchetti", { hasEvidence: "E058" }, "The FBI's corroboration summary gives you reason to question Elena Marchetti again."),
  grant("marchetti_file", "marchetti", { hasEvidence: "E045" }, "Her own preservation file gives you reason to question Elena Marchetti again."),
  grant("sayer_index", "sayer", { hasEvidence: "E050" }, "His index of the A notes gives you reason to talk to Benjamin Sayer again."),
  grant("sayer_authenticated", "sayer", { event: "RE09" }, "The authenticated archive gives you reason to talk to Benjamin Sayer again."),
  grant("donovan_release", "donovan", { hasEvidence: "E037" }, "The release program gives you reason to talk to Claire Donovan again."),
  grant("donovan_castell", "donovan", { hasEvidence: "E052" }, "The notes to Miriam Castell give you reason to talk to Claire Donovan again."),
  grant("oduya_audit", "oduya", { hasEvidence: "E040" }, "The restored audit log gives you reason to talk to Caroline Oduya again."),
  grant("oduya_whiteboard", "oduya", { hasEvidence: "E022" }, "Her name on Pike's whiteboard gives you reason to talk to Caroline Oduya again."),
  grant("holt_register", "holt", { hasEvidence: "E031" }, "The Executive Authorization Register gives you reason to question Adrian Holt again."),
  grant("kane_harbor", "kane", { any: [{ hasEvidence: "E035" }, { hasEvidence: "E048" }] }, "The Harbor authorizations give you reason to question Gideon Kane again."),
  grant("lockhart_identity", "lockhart", { deduction: "D16" }, "The identity behind A-1 gives you reason to question Dr. Lockhart again."),
  grant("lockhart_command", "lockhart", { deduction: "D21" }, "The command chain gives you reason to question Dr. Lockhart again."),
  grant("lockhart_final", "lockhart", { event: "RE12" }, "Dr. Lockhart's voluntary interview at 26 Federal Plaza gives you a fresh allowance of questions.", 20),
];
