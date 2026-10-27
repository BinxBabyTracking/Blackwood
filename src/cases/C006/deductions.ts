import type { DeductionDef } from "@/game/engine/types";

/*
 * C006's 35 deductions in seven chains. Each is confirmed by any one of its
 * board connections (evidence ids, or character ids for D35). Every pair is
 * made of evidence that is available in or before the deduction's chapter,
 * and no deduction leads to evidence it needs itself (checked by
 * scripts/check-case-C006.ts).
 *
 * Texts say what the evidence shows. The final chain avoids names: the
 * report, not the board, is where the player names people.
 */

export interface DeductionMeta {
  chain: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  /** The chapter whose work it belongs to. */
  chapter: number;
  /** Needed to finish its chapter or the case. */
  required: boolean;
  /** What it unlocks, for designers (wired in Phases 7 and 8). */
  unlocks: string;
}

const d = (def: DeductionDef, meta: DeductionMeta) => ({ def, meta });

export const DEDUCTIONS = [
  // Chain A: Emily's final movements
  d(
    { id: "D01", code: "D01", title: "Last Seen Leaving Home", text: "Emily left 418 Fourth Street at about 8:30 PM on Saturday, August 17, 1996, alone, in her own car, with her overnight bag, saying she would be at Rebecca's. That is the last time her family saw her.", connections: [["E019", "E001"], ["E019", "E007"]] },
    { chain: "A", chapter: 1, required: true, unlocks: "1996 timeline cards: 8:30 PM departure" },
  ),
  d(
    { id: "D02", code: "D02", title: "A Meeting at the East Gate", text: "Emily planned to meet \"W.\" at nine o'clock at the East Gate to end something. She went with a man's class ring, initials W.A.R., in her buttoned pocket, as if to give it back.", connections: [["E004", "E015"], ["E004", "E003"]] },
    { chain: "A", chapter: 1, required: true, unlocks: "Question for Sarah about W.; re-interview grant" },
  ),
  d(
    { id: "D03", code: "D03", title: "Trouble with Wade", text: "Emily and Wade Reeves were fighting that summer. The night before she vanished they argued in public and she threw something at him. She went to the mill carrying his class ring.", connections: [["E003", "E009"], ["E015", "E011"]] },
    { chain: "A", chapter: 1, required: true, unlocks: "Wade's Chapter 1 questions about the argument" },
  ),
  d(
    { id: "D04", code: "D04", title: "She Reached the Mill", text: "A witness saw Emily walking from her car to the East Gate on Saturday night, with a dark pickup parked inside. Twenty-two years later she was found inside the East Mill. She got there that night, and never left.", connections: [["E011", "E013"], ["E011", "E012"]] },
    { chain: "A", chapter: 1, required: true, unlocks: "East Mill shop floor return-visit state" },
  ),
  d(
    { id: "D05", code: "D05", title: "Not a Runaway", text: "Emily drove with the seat pulled all the way forward. Her car was found at the Brackett depot with the seat all the way back and the mirror set for someone much taller. Her overnight bag was gone, and her sister says she never took a bus in her life. Someone else drove her car to Brackett.", connections: [["E008", "E002"], ["E008", "E019"]] },
    { chain: "A", chapter: 1, required: true, unlocks: "Chapter 1 objective; Granger's runaway theory marked disproved" },
  ),
  // Chain B: Emily's death
  d(
    { id: "D06", code: "D06", title: "One Fatal Injury", text: "Emily died of a heavy impact to the right side of the head against, or by, a narrow straight edge, at or near the time of death. No other injury was found. The bones cannot say whether she fell or was struck.", connections: [["E016", "E013"], ["E016", "E017"]] },
    { chain: "B", chapter: 1, required: true, unlocks: "Question for Brooks about edges" },
  ),
  d(
    { id: "D07", code: "D07", title: "Hidden and Sealed", text: "Her body was laid in Tool Crib 4, the door chained, padlocked, welded and blocked with pallets. Someone hid her deliberately and came back to make sure the door stayed shut.", connections: [["E014", "E013"], ["E014", "E012"]] },
    { chain: "B", chapter: 1, required: true, unlocks: "Chapter 1 objective" },
  ),
  d(
    { id: "D08", code: "D08", title: "Someone Who Worked That Building", text: "Someone was stripping copper in the East Mill Maintenance Building all summer and selling it every week until August 10, 1996. A coil of stripped copper was left in the crib with Emily, and her friend says he was \"always over at the old shop.\" Whoever hid her knew that building and had a reason to be in it at night.", connections: [["E082", "E013"], ["E082", "E086"]], requires: { chapter: 5 } },
    { chain: "B", chapter: 5, required: true, unlocks: "Wade's copper questions; re-interview grant" },
  ),
  d(
    { id: "D09", code: "D09", title: "A Story That Moved", text: "In 1996 Wade said he last saw Emily on Friday. In 2018 he says Saturday at four, at the garage, when she gave back his ring. She was at the studio until six, and the ring was still in her pocket when she was found.", connections: [["E087", "E009"], ["E087", "E005"], ["E087", "E015"]] },
    { chain: "B", chapter: 5, required: true, unlocks: "Wade's Chapter 6 demeanor; RE19 follow-ups" },
  ),
  d(
    { id: "D10", code: "D10", title: "The Truck Inside the Gate", text: "At 7:40 Emily told a friend she was meeting Wade at nine at the East Gate. Shortly before nine, by his own time card, a witness saw her there, and a dark pickup with a ladder rack parked inside the gate. Wade drove a dark blue Ranger with a black ladder rack.", connections: [["E084", "E011"], ["E086", "E011"], ["E083", "E086"]] },
    { chain: "B", chapter: 5, required: true, unlocks: "1996 timeline cards: the pickup" },
  ),
  // Chain C: the industrial disaster
  d(
    { id: "D11", code: "D11", title: "Warnings on Record", text: "Months before June 14, the company had written warnings that Gallery B's gas monitors and exhaust fan were failing: a union grievance, an urgent work order, an earlier gassing, a bulletin it never posted.", connections: [["E022", "E024"], ["E022", "E039"], ["E024", "E033"]] },
    { chain: "C", chapter: 2, required: true, unlocks: "Questions for Ray and Earl" },
  ),
  d(
    { id: "D12", code: "D12", title: "A Repair Put Off", text: "The maintenance director asked for an immediate $186,000 repair. The general manager deferred it to the third-quarter outage because no capital could be spent outside the sale schedule.", connections: [["E026", "E031"], ["E006", "E031"], ["E033", "E031"]] },
    { chain: "C", chapter: 2, required: true, unlocks: "Stroud's Chapter 2 questions about the memo" },
  ),
  d(
    { id: "D13", code: "D13", title: "What Happened in Gallery B", text: "The crew went down to repack valve 4 with no portable monitor available, the fan tagged out and the fixed monitors dead. The valve stayed locked out. Gas filled the gallery and nothing warned them.", connections: [["E028", "E039"], ["E030", "E028"], ["E025", "E028"]] },
    { chain: "C", chapter: 2, required: true, unlocks: "1996 timeline cards: the night of June 13 to 14" },
  ),
  d(
    { id: "D14", code: "D14", title: "The Log Was Rewritten", text: "The log given to OSHA says the monitors tested OK and the fan ran on June 10. The fan had been tagged out since June 7 and the monitors were dead. Page 41 was written after the fact.", connections: [["E029", "E023"], ["E030", "E023"], ["E037", "E029"]] },
    { chain: "C", chapter: 2, required: true, unlocks: "The log comparison (original and altered page 41) once E032 is found" },
  ),
  d(
    { id: "D15", code: "D15", title: "Blaming the Crew", text: "The company told the public the men bypassed a lockout. The lockout was on, by the fire marshal's own photograph and a furnace operator who saw it. The \"employee error\" story was false.", connections: [["E021", "E028"], ["E021", "E029"]] },
    { chain: "C", chapter: 2, required: false, unlocks: "Supporting; strengthens the report's cover-up point" },
  ),
  // Chain D: the financial and regulatory conspiracy
  d(
    { id: "D16", code: "D16", title: "The Manager Knew", text: "The general manager had the union's complaint on his desk in May, chaired the meeting that froze the repair, and wrote \"defer\" on the request. He knew the danger before the men died.", connections: [["E026", "E022"], ["E031", "E022"], ["E040", "E022"]] },
    { chain: "D", chapter: 2, required: true, unlocks: "Chapter 2 objective" },
  ),
  d(
    { id: "D17", code: "D17", title: "The Borough Looked Away", text: "The borough received the union's request for an OSHA referral and made none. After the deaths its code officer certified an inspection of a gallery OSHA had sealed. The borough's paper helped close the case.", connections: [["E036", "E038"], ["E038", "E027"]] },
    { chain: "D", chapter: 2, required: true, unlocks: "Len becomes known; Chapter 2 objective" },
  ),
  d(
    { id: "D18", code: "D18", title: "Paid for It", text: "That summer the borough's code officer received $8,000 as \"consulting\" from the parcel's buyer and a $28,000 lot from the company for a dollar.", connections: [["E093", "E094"], ["E094", "E036"], ["E093", "E077"]] },
    { chain: "D", chapter: 5, required: false, unlocks: "Supporting; the report's cover-up point" },
  ),
  d(
    { id: "D19", code: "D19", title: "Who Gave the Orders", text: "The orders came from one office: defer the repair, hold the bulletin, make the records \"consistent,\" file the complaint without referral, reward the borough's help.", connections: [["E078", "E026"], ["E098", "E099"], ["E092", "E026"]] },
    { chain: "D", chapter: 5, required: true, unlocks: "Stroud's Chapter 5 demeanor; RE17 follow-ups" },
  ),
  d(
    { id: "D20", code: "D20", title: "A Sale Worth Hiding For", text: "In 1996 a citation over $25,000 would have let the buyer walk away from a $4.1 million sale and halved the general manager's $240,000 bonus. In 2018 the same land's $6.5 million grant stops the moment anything there needs investigating. The truth about Gallery B has had a price both times.", connections: [["E034", "E035"], ["E031", "E035"], ["E090", "E035"]] },
    { chain: "D", chapter: 2, required: false, unlocks: "Supporting; motive for the 1996 cover-up" },
  ),
  // Chain E: Glenn's murder
  d(
    { id: "D21", code: "D21", title: "Glenn Meant to Talk", text: "Glenn Sutter called Blackwood, wrote to Sarah Lasko, planned to fetch \"page 41\" Thursday night and bring \"all of it\" Friday. Wednesday night he told someone he shouldn't have.", connections: [["E041", "E042"], ["E051", "E041"], ["E042", "E047"]] },
    { chain: "E", chapter: 3, required: true, unlocks: "Chapter 3 objective; Stroud's Chapter 3 questions" },
  ),
  d(
    { id: "D22", code: "D22", title: "Not a Robbery", text: "The killer left cash, a ring, a car and new tools, and took a box of old work papers. They were after what Glenn kept, and missed the one page that mattered.", connections: [["E049", "E043"], ["E049", "E032"], ["E059", "E049"]] },
    { chain: "E", chapter: 3, required: true, unlocks: "Chapter 3 objective" },
  ),
  d(
    { id: "D23", code: "D23", title: "Out That Night", text: "Thirteen minutes after Glenn entered the storage gate, the override code held by Trent Protective opened it. A black pickup with a roof light bar parked by his row. Trent's own log has him off site from 8:20 to 9:50, while he told police he was home all evening. A size 12 duty boot like his stepped in the oil, and his truck was shampooed at 7:30 the next morning.", connections: [["E045", "E046"], ["E052", "E054"], ["E048", "E053"], ["E050", "E053"], ["E055", "E054"]] },
    { chain: "E", chapter: 3, required: true, unlocks: "Trent's Chapter 3 questions; RE08 and RE09" },
  ),
  d(
    { id: "D24", code: "D24", title: "Whose Man", text: "Trent Protective guards the Riverworks site for Stroud Riverfront Development and books irregular \"special\" payments from it with no invoice number, the latest the morning after Glenn died.", connections: [["E056", "E052"], ["E056", "E053"]] },
    { chain: "E", chapter: 3, required: true, unlocks: "Stroud's Chapter 4 questions about Trent" },
  ),
  d(
    { id: "D25", code: "D25", title: "The Hand and the Order", text: "Twenty-one minutes after Glenn hung up from telling Stroud he would talk, Stroud called a prepaid phone that was later found in Trent's truck. That phone was on the tower serving the storage facility's road during the killing, called Stroud minutes after, and $12,500 went out the next morning.", connections: [["E080", "E057"], ["E058", "E047"]], requires: { all: [{ deduction: "D23" }, { deduction: "D24" }] } },
    { chain: "E", chapter: 5, required: true, unlocks: "Report option for who ordered Glenn's murder" },
  ),
  // Chain F: Len's abduction
  d(
    { id: "D26", code: "D26", title: "He Didn't Leave on His Own", text: "Len let someone in, lost his glasses in a struggle in the hall, and went without his coat, his shoes or his heart pills. He did not run.", connections: [["E064", "E063"], ["E063", "E062"]] },
    { chain: "F", chapter: 4, required: true, unlocks: "Chapter 4 objective" },
  ),
  d(
    { id: "D27", code: "D27", title: "The Truck in the Driveway", text: "A black pickup with a roof light bar, plate starting ZK and ending 71_4, took a second person from Len's house at 9:44 PM and was read heading south on Route 88 within the half hour. Trent's Unit 1 is ZKL-7184.", connections: [["E065", "E053"], ["E068", "E065"]] },
    { chain: "F", chapter: 4, required: true, unlocks: "Karen's property search (RE13)" },
  ),
  d(
    { id: "D28", code: "D28", title: "A Camp in the Ridges", text: "Trent's company quietly owns a cabin with a cellar at the end of Laurel Hollow Road, more than five miles past the last camera that saw his truck that night.", connections: [["E069", "E070"], ["E070", "E068"]] },
    { chain: "F", chapter: 4, required: true, unlocks: "Laurel Hollow Road on the map; RE14" },
  ),
  d(
    { id: "D29", code: "D29", title: "Alive", text: "Len was held for about 32 hours, tied in a cellar, without his medication, and survived to name who held him.", connections: [["E075", "E077"], ["E076", "E077"], ["E072", "E075"]] },
    { chain: "F", chapter: 4, required: true, unlocks: "Chapter 4 objective" },
  ),
  d(
    { id: "D30", code: "D30", title: "Taken for His Papers", text: "Len was taken the day he told Stroud he would not go down for him, and questioned about where his copies were. His box key was found at the camp. It was about the 1996 papers.", connections: [["E077", "E066"], ["E073", "E066"], ["E075", "E066"], ["E061", "E066"], ["E067", "E066"]] },
    { chain: "F", chapter: 4, required: true, unlocks: "Safe deposit box (RE18)" },
  ),
  // Chain G: the final reconstruction
  d(
    { id: "D31", code: "D31", title: "Two Separate Crimes", text: "The night Emily disappeared, the plant's security man was logged at the far gate all night and the general manager was in Pittsburgh. Emily's copies of the memo were never taken. The cover-up does not explain her death.", connections: [["E088", "E089"], ["E077", "E006"]], requires: { chapter: 5 } },
    { chain: "G", chapter: 5, required: true, unlocks: "Chapter 5 objective; Sarah's Chapter 5 conversation" },
  ),
  d(
    { id: "D32", code: "D32", title: "The Night of August 17", text: "The person Emily went to meet at nine had promised in writing to \"fix it,\" had the building, the truck and the reason, took a chain, a padlock and a welder the next day, and has changed his story. A tall young man paid cash for a cab from the depot where her car was left back to half a mile from the gate. Her death was personal.", connections: [["E081", "E087"], ["E095", "E014"], ["E096", "E100"], ["E018", "E008"], ["E097", "E082"]], requires: { all: [{ chapter: 6 }, { deduction: "D08" }, { deduction: "D09" }, { deduction: "D10" }] } },
    { chain: "G", chapter: 6, required: true, unlocks: "Report available (with D33 to D34)" },
  ),
  d(
    { id: "D33", code: "D33", title: "One Office, Twenty-Two Years", text: "The man who deferred the repair and ordered the records fixed in 1996 is the man whose calls and money surround Glenn's death and Len's abduction in 2018.", connections: [["E098", "E058"], ["E092", "E057"]], requires: { deduction: "D19" } },
    { chain: "G", chapter: 5, required: true, unlocks: "Chapter 5 objective" },
  ),
  d(
    { id: "D34", code: "D34", title: "The Same Hands", text: "The boot in the oil, the code at the gate, the truck in the driveway, the camp and the prepaid phone all lead to one man, acting for another.", connections: [["E060", "E079"], ["E080", "E074"], ["E091", "E056"], ["E071", "E074"]], requires: { all: [{ deduction: "D25" }, { deduction: "D28" }] } },
    { chain: "G", chapter: 5, required: true, unlocks: "Chapter 5 objective" },
  ),
  d(
    { id: "D35", code: "D35", title: "The Whole Picture", text: "Two stories share a mill and a summer. One is a cover-up that killed three men in 1996 and killed again in 2018 to stay buried. The other is a young woman who went to end a relationship and never came home. Each has its own guilty.", connections: [["wade", "trent"], ["wade", "stroud"]], requires: { all: [{ deduction: "D31" }, { deduction: "D32" }, { deduction: "D33" }, { deduction: "D34" }] } },
    { chain: "G", chapter: 6, required: true, unlocks: "Final report" },
  ),
];

export const deductions: DeductionDef[] = DEDUCTIONS.map((x) => x.def);
export const deductionMeta: Record<string, DeductionMeta> = Object.fromEntries(DEDUCTIONS.map((x) => [x.def.id, x.meta]));
