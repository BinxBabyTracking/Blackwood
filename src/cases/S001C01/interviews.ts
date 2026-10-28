import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for S001C01: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give a
 * legitimate reason to question them again (five more questions each, awarded
 * once). Grants follow docs/S001C01-timeline.md, "Re-interview grants".
 *
 * Bennett and Det. Bowman have no limit: the records, the police reports, the
 * footwear comparison, the bank camera and the subpoenas go through them, so
 * the case can never be made unsolvable by running out.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  hannah: {
    warn: "I have a seminar paper due. I haven't opened it since Friday.",
    last: "Can we finish this another time? I'm running on nothing.",
    farewell: "I'm sorry. I can't do any more today. Call me when you know something.",
    offer: "Offer to buy her a $5 coffee from the place on Murray Avenue and keep talking.",
    accept: "Dad would've said that's a fair price. Okay. A few more.",
  },
  whitfield: {
    warn: "I have the board chair at three.",
    last: "I really must get back to the board packet.",
    farewell: "I think that's all I can give you today. My assistant will see you out.",
    offer: "Offer a $5 donation to the Recovery Fund's next grant round for a little more of her time.",
    accept: "We never turn down a donor. Of course. Go ahead.",
  },
  holt: {
    warn: "I bill in fifteen-minute increments, you know. You're well into the second.",
    last: "Two more, and then I have a client.",
    farewell: "We're done. If you want more, put it in writing.",
    offer: "Offer $5 for his trouble, for five more minutes of his time.",
    accept: "Five dollars. That's almost insulting. Five minutes.",
  },
  reddick: {
    warn: "I got a service call in Latrobe.",
    last: "Couple more, then I'm rolling.",
    farewell: "That's it. I got work.",
    offer: "Offer $5 for a sandwich from the gas station across Route 30, for a few more minutes.",
    accept: "Italian hoagie. Fine. Quick.",
  },
  lockhart: {
    warn: "I'm afraid I have a board meeting shortly.",
    last: "I'll need to go in a moment, I'm sorry.",
    farewell: "I really must go. Please, call again if I can be of help.",
    offer: "Offer a $5 gift to the Carroway fund, in Martin Keller's name, for a few more minutes.",
    accept: "That's very kind. Martin would have liked that. Of course, go on.",
  },
  ames: {
    warn: "I have a client at the top of the hour.",
    last: "Let's take two more, and then I really must.",
    farewell: "I need to get back to work. Come back any time.",
    offer: "Offer $5 toward his firm's pro bono hours for nonprofits, for a little more time.",
    accept: "You know the way to an accountant's heart: a line item. All right.",
  },
  avery: {
    warn: "I got rounds to walk.",
    last: "Couple more. Then I'm walking the floors.",
    farewell: "That's it. You know where the desk is.",
    offer: "Offer $5 for coffee and a donut from the bakery on Market Street.",
    accept: "Cream, no sugar. Five more.",
  },
  morris: {
    warn: "Susan's going to wonder why I'm not at my desk.",
    last: "I really have to get back to the phones.",
    farewell: "I can't, I'm sorry. She'll see me talking.",
    offer: "Offer $5 toward the office birthday card collection so she can step away a little longer.",
    accept: "Oh, that's sweet. Okay. A few more, quick.",
  },
  foster: {
    warn: "I got a line at the register.",
    last: "Two more, then I gotta hang up.",
    farewell: "I gotta go. Customers. Call the store if you need me.",
    offer: "Offer to buy $5 of something off his shelves, for a few more minutes.",
    accept: "Ha. A paying customer. Okay, go ahead.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["bennett", "bowman"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("hannah_book", "hannah", { event: "RE01" }, "Hannah's call about the book gives you reason to talk to her again."),
  grant("hannah_ledger", "hannah", { hasEvidence: "E011" }, "Martin's ledger gives you reason to talk to Hannah Keller again."),
  grant("whitfield_memo", "whitfield", { hasEvidence: "E013" }, "Martin's draft memo gives you reason to question Susan Whitfield again."),
  grant("whitfield_authorizations", "whitfield", { hasEvidence: "E018" }, "The fund's authorizations give you reason to question Susan Whitfield again."),
  grant("holt_authorizations", "holt", { hasEvidence: "E018" }, "His own authorizations give you reason to question Adrian Holt again."),
  grant("holt_control", "holt", { deduction: "D09" }, "Holt's control of the payments gives you reason to question him again."),
  grant("holt_payment", "holt", { hasEvidence: "E019" }, "The payment from his desk gives you reason to question Adrian Holt again."),
  grant("reddick_jobsheet", "reddick", { hasEvidence: "E021" }, "His own job sheet gives you reason to question Paul Reddick again."),
  grant("reddick_footwear", "reddick", { hasEvidence: "E007" }, "The footwear report gives you reason to question Paul Reddick again."),
  grant("reddick_bank", "reddick", { hasEvidence: "E024" }, "His bank statement gives you reason to question Paul Reddick again."),
  grant("ames_ledger", "ames", { hasEvidence: "E011" }, "Martin's ledger gives you reason to talk to Walter Kiley again."),
  grant("avery_camera", "avery", { hasEvidence: "E023" }, "The bank camera stills give you reason to talk to Stanley Avery again."),
  grant("morris_jobsheet", "morris", { hasEvidence: "E021" }, "Reddick's job sheet gives you reason to talk to Angela Morris again."),
  grant("foster_letter", "foster", { hasEvidence: "E028" }, "The clawback letter gives you reason to call Warren Foster."),
  grant("lockhart_control", "lockhart", { deduction: "D09" }, "Holt's control of the payments gives you reason to call Dr. Lockhart again."),
];
