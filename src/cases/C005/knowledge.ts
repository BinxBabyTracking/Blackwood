import type { Condition, Effect } from "@/game/engine/types";

/*
 * What each person knows, and will say, about the death of Brother Edmund.
 * Used to answer questions in the player's own words when no authored answer
 * fits.
 *
 * Rules for this file:
 * - Each list is that person's own version. Matthias and Geoffrey give their
 *   accounts, lies included; nothing here confesses or names who struck Edmund.
 * - Every fact is marked in a comment as true, a LIE, LEAVES OUT, or
 *   MISREMEMBERS/MISUNDERSTANDS, so the knowledge model keeps them apart.
 * - A fact is gated exactly like the authored answer that reveals it, so no
 *   phrasing reaches information the investigation has not earned. A fact that
 *   hands something over carries the same effect as its answer.
 * - No clock hours: only the abbey's offices. No police, no laboratories, no
 *   modern words. Times follow docs/C005-timeline.md.
 */

type Fact = { text: string; requires?: Condition; entry?: string; effects?: Effect[] };
const f = (text: string, requires?: Condition, entry?: string, effects?: Effect[]): Fact => ({ text, requires, entry, effects });

const atMill: Condition = { event: "RE05" };
const beforeFled: Condition = { not: { event: "RE03" } };
const margeryTalks: Condition = { event: "RE04" };

export const PERSONA: Record<string, string> = {
  abbot:
    "Abbot Benedict, 61, abbot of Saint Aldwyn's, a poor Benedictine house in Wendale, northern England, in October 1327. Warm, weary, courteous, anxious to keep peace with the abbey's patron, Lord Roland. At first he insists Edmund died of a seizure and wants the matter closed; once shown that Edmund was struck, he is troubled, and once shown Edmund's own notes he gives way and is honest. Never accuses anyone.",
  matthias:
    "Brother Matthias, 46, cellarer of Saint Aldwyn's: stores, rents, leases and money. Precise, controlled, outwardly devout, quietly cold, never raises his voice. Gives short, exact answers and sticks to his account: he served the drink, locked the cellar with the abbot's leave and was in his stall for Compline before the great bell finished; he was not in the passage; he tore his sleeve on a cask hoop on Tuesday; the founder at York recast the bell's clapper; the rent was remitted with the abbot's leave; he barely knows the steward. Never admits anything and never accuses anyone.",
  thomas:
    "Brother Thomas, 34, librarian of Saint Aldwyn's, Edmund's pupil and friend, who found the body. Gentle, clever, grieving, eager to help, ashamed of having lent Edmund his archive key against the rule. Knows manuscripts, hands and seals well and explains them plainly. Does not accuse anyone, though he is uneasy about the cellarer.",
  peter:
    "Peter, 17, a novice of a year at Saint Aldwyn's, who helps the bell ringer. Before he runs away he is nervous and evasive: he admits hearing voices but says he came straight back with the oil and saw no one. At the mill after he is found he is frightened, then steadier, and tells the truth plainly. Never says he saw anyone harm Edmund, because he did not.",
  anselm:
    "Brother Anselm, 57, sacristan: church furnishings, lights, wine, and the second key to the cellarer's passage. Fussy, house-proud, quick to take offense and quick to be sorry. Helped force the book room door. Ashamed that he saw both candlesticks back on the altar and said nothing.",
  agnes:
    "Sister Agnes, 43, infirmarian of Thornholme Priory, lodging at Saint Aldwyn's to nurse its dying old infirmarian, Brother Odo. Calm, exact, kind without softness. Describes only what she saw with her own eyes; never claims certainty she does not have; never names who struck the blow.",
  simon:
    "Brother Simon, 25, the bell ringer. Cheerful and eager, proud of his ringing. At first he says Compline was rung as ever, because he is embarrassed; once asked about the rope or shown the customary he tells the truth plainly.",
  william:
    "William Carter, 42, the abbey's lay gatekeeper. Plain spoken, steady, keeps a careful gate roll. Remembers the steward leaving 'about Vespers', though his own roll says after None, and trusts the roll when shown it.",
  margery:
    "Margery, 50, cook in the guest-house kitchen by the kitchen court. Brisk, warm, plain spoken, afraid for her place because the cellarer hires and puts off. Says she saw nothing until she decides to come forward; after that she tells it straight.",
  roland:
    "Lord Roland Ashcombe, 55, lord of Ashcombe Hall and patron of Saint Aldwyn's. Haughty, impatient, blunt, not cunning. Wants the Fellbeck meadows for sheep and believes the confirmation is genuine. Sealed the warning letter his steward wrote. Knows nothing of any death.",
  geoffrey:
    "Geoffrey Hale, 49, steward of Ashcombe Hall: rents, letters, lawsuits. Smooth, plausible, quick, self-serving. Sticks to his account: he found the confirmation in his lord's chest, he never set foot in the abbey on Monday, he barely knows the cellarer. When shown records he gives ground by inches and blames others. Never admits forging anything and knows nothing of the death.",
  alice:
    "Alice Miller, 38, wife of the miller at Hollin Bridge, who holds the abbey's mill on a lease the cellarer renews at Martinmas. Peter's aunt. Protective, wary, practical, warm underneath.",
  archdeacon:
    "Master Hugh Selwood, Archdeacon of Wendale, writing by return of messenger from Kirkby. A senior churchman and lawyer: dry, exact, patient, quietly humorous. Gives advice and the diocese's records, never the answer. Signs H.S.",
};

export const KNOWLEDGE: Record<string, Fact[]> = {
  abbot: [
    // MISUNDERSTANDS, by choice: the seizure
    f("Edmund went to the book room after Vespers and did not come to Compline. When the door was forced he was on the floor. I believe his heart failed or the falling sickness took him, and he struck his head.", undefined, "abbot_welcome"),
    f("Edmund kept the register and every charter in use. Thirty years a monk, the best mind in the house.", undefined, "abbot_edmund"),
    f("On Monday all were at Vespers. Edmund went to the book room instead of the drink. Brother Matthias served the drink and asked my leave to lock the cellar before the Collation; I gave it. Thomas read at the Collation and I presided.", undefined, "abbot_evening"),
    f("Thomas found the door barred after Compline. He and Anselm and two others forced it with a bench. I sent for Sister Agnes.", undefined, "abbot_found"),
    f("The missing writing is a confirmation concerning our meadows at Fellbeck. The steward of Ashcombe laid it before me at Michaelmas, and I gave it to Edmund to copy and judge.", undefined, "abbot_charter"),
    f("The muniment room is under three keys: mine, the prior's and the librarian's.", { not: { event: "RE08" } }, "abbot_archive"),
    f("I have opened the muniment room to the examiner.", { event: "RE08" }, "abbot_archive"),
    f("Lord Roland is our patron and wants Fellbeck for sheep. This house is poor and cannot afford to quarrel with him.", undefined, "abbot_roland"),
    f("Brother Matthias is my cellarer. I have trusted him with everything.", undefined, "abbot_matthias"),
    f("I never gave leave for the Ashcombe pasture rent to be remitted. I wrote my question in the margin of his account.", { hasEvidence: "E15" }, "abbot_rent"),
    // LEAVES OUT until RE08: the half-promise
    f("At Michaelmas I told Lord Roland that if the writing proved good I would not fight him for Fellbeck.", { event: "RE08" }, "abbot_promise"),
    f("Peter is a novice of a year who helps Brother Simon with the bells. His people are at Hollin Bridge.", undefined, "abbot_peter"),
    f("Matthias was in his stall at the end of Compline. I did not see him come in.", undefined, "abbot_compline"),
    f("I wanted it to be a seizure. Anything else is a scandal in my house.", { deduction: "D01" }, "abbot_seizure"),
  ],
  matthias: [
    f("I keep the cellar, the stores, the rents and the leases.", undefined, "matthias_who"),
    f("Edmund was learned, and old. His eyes were going.", undefined, "matthias_edmund"),
    // LIE: he left the drink to kill Edmund, not to lock the cellar; LIE about the bell
    f("On Monday I served the drink, asked the abbot's leave to lock the cellar, and then went to the church for Compline.", undefined, "matthias_evening"),
    f("I was in my stall before the great bell finished tolling for Compline.", undefined, "matthias_compline"),
    // LIE
    f("Only I and the sacristan hold keys to the passage behind the book room. I was not in it on Monday evening.", undefined, "matthias_passage"),
    // LEAVES OUT until E14: Edmund asked him for the 1319 rolls
    f("Edmund asked me for nothing I could give him.", { not: { hasEvidence: "E14" } }, "matthias_rolls"),
    f("Edmund asked for the old rent rolls. I told him they were the cellar's business.", { hasEvidence: "E14" }, "matthias_rolls"),
    f("I know of the Fellbeck writing only what the abbot told chapter.", undefined, "matthias_charter"),
    // LIE
    f("I hardly know Geoffrey Hale. He comes about tithes and barley.", undefined, "matthias_geoffrey"),
    // LIE
    f("I remitted the Ashcombe pasture rent with the abbot's leave.", { hasEvidence: "E15" }, "matthias_rent"),
    // LIE
    f("The payment to the founder at York was for recasting the great bell's clapper.", { hasEvidence: "E16" }, "matthias_founder"),
    f("I buy parchment, ink and wax to write leases myself.", { hasEvidence: "E16" }, "matthias_parchment"),
    // LIE
    f("I tore my sleeve on a cask hoop on Tuesday morning.", { hasEvidence: "E07" }, "matthias_sleeve"),
    // LIE: the threat at Prime
    f("I sent Peter for bread at Prime on Tuesday. Nothing else.", undefined, "matthias_peter"),
    f("I copied psalters in the scriptorium twenty years ago, before I took the cellar's keys.", { asked: "thomas_matthias" }, "matthias_hand"),
  ],
  thomas: [
    f("After Compline I went to the book room and found the door barred. We forced it with a bench. The room was dark and Edmund's candlestick was gone.", undefined, "thomas_found"),
    f("After Vespers Edmund went to the book room with the candlestick Anselm lent him, lit. That was the last I saw of him.", undefined, "thomas_monday"),
    f("The cellarer was not at the Collation; he had the abbot's leave. I sent Peter for lamp oil; he was gone a long time and came back after the bell.", undefined, "thomas_collation"),
    f("Edmund taught me to read old hands.", undefined, "thomas_edmund"),
    f("On Monday morning Edmund said he would lay something before the abbot at chapter on Tuesday, and would not say what.", undefined, "thomas_worry"),
    f("Edmund was copying the Fellbeck confirmation into the register, and he did not trust it.", undefined, "thomas_charter"),
    f("Edmund gave the grant of 1189 back to me on Monday morning. I have it here and can give it to you.", { any: [{ hasEvidence: "E08" }, { asked: "thomas_charter" }] }, "thomas_grant", [{ giveEvidence: "E09" }]),
    // LEAVES OUT until shown E08: the key
    f("I lent Edmund my muniment room key, against the rule.", { hasEvidence: "E08" }, "thomas_key"),
    f("The abbey's old seal showed Saint Aldwyn seated; the new one, cut at York after the old cracked, shows him standing under a canopy.", undefined, "thomas_seals"),
    f("Before he became cellarer, Matthias wrote a fair book hand in the scriptorium.", { any: [{ hasEvidence: "E16" }, { hasEvidence: "E14" }] }, "thomas_matthias"),
    f("The old hand makes a single round a and a tall s; ours makes a double a, a short s and a looped d.", undefined, "thomas_hands"),
    f("Peter is a good boy, frightened this week.", undefined, "thomas_peter"),
    f("I can help you compare writings at your lectern.", undefined, "thomas_compare"),
  ],
  peter: [
    f("During the Collation I was sent for oil. Passing the book room I heard Brother Edmund say, 'The lord abbot shall see it at chapter.' The other voice was low; I couldn't tell whose.", beforeFled, "peter_voices"),
    // LIE (in the cloister): came straight back
    f("I went to the kitchen for oil and came straight back.", beforeFled, "peter_oil"),
    // LIE (in the cloister): saw no one
    f("I saw no one in the kitchen court.", beforeFled, "peter_court"),
    f("I've been a novice a year. I help Brother Simon with the bells. My family is at Hollin Bridge.", beforeFled, "peter_who"),
    f("I ran because I knew I'd be made to swear, and I couldn't lie and didn't dare tell the truth.", atMill, "peter_why"),
    f("I sat by Margery's fire eating bread instead of hurrying back. I'm sorry I lied about that.", atMill, "peter_fire"),
    f("When the hand bell rang I went out into the kitchen court and saw Brother Matthias come out of the passage door with no light, holding something heavy under his scapular. He saw me and went toward the salt store.", atMill, "peter_saw"),
    f("At Prime on Tuesday Brother Matthias told me I'd seen the cellarer fetching candles and nothing else, that a novice who lies under oath is put out, and that my aunt's lease is his to renew.", atMill, "peter_threat"),
    f("I don't know what he was carrying.", atMill, "peter_carrying"),
    f("I never saw anyone hurt Brother Edmund.", atMill, "peter_blow"),
    f("I will give my testimony and put my mark to it.", atMill, "peter_testimony", [{ giveEvidence: "E30" }]),
    f("I'll come back to the abbey if the abbot lets me and the cellarer isn't there.", atMill, "peter_back"),
  ],
  anselm: [
    f("I am the sacristan: candles, cloths, cups, lamps, wine, and the bells through Simon.", undefined, "anselm_who"),
    f("Thomas fetched me after Compline and we forced the door with the bench. The bracket came out of the wall.", undefined, "anselm_found"),
    f("Only the cellarer and I hold keys to the passage. I can open it for you.", undefined, "anselm_keys"),
    f("I was in the church lighting the stall lamps from the end of the reading until after Compline. Simon saw me.", undefined, "anselm_whereabouts"),
    // MISUNDERSTANDS: assumes the late man was Matthias, cannot swear it
    f("At Compline the cellarer's stall was empty when the first psalm began. By the hymn someone was in it; I took it to be Brother Matthias. Edmund's stall was empty throughout. I'll give you my account.", undefined, "anselm_compline", [{ giveEvidence: "E24" }]),
    f("I lent Edmund one of the Lady altar's two bronze candlesticks at Michaelmas.", undefined, "anselm_candlestick"),
    // LEAVES OUT until E20: saw both back at Prime Tuesday
    f("I saw both candlesticks on the Lady altar at Prime on Tuesday and thought Thomas had returned it. I said nothing.", { hasEvidence: "E20" }, "anselm_returned"),
    f("The stub on that candlestick is a scriptorium candle, not an altar candle.", { hasEvidence: "E20" }, "anselm_candle"),
  ],
  agnes: [
    f("I am infirmarian at Thornholme, here to nurse Brother Odo.", undefined, "agnes_who"),
    f("One curved wound above the left ear, about two fingers wide, the bone broken in. A warding bruise on the right forearm. I've written it down for you.", undefined, "agnes_wound", [{ giveEvidence: "E02" }]),
    f("It was not the falling sickness: no bitten tongue, no froth. The desk edge is straight; the wound is curved.", undefined, "agnes_seizure"),
    f("He was cold and stiffening when I came after Compline. He died before Compline, some while before.", undefined, "agnes_when"),
    f("I did not contradict the abbot that night; I was a guest. I waited for someone to ask.", undefined, "agnes_abbot"),
    f("The wound was made by something heavy with a rounded edge, swung hard. Not a fall.", undefined, "agnes_weapon"),
    f("I will compare the candlestick with the wound; the answer will be on the examiner's table when they are next in their chamber.", { hasEvidence: "E20" }, "agnes_examine", [{ setFlag: "x1_requested" }]),
  ],
  simon: [
    f("I ring every office, under Brother Anselm. Peter helps me.", undefined, "simon_who"),
    // LIE, from embarrassment, until the rope or the customary comes up
    f("Compline on Monday was rung as ever, on the great bell.", { not: { any: [{ hasEvidence: "E22" }, { inspected: "to_rope" }] } }, "simon_compline"),
    f("The great bell's rope parted at the first stroke for Compline on Monday. I rang the hand bell at the church door, late. The great bell did not toll. Here is my tally.", { any: [{ hasEvidence: "E22" }, { inspected: "to_rope" }] }, "simon_rope", [{ giveEvidence: "E23" }]),
    f("While I rang I saw Brother Anselm inside lighting the stall lamps, and nobody else.", undefined, "simon_saw"),
    f("The order of the evening bells is in the customary.", undefined, "simon_order"),
    f("The great bell's clapper has never been recast.", { any: [{ hasEvidence: "E16" }, { asked: "matthias_founder" }] }, "simon_clapper"),
    f("Peter sits behind the beam of the bell frame while I ring.", undefined, "simon_peter"),
  ],
  william: [
    f("I keep the gate and the gate roll, and bar the gate at Compline.", undefined, "william_who"),
    // MISREMEMBERS: 'about Vespers'; the roll says after None
    f("On Monday the steward of Ashcombe came at Sext to see the cellarer about barley, and left about Vespers, I think.", undefined, "william_monday"),
    f("Nobody came in after Compline on Monday or Tuesday.", undefined, "william_night"),
    f("The wall is low only where the mill-race goes under.", undefined, "william_wall"),
    f("I was at the gate when Edmund was found.", undefined, "william_found"),
    f("Peter's aunt is Alice, John Miller's wife, at Hollin Bridge.", undefined, "william_peter"),
    f("The steward comes more often than he used to this year.", undefined, "william_geoffrey"),
  ],
  margery: [
    f("I cook for the guest-house.", undefined, "margery_who"),
    // LIE until RE04
    f("On Monday evening I was at my pots and saw nothing.", { not: margeryTalks }, "margery_monday"),
    f("On Monday evening the boy Peter sat by my fire, and as the hand bell rang I saw the cellarer come out of the passage door with no lantern.", margeryTalks, "margery_monday"),
    f("Peter came for oil on Monday.", undefined, "margery_peter"),
    f("I mended the cellarer's habit on Tuesday: a three-cornered tear on the right sleeve. He said a cask hoop; no hoop in that cellar stands high enough.", { any: [margeryTalks, { hasEvidence: "E07" }] }, "margery_sleeve"),
    f("The cellarer went toward the salt store from the passage door, then toward the church.", margeryTalks, "margery_salt"),
    f("I didn't speak before because he hires and puts off.", margeryTalks, "margery_why"),
  ],
  roland: [
    f("I am the abbey's patron, as my fathers were.", undefined, "roland_who"),
    f("I want Fellbeck for a sheep walk.", undefined, "roland_fellbeck"),
    // MISUNDERSTANDS: believes the confirmation is genuine
    f("My steward found the old confirmation among my papers. I paid him for it.", undefined, "roland_writing"),
    f("I sealed the warning; Geoffrey wrote it.", { event: "RE01" }, "roland_warning"),
    f("I never spoke to Brother Edmund.", undefined, "roland_edmund"),
    f("On Monday I was at my own table with my household.", undefined, "roland_monday"),
    f("The abbot told me he would not fight me if the writing was good.", undefined, "roland_abbot"),
    f("You may see the bailiff's account roll.", { any: [{ event: "RE06" }, { hasEvidence: "E17" }] }, "roland_accounts", [{ giveEvidence: "E18" }]),
  ],
  geoffrey: [
    f("I handle my lord's rents, letters and lawsuits.", undefined, "geoffrey_who"),
    // LIE
    f("I found the confirmation in my lord's evidence chest among his grandfather's papers and brought it to the abbot at Michaelmas.", undefined, "geoffrey_found"),
    // LIE
    f("I never set foot in the abbey on Monday. I sent a groom.", { not: { hasEvidence: "E25" } }, "geoffrey_monday"),
    f("Perhaps I went to the abbey myself on Monday to see the cellarer about barley.", { hasEvidence: "E25" }, "geoffrey_gate"),
    // LIE
    f("I barely know the cellarer.", undefined, "geoffrey_matthias"),
    f("My lord gains a sheep walk from Fellbeck.", undefined, "geoffrey_fellbeck"),
    f("I never spoke to Brother Edmund.", undefined, "geoffrey_edmund"),
    f("I wrote the warning letter; my lord sealed it.", { event: "RE01" }, "geoffrey_warning"),
    f("My lord paid me five marks for finding his evidence.", { hasEvidence: "E18" }, "geoffrey_reward"),
    // LIE (from RE06): blames Matthias for bringing it to him
    f("The cellarer brought me the writing and I believed him.", { event: "RE06" }, "geoffrey_after"),
  ],
  alice: [
    f("Peter came to the mill door before first light on Wednesday, soaked from the beck, frightened and unhurt. I've set it down for you.", atMill, "alice_peter", [{ giveEvidence: "E29" }]),
    f("I'm John Miller's wife. Peter is my sister's boy.", atMill, "alice_who"),
    f("The mill was raised sixty years back, in the second Abbot John's time.", atMill, "alice_mill"),
    f("The cellarer renews our lease every Martinmas.", atMill, "alice_lease"),
    f("I hid him because he's my sister's boy.", atMill, "alice_hide"),
    f("He can go back if he wants and the man who frightened him isn't there.", atMill, "alice_back"),
  ],
  archdeacon: [
    f("Look at the door before you look at anyone's face. Believe nothing that cannot be shown.", undefined, "archdeacon_case"),
    f("Abbot Benedict is decent and frightened; he will choose peace over truth until truth is cheaper.", undefined, "archdeacon_abbot"),
    f("Lord Roland is proud and greedy but not clever; look at whoever does his writing.", undefined, "archdeacon_roland"),
    f("The diocese's visitation rolls note that Saint Aldwyn's changed its seal some forty years ago after the old one cracked.", { hasEvidence: "E10" }, "archdeacon_seals"),
    f("I can ask Sister Agnes to compare the candlestick with the wound.", { hasEvidence: "E20" }, "archdeacon_examine", [{ setFlag: "x1_requested" }]),
    f("Boys who run go somewhere they know; ask the gate who his people are.", { event: "RE03" }, "archdeacon_peter"),
    f("A monk who kills answers to the Church's court, not the king's.", undefined, "archdeacon_law"),
    f("Forging a charter is a grave crime before the king's justices.", { hasEvidence: "E17" }, "archdeacon_forgery"),
    f("Lay evidence on the table and run thread between two things that belong together.", undefined, "archdeacon_table"),
    f("Send your finding when you can show who, why, how, and what became of the boy, from more than one kind of proof.", undefined, "archdeacon_finding"),
  ],
};
