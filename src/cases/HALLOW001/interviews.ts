import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for HALLOW001: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give a
 * legitimate reason to question them again (five more questions each, once).
 * Lt. Mahoney has no limit: the lab, the officers, the chamber and the arrest
 * all go through her, so the case can never be made unsolvable by running out.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  crane: {
    warn: "I'm happy to help, of course. Within reason. It is very late.",
    last: "A couple more, and then I'd like to sit with Constance. She's had a shock.",
    farewell: "That's enough for tonight, I think. You know where I am.",
    offer: "Offer $5 toward the foundation's restoration fund for a few more minutes of his time.",
    accept: "For the fund. Ambrose would appreciate the gesture. Go on.",
  },
  josie: {
    warn: "I'm sorry. I'm so tired. I've been holding my breath for twenty years.",
    last: "Just a little more. Then I need to sit quietly.",
    farewell: "I can't talk anymore right now. Please come back.",
    offer: "Offer $5 for a pot of tea from the kitchen while you keep talking.",
    accept: "Thank you. Yes. Tea. Go on.",
  },
  constance: {
    warn: "I've buried a marriage once already. I'd rather not do it twice in one night.",
    last: "Two more, please, and then leave me be.",
    farewell: "No more tonight. I mean it.",
    offer: "Offer $5 toward the church's Halloween collection, in Ambrose's name, for a few more minutes.",
    accept: "He'd have hated that. Fine. A few more.",
  },
  penrose: {
    warn: "I should look in on a few of the older guests. This is a great deal of strain.",
    last: "I must go and check on Mrs. Duffy shortly.",
    farewell: "I've told you what I can. I have patients to see in the morning.",
    offer: "Offer $5 for the free clinic in Pittsfield where he volunteers, for a little more time.",
    accept: "That's decent of you. All right.",
  },
  felix: {
    warn: "Look, I've just lost my father. Can we wrap this up?",
    last: "Couple more. Then I need a drink.",
    farewell: "I'm done. Talk to me tomorrow.",
    offer: "Offer $5 for a large whiskey from the sideboard to keep him talking.",
    accept: "Now you're speaking my language. Go ahead.",
  },
  wren: {
    warn: "I still have caterers to send home and a procession to think about.",
    last: "I need to get back to my team in a moment.",
    farewell: "I'm sorry, I have to see to my staff.",
    offer: "Offer $5 toward his staff's tips tonight for a few more minutes.",
    accept: "They've earned it tonight. Fire away.",
  },
  harriet: {
    warn: "I'm not as young as I was, and it's very late.",
    last: "I'd like to rest soon.",
    farewell: "That's all I can manage tonight, dear.",
    offer: "Offer $5 for the Harrow Falls library's book sale, which she runs, for a little more time.",
    accept: "Oh, the book sale. Well. All right.",
  },
  amos: {
    warn: "My knees don't like these chairs.",
    last: "Couple more. Then I'm going to find Bridget.",
    farewell: "That's me done.",
    offer: "Offer $5 for a cup of coffee and a chair by the hall fire to keep him talking.",
    accept: "By the fire. Fair enough.",
  },
  bridget: {
    warn: "I'm sorry, I keep thinking about that girl.",
    last: "Just a little more, and then I'll go sit with Amos.",
    farewell: "I can't, not now. God bless you.",
    offer: "Offer $5 for a candle at St. Agnes, for Ambrose, for a few more minutes.",
    accept: "For Mr. Blackthorn. Yes. Thank you.",
  },
  beatrice: {
    warn: "I'd like to stop soon. I feel quite ill.",
    last: "Two more. Please.",
    farewell: "No more. I can't.",
    offer: "Offer $5 toward the garden club's fund, which she chairs, for a few more minutes.",
    accept: "That's very kind. Very well.",
  },
  byrne: {
    warn: "I'll need to call the trustees' insurers before morning.",
    last: "One or two more, and then I have calls to make.",
    farewell: "I have to make some calls. Put anything else in writing.",
    offer: "Offer $5 for the foundation's legal aid fund for a few more minutes.",
    accept: "Recorded. Go ahead.",
  },
  iris: {
    warn: "I'm happy to keep talking about the house, but I'm fading.",
    last: "A couple more, then I should sit down.",
    farewell: "I'm sorry, I need a break.",
    offer: "Offer $5 for the Berkshire historical society's archive fund to keep her going.",
    accept: "You know the way to a historian's heart. Go on.",
  },
};

export const reinterviews: ReinterviewDef[] = [
  { id: "ri_crane_key", characterId: "crane", when: { hasEvidence: "HE029" }, note: "Lucian Marsh will have to explain the key book." },
  { id: "ri_crane_terrace", characterId: "crane", when: { hasEvidence: "HE028" }, note: "Lucian Marsh will have to explain where he really was." },
  { id: "ri_beatrice", characterId: "beatrice", when: { any: [{ hasEvidence: "HE016" }, { hasEvidence: "HE014" }] }, note: "Beatrice Holloway knows more about the woman in black than she has said." },
  { id: "ri_penrose", characterId: "penrose", when: { hasEvidence: "HE033" }, note: "Dr. Penrose has some explaining to do about the conservatory." },
  { id: "ri_constance", characterId: "constance", when: { hasEvidence: "HE033" }, note: "Constance Blackthorn has some explaining to do about the conservatory." },
  { id: "ri_felix", characterId: "felix", when: { hasEvidence: "HE032" }, note: "Felix Blackthorn will have to talk about his debts." },
  { id: "ri_harriet", characterId: "harriet", when: { any: [{ hasEvidence: "HE018" }, { hasEvidence: "HE020" }] }, note: "Harriet Lowell will want to see what the 1997 records say." },
  { id: "ri_amos", characterId: "amos", when: { any: [{ hasEvidence: "HE024" }, { hasEvidence: "HE004" }] }, note: "Amos Duffy knows this house better than anyone. He'll have more to say." },
];
