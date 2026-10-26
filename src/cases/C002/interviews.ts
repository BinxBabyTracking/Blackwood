import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for C002: how each person runs out of patience,
 * how they take an offer of more time, and which discoveries give a legitimate
 * reason to question them again (five more questions each, awarded once).
 *
 * Det. Bennett has no limit: his labs, records and searches must stay
 * reachable for the case to be solvable.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  tom: {
    warn: "I haven't slept since Sunday. Can we get to the end of this?",
    last: "A couple more. Then I need to lie down before I fall down.",
    farewell: "That's all I've got in me right now. Go find her. Please.",
    offer: "Offer to buy him a decent meal, $5, for a little more of his time.",
    accept: "I haven't eaten since Sunday either. All right. A few more.",
  },
  ruth: {
    warn: "I'm paying you to find things out, not to ask me the same things twice.",
    last: "Two more questions. Then go and do your job.",
    farewell: "That's enough. I've told you everything I know. Now go.",
    offer: "Knock $5 off her bill for a little more of her time.",
    accept: "Fine. Five more. Make them count.",
  },
  laura: {
    warn: "I'm very tired. I want to help, but I'm very tired.",
    last: "One or two more. Then I need to sleep.",
    farewell: "I can't do any more today. Ruth will call you if I remember anything.",
    offer: "Offer $5 toward the junior high band's new music stands for a few more minutes.",
    accept: "The band could use them. All right. A few more.",
  },
  ferris: {
    warn: "I've got a chief breathing down my neck and three other cases. Wrap it up.",
    last: "Two more. Then I've got work to do.",
    farewell: "We're done. Come back when you've got something I can use.",
    offer: "Offer to buy the squad room's coffee for the week, $5.",
    accept: "Bribing a police sergeant with coffee. Five questions, and I didn't see that.",
  },
  nora: {
    warn: "I've got a deadline at nine. Let's speed this up.",
    last: "Two more, then I'm writing.",
    farewell: "That's it, I'm on deadline. Call me.",
    offer: "Offer $5 for a tip she can use later.",
    accept: "Now we're talking. Five more, and you owe me a story.",
  },
  howard: {
    warn: "I'd better sit down before my knees go. A few more.",
    last: "Two more and then I'm going in for my programs.",
    farewell: "That's all I saw, and I've told you all of it. Good luck to you.",
    offer: "Offer $5 for his trouble, toward his aspirin bill.",
    accept: "Ha! Aspirin money. All right, five more.",
  },
  diane: {
    warn: "I haven't slept since it happened. I can't do much more of this.",
    last: "Two more. Then I want to go and pick up my dog.",
    farewell: "That's all. I need to be somewhere with the lights on.",
    offer: "Offer $5 toward a better lock on her garage door.",
    accept: "That's the most useful thing anyone's offered me this week. Five more.",
  },
  gordon: {
    warn: "I've got a lot of work on the bench, friend.",
    last: "A couple more, and then I really have to get back to it.",
    farewell: "I think that's enough neighborliness for one day. You have a good one.",
    offer: "Offer him $5 to look at a radio you don't have, for more of his time.",
    accept: "Business is business. Five more.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["bennett"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("tom_courier", "tom", { callAnswered: "call_nora" }, "The package at the Courier gives you reason to question Tom Hale again."),
  grant("nora_trace", "nora", { hasEvidence: "E09" }, "The phone company's trace gives you reason to question Nora Pruitt again."),
  grant("ruth_home", "ruth", { flag: "laura_home" }, "Laura is home. You can question Ruth Kessler again."),
  grant("ferris_hoax", "ferris", { hasEvidence: "E11" }, "The hoax story gives you reason to question Sgt. Ferris again."),
  grant("ferris_arrest", "ferris", { flag: "gordon_arrested" }, "The arrest at Cabin 14 gives you reason to question Sgt. Ferris again."),
  grant("howard_van", "howard", { deduction: "D3" }, "Howard Lisk's van matters now. You can question him again."),
  grant("gordon_ledger", "gordon", { hasEvidence: "E15" }, "The store ledger gives you reason to question Gordon Pell again."),
  grant("gordon_arrest", "gordon", { flag: "gordon_arrested" }, "Gordon Pell is in custody. You can question him again."),
  grant("laura_oak", "laura", { hasEvidence: "E16" }, "The Oak Terrace break-in gives you reason to question Laura Kessler again."),
  grant("diane_pager", "diane", { hasEvidence: "E17" }, "The pager record gives you reason to question Diane Moss again."),
];
