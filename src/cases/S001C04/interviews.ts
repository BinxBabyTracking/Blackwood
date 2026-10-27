import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for S001C04: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give a
 * legitimate reason to question them again (five more questions each, awarded
 * once). Grants follow docs/S001C04-timeline.md, "Re-interview grants".
 *
 * Bennett, Det. Harris and Det. Collins have no limit: the police records, the
 * court orders, the plate readers, the visit log and the drive go through
 * them, so the case can never be made unsolvable by running out.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  donovan: {
    warn: "I haven't slept properly since Tuesday. I'm starting to repeat myself.",
    last: "Two more. Then I need to lie down on that couch.",
    farewell: "I'm sorry. I can't do any more right now. I'll be here.",
    offer: "Offer to bring her a $5 oat milk cortado from the Wren and keep talking.",
    accept: "Nina will know exactly how I take it. Okay. A few more.",
  },
  tate: {
    warn: "I've got a business to run.",
    last: "Two more, then you can see yourself out.",
    farewell: "We're done. Talk to my lawyer.",
    offer: "Offer $5 for a coffee from the cart downstairs, for five more minutes.",
    accept: "Black. Five minutes.",
  },
  rourke: {
    warn: "Mr. Fenwick is looking at his watch, detective. So am I.",
    last: "Two more. Then the guard takes me back.",
    farewell: "We're finished. Mr. Fenwick will see to the recording.",
    offer: "Offer $5 for Rourke's commissary account, for a few more minutes on the link.",
    accept: "Five dollars. That's two days of bad coffee in here. Go on.",
  },
  lockhart: {
    warn: "I'm afraid I have a meeting shortly.",
    last: "I'll need to go in a moment, I'm sorry.",
    farewell: "I really must go. Please, call again if the foundation can help.",
    offer: "Offer a $5 gift to Clearwater's whistleblower fund, for a few more minutes.",
    accept: "That's very kind. Miriam will be touched. Of course, go on.",
  },
  castell: {
    warn: "I have three other people who depend on this office this week.",
    last: "A couple more. I need to make some calls.",
    farewell: "I can't do any more right now. Please find her.",
    offer: "Offer a $5 donation to Clearwater for a little more of her time.",
    accept: "We never turn down five dollars. Go ahead.",
  },
  prentiss: {
    warn: "I've got a standup in a few minutes.",
    last: "Two more. My team's waiting on me.",
    farewell: "I have to get on this call. Text me if you hear anything.",
    offer: "Offer $5 for a burrito from the place on Wilson Boulevard, for a few more minutes.",
    accept: "Chicken, extra salsa. Okay. Go.",
  },
  patel: {
    warn: "I'm on at seven tonight. I really do have to sleep.",
    last: "Two more, then I'm putting my eye mask on.",
    farewell: "I'm sorry. I'm dead on my feet. Knock if you need me later.",
    offer: "Offer $5 for a coffee and a pastry from the bakery on Cameron Street, for a few more minutes.",
    accept: "That's how you get a night nurse. Okay. A few more.",
  },
  corbett: {
    warn: "I've told you more than my severance agreement would like.",
    last: "Two more, and then I'd like my afternoon back.",
    farewell: "That's all I can give you today. Mind the step.",
    offer: "Offer $5 toward his coffee fund, for a few more minutes at his dining table.",
    accept: "I've been unemployed since September. I'll take it. Go on.",
  },
  halvorsen: {
    warn: "The lunch rush starts in a few minutes.",
    last: "Two more, then I have to get back on the bar.",
    farewell: "I'm so sorry, I have to get back. Come back any time.",
    offer: "Offer a $5 tip for the staff jar, for a few more minutes.",
    accept: "The barista will love you. Okay. A few more.",
  },
  lang: {
    warn: "I've got a truck at the dock.",
    last: "Two more, then I'm back on the forklift.",
    farewell: "That's it for today. You know where the gate is.",
    offer: "Offer $5 for coffee and doughnuts for his dock crew, for a few more minutes.",
    accept: "Glazed. They'll want glazed. Okay.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["bennett", "harris", "collins"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("patel_access", "patel", { hasEvidence: "E006" }, "The building's access report gives you reason to talk to Gwen Patel again."),
  grant("halvorsen_vehicle", "halvorsen", { hasEvidence: "E030" }, "The Tahoe's vehicle record gives you reason to talk to Nina Halvorsen again."),
  grant("prentiss_phone", "prentiss", { hasEvidence: "E008" }, "Claire's phone record gives you reason to question Tyler Prentiss again."),
  grant("prentiss_rescue", "prentiss", { event: "RE08" }, "Claire is safe. Tyler Prentiss will want to hear it, and you have reason to talk to him again."),
  grant("corbett_duplicates", "corbett", { any: [{ hasEvidence: "E019" }, { hasEvidence: "E020" }, { hasEvidence: "E021" }] }, "Claire's own duplicates give you reason to go back to Alan Corbett."),
  grant("corbett_checkout", "corbett", { hasEvidence: "E017" }, "The checkout log gives you reason to talk to Alan Corbett again."),
  grant("castell_cooperates", "castell", { event: "RE04" }, "Miriam Castell knows Claire is in danger. You have reason to question her again."),
  grant("castell_cottage", "castell", { hasEvidence: "E029" }, "What you found at the cottage gives you reason to question Miriam Castell again."),
  grant("castell_register", "castell", { hasEvidence: "E038" }, "Claire's copy register gives you reason to question Miriam Castell again."),
  grant("lang_register", "lang", { hasEvidence: "E016" }, "The stack register gives you reason to talk to Gerald Lang again."),
  grant("lang_warrant", "lang", { flag: "carton_warrant" }, "The court order for Claire's carton gives you reason to go back to Gerald Lang."),
  grant("tate_vehicle", "tate", { hasEvidence: "E030" }, "His Tahoe's plate-reader hits give you reason to question Brandon Tate again."),
  grant("tate_cottage", "tate", { hasEvidence: "E029" }, "What you found at the cottage gives you reason to question Brandon Tate again."),
  grant("tate_basement", "tate", { hasEvidence: "E035" }, "The basement room gives you reason to question Brandon Tate again."),
  grant("tate_note", "tate", { hasEvidence: "E032" }, "The note from his desk gives you reason to question Brandon Tate again."),
  grant("rourke_phone", "rourke", { hasEvidence: "E031" }, "Tate's prepaid phone gives you reason to question Julian Rourke again."),
  grant("lockhart_courier", "lockhart", { hasEvidence: "E018" }, "The courier statement gives you reason to call Dr. Lockhart again."),
  grant("lockhart_timeline", "lockhart", { hasEvidence: "E039" }, "Claire's timeline gives you reason to call Dr. Lockhart again."),
  grant("claire_archive", "donovan", { hasEvidence: "E037" }, "Her decrypted archive gives you reason to talk to Claire Donovan again."),
  grant("claire_coversheets", "donovan", { hasEvidence: "E040" }, "The cover sheets from her wallet give you reason to talk to Claire Donovan again."),
  grant("claire_sequence", "donovan", { hasEvidence: "E022" }, "Alan Corbett's reconstruction gives you reason to talk to Claire Donovan again."),
];
