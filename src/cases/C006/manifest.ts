/*
 * C006 evidence manifest: the design facts for every evidence item that the
 * engine's EvidenceDef does not carry. Designer-only; never sent to the
 * browser. scripts/check-case-C006.ts checks it against evidence/ and the
 * deductions, and scripts/c006-manifest.ts prints the readable manifest.
 *
 * via: how the item is reached (exactly one way):
 *   scene     a hotspot in a location
 *   document  a document read in a location (the case file, the 1996 box)
 *   dialogue  handed over in an interview (a knowledge fact or answer)
 *   delivery  arrives at the field office (Evelyn, Denise, the safe deposit box)
 *   event     a voicemail or development (reactive event)
 *   lab       a lab test the player has sent off
 * chapter: the first chapter in which it can be found.
 * critical: needed for a required deduction or the report's proof, with no
 *   equally good substitute; otherwise supporting.
 * prompt: the picture to paint (an evidence close-up, 1024x1024). Readable
 *   words in the picture are spelled out; everything else stays soft.
 */

export type Via = "scene" | "document" | "dialogue" | "delivery" | "event" | "lab";

export interface EvidenceMeta {
  id: string;
  group: "A" | "B" | "C" | "D" | "E";
  type: string;
  chapter: number;
  via: Via;
  /** In words: what must be true before it can be found. */
  unlock: string;
  critical: boolean;
  /** Provenance: who made it, when, and how it survived to 2018. */
  provenance: string;
  /** What it cannot prove. */
  limits?: string;
  prompt: string;
}

const m = (
  id: string,
  type: string,
  chapter: number,
  via: Via,
  unlock: string,
  critical: boolean,
  provenance: string,
  prompt: string,
  limits?: string,
): EvidenceMeta => ({ id, group: groupOf(id), type, chapter, via, unlock, critical, provenance, prompt, limits });

function groupOf(id: string): EvidenceMeta["group"] {
  const n = Number(id.slice(1));
  return n <= 20 ? "A" : n <= 40 ? "B" : n <= 60 ? "C" : n <= 80 ? "D" : "E";
}

export const MANIFEST: EvidenceMeta[] = [
  // Group A: Emily's disappearance
  m("E001", "Police report", 1, "document", "Ask Det. Mitchell for the 1996 file (police station).", true, "HCPD 1996 missing person case 96-1142, kept in the department's closed-case boxes.", "A yellowed 1996 police missing person form on a desk, typed in a typewriter font, a school photo of a young dark-haired woman clipped to the corner, under a desk lamp."),
  m("E002", "Photograph", 1, "event", "RE01: after the first interview with Sarah, she finds it and brings it to the field office.", true, "Lasko family snapshot, July 4, 1996, kept in a drugstore print envelope.", "A 1996 drugstore color snapshot, slightly faded: a smiling young woman with dark hair in the driver's seat of a blue 1987 Chevrolet Cavalier, seat pulled close to the wheel, door open, summer evening.", "Shows a habit, not that night."),
  m("E003", "Diary", 1, "scene", "In Emily's room at the Lasko house.", false, "Emily's own notebook, kept by her mother and then Sarah.", "A spiral notebook with a worn cardboard cover lying open on a bedspread, blue ballpoint handwriting, one page torn out at the binding.", "Her suspicions, not proof."),
  m("E004", "Calendar", 1, "scene", "On the wall of Emily's room at the Lasko house.", true, "Bank wall calendar left on Emily's wall since 1996.", "A 1996 bank wall calendar turned to August, river photograph above the grid, handwriting in some squares, one square written in hard pressed ink.", "\"W.\" is an initial."),
  m("E005", "Employment records", 1, "scene", "Back-room cabinet at Corso Photo and Frame.", true, "Vince Corso's own shop files.", "A punched paper time card and a small spiral darkroom log on a darkroom counter under a red safelight, trays and a copy stand behind."),
  m("E006", "Photographic prints", 1, "scene", "In the box of Emily's things at the Lasko house.", true, "Prints Emily made at Corso Photo, July 1996, kept in her box.", "Two black and white 8x10 photographic prints of a typed office memo, with a handwritten note at the bottom, half out of an orange photo studio envelope.", "Shows she had the memo; not that anyone knew."),
  m("E007", "Detective's notes", 1, "document", "The 1996 file at the police station.", false, "Det. Sgt. Granger's legal pad notes, photocopied into the case file.", "Photocopied yellow legal pad pages of a detective's slanting handwritten notes, clipped together in a manila folder."),
  m("E008", "Vehicle inventory", 1, "document", "The 1996 file at the police station.", true, "Brackett PD tow inventory sent to HCPD in 1996.", "A 1996 police tow and inventory form with a parking ticket stapled behind it, on a clipboard, a blue compact car in a tow lot blurred in the background.", "Proves the seat was moved, not by whom."),
  m("E009", "Statement", 1, "document", "The 1996 file at the police station.", true, "Typed statement signed by Wade Reeves, 1996.", "A typed 1996 witness statement form with a signature at the bottom, coffee ring on the corner."),
  m("E010", "Statement", 1, "document", "The 1996 file at the police station.", false, "Typed statement signed by Rebecca Sloan, 1996.", "A typed 1996 witness statement form with a handwritten note in the margin."),
  m("E011", "Statement", 1, "document", "The 1996 file at the police station.", true, "Typed statement signed by Andrew Pierce, 1996.", "A typed 1996 witness statement form, a small hand-drawn sketch of a road and gate in the margin.", "His time is wrong (see E083)."),
  m("E012", "Police report", 1, "document", "The case file at the field office.", false, "HCPD incident report 18-1012-07.", "A modern printed police incident report on a desk beside a laptop, a photo of a rusted industrial building paper-clipped to it."),
  m("E013", "Scene sketch and photographs", 1, "scene", "Inside Tool Crib 4.", true, "HCPD crime scene unit, October 13, 2018.", "Police scene photographs and a measured sketch of a small caged tool room pinned to steel mesh, evidence markers, work-light glare.", "No drag marks or blood survive."),
  m("E014", "Physical evidence", 1, "scene", "The outside of the Tool Crib 4 door, on the shop floor.", true, "Left in place by police, tagged.", "A rusted steel door hasp with a broken short weld bead, a heavy chain through the handle held by an old brass padlock rusted shut, wooden pallets leaning nearby, police evidence tags.", "The weld cannot be matched to one welder; no prints."),
  m("E015", "Personal effects", 1, "dialogue", "Ask Dr. Brooks about what was found with the remains.", true, "County ME personal effects, ME-18-0388.", "A worn women's denim jacket laid on a steel exam table beside a gold high school class ring with a red stone, a brass key on a paper tag, folded newspaper clipping and a few dollar bills, evidence bags.", "The ring shows intent to return it, not who she met."),
  m("E016", "Forensic report", 1, "dialogue", "Ask Dr. Brooks about the cause of death.", true, "County ME anthropology report, ME-18-0388.", "A forensic anthropology report on a clipboard beside a gloved hand and calipers, a lab light box glowing behind, no remains visible.", "Cannot say fall or blow, exact time, or who."),
  m("E017", "Forensic report", 1, "dialogue", "Ask Dr. Brooks how the remains were identified.", false, "Forensic odontology comparison, October 18, 2018.", "Two dental x-ray films side by side on a light box with a report form beneath."),
  m("E018", "Transport record", 5, "dialogue", "Chapter 5: ask Karen Novak about 1996 taxi or cab records.", true, "Brackett Yellow Cab trip sheet, archived with county taxi license renewals.", "A grease-stained 1996 taxi driver's daily trip sheet, handwritten rows of fares, in a cardboard archive box.", "No passenger name."),
  m("E019", "Witness account", 1, "dialogue", "Ask Sarah about the night Emily left.", true, "Written by Sarah Lasko for Blackwood, October 22, 2018.", "Two pages of handwritten lined paper on a kitchen table beside a mug of coffee, signed at the bottom."),
  m("E020", "Personal effect", 1, "scene", "In the box of Emily's things at the Lasko house.", true, "Emily's pager and her mother's index card, kept since 1996.", "A black 1990s pager rubber-banded to a 3x5 index card with neat handwriting, on top of a cardboard box of keepsakes.", "The number alone doesn't say who called."),
  // Group B: the 1996 accident
  m("E021", "Company report", 2, "scene", "Records cartons in the West End administration building.", true, "Hollow Creek Steel incident report 96-07, left in the abandoned building.", "A 1996 corporate incident report with a press release clipped to it, in a dusty records carton, abandoned office."),
  m("E022", "Union grievance", 2, "dialogue", "Ask Earl Hayes about Ron Lasko's complaint (union hall).", true, "USW Local 2177 grievance file.", "A 1996 union grievance form with handwritten complaint text and an initial stamp, in a green file folder on a union hall table."),
  m("E023", "Logbook page", 2, "scene", "The bound Gallery B log on the shelf in the former maintenance office.", true, "The plant's own log, never removed.", "A bound green ledger lying open to a page of neat handwritten dated entries, one entry in darker ink, an OSHA copy tab on the page edge."),
  m("E024", "Work order", 2, "scene", "Open work orders binder in the former maintenance office.", true, "Maintenance department binder, left behind.", "A carbon work order form with a priority crossed out and rewritten, a red tag stub stapled to it, in a three-ring binder."),
  m("E025", "Roster", 2, "scene", "Personnel cartons in the West End administration building.", false, "Plant roster and tool room sign-out sheet.", "A typed shift roster with a tool room sign-out sheet clipped behind it."),
  m("E026", "Office copies", 2, "delivery", "Evelyn Dorsey sends it once she trusts the investigator (her trust questions answered, Chapter 2).", true, "Evelyn's private copies, kept since 1997.", "A manila envelope with three office papers sliding out: a photocopied memo with a handwritten note, a carbon copy memo, a carbon letter, a short handwritten note on the envelope."),
  m("E027", "Federal record", 2, "scene", "OSHA boxes at the county regulatory archive.", false, "County archive copy of OSHA's 1996 file.", "A government inspection summary with a federal seal header on a gray archive table under fluorescent light."),
  m("E028", "Witness statements", 2, "scene", "Grievance file at the union hall (after E022).", true, "Union's own statements, June 1996.", "Handwritten statements on union letterhead, a pencil and an old cassette recorder beside them."),
  m("E029", "Photographs", 2, "scene", "Fire marshal file at the county regulatory archive.", true, "County fire marshal photos, June 14, 1996.", "A photographic contact sheet and enlargements of a dim industrial gas valve room: a large fan motor with a red danger tag wired to it, a wall monitor panel with a dark display."),
  m("E030", "Site observation", 2, "scene", "Climb down into Gallery B from the loading yard.", true, "The gallery itself, untouched since 2003.", "A narrow underground valve gallery under a steel furnace, rusted valves in a row, three wall sensor heads, a seized fan with a scrap of red tag, a brass memorial plate on the rail, flashlight beam."),
  m("E031", "Meeting minutes", 2, "scene", "GM's office carton in the West End administration building.", true, "Typed minutes recorded by Evelyn Dorsey.", "Typed 1996 meeting minutes on letterhead, initialed, in a manila folder labeled for the general manager's office."),
  m("E032", "Logbook page", 3, "scene", "Unit 14 at Creekside, after Glenn's murder: look under the tackle box's false floor.", true, "Torn from the Gallery B log by Glenn Sutter, June 17, 1996, and hidden.", "A single folded ledger page with handwritten entries and a small handwritten slip clipped to it, lying in the hidden compartment of a green metal tackle box."),
  m("E033", "Bulletin", 2, "scene", "Bottom drawer of the maintenance director's desk.", false, "Twenty unposted copies, banded, never removed.", "A banded stack of identical printed safety bulletins in an open steel desk drawer, a faded sticky note on top."),
  m("E034", "Personnel record", 2, "scene", "Human Resources carton in the West End administration building.", false, "HR file copy.", "A confidential executive bonus schedule page with a payroll PAID stamp, in an HR file folder."),
  m("E035", "Sale agreement", 2, "dialogue", "Ask Karen Novak about the 1996 sale of the East Mill (courthouse).", false, "Recorded with the deed, County Recorder.", "A thick recorded real estate agreement in a deed book binder, a clause flagged with a paper strip."),
  m("E036", "Borough correspondence", 2, "scene", "Riverside Works file at the municipal records office (after RE03).", true, "Borough code office file, 1996.", "Two letters in a borough file folder: a union letterhead letter with a RECEIVED stamp and a short typed borough reply."),
  m("E037", "Interview summary", 2, "scene", "OSHA interview binder at the county regulatory archive.", false, "OSHA 1996 interview summary.", "A typed question and answer interview summary in a government binder."),
  m("E038", "Borough memorandum", 2, "scene", "Riverside Works file at the municipal records office (after RE03).", true, "Borough code office memo, June 19, 1996.", "A short typed borough memorandum on letterhead, signed, in the same file folder."),
  m("E039", "Medical log", 2, "scene", "Treatment logbook in the abandoned medical station.", true, "Plant medical station log.", "A bound medical treatment logbook open to handwritten entries, an oxygen mask and an old stretcher in a dim first aid room."),
  m("E040", "Audio recording", 2, "dialogue", "Ask Jessica Kemp about her interviews with the union (newspaper office).", false, "Jessica Kemp's own cassette, 1998.", "A labeled audio cassette and a portable cassette player on a newsroom desk piled with clippings."),
  // Group C: Glenn's murder
  m("E041", "Voicemail", 3, "event", "RE05: arrives at the field office at the start of Chapter 3.", true, "Field office answering machine.", "A 2018 desk answering machine with a blinking message light on a cluttered office desk.", "His words, not proof of anything."),
  m("E042", "Calendar", 3, "scene", "On the refrigerator at the Sutter house, after the police allow entry (RE07 resolved).", true, "Glenn Sutter's own calendar.", "A hardware store wall calendar on a refrigerator door, handwritten notes in several squares, magnets."),
  m("E043", "Scene photographs", 3, "scene", "Police photo board at the door of Unit 14, after RE06.", false, "HCPD crime scene unit, October 26, 2018.", "A police photo board of a storage unit scene: shelving, dumped file boxes, an overturned green tackle box, evidence markers; no visible body."),
  m("E044", "Autopsy summary", 3, "dialogue", "Ask Dr. Brooks about Glenn's autopsy, after RE06.", false, "County ME case ME-18-0402.", "An autopsy summary report on a clipboard on a steel counter, gloves and a pen.", "Weapon not recovered."),
  m("E045", "Access log", 3, "scene", "Creekside office terminal (printed by the manager), after RE06.", true, "Creekside keypad system.", "A dot-matrix style printout of a gate access log with time-stamped rows, on a storage facility office counter.", "Records codes, not people."),
  m("E046", "Contract", 3, "scene", "Creekside office filing cabinet, after RE06.", true, "Creekside's contract file.", "A two-page security services contract with a signature, in an open filing cabinet drawer."),
  m("E047", "Phone records", 3, "dialogue", "Ask Det. Mitchell about Glenn's calls, after RE06.", true, "Records obtained by HCPD.", "A stack of printed phone call detail records with a few lines highlighted in yellow."),
  m("E048", "Witness statement", 3, "dialogue", "Ask Det. Mitchell whether anyone saw anything at Creekside, after RE06.", false, "HCPD witness statement.", "A typed police witness statement with a signature, on a detective's desk."),
  m("E049", "Property inventory", 3, "dialogue", "Ask Det. Mitchell what was taken, after RE06.", true, "HCPD property inventory with the victim's daughter.", "A police property inventory form with two columns, MISSING and LEFT BEHIND, a pen beside it."),
  m("E050", "Physical evidence", 3, "scene", "The floor inside Unit 14, after RE06.", false, "Left in place under a crime scene marker.", "A partial lug-soled boot print pressed into spilled motor oil on a concrete floor, a yellow evidence marker numbered 6 and a casting frame.", "Class evidence only until compared (E060)."),
  m("E051", "Letter", 3, "scene", "On the desk in the Sutter house den, after RE07 resolves.", false, "Glenn Sutter's own unsent letter.", "A handwritten letter on lined paper and a stamped, addressed, unsealed envelope on a wooden desk in a den."),
  m("E052", "Patrol log", 3, "scene", "Clipboard in the Trent Protective site trailer at the West End Gate, after RE06.", true, "Trent Protective's own site log.", "A clipboard with a handwritten security patrol log sheet, hanging on a nail in a construction site trailer, a radio charger below."),
  m("E053", "Company roster", 3, "scene", "Office wall at Trent Protective Services.", true, "Framed on Trent's office wall.", "A framed company vehicle and equipment roster beside a state security license certificate on a paneled office wall."),
  m("E054", "Interview summary", 3, "dialogue", "Ask Det. Mitchell whether Trent has been interviewed, after D23 or RE06 plus a visit to Trent.", true, "HCPD interview summary.", "A typed police interview summary on a desk, a detective's notes in the margin."),
  m("E055", "Work order", 3, "scene", "Work order rack at Reeves Auto Repair, after RE06.", false, "Reeves Auto Repair's own work orders.", "A garage work order slip on a metal rack in an auto repair shop, PAID CASH stamp.", "Shows the truck was cleaned, not what was cleaned off it."),
  m("E056", "Ledger", 3, "scene", "Desk at Trent Protective Services.", true, "Trent's invoice book.", "A green clothbound ledger lying open on an office desk, handwritten rows of invoices."),
  m("E057", "Phone records", 5, "dialogue", "Chapter 5: ask Det. Mitchell for Stroud's phone records (court order follows Len's statement).", true, "Court-ordered carrier records.", "Printed mobile phone call records with three lines highlighted, a court order cover sheet."),
  m("E058", "Bank record", 5, "dialogue", "Chapter 5: ask Det. Mitchell about payments to Trent (court order).", true, "Mon Valley Savings, under court order.", "A bank wire transfer confirmation printout with a bank logo header."),
  m("E059", "Police report", 3, "dialogue", "Ask Det. Mitchell about Glenn's death, after RE06.", false, "HCPD incident report 18-1026-02.", "A modern police incident report on a desk under a lamp."),
  m("E060", "Lab report", 5, "lab", "Ask Det. Mitchell to compare the Unit 14 print with Trent's boots, once he is arrested (after RE15).", true, "State police footwear examination.", "A state police lab report beside a plaster cast of a boot print and a black tactical boot in an evidence bag.", "Cannot exclude every other boot of the model."),
  // Group D: Len's abduction
  m("E061", "Voicemail", 4, "event", "RE10: arrives at the field office early in Chapter 4.", true, "Field office answering machine.", "The same desk answering machine, message light blinking, a rainy window behind."),
  m("E062", "Police report", 4, "dialogue", "Ask Det. Mitchell about Len, after RE11.", false, "HCPD missing person report 18-1029-01.", "A modern missing person report with a driver's license photo of a gray-haired man in glasses."),
  m("E063", "Scene observation", 4, "scene", "Front hall and kitchen of the Greer house, after RE12.", true, "Observed and photographed with Mitchell's permission.", "A suburban front hall: eyeglasses on the floor with one lens out, a rumpled runner rug, a coat and cap on a rack; a cold untouched dinner plate visible in the kitchen beyond."),
  m("E064", "Medication", 4, "scene", "Kitchen counter at the Greer house, after RE12.", true, "Len's own pill organizer.", "A plastic weekly pill organizer with AM and PM rows, two compartments still full, three orange prescription bottles beside it on a kitchen counter."),
  m("E065", "Video stills", 4, "scene", "Next door at the Kovach house (Greer house hotspot), after RE12.", true, "Neighbor's video doorbell, printed for Blackwood.", "Four black and white night-vision video stills printed on paper: a large pickup truck with a roof light bar in a driveway, dark figures, a partly readable license plate.", "Faces not visible; plate partial."),
  m("E066", "Letter", 4, "scene", "Dining room table at the Greer house, after RE12.", true, "Hand-delivered law firm letter with Len's pencil note.", "A law firm letter on heavy paper with a penciled note across the bottom, on a dining table, an empty coffee can on the shelf behind."),
  m("E067", "Phone records", 4, "dialogue", "Ask Det. Mitchell for Len's calls, after RE11.", false, "Records obtained by HCPD.", "Printed home phone call records with a few lines highlighted."),
  m("E068", "Plate reader data", 4, "dialogue", "Ask Det. Mitchell to run the plate, once the player has E065 and has learned Trent's truck (E053).", true, "HCPD license plate reader system.", "A printout of license plate reader hits with small grainy camera images of a black pickup on a rural highway at night."),
  m("E069", "Corporate filing", 4, "dialogue", "Ask Karen Novak what property Trent or his company owns, after D27.", true, "Pennsylvania Department of State filings.", "Printed state corporation records for an LLC on a courthouse counter, a stamp and a pen."),
  m("E070", "Property record", 4, "dialogue", "Given by Karen Novak with E069.", true, "County assessment office.", "A county tax parcel record and a tax map with a dirt road highlighted, on a records counter."),
  m("E071", "Scene observation", 4, "scene", "At the gate on Laurel Hollow Road (unlocked by D28).", false, "Observed at the gate.", "A rusted pipe gate on a muddy forest road at night, an old chain with a bright new brass padlock, fresh tire tracks through puddles, flashlight beam.", "Tread narrows the vehicle type only."),
  m("E072", "Scene observation", 4, "scene", "The cellar at the camp, after RE15.", true, "Observed after the recovery.", "A stone-walled cellar under a cabin: a folding cot with a sleeping bag, cut black zip ties on the dirt floor, a bucket, water bottles, an eye bolt in the wall, scratched letters on a beam, a white handkerchief."),
  m("E073", "Personal belongings", 4, "scene", "Coffee can on the shelf in the cabin, after RE15.", false, "Found by the player with police.", "An open coffee can on a shelf above a wood stove holding a black leather wallet, a steel wristwatch and a small brass key."),
  m("E074", "Search return", 4, "dialogue", "Ask Det. Mitchell what police found at the camp, after RE15.", false, "Court search warrant return.", "A court search warrant return form listing seized items, beside a Sheetz receipt in an evidence bag."),
  m("E075", "Police report", 4, "dialogue", "Ask Det. Mitchell about the recovery, after RE15.", true, "HCPD supplementary report.", "A typed police supplementary report on a desk, morning light."),
  m("E076", "Medical assessment", 4, "dialogue", "Ask Det. Mitchell how Len is, after RE15.", false, "Mon Valley Hospital physician summary.", "A hospital physician's summary on letterhead on a clipboard at the foot of a hospital bed."),
  m("E077", "Statement", 4, "dialogue", "Interview Len at the hospital after RE15 (RE16).", true, "Signed statement, HCPD.", "A multi-page signed police statement on a hospital tray table beside a water cup.", "A participant's word; corroborate with E078, E093, E094."),
  m("E078", "Routing slip", 5, "delivery", "RE18: the safe deposit box contents arrive after Len's statement.", true, "Len's private copy, kept in a safe deposit box since 1996.", "A photocopied union letter with a small handwritten borough routing slip stapled to it, on a bank safe deposit box tray."),
  m("E079", "Interview summary", 5, "dialogue", "Chapter 5: ask Det. Mitchell what Trent said after his arrest.", false, "HCPD custodial interview summary.", "A typed custodial interview summary with a rights waiver form beside it."),
  m("E080", "Phone extraction", 5, "dialogue", "Chapter 5: ask Det. Mitchell about anything found in Trent's truck.", true, "State police extraction of a seized prepaid phone.", "A cheap gray prepaid flip phone in an evidence bag on top of a printed call log report."),
  // Group E: final connections
  m("E081", "Letters", 5, "delivery", "Arrives after Rebecca's revised statement (RE04) and a question to her about Denise.", true, "Scans emailed by Denise Hollins; originals with her lawyer.", "Printed scans of three handwritten letters signed W., under a printed email, on the field office desk."),
  m("E082", "Ledger", 5, "scene", "Old weigh office in the rail service building (Chapter 5).", true, "Mon Valley Scrap's 1996 ledger, left when the yard moved.", "A large bound purchase ledger open on a dusty weigh office counter in an abandoned rail building, a big platform scale behind.", "Proves sales, not where the copper came from."),
  m("E083", "Time card", 5, "scene", "Shoebox in Andrew's basement, once asked about the exact time.", true, "Andrew's mother's keepsakes.", "A 1996 punched time card on top of a shoebox of old pay envelopes in a basement."),
  m("E084", "Invoice", 5, "scene", "Invoice books in the loft at Reeves Auto Repair (Chapter 5).", true, "Gus Reeves's bound invoice books.", "A garage invoice book open to a 1995 page with a snapshot pinned to it of a dark blue small pickup with a black ladder rack."),
  m("E085", "Directory", 5, "scene", "Reference shelf at the newspaper office, once the player holds E020 (Chapter 5).", true, "The Record's reference copy.", "A thick 1996 telephone directory open to the business listings, a finger marking one line."),
  m("E086", "Statement", 5, "dialogue", "RE04: Rebecca writes it once shown the pager card and the motel listing.", true, "Signed statement for HCPD and Blackwood.", "Two handwritten pages signed at the bottom, on a kitchen counter, a tissue box beside them."),
  m("E087", "Interview summary", 5, "dialogue", "RE19: ask Det. Mitchell after Wade is re-interviewed (Chapter 5).", true, "HCPD interview summary.", "A typed police interview summary with a detective's handwritten note at the bottom."),
  m("E088", "Guard log", 5, "scene", "Bound 1996 gate logs in the old guardhouse at the West End Gate (Chapter 5).", true, "Plant security logs left in the guardhouse.", "A bound security gate log open to a page of hourly handwritten entries with supervisor signatures, in a small concrete guardhouse."),
  m("E089", "Expense report", 5, "delivery", "Evelyn sends it once asked where Stroud was the night Emily disappeared (Chapter 5).", true, "Evelyn Dorsey's files.", "A carbon expense report and a hotel folio photocopy with a handwritten note clipped on."),
  m("E090", "Grant letter", 2, "scene", "Framed in the Stroud Riverfront reception area.", false, "On display at Stroud's office.", "A framed state grant award letter on a reception wall beside an architect's rendering of riverfront apartments."),
  m("E091", "Financial summary", 5, "dialogue", "Chapter 5: ask Det. Mitchell for the payment history (court orders).", true, "HCPD summary of court-ordered records.", "A detective's typed financial summary table with bank statements fanned beneath it."),
  m("E092", "Handwritten statement", 5, "scene", "Inside the Bible on Glenn's nightstand, when police release the house (Chapter 5).", true, "Glenn Sutter's own hand, October 24, 2018.", "A sealed envelope marked in handwriting tucked in an open family Bible on a bedside table, reading lamp."),
  m("E093", "Deed", 4, "dialogue", "Ask Karen Novak about property connected to Len Greer.", false, "County Recorder of Deeds.", "A recorded deed page in a large deed book, a one dollar consideration line flagged."),
  m("E094", "Bank passbook", 5, "delivery", "RE18: with the safe deposit box contents.", true, "Len's safe deposit box.", "A small bank savings passbook open to a deposit line with a check stub stapled in."),
  m("E095", "Parts ledger", 6, "scene", "1996 ledgers in the loft at Reeves Auto Repair (Chapter 6).", true, "Gus Reeves's shop-use ledger.", "A bound garage parts ledger open to a handwritten August 1996 page with a margin note, a coil of chain and an old portable welder in the dim loft behind.", "Shows what was taken, not where it was used."),
  m("E096", "Scene observation", 6, "scene", "The workbench during the final reconstruction (RE20).", true, "Observed and swabbed during the police reconstruction.", "A heavy steel workbench with an angle-iron front edge under harsh police work lights, a vise, copper strippings in the dust beneath, an evidence swab tag.", "Blood too degraded for DNA."),
  m("E097", "Physical evidence", 6, "scene", "The loft above the shop floor during the final reconstruction (RE20).", true, "Left in the loft since 1996.", "Bundles of stripped copper wire tied with wire and hung with paper parts tags, stacked behind plywood in a dusty industrial loft, rusted wire strippers beside them."),
  m("E098", "Handwritten note", 5, "delivery", "RE18: with the safe deposit box contents.", true, "Len's safe deposit box.", "A small folded sheet of 1990s company letterhead with a short fountain pen note, on a bank box tray."),
  m("E099", "Lab report", 5, "lab", "Ask Det. Mitchell to have the note's handwriting compared, once the player holds E098.", false, "State police questioned documents unit.", "A questioned documents lab report beside handwriting samples under a magnifier."),
  m("E100", "Expert opinion", 6, "dialogue", "Ask Dr. Brooks about the workbench, once the player holds E096.", true, "County ME supplementary opinion.", "A short typed expert opinion letter on medical examiner letterhead beside a plaster cast of a straight metal edge.", "Cannot say fall, push or blow."),
];

/** Items that do their work outside the board: they trigger an event, prove a report point, or establish a contradiction. */
export const OTHER_ROLES: Record<string, string> = {
  E010: "Contradiction: Rebecca's 1996 account against E086, and one of the three items behind RE04.",
  E020: "RE04 trigger: with E085 it shows Emily's last call went to the Valley View Motor Inn, which confronts Rebecca.",
  E044: "Report: proves how Glenn was killed (blows from a bar, defensive injuries).",
  E085: "RE04 trigger: identifies the pager number as the motel.",
};
