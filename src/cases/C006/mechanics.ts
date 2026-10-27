import "server-only";
import type { ComparisonDef, SequenceDef } from "@/game/engine/types";

/*
 * C006's two timelines and its document comparison. Server-only: where a card
 * belongs and which observation is right never reach the browser.
 *
 * The timelines are the brief's two tracks, 1996 and 2018, on the office
 * wall. Cards appear as evidence is found; the player lays them in time
 * slots, earliest first within a slot, and tests. Testing shows only the
 * contradictions the cards as placed now show, never where a card goes. The
 * board is where events are connected across decades.
 *
 * The comparison is page 41 of the Gallery B log as given to OSHA against the
 * page Glenn Sutter kept.
 */


export const sequences: SequenceDef[] = [
  {
    id: "t1996",
    title: "Timeline: 1996",
    intro:
      "The year it happened. Lay each card in the space where it belongs, earliest first within a space. Cards marked as claims are a person's own account: put a claim where its speaker says it belongs. Then test. The wall will not tell you where anything goes; it only shows you accounts that cannot stand beside what you have placed. Run string on the board to connect 1996 with 2018.",
    available: { evidenceCount: 6 },
    nothingNew: "Nothing new stands out on the 1996 wall yet.",
    spaces: [
      { id: "spring", label: "Spring 1996" },
      { id: "june_night", label: "Night of June 13 to 14" },
      { id: "june_after", label: "Rest of June" },
      { id: "july", label: "July" },
      { id: "early_aug", label: "August 1 to 16" },
      { id: "aug17_day", label: "Sat Aug 17, to 9 PM" },
      { id: "aug17_night", label: "Sat Aug 17, after 9 PM" },
      { id: "after", label: "August 18 on" },
    ],
    cards: [
      { id: "a_complaint", text: "Ron Lasko files Grievance 96-031 on Gallery B", source: "E022", kind: "observed", unlock: { hasEvidence: "E022" }, space: "spring" },
      { id: "a_defer", text: "Sutter asks for an immediate repair; Stroud writes \"defer\"", source: "E006 / E026", kind: "observed", unlock: { any: [{ hasEvidence: "E006" }, { hasEvidence: "E026" }] }, space: "spring" },
      { id: "a_deaths", text: "Three men die in Gallery B; Ray Dalton survives", source: "E039", kind: "observed", unlock: { any: [{ hasEvidence: "E039" }, { hasEvidence: "E021" }] }, space: "june_night" },
      { id: "a_sealed", text: "OSHA seals Gallery B, June 14 to 24", source: "E027", kind: "observed", unlock: { hasEvidence: "E027" }, space: "june_after" },
      { id: "a_rewrite", text: "Page 41 of the Gallery B log is rewritten (June 17)", source: "E032", kind: "observed", unlock: { hasEvidence: "E032" }, space: "june_after" },
      { id: "a_len_claim", text: "\"This office inspected Gallery B on June 18.\"", source: "Len Greer (E038)", kind: "claimed", unlock: { hasEvidence: "E038" } },
      { id: "a_prints", text: "Emily photographs the memo at Corso Photo", source: "E005", kind: "observed", unlock: { hasEvidence: "E005" }, space: "july" },
      { id: "a_ray", text: "Emily interviews Ray Dalton on his porch", source: "E003", kind: "observed", unlock: { hasEvidence: "E003" }, space: "july" },
      { id: "a_scrap", text: "W. Reeves's last copper sale at Mon Valley Scrap (Aug 10)", source: "E082", kind: "observed", unlock: { hasEvidence: "E082" }, space: "early_aug" },
      { id: "a_fight", text: "Emily and Wade argue at the Corner Mart (Fri Aug 16)", source: "E011", kind: "observed", unlock: { hasEvidence: "E011" }, space: "early_aug" },
      { id: "a_studio", text: "Emily at work at Corso Photo, 9:58 AM to 6:04 PM", source: "E005", kind: "observed", unlock: { hasEvidence: "E005" }, space: "aug17_day" },
      { id: "a_motel", text: "Emily calls Rebecca at the Valley View, about 7:40 PM", source: "E086", kind: "observed", unlock: { hasEvidence: "E086" }, space: "aug17_day" },
      { id: "a_leaves", text: "Emily leaves home with her bag, 8:30 PM", source: "E019", kind: "observed", unlock: { hasEvidence: "E019" }, space: "aug17_day" },
      { id: "a_gate", text: "Andrew sees Emily and a pickup at the East Gate, about 8:40 PM", source: "E083", kind: "observed", unlock: { hasEvidence: "E083" }, space: "aug17_day" },
      { id: "a_pgh", text: "Stroud checks in at the Grant Street Hotel, Pittsburgh, 5:10 PM", source: "E089", kind: "observed", unlock: { hasEvidence: "E089" }, space: "aug17_day" },
      { id: "a_trent_gate", text: "Trent on post at the West End gate from 6 PM, all night", source: "E088", kind: "observed", unlock: { hasEvidence: "E088" }, space: "aug17_day" },
      { id: "a_cab", text: "A tall young man takes a cab from the Brackett depot to Mill Road, 11:52 PM", source: "E018", kind: "observed", unlock: { hasEvidence: "E018" }, space: "aug17_night" },
      { id: "a_chain", text: "Wade takes chain, a padlock and the welder from the shop (Sun Aug 18)", source: "E095", kind: "observed", unlock: { hasEvidence: "E095" }, space: "after" },
      { id: "a_car", text: "Emily's car ticketed at the Brackett depot (Mon Aug 19)", source: "E008", kind: "observed", unlock: { hasEvidence: "E008" }, space: "after" },
      { id: "a_wade_fri", text: "\"The last time I saw her was Friday night at the Corner Mart.\"", source: "Wade Reeves, 1996 (E009)", kind: "claimed", unlock: { hasEvidence: "E009" } },
      { id: "a_wade_home", text: "\"Saturday I went home. My truck was home all night.\"", source: "Wade Reeves, 1996 (E009)", kind: "claimed", unlock: { hasEvidence: "E009" } },
      { id: "a_wade_four", text: "\"She came by the garage Saturday around four and gave me my ring back.\"", source: "Wade Reeves, 2018 (E087)", kind: "claimed", unlock: { hasEvidence: "E087" } },
      { id: "a_rebecca_home", text: "\"I was home all night. She never called.\"", source: "Rebecca Sloan, 1996 (E010)", kind: "claimed", unlock: { hasEvidence: "E010" } },
      { id: "a_andrew_ten", text: "\"I saw her at the gate about ten.\"", source: "Andrew Pierce, 1996 (E011)", kind: "claimed", unlock: { hasEvidence: "E011" } },
    ],
    findings: [
      {
        id: "f96_studio",
        title: "Emily couldn't have come to the garage at four",
        text: "Wade now says Emily came to the garage at about four on Saturday and gave his ring back. She was at Corso Photo until 6:04 PM.",
        needs: [{ card: "a_wade_four", anyOf: ["aug17_day"] }, { card: "a_studio" }],
        effects: [{ note: { id: "finding:f96_studio", kind: "contradiction", title: "Timeline: the garage at four", text: "Emily was at the studio until 6:04 PM when Wade says she came to the garage.", characterId: "wade" } }],
      },
      {
        id: "f96_rebecca",
        title: "Rebecca heard from Emily",
        text: "Rebecca said in 1996 she never heard from Emily that night. Emily called her at the Valley View Motor Inn at about 7:40 PM.",
        needs: [{ card: "a_rebecca_home", anyOf: ["aug17_day", "aug17_night"] }, { card: "a_motel" }],
      },
      {
        id: "f96_andrew",
        title: "Andrew's \"about ten\"",
        text: "Andrew remembered ten o'clock. He clocked out at 8:30 and walked straight past the gate. What he saw happened before nine, while Emily was on her way to the meeting she had planned.",
        needs: [{ card: "a_andrew_ten", anyOf: ["aug17_night"] }, { card: "a_leaves" }, { card: "a_gate" }],
        ordered: ["a_leaves", "a_gate"],
      },
      {
        id: "f96_friday",
        title: "Not the last time",
        text: "Wade said the last time he saw Emily was Friday night, after their fight. On Saturday evening she was at the East Gate, and a pickup was waiting inside it.",
        needs: [{ card: "a_wade_fri", anyOf: ["early_aug"] }, { card: "a_gate" }, { card: "a_fight" }],
      },
      {
        id: "f96_elsewhere",
        title: "The plant's men were elsewhere",
        text: "From six that evening the plant's security man was on post at the West End gate a mile and a half away, and the general manager had checked into a Pittsburgh hotel. Whoever met Emily at the East Gate, it was neither of them.",
        needs: [{ card: "a_gate" }, { card: "a_trent_gate" }, { card: "a_pgh" }],
        effects: [{ setFlag: "finding_elsewhere" }],
      },
      {
        id: "f96_inspection",
        title: "An inspection behind a seal",
        text: "The borough says it inspected Gallery B on June 18. OSHA had sealed the gallery from June 14 to June 24.",
        needs: [{ card: "a_len_claim", anyOf: ["june_after"] }, { card: "a_sealed" }],
      },
      {
        id: "f96_rewrite",
        title: "Rewritten after the deaths",
        text: "Page 41 was rewritten three days after the men died, before OSHA came. The warnings came first, the deaths second, the clean record last.",
        needs: [{ card: "a_complaint" }, { card: "a_defer" }, { card: "a_deaths" }, { card: "a_rewrite" }],
        ordered: ["a_complaint", "a_defer", "a_deaths", "a_rewrite"],
      },
      {
        id: "f96_copper",
        title: "The copper stops",
        text: "Wade sold copper every week until August 10. He never sold another pound. The day after Emily vanished he took a chain, a padlock and a welder from his uncle's shop.",
        needs: [{ card: "a_scrap" }, { card: "a_chain" }],
        ordered: ["a_scrap", "a_chain"],
      },
      {
        id: "f96_car",
        title: "The way back from Brackett",
        text: "Emily's car was left at the Brackett depot. Before midnight a tall young man with no bags took a cab from that depot to half a mile from the East Gate.",
        needs: [{ card: "a_gate" }, { card: "a_cab" }, { card: "a_car" }],
        ordered: ["a_gate", "a_cab", "a_car"],
      },
    ],
  },
  {
    id: "t2018",
    title: "Timeline: October 2018",
    intro:
      "The weeks since Emily was found. Lay each card in its day, earliest first within a day, claims where their speakers put them, and test.",
    available: { chapter: 3 },
    nothingNew: "Nothing new stands out on the 2018 wall yet.",
    spaces: [
      { id: "before", label: "Oct 12 to 21" },
      { id: "mon_tue", label: "Mon 22 to Tue 23" },
      { id: "wed", label: "Wed 24" },
      { id: "thu", label: "Thu 25" },
      { id: "fri", label: "Fri 26" },
      { id: "weekend", label: "Sat 27 to Sun 28" },
      { id: "mon29", label: "Mon 29" },
      { id: "tue30", label: "Tue 30 on" },
    ],
    cards: [
      { id: "b_found", text: "Teenagers find remains in Tool Crib 4", source: "E012", kind: "observed", unlock: { hasEvidence: "E012" }, space: "before" },
      { id: "b_rs_calls", text: "Stroud calls Glenn Sutter (Sat 20, 14 min)", source: "E047", kind: "observed", unlock: { hasEvidence: "E047" }, space: "before" },
      { id: "b_glenn_vm", text: "Glenn leaves a message for Blackwood", source: "E041", kind: "observed", unlock: { hasEvidence: "E041" }, space: "wed" },
      { id: "b_glenn_rs", text: "Glenn calls Stroud, 8:47 PM, 6 min", source: "E047", kind: "observed", unlock: { hasEvidence: "E047" }, space: "wed" },
      { id: "b_burner", text: "Stroud calls a prepaid phone, 9:14 PM", source: "E057", kind: "observed", unlock: { hasEvidence: "E057" }, space: "wed" },
      { id: "b_trent_off", text: "Trent logged off the Riverworks site, 8:20 to 9:50 PM", source: "E052", kind: "observed", unlock: { hasEvidence: "E052" }, space: "thu" },
      { id: "b_glenn_gate", text: "Glenn's code opens the Creekside gate, 8:52 PM", source: "E045", kind: "observed", unlock: { hasEvidence: "E045" }, space: "thu" },
      { id: "b_override", text: "The override code opens the gate, 9:05 PM", source: "E045", kind: "observed", unlock: { hasEvidence: "E045" }, space: "thu" },
      { id: "b_found_glenn", text: "Glenn found dead in Unit 14, 7:31 AM", source: "E059", kind: "observed", unlock: { hasEvidence: "E059" }, space: "fri" },
      { id: "b_detail", text: "Trent's truck detailed at Reeves Auto, 7:30 AM", source: "E055", kind: "observed", unlock: { hasEvidence: "E055" }, space: "fri" },
      { id: "b_wire", text: "$12,500 wired from Stroud's company to Trent's", source: "E058", kind: "observed", unlock: { hasEvidence: "E058" }, space: "fri" },
      { id: "b_lawyer", text: "Stroud's lawyer delivers a letter to Len", source: "E066", kind: "observed", unlock: { hasEvidence: "E066" }, space: "weekend" },
      { id: "b_len_rs", text: "Len calls Stroud, 3:22 PM", source: "E067", kind: "observed", unlock: { hasEvidence: "E067" }, space: "weekend" },
      { id: "b_len_vm", text: "Len leaves a message for Blackwood, 4:05 PM", source: "E061", kind: "observed", unlock: { hasEvidence: "E061" }, space: "weekend" },
      { id: "b_truck", text: "A black pickup takes two people from Len's house, 9:44 PM", source: "E065", kind: "observed", unlock: { hasEvidence: "E065" }, space: "weekend" },
      { id: "b_noshow", text: "Len misses his ten o'clock; reported missing", source: "E062", kind: "observed", unlock: { hasEvidence: "E062" }, space: "mon29" },
      { id: "b_rescue", text: "Len found alive in the camp cellar", source: "E075", kind: "observed", unlock: { hasEvidence: "E075" }, space: "tue30" },
      { id: "b_trent_home", text: "\"I left the site around six and was home alone all night.\"", source: "Michael Trent (E054)", kind: "claimed", unlock: { hasEvidence: "E054" } },
      { id: "b_trent_willing", text: "\"Len asked me to hide him. He came willingly.\"", source: "Michael Trent (E079)", kind: "claimed", unlock: { hasEvidence: "E079" } },
    ],
    findings: [
      {
        id: "f18_home",
        title: "Trent wasn't home",
        text: "Trent says he left the site at six and stayed home. His own log has him on site until 8:20 and off site until 9:50, the hour the override code opened Creekside's gate.",
        needs: [{ card: "b_trent_home", anyOf: ["thu"] }, { card: "b_trent_off" }, { card: "b_override" }],
      },
      {
        id: "f18_chain",
        title: "Twenty-one minutes",
        text: "Glenn called Stroud on Wednesday night. Twenty-one minutes after that call ended, Stroud called a prepaid phone. The next night the override code opened the gate thirteen minutes behind Glenn.",
        needs: [{ card: "b_glenn_rs" }, { card: "b_burner" }, { card: "b_glenn_gate" }, { card: "b_override" }],
        ordered: ["b_glenn_rs", "b_burner", "b_glenn_gate", "b_override"],
      },
      {
        id: "f18_paid",
        title: "Paid the next morning",
        text: "The morning after the killing, Trent's truck was shampooed at 7:30 and $12,500 arrived from Stroud's company.",
        needs: [{ card: "b_override" }, { card: "b_detail" }, { card: "b_wire" }],
        ordered: ["b_override", "b_detail", "b_wire"],
      },
      {
        id: "f18_len",
        title: "Six hours",
        text: "A day after Stroud's lawyer wrote to him, Len called Stroud. Six hours later a black pickup took two people from his house.",
        needs: [{ card: "b_lawyer" }, { card: "b_len_rs" }, { card: "b_truck" }],
        ordered: ["b_lawyer", "b_len_rs", "b_truck"],
      },
      {
        id: "f18_willing",
        title: "Not willingly",
        text: "Trent says Len came willingly. A pickup took two people from Len's house that night, one held by the arm, and Len was found in a cellar.",
        needs: [{ card: "b_trent_willing", anyOf: ["weekend"] }, { card: "b_truck" }, { card: "b_rescue" }],
      },
    ],
  },
];

const nothing = "Nothing differs in substance.";
const opt = (...texts: string[]) => texts.map((text, i) => ({ id: String.fromCharCode(97 + i), text }));

export const comparisons: ComparisonDef[] = [
  {
    id: "page41",
    title: "Page 41: the Official Copy and the Page Glenn Kept",
    intro:
      "On the left, page 41 of the Gallery B log as it went to OSHA. On the right, the page Glenn Sutter tore out and hid. Choose an entry, compare them, and say what differs. Det. Mitchell will check each find with you before it goes in your notebook.",
    available: { all: [{ hasEvidence: "E023" }, { hasEvidence: "E032" }] },
    expert: "mitchell",
    left: { title: "Official copy (E023)", evidence: "E023" },
    right: { title: "Glenn's page (E032)", evidence: "E032" },
    wrong: "Mitchell looks again. \"I don't see it. Try another line.\"",
    completeText: "Mitchell: \"Same man, same pen, two different stories. The one he hid says the gallery was restricted. The one he gave OSHA says it was clear. Three men died in between.\"",
    onComplete: [{ deduce: "D14" }, { note: { id: "page41_done", kind: "document", title: "Page 41 compared", text: "The official page 41 turns failed monitors and a tagged-out fan into \"tested OK\" and \"running OK,\" and drops the June 7 tag-out entirely.", important: true } }],
    regions: [
      {
        id: "may27",
        label: "May 27 entry",
        leftText: "\"Monitors checked. Heads 1, 3 drift. Recal. GS\"",
        rightText: "\"Monitors checked. Heads 1, 3 drift. Recal. GS\"",
        options: opt("The heads named are different.", "One is initialed by someone else.", nothing),
        answer: "c",
        discrepancy: false,
        comment: "Word for word. He only changed what he had to.",
      },
      {
        id: "jun3",
        label: "June 3 entry",
        leftText: "\"Monitors checked. All heads within tolerance. EF-3 running. GS\"",
        rightText: "\"Monitors checked. Head 1 alarming on air. Head 3 reads 0 on test gas. Head 2 OK. Parts on order WO-0412. GS\"",
        options: opt("The official page says all heads were fine; the kept page records two heads failing.", "The kept page is dated a week later.", "The official page has a different work order number."),
        answer: "a",
        discrepancy: true,
        comment: "Head 3 reading zero on test gas. That's a monitor that wouldn't have warned anybody.",
      },
      {
        id: "jun7",
        label: "June 7",
        leftText: "(No entry.)",
        rightText: "\"EF-3 bearing seized. TAGGED OUT. GS\"",
        options: opt("The official page leaves out the day the fan was tagged out of service.", "Both pages record the fan as repaired.", nothing),
        answer: "a",
        discrepancy: true,
        comment: "And the fire marshal photographed that tag a week later. He took the line off the page and left the tag on the fan.",
      },
      {
        id: "jun10",
        label: "June 10 entry",
        leftText: "\"All heads tested OK. EF-3 running OK. Gallery clear for entry. GS\"",
        rightText: "\"Heads 1 and 3 failed cal. Parts on hold per GM. EF-3 still out. Gallery restricted: portable monitors required for any entry. GS\"",
        options: opt("They agree the gallery was safe to enter.", "The official page says clear for entry; the kept page says failed monitors, fan out, entry restricted.", "Only the dates differ."),
        answer: "b",
        discrepancy: true,
        comment: "\"Parts on hold per GM.\" That's the line that cost somebody his sleep for twenty-two years.",
      },
      {
        id: "initials",
        label: "The initials",
        leftText: "Every entry initialed \"GS.\"",
        rightText: "Every entry initialed \"GS.\"",
        options: opt("The kept page was initialed by someone else.", nothing, "The official page is unsigned."),
        answer: "b",
        discrepancy: false,
        comment: "Both his. That's what makes it a confession on paper.",
      },
    ],
  },
];
