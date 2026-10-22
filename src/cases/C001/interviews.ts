import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for C001: how each person runs out of patience,
 * how they take an offer of more time, and which discoveries give a legitimate
 * reason to question them again (five more questions each, awarded once).
 *
 * Det. Bennett has no limit: he is the police contact, and his searches and
 * checks must stay reachable for the case to be solvable.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  margaret: {
    warn: "I'm sorry, but I really can't spend much longer discussing this.",
    last: "Just a question or two more. This has been a great deal to go over.",
    farewell: "I think I've told you everything I can for now. Please, let me sit quietly for a while.",
    offer: "Offer $5 toward the library's reading-room fund for a little more of her time.",
    accept: "That's very kind of you. The library will put it to good use. All right, a few more questions.",
  },
  daniel: {
    warn: "I've been cooperative, detective. I do have other matters to attend to.",
    last: "Two more questions. Then I really must get back to my clients.",
    farewell: "We're finished for today. Anything further can wait until you have something new to discuss.",
    offer: "Offer $5 for his billable time.",
    accept: "My rate is considerably higher than that, but fine. Five more questions.",
  },
  robert: {
    warn: "Look, I've got work to finish. Make these last few questions count.",
    last: "Two more. Then this pickup goes back on the lift.",
    farewell: "That's it. I've got a shop to run. Come back if you find something I can actually help with.",
    offer: "Offer $5 to cover the time he's off the clock.",
    accept: "Five bucks buys you five questions. Make 'em count.",
  },
  patricia: {
    warn: "I don't know how much more I can tell you right now.",
    last: "Just one or two more. I have to get back to my desk.",
    farewell: "I'm sorry. I can't do any more of this today. Please come back another time.",
    offer: "Offer to buy her lunch, $5, for a little more of her time.",
    accept: "You don't have to do that. But all right, a few more questions over a sandwich.",
  },
  rosa: {
    warn: "Honey, I've got a counter full of coffee cups. Let's wrap this up soon.",
    last: "Two more, sugar, then I've got to get back to my tables.",
    farewell: "That's all the time I've got, honey. Come back when it's quieter.",
    offer: "Leave a $5 tip on the counter for her trouble.",
    accept: "Well, aren't you a sweetheart. Ask away, honey. Five more.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["bennett"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("daniel_diner", "daniel", { any: [{ hasEvidence: "E04" }, { hasEvidence: "E13" }] }, "The diner's records give you reason to question Daniel Mercer again."),
  grant("daniel_jacket", "daniel", { hasEvidence: "E05" }, "The recovered jacket gives you reason to question Daniel Mercer again."),
  grant("daniel_statement", "daniel", { hasEvidence: "E15" }, "The torn bank statement gives you reason to question Daniel Mercer again."),
  grant("margaret_sedan", "margaret", { eventState: "RE01", is: "completed" }, "Margaret Ellis remembered the car. You can question her again."),
  grant("margaret_hand", "margaret", { hasEvidence: "E14" }, "Daniel's injured hand gives you reason to question Margaret Ellis again."),
  grant("robert_house", "robert", { any: [{ hasEvidence: "E01" }, { hasEvidence: "E10" }] }, "The cut screen and the back door give you reason to question Robert Hale again."),
  grant("robert_sedan", "robert", { eventState: "RE01", is: "completed" }, "The car Margaret saw gives you reason to question Robert Hale again."),
  grant("patricia_accounts", "patricia", { any: [{ hasEvidence: "E03" }, { hasEvidence: "E08" }] }, "Eleanor's accounts give you reason to question Patricia Wells again."),
  grant("patricia_statement", "patricia", { hasEvidence: "E15" }, "The envelope gives you reason to question Patricia Wells again."),
  grant("rosa_jacket", "rosa", { hasEvidence: "E05" }, "The recovered jacket gives you reason to question Rosa Delgado again."),
];
