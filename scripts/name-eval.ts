/* Word-layer checks for name screening: npx tsx --conditions=react-server scripts/name-eval.ts */
import { wordCheck } from "../src/lib/moderation";

const BLOCK = [
  "fuck", "F U C K", "f.u.c.k", "fuuuuck", "phuck", "fuq", "Fvck", "fück", "fuk you", "sh1t", "5hit", "shyt", "$hit", "biatch", "b1tch", "Bitch Please", "kunt", "cunt", "c u n t",
  "n1gga", "nigger", "niqqa", "faggot", "f4g", "retard", "whore", "slut", "pu55y", "pussy cat", "penis", "dildo", "porn star", "boobs", "titties", "asshole", "a$$hole", "dumbass", "ass", "A55",
  "dick", "d1ck", "big dick", "dickhead", "cock", "c0ck", "kok", "cum", "rapist", "rape", "pedo", "nazi", "n4zi", "Hitler", "KKK", "k k k", "isis", "chink", "kike", "spic", "tranny", "dyke",
  "Mike Hunt", "Mike Huntt", "Ben Dover", "Hugh Jass", "Phil McCracken", "Seymour Butz", "Mike Oxlong", "Heywood Jablome", "Dixie Normous", "Amanda Hugginkiss", "Sexy Detective", "sexxx", "milf hunter",
  "The Shit Show", "Dick Dickens", "Holy Shitballs", "kys", "wtf", "STFU", "Killer Bitches", "Big Cock Energy", "thot", "skank", "twat", "wanker", "bastard", "bollocks", "piss", "turd", "prick", "fuk_u", "FuCkEr", "sh!t", "b!tch", "a s s", "Assface", "c0cks", "p3n1s", "ni66a", "fag0t", "r3tard", "w h o r e", "Ass Hat", "Phat Phuk", "Bich", "shiiiit", "Fu Manchu Fu", "cum dumpster", "Jizz Wizard", "Cock Robin", "suck my", "kill yourself", "Biggus Dickus",
];
const ALLOW = [
  "Sam Calloway", "Ian", "Chelsea", "Charles Dickens", "Hancock", "John Hancock", "Sussex", "Essex", "Scunthorpe", "Cassidy", "Nigel", "Nigella", "Night Shift", "The Night Shift", "Knights",
  "Titus", "Titan", "Assassins", "Assistant Detective", "Analysis Team", "Grape Escape", "Therapist", "Draper", "Cummings", "Benedict Cumberbatch", "Kumar", "Wang", "Dong Nguyen", "Connie", "Dixon", "Cocktail Hour",
  "Shiitake", "Matilda", "Janus", "Torpedo", "Peacock", "Hitchcock", "Sexton", "Spike", "Spicer", "Japan", "Montenegro", "Ana Lopez", "Hannah Lee", "Dinah Sinclair", "Killian", "Kilometer Club", "Horizon",
  "Mrs. Marple", "The Usual Suspects", "Bundle of Bushes", "Blackwood Irregulars", "Sherlock", "Agatha", "Poirot", "Columbo", "Holmes & Watson", "Team 7", "Bob", "Fakir", "Faculty Club", "Custard", "Jasper", "Kiki", "Massive Attack", "Classic Sleuths", "Grassy Knoll", "Bass", "Hassan", "Cassandra", "Lassie", "Tess", "Assam Tea", "Glasses", "Passport", "Ambassadors", "Butte Montana", "Titanic Crew", "Sextant", "Nikki", "Nika", "Analise", "Hugh Grant", "Ben Stiller", "Mike Hunter", "Phil Collins", "Seymour", "Dixie",
];
let bad = 0;
for (const n of BLOCK) if (!wordCheck(n)) { console.log("MISSED   ", n); bad++; }
for (const n of ALLOW) if (wordCheck(n)) { console.log("BLOCKED  ", n); bad++; }
console.log(`${BLOCK.length + ALLOW.length - bad}/${BLOCK.length + ALLOW.length} as expected`);
