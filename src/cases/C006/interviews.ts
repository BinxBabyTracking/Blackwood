import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * C006's interview economy. Everyone starts with 20 questions and starts
 * winding down about five before the end. Det. Mitchell, Dr. Brooks and Karen
 * Novak have no limit: police records, forensic reports and county records go
 * through them, so the case can never be made unsolvable by running out.
 * Every key witness gets a legitimate reason to talk again as the case moves,
 * five questions each, awarded once.
 */

export const UNLIMITED = ["mitchell", "brooks", "karen"];

export const PATIENCE: Record<string, PatienceDef> = {
  sarah: {
    warn: "I have spelling tests to grade tonight.",
    last: "Can we stop soon? This is a lot.",
    farewell: "I need a minute. Call me when you know something.",
    offer: "Offer to buy the paper for her classroom reading corner, $5, for a little more of her time.",
    accept: "Third graders go through paper like you wouldn't believe. Okay. A few more.",
  },
  wade: {
    warn: "I've got a transmission on the lift.",
    last: "Two more and you're out of my shop.",
    farewell: "I've got cars on the lift. We're done.",
    offer: "Buy a $5 air freshener from the rack for five more minutes.",
    accept: "Pine or vanilla? Fine. Five minutes.",
  },
  stroud: {
    warn: "I have a call with the state at three.",
    last: "I'll give you a minute more as a courtesy.",
    farewell: "I have a meeting. My assistant will see you out.",
    offer: "Offer $5 to the Riverworks community fund for more of his time.",
    accept: "Always glad to meet someone who believes in the town. Five more.",
  },
  trent: {
    warn: "You're running out of questions I'll answer.",
    last: "Last couple.",
    farewell: "We're done.",
    offer: "Offer $5 for a coffee and five more minutes.",
    accept: "Five minutes.",
  },
  glenn: {
    warn: "I'm getting tired. Friday, I said.",
    last: "That's about all I've got in me today.",
    farewell: "That's enough for today. Come back Friday.",
    offer: "Offer $5 toward the church's roof fund for a little more of his time.",
    accept: "Father Dan will be glad. All right. A few more.",
  },
  len: {
    warn: "I'm very tired.",
    last: "Please. A couple more.",
    farewell: "I'm tired. Please.",
    offer: "Offer $5 for the hospital's volunteer gift shop, for a little more time.",
    accept: "The ladies there were kind to me. All right.",
  },
  evelyn: {
    warn: "My program's coming on, honey.",
    last: "I really should go.",
    farewell: "I should go. I'll call you if I think of anything.",
    offer: "Offer $5 for her church's bake sale, for a little more of her time.",
    accept: "Well, the rhubarb pies won't buy themselves. Go on.",
  },
  ray: {
    warn: "My chest's acting up. Not much longer.",
    last: "Couple more. Then I'm done.",
    farewell: "I'm done talking about that place for today.",
    offer: "Offer $5 for a round at the hall's bar, for a few more minutes.",
    accept: "Now you're talking. Five more.",
  },
  earl: {
    warn: "The Thursday crowd's coming in for cards.",
    last: "Wrap it up, I've got a hand to deal.",
    farewell: "I've said my piece. Come back when you've got something.",
    offer: "Offer $5 for the local's memorial scholarship, for more of his time.",
    accept: "That fund put eleven kids through Pitt. Five more.",
  },
  rebecca: {
    warn: "My son's practice gets out soon.",
    last: "I can't do much more of this.",
    farewell: "I can't do this right now.",
    offer: "Offer $5 toward her son's travel soccer fees, for a little more time.",
    accept: "God knows we need it. Okay.",
  },
  andrew: {
    warn: "I've got a furnace call at four.",
    last: "Couple more, then I gotta run.",
    farewell: "I've got a service call. Sorry.",
    offer: "Buy him a $5 coffee for five more minutes.",
    accept: "Large, black. Shoot.",
  },
  jessica: {
    warn: "My editor's going to want this page in an hour.",
    last: "Last couple, I'm on deadline.",
    farewell: "I'm on deadline. Call me.",
    offer: "Offer $5 toward the newsroom coffee fund for a few more minutes.",
    accept: "You've just made the whole newsroom's day. Go.",
  },
};

export const reinterviews: ReinterviewDef[] = [
  { id: "ri_sarah_w", characterId: "sarah", when: { hasEvidence: "E004" }, note: "The calendar gives you reason to ask Sarah more about \"W.\"" },
  { id: "ri_sarah_d31", characterId: "sarah", when: { deduction: "D31" }, note: "Sarah needs to hear that the company may not explain Emily's death." },
  { id: "ri_wade_ring", characterId: "wade", when: { hasEvidence: "E015" }, note: "Wade's class ring was in Emily's pocket. He'll have to explain that." },
  { id: "ri_wade_copper", characterId: "wade", when: { hasEvidence: "E082" }, note: "The scrap ledger gives you reason to question Wade again." },
  { id: "ri_wade_rebecca", characterId: "wade", when: { hasEvidence: "E086" }, note: "Rebecca's new statement puts Wade at the East Gate at nine. Go back to him." },
  { id: "ri_wade_chain", characterId: "wade", when: { hasEvidence: "E095" }, note: "Gus's parts ledger gives you reason to question Wade again." },
  { id: "ri_rebecca_pager", characterId: "rebecca", when: { all: [{ hasEvidence: "E020" }, { hasEvidence: "E085" }] }, note: "The pager number was the Valley View Motor Inn. Rebecca has some explaining to do." },
  { id: "ri_andrew_time", characterId: "andrew", when: { chapter: 5 }, note: "Andrew's sighting matters more now. Ask him again about the time." },
  { id: "ri_stroud_memo", characterId: "stroud", when: { hasEvidence: "E026" }, note: "Evelyn's copies give you reason to question Stroud again." },
  { id: "ri_stroud_calls", characterId: "stroud", when: { hasEvidence: "E057" }, note: "Stroud's own phone records give you reason to question him again." },
  { id: "ri_stroud_note", characterId: "stroud", when: { hasEvidence: "E098" }, note: "Stroud's note to Len gives you reason to question him again." },
  { id: "ri_trent_log", characterId: "trent", when: { hasEvidence: "E052" }, note: "Trent's own patrol log gives you reason to question him again." },
  { id: "ri_trent_arrest", characterId: "trent", when: { flag: "trent_arrested" }, note: "Michael Trent is in custody at the police station." },
  { id: "ri_len_rescued", characterId: "len", when: { event: "RE15" }, note: "Len Greer is safe and wants to talk." },
  { id: "ri_evelyn_ch5", characterId: "evelyn", when: { chapter: 5 }, note: "Evelyn may know where Stroud was that August." },
  { id: "ri_ray_trent", characterId: "ray", when: { hasEvidence: "E091" }, note: "The 1996 payment to Trent gives you reason to ask Ray about his visitor." },
  { id: "ri_earl_scrap", characterId: "earl", when: { chapter: 5 }, note: "Earl knew everyone in the East Mill in the nineties. Ask him about the scrap trade." },
];
