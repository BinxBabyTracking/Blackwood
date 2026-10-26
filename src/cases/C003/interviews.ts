import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for C003: how each person runs out of patience,
 * how they take an offer of more time, and which discoveries give a legitimate
 * reason to question them again (five more questions each, awarded once).
 *
 * Bennett, Det. Cross and Dr. Reed have no limit: the records, the police
 * reports, the call that brings the police to the Marsh house and every lab test
 * go through them, so the case can never be made unsolvable by running out.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  rachel: {
    warn: "I have to pick Sophie up soon.",
    last: "Can we finish this another time? I'm wrung out.",
    farewell: "I'm sorry. I can't today. Call me when there's news.",
    offer: "Offer to cover Sophie's after-school program this week, $5, for a little more of her time.",
    accept: "That would actually help. All right. A few more.",
  },
  vivian: {
    warn: "Graham will want dinner.",
    last: "I don't know what else I can tell you.",
    farewell: "I think I've said everything I can. I'm sorry.",
    offer: "Offer $5 for the high school's band trip fund.",
    accept: "You know the way to an assistant principal's heart. A few more.",
  },
  graham: {
    warn: "She's had enough for one night. So have I.",
    last: "Let's wrap this up.",
    farewell: "That's it. Good night.",
    offer: "Offer $5 toward his bait and tackle for the season.",
    accept: "Ha. Fair enough. Five more.",
  },
  lena: {
    warn: "I've got a line out the door.",
    last: "Two more minutes, then I'm on the register.",
    farewell: "I gotta work. You know where I am.",
    offer: "Buy $5 of lottery tickets so she can stay off the register a few minutes.",
    accept: "If one of those hits, I want half. Go ahead.",
  },
  voss: {
    warn: "I have a council meeting at four.",
    last: "My attorney would tell me to stop here.",
    farewell: "We're done. Next time, call my lawyer.",
    offer: "Offer $5 to the Riverside Commons community fund, for more of his time.",
    accept: "Always happy to talk to someone who supports the community. Five more.",
  },
  bell: {
    warn: "You're running out of questions I'll answer.",
    last: "Last couple.",
    farewell: "We're done.",
    offer: "Offer $5 for a cup of coffee and five more minutes.",
    accept: "Five minutes. Then you're gone.",
  },
  shaw: {
    warn: "Man, I got a call coming in, I gotta roll.",
    last: "Seriously, I gotta go.",
    farewell: "I'm out. I'm not doing this anymore.",
    offer: "Offer $5 toward his diesel for a few more minutes.",
    accept: "Diesel's diesel. Okay. Quick.",
  },
  owen: {
    warn: "I really shouldn't be talking to you at all.",
    last: "Please don't put my name on any of this.",
    farewell: "That's everything I know. Please leave me out of it.",
    offer: "Offer $5 to the historical society's archive fund.",
    accept: "They do need it. All right. A little more.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["bennett", "cross", "reed"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("rachel_envelope", "rachel", { event: "RE02" }, "Ethan's envelope gives you reason to question Rachel Kowalski again."),
  grant("rachel_marshes", "rachel", { flag: "marshes_found" }, "After what happened on Alder Street, you can talk to Rachel Kowalski again."),
  grant("lena_detail", "lena", { callAnswered: "call_lena" }, "Lena Ortiz's call gives you reason to question her again."),
  grant("vivian_followed", "vivian", { deduction: "D02" }, "Now you know a vehicle followed them. You can question Vivian Marsh again."),
  grant("voss_altered", "voss", { deduction: "D04" }, "The altered clearance gives you reason to question Caleb Voss again."),
  grant("voss_money", "voss", { deduction: "D11" }, "The payments to Bell Security give you reason to question Caleb Voss again."),
  grant("bell_suv", "bell", { deduction: "D08" }, "Unit 4 gives you reason to question Marcus Bell again."),
  grant("bell_custody", "bell", { flag: "bell_custody" }, "Marcus Bell is in custody. You can question him again."),
  grant("shaw_dispatch", "shaw", { deduction: "D09" }, "His own dispatch log gives you reason to question Trevor Shaw again."),
  grant("shaw_phone", "shaw", { hasEvidence: "E29" }, "His phone records give you reason to question Trevor Shaw again."),
  grant("owen_altered", "owen", { hasEvidence: "E11" }, "The altered clearance gives you reason to question Owen Price again."),
];
