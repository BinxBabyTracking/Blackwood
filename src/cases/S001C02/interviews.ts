import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for S001C02: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give a
 * legitimate reason to question them again (five more questions each, awarded
 * once). Grants follow docs/S001C02-timeline.md, "Re-interview grants".
 *
 * Bennett, Det. Collins and Agent Quinlan have no limit: the police reports,
 * the exigent phone records, Hurst's phone, the plate, the Kestrel warrant,
 * the drive and the federal search go through them, so the case can never be
 * made unsolvable by running out.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  jonathan: {
    warn: "I haven't slept since Saturday. Not really.",
    last: "Can we stop soon? The paramedic keeps looking at me.",
    farewell: "I can't do any more right now. I'm sorry. Ask Agent Quinlan. I'll tell her everything.",
    offer: "Offer $5 for a hot coffee from the deputy's thermos and a few more minutes.",
    accept: "Coffee. I'd forgotten coffee. Okay. A few more.",
  },
  natalie: {
    warn: "I have to call the home and check on Mom. She gets confused when I don't.",
    last: "Two more. Then I need to sit somewhere quiet.",
    farewell: "I can't right now. Call me the second you know anything.",
    offer: "Offer $5 for a sandwich from the lobby cafe so she eats something, and keep talking.",
    accept: "You sound like me with my patients. Fine. Keep going.",
  },
  rourke: {
    warn: "I have a client at the top of the hour, I'm afraid.",
    last: "Let's take two more, and then I really must.",
    farewell: "I think we're finished. My assistant will see you to the elevator.",
    offer: "Offer $5 toward the Meridian lobby's holiday food drive for five more minutes.",
    accept: "Charity, at Thanksgiving. How could I refuse? Five minutes.",
  },
  lyons: {
    warn: "I've got a crew to schedule for the holiday.",
    last: "Couple more. Then I've got calls.",
    farewell: "We're done. You know where the door is.",
    offer: "Offer $5 for a coffee from the place downstairs, for a few more minutes.",
    accept: "Black. Fine. Few more.",
  },
  hurst: {
    warn: "I gotta get back on the clock. They watch the timeclock now.",
    last: "Two more. My supervisor's gonna come looking.",
    farewell: "That's it, I gotta go. I gotta go.",
    offer: "Offer $5 for a soda and a bag of chips from the staff vending machine, for a few more minutes.",
    accept: "Doritos. Okay. Few more.",
  },
  chen: {
    warn: "I have another client at four.",
    last: "Two more questions, and then I need to make some calls.",
    farewell: "That's all I can give you today. You have my number.",
    offer: "Offer $5 toward her firm's pro bono fund for a few more minutes.",
    accept: "I'll put it on the ledger. Go ahead.",
  },
  grant: {
    warn: "I have a ballroom full of Thanksgiving setups to approve.",
    last: "Two more, and then the house needs me.",
    farewell: "I'm needed on the floor. My assistant can reach me if it's urgent.",
    offer: "Offer $5 toward the staff holiday fund for a little more of her time.",
    accept: "The staff fund. That's kind. Of course.",
  },
  wallace: {
    warn: "I've got a shift change in twenty minutes.",
    last: "Couple more. Then I'm walking the floors.",
    farewell: "That's it. You know where my office is.",
    offer: "Offer $5 for coffee and a doughnut from the place on Fourteenth Street.",
    accept: "Plain cake doughnut. Five more.",
  },
  monroe: {
    warn: "There's a line building at the desk.",
    last: "Two more, and then I really have to check people in.",
    farewell: "I'm sorry, I have to get back. Come find me if you need anything.",
    offer: "Offer $5 toward the front desk's holiday pizza fund so she can step away a little longer.",
    accept: "Oh, they'll love you. Okay, a few more.",
  },
  okoye: {
    warn: "I have outside counsel on the phone at three.",
    last: "Let's keep it to two more.",
    farewell: "I think that's all I can say today. Security will see you out.",
    offer: "Offer $5 toward Eastbridge's employee Thanksgiving drive for a few more minutes.",
    accept: "That's a legitimate charitable contribution. Fine. Go on.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["bennett", "collins", "quinlan"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("natalie_remembers", "natalie", { event: "RE01" }, "What Natalie remembered gives you reason to talk to her again."),
  grant("natalie_notebook", "natalie", { hasEvidence: "E024" }, "Jonathan's notebook gives you reason to talk to Natalie again."),
  grant("monroe_license", "monroe", { hasEvidence: "E027" }, "The license photo gives you reason to talk to Tessa Monroe again."),
  grant("wallace_access", "wallace", { hasEvidence: "E008" }, "The service door log gives you reason to talk to Douglas Wallace again."),
  grant("wallace_dock", "wallace", { hasEvidence: "E011" }, "The dock camera gives you reason to talk to Douglas Wallace again."),
  grant("wallace_badge", "wallace", { hasEvidence: "E015" }, "The temporary badge record gives you reason to talk to Douglas Wallace again."),
  grant("grant_bypass", "grant", { hasEvidence: "E009" }, "The alarm bypass gives you reason to question Celia Grant again."),
  grant("grant_badge", "grant", { hasEvidence: "E015" }, "Her own memo, clipped to the badge record, gives you reason to question Celia Grant again."),
  grant("hurst_bypass", "hurst", { hasEvidence: "E009" }, "The bypass under his code gives you reason to question Kevin Hurst again."),
  grant("hurst_admits", "hurst", { event: "RE03" }, "Kevin Hurst's changing story gives you reason to question him again."),
  grant("hurst_deposits", "hurst", { hasEvidence: "E029" }, "The deposit receipts from his locker give you reason to question Kevin Hurst again."),
  grant("hurst_messages", "hurst", { hasEvidence: "E030" }, "His recovered messages give you reason to question Kevin Hurst again."),
  grant("hurst_garrett", "hurst", { deduction: "D11" }, "The man behind the messages gives you reason to question Kevin Hurst again."),
  grant("okoye_letter", "okoye", { hasEvidence: "E017" }, "The task force letter gives you reason to question David Okoye again."),
  grant("okoye_notebook", "okoye", { hasEvidence: "E024" }, "Jonathan's notebook gives you reason to question David Okoye again."),
  grant("chen_card", "chen", { hasEvidence: "E021" }, "Her appointment card in Jonathan's wallet gives you reason to talk to Irene Chen again."),
  grant("chen_release", "chen", { event: "RE05" }, "Irene Chen's call gives you reason to talk to her again."),
  grant("rourke_calls", "rourke", { hasEvidence: "E026" }, "The carrier records give you reason to question Julian Rourke again."),
  grant("rourke_list", "rourke", { hasEvidence: "E033" }, "The client list gives you reason to question Julian Rourke again."),
  grant("rourke_funding", "rourke", { hasEvidence: "E034" }, "His division's funding sheet gives you reason to question Julian Rourke again."),
  grant("lyons_van", "lyons", { hasEvidence: "E027" }, "The plate readers give you reason to question Garrett Lyons again."),
  grant("lyons_messages", "lyons", { hasEvidence: "E030" }, "Hurst's recovered messages give you reason to question Garrett Lyons again."),
  grant("lyons_movement", "lyons", { deduction: "D11" }, "The van, the messages and the timing give you reason to question Garrett Lyons again."),
  grant("jonathan_envelope", "jonathan", { hasEvidence: "E022" }, "The envelope he left with Irene Chen gives you reason to talk to Jonathan again."),
  grant("jonathan_index", "jonathan", { hasEvidence: "E035" }, "The index from Lyons's bag gives you reason to talk to Jonathan again."),
];
