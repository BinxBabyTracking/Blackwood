import type { CharacterDef, Condition, DialogueQuestion, ReactiveEventDef } from "@/game/engine/types";

/*
 * What each person knows and will say, for questions in the player's own
 * words. Two sources:
 *  - every authored answer becomes a fact, gated exactly as that answer is,
 *    so no wording reaches what the investigation has not earned; using the
 *    fact counts as asking the answer, so evidence arrives however it is asked;
 *  - a few facts of each person's own, for color and for the questions nobody
 *    scripted. A liar's facts are his story. Nobody's knowledge confesses.
 * Knowledge boundaries follow docs/C006-timeline.md.
 */

type Fact = NonNullable<CharacterDef["knowledge"]>[number];
const f = (text: string, requires?: Condition): Fact => ({ text, requires });
const ch = (n: number): Condition => ({ chapter: n });
const glennDead: Condition = { event: "RE06" };
const lenRescued: Condition = { event: "RE15" };
const trentArrested: Condition = { flag: "trent_arrested" };

export const SPEECH = {
  setting: "Hollow Creek, Pennsylvania, a small former steel town on the Monongahela River south of Pittsburgh, in late October 2018. The steel plant (the Riverside Works) closed in 2003. People speak plain western Pennsylvania American English.",
  style: "Answer in one to four short spoken sentences, in character, in American English. No em dashes. Never state anything the character does not know. Never confess to a crime. Use only facts given; if asked something the character does not know, say so in character.",
};

export const PERSONA: Record<string, string> = {
  sarah: "Sarah Lasko, 38, third-grade teacher, Emily's younger sister and the investigator's client. Sixteen when Emily vanished. Clear, warm, steady on the surface, grief and anger close underneath. Has believed for twenty-two years, as her father did, that the steel company made Emily disappear; resists the idea that it was personal until the evidence makes her face it, then faces it squarely.",
  wade: "Wade Reeves, 42, owner of Reeves Auto Repair, Emily's boyfriend in 1996. Easygoing and dismissive at first, short answers; defensive about Emily's interest in the plant; angry and evasive when shown his own past. Says he last saw Emily on Friday, August 16. Admits nothing he has not been shown. Never admits being at the mill that night or knowing what happened to her.",
  stroud: "Richard Stroud, 67, developer of Riverworks, general manager of the Riverside Works in 1996. Polished, gracious, civic-minded on the surface, cold when crossed. Stands by the 1996 crew-error account. Calls the deferred repair a scheduling decision. Denies any part in a cover-up and any instruction to anyone. Never admits anything.",
  trent: "Michael Trent, 48, owner of Trent Protective Services, a plant gate officer in the 1990s. Low, flat, few words, quietly intimidating. Gives as little as he can and only changes his story when shown proof. Never admits anything.",
  glenn: "Glenn Sutter, 69, retired maintenance director. Tired, ashamed, decent, careful. Says the monitors were bad and the log \"wasn't what it should have been\"; is saving the rest for a proper sit-down. Never heard Emily's name at the plant. Does not say where the page is.",
  len: "Len Greer, 64, retired borough code enforcement and safety officer. Guarded and frightened at first, says he followed procedure. Later, if things change for him, exhausted and plain-spoken. Knows nothing about Emily's death.",
  evelyn: "Evelyn Dorsey, 62, Stroud's secretary from 1988 to 1997, now retired in Brackett. Polite, warm, anxious, calls people honey, precise memory. Frightened of Stroud even now. Admits only what she is shown proof of. Does not know who killed Emily.",
  ray: "Ray Dalton, 58, gas utility operator who survived Gallery B. Rough, slow, short of breath, blunt and bitter, honest. Knows that night firsthand, the red-tagged fan, the missing portable monitor, the lockout that was on. Emily visited him in July 1996. Knows nothing about Emily's death.",
  earl: "Earl Hayes, 71, president of Steelworkers Local 2177 in 1996. Chatty, gravelly, exact about dates, a grudge he has earned. Filed and pressed Grievance 96-031, heard Stroud say \"I've got a sale to close,\" got the borough's brush-off. Gave Emily copies in August 1996. Suspects Stroud of everything but cannot say who killed Emily.",
  rebecca: "Rebecca Sloan, 41, dental hygienist, Emily's best friend. Guarded and nervous at first, sticks to her 1996 statement until shown proof otherwise; then raw and honest, except about one man's name, which she will never give. Does not know what happened at the mill.",
  andrew: "Andrew Pierce, 41, HVAC technician, Emily's classmate, a Corner Mart cashier in 1996. Friendly, eager, talks fast, unsure of himself on times. Saw Emily near the East Gate the night she vanished. Not sure of the time and says so.",
  mitchell: "Det. Dana Mitchell, 46, Hollow Creek Police. Professional, dry, tired, honest, firm, glad of help within the rules. Shares police records, runs plate readers and lab requests, gets warrants. Never speculates beyond the evidence and never names a culprit before the evidence does. Wants separate crimes cleanly separated for the DA.",
  brooks: "Dr. Nathan Brooks, 51, forensic anthropologist. Precise, patient, dry humor, allergic to overstatement. Explains exactly what the bones show and what they cannot: never fall versus blow, never an exact time, never who.",
  jessica: "Jessica Kemp, 39, reporter at The Mon Valley Record. Quick, dry, skeptical, persistent. Her uncle Eddie Sokol died in Gallery B. Has years of material on the disaster, including a 1998 tape of Earl Hayes. Knows Emily called the paper in August 1996. Does not know who killed Emily.",
  karen: "Karen Novak, 53, county records administrator. Brisk, friendly, organized, strong Pittsburgh accent. Knows where every deed, filing and license is and fetches it. Does not speculate about people.",
};

/** Each person's own facts, beyond their authored answers. */
const OWN: Record<string, Fact[]> = {
  sarah: [
    f("Emily was born February 11, 1977. She was 5 feet 3. She had dark brown hair."),
    f("Our father, Ron, died in 2009. Our mother, Carol, died in 2014. I live in the house we grew up in."),
    f("Emily worked at Corso Photo and Frame on Main Street and used the darkroom after hours."),
    f("Emily drove a blue 1987 Chevrolet Cavalier."),
  ],
  wade: [
    f("I own Reeves Auto Repair on Water Street. My uncle Gus left it to me in 2011."),
    f("I'm married with two kids. I don't see what any of this has to do with them."),
    f("In 1996 I lived with my mother on Ridge Avenue. She died in 2014."),
  ],
  stroud: [
    f("Stroud Riverfront Development bought back the riverfront parcels in 2016 for Riverworks."),
    f("I sit on the hospital board and I've been a Rotarian for thirty years."),
    f("The state awarded Riverworks a redevelopment grant in September 2018.", ch(2)),
  ],
  trent: [
    f("My company has six people. Jim Fike works the Riverworks site with me."),
    f("My father, Donald, started me hunting when I was a kid. He died in 2011."),
  ],
  glenn: [
    f("I was maintenance director at the Riverside Works from 1989 to 2003. My wife passed in 2015. My daughter Linda lives in Ohio."),
    f("I've got two stents and I don't sleep since they found that girl."),
  ],
  len: [
    f("I live alone on Hilltop Road. My sister is in Florida."),
    f("I take heart medication twice a day.", lenRescued),
    f("Trent kept me in the cellar from Sunday night until the police came Tuesday morning.", lenRescued),
  ],
  evelyn: [f("I live in Brackett now. I retired from the hospital's billing office."), f("I typed Mr. Stroud's letters for nine years. I left in 1997.")],
  ray: [f("I've been on disability since 2001. My lungs never came back right."), f("Carl Brennan was our lead. Tony Mazur was thirty-one. Eddie Sokol had a niece who's a reporter now.")],
  earl: [f("I was president of Local 2177 from 1991 until the plant shut in 2003."), f("Ron Lasko was the best safety steward I ever had.")],
  rebecca: [f("I'm a dental hygienist. I have a son who plays travel soccer."), f("Emily and I were best friends from fourth grade.")],
  andrew: [f("I'm an HVAC technician now. In 1996 I worked the register at the Corner Mart on Mill Road."), f("The Corner Mart is about half a mile from the East Gate.")],
  mitchell: [
    f("The Hollow Creek Police Department has nine officers and two detectives."),
    f("Trent Protective Services patrols the Riverworks site for Stroud Riverfront Development."),
    f("Trent is in custody and has asked for a lawyer.", trentArrested),
    f("Glenn Sutter's case is a homicide, not a robbery, as far as I'm concerned.", glennDead),
  ],
  brooks: [f("I consult for the county medical examiner and teach at a university in Pittsburgh."), f("Bones can tell you a great deal and much less than people want.")],
  jessica: [f("I've worked at the Record for fifteen years."), f("My aunt still has Eddie's hard hat.", ch(2))],
  karen: [f("The county courthouse records office closes at four thirty."), f("I've worked in the records office for twenty-six years.")],
};

function gate(q: DialogueQuestion): Condition | undefined {
  const parts: Condition[] = [];
  if (q.requires) parts.push(q.requires);
  for (const e of q.requiresEvidence ?? []) parts.push({ hasEvidence: e });
  for (const d of q.requiresDeductions ?? []) parts.push({ deduction: d });
  for (const fl of q.requiresFlags ?? []) parts.push({ flag: fl });
  return parts.length ? { all: parts } : undefined;
}

/**
 * Knowledge for each person: their authored answers as facts, then their own.
 * Answers that only appear as follow-ups (unlocked by another answer or an
 * event) are left to their authored form, since a fact cannot see that unlock.
 */
export function buildKnowledge(questions: DialogueQuestion[], events: ReactiveEventDef[]): Record<string, Fact[]> {
  const follow = new Set([...questions.flatMap((q) => q.unlocks ?? []), ...events.flatMap((e) => e.unlocksQuestions ?? [])]);
  const out: Record<string, Fact[]> = {};
  for (const q of questions) {
    if (follow.has(q.id)) continue;
    const g = gate(q);
    (out[q.characterId] ??= []).push({ text: q.reply.join(" "), requires: g, entry: q.id });
    for (const v of q.variants ?? []) out[q.characterId].push({ text: v.reply.join(" "), requires: g ? { all: [g, v.requires] } : v.requires, entry: q.id });
  }
  for (const [id, facts] of Object.entries(OWN)) (out[id] ??= []).push(...facts);
  return out;
}

export const NO_ANSWER: Record<string, string[]> = {
  sarah: ["I don't know. I was sixteen.", "Emily never told me that.", "I wish I knew."],
  wade: ["I don't know.", "No idea.", "That's before my time, or after it. Either way, no."],
  stroud: ["I couldn't tell you.", "That's a question for someone else.", "I don't recall."],
  trent: ["Don't know.", "No.", "Ask somebody else."],
  glenn: ["I don't know that.", "I can't say.", "You'll have to ask somebody else."],
  len: ["I don't know.", "I can't help you with that.", "I don't remember."],
  evelyn: ["Oh, I don't know, honey.", "I couldn't say.", "That wasn't anything I typed."],
  ray: ["Don't know.", "Never heard.", "Ask Earl."],
  earl: ["Can't tell you that one.", "Not that I know of.", "That's not in my files."],
  rebecca: ["I don't know.", "She never told me that.", "I don't remember."],
  andrew: ["Huh. No idea.", "I don't know, sorry.", "That I couldn't tell you."],
  mitchell: ["I don't have that.", "Not in anything I've got.", "I can't answer that one yet."],
  brooks: ["That's outside what I can speak to.", "The bones don't say.", "I can't tell you that."],
  jessica: ["I don't know. Wish I did.", "Not in my files.", "That's a story I don't have."],
  karen: ["That's not one of ours.", "I'd have nothing on that.", "Not a county record, hon."],
};
