import type { PatienceDef, ReinterviewDef } from "@/game/engine/types";

/*
 * The interview question limit for C005: how each person runs out of
 * patience, how they take an offer of more time, and which discoveries give
 * a legitimate reason to question them again (five more questions each,
 * awarded once). Offers are in 1327 coin; the game's expense money pays.
 *
 * The archdeacon has no limit: he arranges anything the case needs (the
 * examination of the candlestick), so running out of questions can never
 * make the case unsolvable. Thomas's comparison costs no questions.
 */

export const PATIENCE: Record<string, PatienceDef> = {
  abbot: {
    warn: "The office calls me soon.",
    last: "I have a house to keep. A little longer.",
    farewell: "That is enough for today. God keep you.",
    offer: "Put a silver penny in the abbey's alms box, for a little more of his time.",
    accept: "For the poor. Very well. A few more.",
  },
  matthias: {
    warn: "The cellar does not keep itself.",
    last: "I have answered more than courtesy asks.",
    farewell: "I have nothing more to say to you.",
    offer: "Pay a silver penny into the cellar's account, for his trouble.",
    accept: "Entered. You may have a little more of my time.",
  },
  thomas: {
    warn: "I should be at my carrel.",
    last: "Forgive me. I'm very tired.",
    farewell: "I can't. Not today. Come back tomorrow.",
    offer: "Buy him a candle of good wax for his carrel, a penny.",
    accept: "Edmund would have liked that. Go on.",
  },
  peter: {
    warn: "Please, I have to go.",
    last: "I keep saying the same things.",
    farewell: "I've told you everything. Please.",
    offer: "Give him a penny's worth of bread and cheese.",
    accept: "Thank you. All right. A little more.",
  },
  anselm: {
    warn: "The lamps want trimming.",
    last: "I've a church to see to.",
    farewell: "That's all. The sacristy's waiting.",
    offer: "Give a penny for Our Lady's candles.",
    accept: "Well. For Our Lady. Five more.",
  },
  agnes: {
    warn: "Brother Odo will need me.",
    last: "Ask what matters.",
    farewell: "I'm needed in the infirmary. Come if you need my eyes again.",
    offer: "Give a penny for Thornholme's infirmary.",
    accept: "Kindly done. Ask.",
  },
  simon: {
    warn: "I should look at that rope again.",
    last: "Is there much more?",
    farewell: "I have to ring for None. Sorry!",
    offer: "Promise him a penny toward a new rope.",
    accept: "A good rope! All right then.",
  },
  william: {
    warn: "There's a cart at the gate.",
    last: "Quick, now.",
    farewell: "I've a gate to keep. You know where I am.",
    offer: "Stand him a penny's worth of ale.",
    accept: "That's handsome. Go on, then.",
  },
  margery: {
    warn: "My pots are boiling over.",
    last: "Two minutes more.",
    farewell: "I've said my piece. I've a kitchen to run.",
    offer: "Buy a penny's worth of her best bread.",
    accept: "You'll not regret it. Sit down, then.",
  },
  roland: {
    warn: "My time is worth more than this.",
    last: "One or two more, and then you'll go.",
    farewell: "Enough. My steward will see you out.",
    offer: "Praise his hounds, and stand a penny for the kennel boy.",
    accept: "You know a good hound. Very well.",
  },
  geoffrey: {
    warn: "My lord expects me.",
    last: "I've been patient with you.",
    farewell: "We're done. Speak to my lord if you must.",
    offer: "Pay a penny for a copy of something from the manor rolls, to keep him talking.",
    accept: "A copy. Of course. Go on.",
  },
  alice: {
    warn: "The stones don't grind themselves.",
    last: "Leave him be a while.",
    farewell: "That's all. Go gently with him.",
    offer: "Pay a penny to have a sack of grain ground.",
    accept: "Trade's trade. Go on.",
  },
};

/** Characters with no question limit. */
export const UNLIMITED = ["archdeacon"];

const grant = (id: string, characterId: string, when: ReinterviewDef["when"], note: string): ReinterviewDef => ({ id, characterId, when, note });

export const reinterviews: ReinterviewDef[] = [
  grant("abbot_archive", "abbot", { event: "RE08" }, "The abbot has opened the muniment room. You can question him again."),
  grant("thomas_forgery", "thomas", { deduction: "D08" }, "Now you know Edmund had found the forgery. You can question Brother Thomas again."),
  grant("matthias_passage", "matthias", { deduction: "D04" }, "The torn wool and the mended sleeve give you reason to question Brother Matthias again."),
  grant("matthias_money", "matthias", { deduction: "D09" }, "The cellarer's money gives you reason to question Brother Matthias again."),
  grant("matthias_salt", "matthias", { hasEvidence: "E31" }, "The charter in the salt bin gives you reason to question Brother Matthias again."),
  grant("geoffrey_letter", "geoffrey", { event: "RE06" }, "Geoffrey Hale's letter gives you reason to question him again."),
  grant("roland_letter", "roland", { event: "RE06" }, "His steward's letter gives you reason to question Lord Roland again."),
  grant("anselm_candlestick", "anselm", { hasEvidence: "E20" }, "The candlestick on the Lady altar gives you reason to question Brother Anselm again."),
  grant("simon_customary", "simon", { hasEvidence: "E22" }, "The customary gives you reason to question Brother Simon again."),
  grant("margery_came", "margery", { event: "RE04" }, "Margery has come forward. You can question her again."),
  grant("peter_mill", "peter", { event: "RE05" }, "Peter has been found. You can question him again, at the mill."),
  grant("agnes_candlestick", "agnes", { hasEvidence: "E20" }, "The candlestick gives you reason to question Sister Agnes again."),
];
