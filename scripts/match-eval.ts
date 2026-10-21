/** Measures the free-form question matcher. Run: npx tsx --conditions=react-server scripts/match-eval.ts */
import { loadCase } from "../src/game/registry";
import { bestMatch, rankCandidates } from "../src/game/engine/matcher";
import type { CaseDefinition } from "../src/game/engine/types";

const def = loadCase("C001") as CaseDefinition;
export const CASES: [string, string, string | null][] = [
  ["margaret", "Did you see anything that night after you went home?", "margaret_noise"],
  ["margaret", "Did you hear anything unusual later that night?", "margaret_noise"],
  ["margaret", "How long have you known Eleanor?", "margaret_relationship"],
  ["margaret", "What happened at the dinner party?", "margaret_evening"],
  ["margaret", "What time did you leave?", "margaret_departure"],
  ["margaret", "Who was still at the house when you left?", "margaret_departure"],
  ["margaret", "How was Eleanor acting that night?", "margaret_eleanor_mood"],
  ["margaret", "What can you tell me about Daniel Mercer?", "margaret_daniel"],
  ["margaret", "Did anyone have a cut on their hand?", "margaret_hands"],
  ["margaret", "What did the car look like?", "margaret_sedan_more"],
  ["margaret", "Did you see who was driving?", "margaret_sedan_driver"],
  ["margaret", "How sure are you about the time you saw the car?", "margaret_confidence"],
  ["margaret", "How did the other guests act?", "margaret_guests"],
  ["margaret", "What's your favorite color?", null],
  ["margaret", "Do you like baseball?", null],
  ["daniel", "Where did you go after you left the party?", "daniel_evening"],
  ["daniel", "Where were you that night?", "daniel_evening"],
  ["daniel", "How did you hurt your hand?", "daniel_hand"],
  ["daniel", "What happened to your hand?", "daniel_hand"],
  ["daniel", "What time did you leave Eleanor's?", "daniel_departure"],
  ["daniel", "How did you start working for the Whitmores?", "daniel_relationship"],
  ["daniel", "Are the estate accounts in order?", "daniel_accounts"],
  ["daniel", "What did you and Eleanor talk about at her desk?", "daniel_desk"],
  ["daniel", "Where's the tan windbreaker that was hanging here?", "daniel_jacket_b"],
  ["daniel", "Linda clocked out at eleven, so who poured your coffee?", "daniel_alibi_broken"],
  ["daniel", "Your Buick was parked outside her house after midnight.", "daniel_sedan"],
  ["daniel", "Are you planning a trip?", "daniel_suitcase"],
  ["daniel", "What do you think about the weather?", null],
  ["robert", "When did you leave the party?", "robert_departure"],
  ["robert", "What kind of car does Daniel drive?", "robert_cars"],
  ["robert", "Could someone unlock the back door from outside?", "robert_reardoor"],
  ["robert", "If a screen was cut from outside, which way would it bend?", "robert_screen"],
  ["robert", "How well do you know the house?", "robert_property"],
  ["robert", "How did you know Harold and Eleanor?", "robert_relationship"],
  ["robert", "What cars were parked outside when you left?", "robert_cars_night"],
  ["patricia", "Who inherits the estate?", "patricia_inheritance"],
  ["patricia", "Was your aunt worried about anything?", "patricia_concerns"],
  ["patricia", "Did Eleanor ask you for help with her bank statements?", "patricia_money"],
  ["patricia", "When did you leave that night?", "patricia_evening"],
  ["patricia", "Were you close to your aunt?", "patricia_relationship"],
  ["patricia", "What do you think of Daniel?", "patricia_daniel"],
  ["bennett", "What did your officers find at the crime scene?", "bennett_scene"],
  ["bennett", "What did the coroner say about the time of death?", "bennett_forensics"],
  ["bennett", "Can you search Mercer's trash for the jacket?", "bennett_jacket"],
  ["bennett", "Can you run the plates on a green Buick?", "bennett_sedan"],
  ["bennett", "Any news?", "bennett_again"],
  ["bennett", "How did the interviews with the guests go?", "bennett_interviews"],
  ["rosa", "Were you working Friday night?", "rosa_friday"],
  ["rosa", "Do you remember a man in a tan jacket?", "rosa_customer"],
  ["rosa", "Did he come back later?", "rosa_return"],
  ["rosa", "What's good on the menu?", null],
];

if (process.argv[1]?.endsWith("match-eval.ts")) {
  let ok = 0;
  for (const [cid, q, want] of CASES) {
    const cands = def.questions.filter((x) => x.characterId === cid);
    const got = bestMatch(q, cands);
    if (got === want) ok++;
    else {
      const top = rankCandidates(q, cands).slice(0, 3).map((r) => `${r.id}=${r.score.toFixed(2)}`).join(" ");
      console.log(`MISS ${cid}: "${q}" want ${want} got ${got}  [${top}]`);
    }
  }
  console.log(`${ok}/${CASES.length} matched`);
}
