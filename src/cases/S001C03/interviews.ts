import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for S001C03: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give a
 * legitimate reason to question them again (five more questions each, awarded
 * once). Grants follow docs/S001C03-timeline.md, "Re-interview grants", with
 * the build contract's ids.
 *
 * Bennett and Det. Whitaker have no limit: the police reports, the lab, the
 * call records, the bank schedule and the records checks go through them, so
 * the case can never be made unsolvable by running out. Rourke and Holt have
 * twelve questions each (their lawyers set the length); that is on their
 * character entries.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  marisol: {
    warn: "My sister keeps calling. Sofia wants to know when I'm coming.",
    last: "A couple more. I haven't eaten since Sunday.",
    farewell: "I can't do any more today. Please find out what happened to him.",
    offer: "Offer to pick up $5 of pastries from the bakery on Eastern Avenue for her and Sofia, and keep talking.",
    accept: "Hector liked the ones with the guava. Okay. A few more.",
  },
  gaffney: {
    warn: "I've got a vessel working and a yard full of boxes.",
    last: "Two more, then I'm back on the radio.",
    farewell: "We're done. Talk to the company's lawyer if you want more.",
    offer: "Offer $5 for a coffee and an egg sandwich from the food truck at Gate 1, for a few more minutes.",
    accept: "Black, no sugar. Five minutes.",
  },
  kane: {
    warn: "I have a call with a carrier at the top of the hour.",
    last: "Two more, and then I really do have a business to run.",
    farewell: "That's all the time I have. My office will see you out.",
    offer: "Offer $5 toward the coffee fund in his dispatch office, for a few more minutes.",
    accept: "Generous. Fine. A few more.",
  },
  fisk: {
    warn: "I got posts to cover.",
    last: "Couple more.",
    farewell: "That's it. We're done.",
    offer: "Offer $5 for a sub from the carryout on Pennington Avenue, for a few more minutes.",
    accept: "Cheesesteak. Quick.",
  },
  rourke: {
    warn: "His lawyer, off camera: 'We have about ten minutes left on this link.'",
    last: "His lawyer, off camera: 'Two more questions.'",
    farewell: "His lawyer, off camera: 'That's the end of the session.' The screen goes dark.",
    offer: "Offer $5 toward the detention center commissary for a few more minutes on the link.",
    accept: "His lawyer, off camera: 'A few minutes. No more.'",
  },
  holt: {
    warn: "His lawyer: 'We're nearly at the time we agreed.'",
    last: "His lawyer: 'Two more.'",
    farewell: "His lawyer: 'That concludes the interview.' The recorder clicks off.",
    offer: "Offer $5 to his commissary account for a few more minutes of the recording.",
    accept: "Five dollars of commissary. How the mighty. Go on, briefly.",
  },
  lindqvist: {
    warn: "If he comes up the stairs and sees me talking to you...",
    last: "Two more. Please be quick.",
    farewell: "I have to get back to the screen. I'm sorry.",
    offer: "Offer $5 for a coffee from the machine downstairs so she can step out a little longer.",
    accept: "The machine coffee is terrible. Okay. A few more.",
  },
  malone: {
    warn: "I got a box to pull at Seagirt this afternoon.",
    last: "Couple more, then I gotta roll.",
    farewell: "That's all. I'm losing my spot in the queue.",
    offer: "Offer $5 for his toll on the way to his next pickup, for a few more minutes.",
    accept: "Tolls add up. Okay. Go ahead.",
  },
  sullivan: {
    warn: "I got a meeting at the hall at noon.",
    last: "Two more. Then I need some air.",
    farewell: "That's enough for today. Come back when you know who.",
    offer: "Offer $5 for the hall's coffee can, for a few more minutes.",
    accept: "The coffee can. Hector always put a dollar in. Go on.",
  },
  walsh: {
    warn: "I have month-end in four weeks and an audit committee that reads my mail.",
    last: "Two more. I need to get back to the ledger.",
    farewell: "I think I should talk to a lawyer before I say any more.",
    offer: "Offer $5 toward the accounts office's coffee club, for a few more minutes.",
    accept: "A contribution to the coffee club is a reconciled item. All right.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["bennett", "whitaker"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("ri_marisol_re01", "marisol", { event: "RE01" }, "Marisol's call about the locker gives you reason to talk to her again."),
  grant("ri_marisol_e009", "marisol", { hasEvidence: "E009" }, "Hector's notebook gives you reason to talk to Marisol Navarro again."),
  grant("ri_gaffney_e012", "gaffney", { hasEvidence: "E012" }, "The re-issued dock receipt gives you reason to question Russell Gaffney again."),
  grant("ri_gaffney_d06", "gaffney", { deduction: "D06" }, "The badge he added to Staging Area C gives you reason to question Russell Gaffney again."),
  grant("ri_gaffney_e033", "gaffney", { hasEvidence: "E033" }, "The file on him gives you reason to question Russell Gaffney again."),
  grant("ri_lindqvist_e012", "lindqvist", { hasEvidence: "E012" }, "The printout from her tray gives you reason to talk to Joanne Lindqvist again."),
  grant("ri_lindqvist_d04", "lindqvist", { deduction: "D04" }, "The night moves give you reason to talk to Joanne Lindqvist again."),
  grant("ri_malone_e035", "malone", { hasEvidence: "E035" }, "The Riverside gate log gives you reason to talk to Eddie Malone again."),
  grant("ri_sullivan_e009", "sullivan", { hasEvidence: "E009" }, "Hector's notebook gives you reason to talk to Vince Sullivan again."),
  grant("ri_fisk_e027", "fisk", { hasEvidence: "E027" }, "The Gate 4 camera gives you reason to question Dwayne Fisk again."),
  grant("ri_fisk_e028", "fisk", { hasEvidence: "E028" }, "The phone in his truck gives you reason to question Dwayne Fisk again."),
  grant("ri_fisk_e004", "fisk", { hasEvidence: "E004" }, "The lab report on the binder bar gives you reason to question Dwayne Fisk again."),
  grant("ri_kane_e021", "kane", { hasEvidence: "E021" }, "Fisk's call records give you reason to question Gideon Kane again."),
  grant("ri_kane_e023", "kane", { hasEvidence: "E023" }, "Gaffney's texts give you reason to question Gideon Kane again."),
  grant("ri_kane_e028", "kane", { hasEvidence: "E028" }, "His messages on Fisk's phone give you reason to question Gideon Kane again."),
  grant("ri_walsh_e030", "walsh", { hasEvidence: "E030" }, "Patapsco's state filing gives you reason to talk to Philip Walsh again."),
  grant("ri_rourke_d12", "rourke", { deduction: "D12" }, "What the file did to Gaffney gives you reason to put it to Julian Rourke again."),
  grant("ri_holt_e038", "holt", { hasEvidence: "E038" }, "Patapsco's bank schedule gives you reason to put it to Adrian Holt again."),
];
