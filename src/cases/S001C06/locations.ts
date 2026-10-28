import type { Condition, HotspotDef, LocationDef } from "@/game/engine/types";
import {
  LAB_CHAIN_RECT,
  LAB_IMAGING_RECT,
  LAB_PHONES_RECT,
  LAB_SIGNATURES_RECT,
  LETTER_RECT,
  RECONSTRUCTION_RECT,
  RECOVERY_RECT,
  SUBPOENA_RECT,
} from "./desk";
import { briefed, reportAvailable } from "./story";

/*
 * Scene layout for S01 C06. Hotspot rectangles are percentages of a 16:9
 * frame, laid out for placeholder art (the office for C003's painting, as
 * S01 C01 uses it); refit every one once its painting lands. No two hotspots
 * in a scene overlap, whatever is showing.
 *
 * Scene items and availability follow the build contract in
 * docs/S001C06-timeline.md. Benjamin's former office (Room 1011) is a
 * sub-scene of Meridian headquarters, reached by its door. People in custody
 * (Holt, Rourke, Kane) are on the screen in the FBI's video interview room.
 * Person hotspots are shown exactly when the person is at that place.
 */

const pikeKnown: Condition = { any: [{ hasEvidence: "E006" }, { hasEvidence: "E012" }, { hasEvidence: "E013" }] };
const oduyaKnown: Condition = { any: [{ hasEvidence: "E004" }, { hasEvidence: "E006" }] };
const sealed: Condition = { flag: "records_sealed" };
const recovered: Condition = { event: "RE08" };
const archiveOpen: Condition = { flag: "archive_open" };

const inspect = (
  id: string,
  label: string,
  kind: string,
  rect: HotspotDef["rect"],
  title: string,
  text: string,
  extra: Partial<Extract<HotspotDef["interaction"], { type: "inspect" }>> & { visible?: Condition } = {},
): HotspotDef => {
  const { visible, ...rest } = extra;
  return { id, label, kind, rect, visible, interaction: { type: "inspect", title, text, ...rest } };
};

const panel = (id: string, label: string, kind: string, rect: HotspotDef["rect"], p: Extract<HotspotDef["interaction"], { type: "panel" }>["panel"], visible?: Condition): HotspotDef => ({
  id,
  label,
  kind,
  rect,
  visible,
  interaction: { type: "panel", panel: p },
});

const person = (id: string, label: string, characterId: string, rect: HotspotDef["rect"], visible?: Condition): HotspotDef => ({
  id,
  label,
  kind: "person",
  rect,
  visible,
  interaction: { type: "talk", characterId },
});

const door = (id: string, label: string, locationId: string, rect: HotspotDef["rect"]): HotspotDef => ({
  id,
  label,
  kind: "doorway",
  rect,
  interaction: { type: "travel", locationId },
});

/** Something that arrives on the office desk: shown when it arrives, gone once its evidence is collected. */
const deskItem = (id: string, label: string, deliveryId: string, evidenceId: string, rect: HotspotDef["rect"], image: string): HotspotDef => ({
  id,
  label,
  kind: "sprite",
  rect,
  visible: { any: [{ deliveryPending: deliveryId }, { all: [{ deliveryOpened: deliveryId }, { not: { hasEvidence: evidenceId } }] }] },
  sprite: [{ image }],
  attention: { deliveryPending: deliveryId },
  interaction: { type: "delivery", deliveryId },
});

/** Painted artwork for objects and people, by hotspot. Drawn only over painted scenes. */
const ART: Record<string, string> = {
  office_casefile: "art.obj_casefile",
  office_notebook: "art.obj_notebook",
  office_mail: "art.obj_mailtray",
  office_phone: "art.obj_deskphone",
  od_oduya: "art.figure_oduya",
  lf_lockhart: "art.figure_lockhart",
  mo_marchetti: "art.figure_marchetti",
  po_pike: "art.figure_pike",
  fa_ames: "art.figure_ames",
  ex_chen: "art.figure_chen",
  ex_sayer: "art.figure_sayer",
  ny_caruso: "art.figure_caruso",
  fbi_quinlan: "art.figure_quinlan",
  fbi_donovan: "art.figure_donovan",
  fbi_sayer: "art.figure_sayer",
  st_caruso: "art.figure_caruso",
  ir_lockhart: "art.figure_lockhart",
};

const CALLS = [
  "call_quinlan_fire",
  "call_donovan_warning",
  "call_marchetti_contact",
  "call_bennett_ridge",
  "call_recovery",
  "call_quinlan_authenticated",
  "call_caruso_storage",
  "call_quinlan_interview",
  "call_bennett_copies",
  "call_bennett_board",
];

const BOARD_NUDGE: Condition = { all: [{ callAnswered: "call_bennett_board" }, { not: { boardConnections: 1 } }] };
const MAP_NUDGE: Condition = { all: [briefed, { not: { inspected: "office_map" } }] };
const DELIVERIES = ["benjamin_letter", "recovery_report", "subpoena_return", "phones_report", "imaging_report", "signatures_report", "chain_report", "final_reconstruction"];

const withArt = (l: LocationDef): LocationDef => ({ ...l, hotspots: l.hotspots.map((h) => (ART[h.id] ? { ...h, art: ART[h.id] } : h)) });

const SCENES: LocationDef[] = [
  // -------------------------------------------------------------------------
  // L01 The Pittsburgh field office (hub), with the series rolling board
  // -------------------------------------------------------------------------
  {
    id: "office",
    area: "pittsburgh",
    name: "Blackwood Field Office",
    subtitle: "Blackwood Investigations, Pittsburgh",
    mapPin: { x: 8, y: 38 },
    mapTag: "BLACKWOOD",
    background: "loc.office",
    ambience: "amb.office",
    available: { always: true },
    onMap: true,
    hotspots: [
      panel("office_casefile", "Case file: the former Records Administrator", "folder", { x: 27, y: 66, w: 15, h: 22 }, "casefile"),
      deskItem("office_lab_phones", "CART extraction report", "phones_report", "E020", LAB_PHONES_RECT, "obj.labfolder"),
      deskItem("office_lab_imaging", "Laboratory report: imaging", "imaging_report", "E030", LAB_IMAGING_RECT, "obj.labfolder"),
      deskItem("office_lab_signatures", "Laboratory report: signatures", "signatures_report", "E041", LAB_SIGNATURES_RECT, "obj.labfolder"),
      deskItem("office_lab_chain", "Certified reconstruction of authority", "chain_report", "E057", LAB_CHAIN_RECT, "obj.labfolder"),
      deskItem("office_letter", "A letter postmarked Silver Spring", "benjamin_letter", "E010", LETTER_RECT, "obj.letter"),
      deskItem("office_recovery", "FBI operation summary", "recovery_report", "E027", RECOVERY_RECT, "obj.recovery_folder"),
      deskItem("office_subpoena", "Box of subpoena returns", "subpoena_return", "E042", SUBPOENA_RECT, "obj.subpoena_box"),
      deskItem("office_reconstruction", "Final evidentiary reconstruction", "final_reconstruction", "E060", RECONSTRUCTION_RECT, "obj.reconstruction"),
      {
        ...panel("office_board", "Case board", "board", { x: 0, y: 4, w: 24, h: 42 }, "board"),
        attention: BOARD_NUDGE,
        callout: { text: "Tap here to connect your evidence", when: BOARD_NUDGE },
      },
      {
        ...panel("office_phone", "Phone", "phone", { x: 2, y: 62, w: 12, h: 18 }, "phone"),
        attention: { any: CALLS.map((c) => ({ callPending: c })) },
      },
      panel("office_notebook", "Notebook", "notebook", { x: 15, y: 70, w: 11, h: 16 }, "notebook"),
      {
        ...panel("office_map", "Map of the East Coast and Pennsylvania", "map", { x: 70, y: 6, w: 21, h: 36 }, "map"),
        attention: MAP_NUDGE,
        callout: { text: "Tap here to travel", when: MAP_NUDGE },
      },
      panel("office_mail", "Opened mail and reports", "tray", { x: 84, y: 56, w: 12, h: 10 }, "delivery", { any: DELIVERIES.map((d) => ({ deliveryOpened: d })) }),
      inspect(
        "office_window",
        "Window",
        "window",
        { x: 40, y: 2, w: 26, h: 40 },
        "The window",
        "Late December over the Point. Snow on the bridges that will not quite settle, the rivers slate gray where they meet, and the fountain at the Point drained for the winter. Washington is four hours east by the Turnpike; New York, an hour by air.",
      ),
      {
        ...panel("office_report", "Final report", "sprite", { x: 82, y: 72, w: 16, h: 24 }, "conclusion", reportAvailable),
        sprite: [{ image: "obj.report_folder" }],
      },
      {
        // The series' rolling board, in the office since the end of the first case.
        ...panel("office_rolling", "Rolling board", "sprite", { x: 56, y: 44, w: 13, h: 26 }, "rolling"),
        sprite: [{ image: "obj.rolling_board" }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // L02 Benjamin Sayer's house, Arlington
  // -------------------------------------------------------------------------
  {
    id: "sayer_home",
    area: "northern_virginia",
    name: "Benjamin Sayer's House",
    subtitle: "4417 North 19th Street, Arlington, Virginia",
    mapPin: { x: 44, y: 76 },
    background: "loc.sayer_home",
    ambience: "amb.street",
    available: briefed,
    onMap: true,
    hotspots: [
      inspect(
        "sh_window",
        "Front window",
        "window",
        { x: 2, y: 4, w: 16, h: 30 },
        "North 19th Street",
        "A quiet street of brick colonials and bare oaks, Christmas lights still up on half the porches. Across the way, the curb where a car could sit with its engine running and see every window of this house. Next door at 4419, a curtain moves and falls back.",
      ),
      inspect(
        "sh_bookshelf",
        "Bookshelf",
        "bookshelf",
        { x: 20, y: 10, w: 14, h: 44 },
        "The bookshelf",
        "Cookbooks, bird guides, a run of county histories, and among them a gray binder labeled in a label-maker's tidy capitals: \"Records Retention, home reference.\" Its tabs run from ONE YEAR to PERMANENT.",
        { evidence: "E007" },
      ),
      inspect(
        "sh_desk",
        "Legal pad on the study desk",
        "desk",
        { x: 36, y: 50, w: 12, h: 10 },
        "The study desk",
        "The desk has been cleared to the wood: no papers, no laptop, only a lamp and a yellow legal pad with its top sheet torn away. The next sheet is blank, but not quite smooth.",
        { evidence: "E004" },
      ),
      inspect(
        "sh_safe",
        "Fire safe under the desk",
        "safe",
        { x: 36, y: 64, w: 10, h: 10 },
        "The fire safe",
        "A small fireproof document safe, the kind sold for passports and deeds, door standing open. Empty. The foam inside still holds the shape of something rectangular and not much bigger than a paperback.",
      ),
      inspect(
        "sh_kitchen",
        "Kitchen counter",
        "counter",
        { x: 58, y: 40, w: 14, h: 14 },
        "The kitchen counter",
        "A beige answering machine with a red 6 blinking, a caller ID box beside it, and a short stack of opened mail squared off against the wall.",
        { evidence: "E006" },
      ),
      inspect(
        "sh_fridge",
        "Refrigerator",
        "fridge",
        { x: 74, y: 20, w: 10, h: 30 },
        "The refrigerator",
        "A note under a magnet shaped like a cardinal: \"D. Dewey's food is in the pantry. Back after New Year. Don't worry. B.\" Below it, a vet's reminder card and a takeout menu.",
      ),
      inspect(
        "sh_bedroom",
        "Bedroom doorway",
        "doorway",
        { x: 86, y: 10, w: 12, h: 50 },
        "The bedroom",
        "A made bed, a closet with a two-foot gap in the hanging shirts, an empty luggage stand, the top drawers of the dresser half open. Whoever packed here packed quickly and neatly, for a week or two.",
      ),
      inspect(
        "sh_feeder",
        "Cat feeder",
        "box",
        { x: 50, y: 80, w: 10, h: 10 },
        "Dewey's feeder",
        "An automatic feeder, full, set for seven days. A gray cat watches you from under the kitchen table with an air of having been promised this would not happen.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L03 The Meridian Records Center, Chantilly (the fire scene)
  // -------------------------------------------------------------------------
  {
    id: "records_center",
    area: "northern_virginia",
    name: "Meridian Records Center",
    subtitle: "3900 Brookfield Corporate Drive, Chantilly, Virginia",
    mapPin: { x: 36, y: 79 },
    mapTag: "FIRE SCENE",
    background: "loc.records_center",
    ambience: "amb.vault",
    available: { event: "RE01" },
    onMap: true,
    hotspots: [
      inspect(
        "rc_command",
        "Fire marshal's command post",
        "table",
        { x: 2, y: 40, w: 16, h: 30 },
        "The fire marshal's command post",
        "A folding table under a pop-up canopy by the loading apron, a laptop, a radio, and a clipboard of forms weighted down with a hard hat. Investigator Samira Qureshi of the Fairfax County Fire Marshal's Office has left a copy of her preliminary report for the FBI's file.",
        { evidence: "E011" },
      ),
      inspect(
        "rc_access",
        "Access printout, security office",
        "paper",
        { x: 22, y: 50, w: 12, h: 10 },
        "The security office",
        "A cramped office by the dock with a card-system terminal and a bank of DVR monitors, most of them dark. Dale Merriman printed the night's access report before the FBI arrived and left it squared on the keyboard.",
        { evidence: "E012" },
      ),
      inspect(
        "rc_cameras",
        "Camera stills, security office",
        "photo",
        { x: 22, y: 62, w: 12, h: 10 },
        "The camera stills",
        "A sheaf of DVR stills, printed and clipped, on the desk beside the dead monitor for Bay C.",
        { evidence: "E016" },
      ),
      inspect(
        "rc_clipboard",
        "Clipboard in the dock office",
        "clipboard",
        { x: 40, y: 52, w: 10, h: 10 },
        "The dock office clipboard",
        "A clipboard on a nail by the dock door, the top sheet a work order with Merriman's handwriting crammed along the bottom.",
        { evidence: "E013" },
      ),
      inspect(
        "rc_schedule",
        "Schedule binder in the dock office",
        "binder",
        { x: 40, y: 64, w: 10, h: 12 },
        "The schedule binder",
        "A black binder on the dock office shelf, spine labeled RETENTION SCHEDULE. It is fatter than one schedule should be.",
        { evidence: "E015" },
      ),
      inspect(
        "rc_salvage",
        "Salvage tables",
        "table",
        { x: 56, y: 62, w: 18, h: 14 },
        "The salvage tables",
        "Folding tables under an FBI evidence tent, sheets of glass laid in rows, and between them what came out of Bay C: mostly ash, some of it with edges.",
        { evidence: "E019" },
      ),
      inspect(
        "rc_bay_c",
        "Bay C, from the doorway",
        "doorway",
        { x: 58, y: 8, w: 22, h: 40 },
        "Bay C",
        "From the doorway, as far as anyone may go: a steel-mesh cage gone black and bowed, shelving slumped into itself, the floor a gray drift of wet ash and the twisted wire of carton handles. The smell is still sharp. Fire marshal's tape is strung across the opening.",
        { textAfter: [{ requires: sealed, text: "Bay C, behind two layers of tape now: the fire marshal's and the FBI's. The cage is black and bowed, the shelving slumped, the floor a drift of wet ash. An agent at the doorway logs everyone who so much as looks." }] },
      ),
      inspect(
        "rc_bays_ab",
        "Bays A and B",
        "shelving",
        { x: 82, y: 8, w: 16, h: 36 },
        "Bays A and B",
        "Aisle after aisle of steel shelving, bare to the uprights. Faint rectangles in the dust where cartons stood for years. Collections 14, 22 and 31, according to the aisle signs. Nothing is left on any of them.",
      ),
      inspect(
        "rc_seal",
        "FBI crime scene seal",
        "tape",
        { x: 80, y: 52, w: 16, h: 18 },
        "The crime scene seal",
        "A sign on an easel at the evidence tent: FBI CRIME SCENE. AUTHORIZED PERSONNEL ONLY. The agent on the log waves you through to the tables and the offices. \"Everything you need is under the tent or on a clipboard. Touch nothing in the bays.\"",
        { visible: sealed },
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L04 Meridian Advisory Group headquarters, during the FBI search
  // -------------------------------------------------------------------------
  {
    id: "meridian_hq",
    area: "dc",
    name: "Meridian Advisory Group",
    subtitle: "Headquarters, Washington, D.C., during the FBI search",
    mapPin: { x: 48, y: 72 },
    background: "loc.meridian_hq",
    ambience: "amb.corporate",
    available: { chapter: 2 },
    onMap: true,
    hotspots: [
      inspect(
        "hq_vendor",
        "Assistant's vendor files",
        "filing",
        { x: 6, y: 44, w: 14, h: 14 },
        "The vendor files",
        "The executive assistant's desk outside the Chair's suite, a lateral file drawer pulled open and tagged by the search team. Under V, a folder of vendor engagements, the newest on top.",
        { evidence: "E017" },
      ),
      inspect(
        "hq_payables",
        "Accounts payable tray",
        "tray",
        { x: 24, y: 56, w: 12, h: 10 },
        "Accounts payable",
        "A wire tray marked AP: TO APPROVE, on a credenza in the finance corner. One invoice sits on top, already paid, the wire confirmation stapled behind.",
        { evidence: "E018" },
      ),
      inspect(
        "hq_suite",
        "The Chair's suite",
        "doorway",
        { x: 40, y: 6, w: 24, h: 40 },
        "The Chair's suite",
        "A corner suite with a view of the Mall and nothing else in it. Empty shelves, an empty credenza, bright rectangles on the carpet where file cabinets stood. The brass plate on the door says only OFFICE OF THE CHAIR. An agent shrugs: \"It was like this when we got here at nine.\"",
      ),
      inspect(
        "hq_freight",
        "Freight elevator log",
        "clipboard",
        { x: 66, y: 30, w: 12, h: 16 },
        "The freight elevator log",
        "A clipboard by the service elevator. The last entry, Thursday night: \"12/27. 21:40 to 23:15. Keyed S6-0001. 31 cartons, 9 (Chair) to dock. Day hire, 2 men. Destination: storage (NY).\"",
      ),
      inspect(
        "hq_search",
        "The search team",
        "people",
        { x: 64, y: 60, w: 16, h: 14 },
        "The FBI search",
        "Agents in windbreakers boxing files under a warrant served at 9:00 Friday morning. Every box gets a number and a line in a log. Nobody from Meridian is in the building except a lawyer who stands by the elevator taking notes on everything.",
      ),
      door("hq_to_611", "Room 1011, records administration", "sayer_office", { x: 84, y: 10, w: 14, h: 56 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L05 Benjamin's former office, Room 1011 (sub-scene of headquarters)
  // -------------------------------------------------------------------------
  {
    id: "sayer_office",
    area: "dc",
    name: "Room 1011",
    subtitle: "Records administration, tenth floor, Meridian headquarters",
    background: "loc.sayer_office",
    ambience: "amb.corporate",
    available: { chapter: 2 },
    onMap: false,
    hotspots: [
      inspect(
        "so_policy",
        "Policy binder",
        "binder",
        { x: 6, y: 30, w: 12, h: 16 },
        "The policy binder",
        "A blue binder on the shelf behind the desk: RECORDS RETENTION AND DISPOSAL POLICY. The spine is worn white where a thumb has pulled it out for years.",
        { evidence: "E014" },
      ),
      inspect(
        "so_manual",
        "Governance and Records Manual",
        "book",
        { x: 20, y: 30, w: 12, h: 16 },
        "The manual",
        "A spiral-bound manual beside the binder, Meridian's own governance rules, with yellow flags at the sections on reserved matters.",
        { evidence: "E039" },
      ),
      inspect(
        "so_blotter",
        "Desk blotter",
        "calendar",
        { x: 40, y: 60, w: 16, h: 10 },
        "The desk blotter",
        "A paper desk blotter, December. Every Friday has the same note in the same small upright hand: \"Fri: export, ledger.\" The last Friday, the 21st, has it too, and nothing after.",
      ),
      inspect(
        "so_drawer",
        "Ledger drawer",
        "drawer",
        { x: 58, y: 66, w: 12, h: 10 },
        "The ledger drawer",
        "The bottom desk drawer, a lock on it, open. A wooden tray inside sized for one bound notebook, and the notebook is not in it.",
      ),
      inspect(
        "so_window",
        "Window",
        "window",
        { x: 62, y: 6, w: 20, h: 30 },
        "The window",
        "Ten floors down, an interior courtyard with a bare gingko tree and a smokers' bench. Nobody is smoking today. There is an FBI van in the service lane.",
      ),
      door("so_to_hq", "Back to the executive floor", "meridian_hq", { x: 86, y: 10, w: 12, h: 60 }),
    ],
  },

  // -------------------------------------------------------------------------
  // L06 Oduya Records Consulting, Reston
  // -------------------------------------------------------------------------
  {
    id: "oduya_office",
    area: "northern_virginia",
    name: "Oduya Records Consulting",
    subtitle: "Suite 300, 1840 Sunrise Valley Drive, Reston, Virginia",
    mapPin: { x: 39, y: 74 },
    background: "loc.oduya_office",
    ambience: "amb.corporate",
    available: { all: [{ chapter: 2 }, oduyaKnown] },
    onMap: true,
    hotspots: [
      inspect(
        "od_safe",
        "Backup tape safe",
        "safe",
        { x: 6, y: 50, w: 14, h: 20 },
        "The tape safe",
        "A fire-rated media safe, waist high, with a typed list on the door: client, tape, date. One line has been highlighted twice: \"Meridian / Custodia / monthly / 11/30/2018.\" Beside it, in pen: \"Contract terminated 12/23. Return requested. 30 days per clause 11.\"",
      ),
      person("od_oduya", "Caroline Oduya", "oduya", { x: 30, y: 20, w: 12, h: 64 }),
      inspect(
        "od_server",
        "Server room",
        "server",
        { x: 60, y: 10, w: 20, h: 40 },
        "The server room",
        "Through a glass wall, two racks of blinking hardware and a tape library the size of a refrigerator. A sticky note on the glass: \"Custodia builds 2010 to 2011. Don't touch the old rig.\"",
      ),
      inspect(
        "od_window",
        "Window",
        "window",
        { x: 84, y: 8, w: 14, h: 30 },
        "Sunrise Valley Drive",
        "Glass office parks and a frozen retention pond. The Dulles Toll Road hisses beyond the trees.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L07 Glenmore Court Residences, Silver Spring
  // -------------------------------------------------------------------------
  {
    id: "safe_apartment",
    area: "maryland",
    name: "Glenmore Court Residences",
    subtitle: "Lobby and Unit 3C, Silver Spring, Maryland",
    mapPin: { x: 50, y: 68 },
    background: "loc.safe_apartment",
    ambience: "amb.street",
    available: { all: [{ chapter: 3 }, { hasEvidence: "E008" }] },
    onMap: true,
    hotspots: [
      inspect(
        "sa_desk",
        "Front desk",
        "desk",
        { x: 10, y: 46, w: 20, h: 16 },
        "The front desk",
        "A marble counter with a bowl of mints and a monitor turned away from the lobby. The manager has printed the door log for you and clipped the night concierge's note to it.",
        { evidence: "E023" },
      ),
      inspect(
        "sa_business",
        "Business center",
        "printer",
        { x: 34, y: 40, w: 14, h: 20 },
        "The business center",
        "A glass room off the lobby with two computers and a printer. The printer's output tray is empty. The desk says one page printed at 11:52 PM was held here for the guest. It isn't here now.",
      ),
      inspect(
        "sa_unit",
        "Unit 3C",
        "doorway",
        { x: 56, y: 10, w: 24, h: 50 },
        "Unit 3C",
        "Upstairs, a furnished one-bedroom that someone has gone through quickly and with no interest in hiding it: drawers pulled out and left on the floor, the mattress lifted off its frame, the closet's spare blankets shaken out. Nothing broken. Nothing, as far as anyone can tell, taken.",
      ),
      inspect(
        "sa_ramp",
        "Garage ramp",
        "doorway",
        { x: 82, y: 50, w: 14, h: 30 },
        "The garage ramp",
        "A steel door at the back of the lobby, push bar on the inside, and beyond it a concrete ramp down to the street behind the building. No camera on this side.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L08 Frederick Transit Center
  // -------------------------------------------------------------------------
  {
    id: "transit",
    area: "maryland",
    name: "Frederick Transit Center",
    subtitle: "Frederick, Maryland",
    mapPin: { x: 42, y: 62 },
    background: "loc.transit",
    ambience: "amb.transit",
    available: { all: [{ chapter: 3 }, { any: [{ hasEvidence: "E023" }, { hasEvidence: "E010" }] }] },
    onMap: true,
    hotspots: [
      inspect(
        "tr_security",
        "Security office",
        "monitor",
        { x: 6, y: 30, w: 18, h: 24 },
        "The security office",
        "A windowless room behind the concourse, a wall of camera feeds and a guard who has already printed what SA Quinlan asked for. The cab stand's dispatch sheet is clipped behind the stills.",
        { evidence: "E009" },
      ),
      inspect(
        "tr_ticket",
        "Ticket window",
        "counter",
        { x: 30, y: 40, w: 16, h: 24 },
        "The ticket window",
        "Bernadette Kovalenko, customer service, has been waiting for someone to ask. She talks fast and keeps her hands flat on the counter so they don't shake, and when she is done she reads her statement over twice before she signs it.",
        { evidence: "E024" },
      ),
      inspect(
        "tr_cabs",
        "Cab stand",
        "street",
        { x: 60, y: 30, w: 20, h: 30 },
        "The cab stand",
        "Three white cabs in a row under the canopy, MONOCACY CAB on the doors. Car 31 isn't one of them; the dispatcher says Emmanuel is on a long fare and will call in.",
      ),
      inspect(
        "tr_bay4",
        "Bay 4",
        "doorway",
        { x: 84, y: 20, w: 14, h: 40 },
        "Bay 4",
        "The Silver Spring bus pulls in here. A schedule in a cracked plastic frame lists the first departure from Silver Spring at 5:45 AM, arriving 7:05.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L09 The Burkholder farm and tenant house, Fulton County
  // -------------------------------------------------------------------------
  {
    id: "ridge_property",
    area: "fulton_county",
    name: "The Burkholder Farm",
    subtitle: "Juniper Gap Road, Fulton County, Pennsylvania",
    mapPin: { x: 30, y: 52 },
    mapTag: "WITNESS",
    secret: true,
    background: "loc.ridge_property",
    ambience: "amb.farm",
    available: { event: "RE07" },
    onMap: true,
    hotspots: [
      inspect(
        "rp_camera",
        "Trail camera, on the kitchen laptop",
        "laptop",
        { x: 6, y: 40, w: 16, h: 20 },
        "Burkholder's trail camera",
        "In the farmhouse kitchen, Lester Burkholder has the camera's card in an old laptop on the oilcloth. \"Deer, mostly,\" he says. \"Not this morning.\"",
        { evidence: "E026" },
      ),
      inspect(
        "rp_tahoe",
        "The SUV on the lane",
        "vehicle",
        { x: 28, y: 50, w: 18, h: 16 },
        "The lane",
        "Through Burkholder's binoculars, a quarter mile up the lane: a dark gray full-size SUV parked crosswise, blocking the way to the tenant house. Engine running; exhaust hanging in the cold. Nobody gets out.",
        { textAfter: [{ requires: recovered, text: "The dark gray Tahoe, Virginia UFK-7731, doors open and taped off, State Police photographing the inside: a pry bar in the back, a GPS unit on the dash, two coffee cups gone cold." }] },
      ),
      inspect(
        "rp_house",
        "The tenant house",
        "building",
        { x: 56, y: 6, w: 26, h: 40 },
        "The tenant house",
        "A small white frame house on the ridge, blinds drawn, no smoke from the chimney. No phone line runs to it and there is no signal up there. Burkholder says his tenant wanted quiet to write.",
        { textAfter: [{ requires: recovered, text: "The tenant house with its back door forced at the frame, the kitchen table pushed against it from inside, and a trapdoor in the pantry floor standing open over the root cellar." }] },
      ),
      inspect(
        "rp_cellar",
        "Root cellar",
        "cellar",
        { x: 60, y: 56, w: 16, h: 16 },
        "The root cellar",
        "Down a ladder under the pantry: shelves of canning jars, a camp chair, a blanket, a flashlight, and the leather satchel. An agent hands up a sealed case from behind the potato bins.",
        { evidence: "E029", visible: recovered },
      ),
      inspect(
        "rp_farmhouse",
        "Farmhouse porch",
        "building",
        { x: 84, y: 30, w: 14, h: 30 },
        "Lester Burkholder",
        "A lean man in a barn coat, arms folded on the porch rail. \"I rent to people who want quiet. I don't rent to people who want company. Those two aren't anybody's company.\"",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L10 The Lockhart Foundation, New York
  // -------------------------------------------------------------------------
  {
    id: "lockhart_foundation",
    area: "new_york",
    name: "The Lockhart Foundation",
    subtitle: "1140 Fifth Avenue, New York",
    mapPin: { x: 86, y: 26 },
    background: "loc.lockhart_foundation",
    ambience: "amb.corporate",
    available: { chapter: 5 },
    onMap: true,
    hotspots: [
      inspect(
        "lf_photo",
        "Founding photograph",
        "photo",
        { x: 6, y: 10, w: 16, h: 24 },
        "A framed photograph",
        "In the hallway, among award plaques and grant ceremonies, a small framed photograph of six people on the steps of a Washington townhouse, squinting into sun. A brass label: \"Meridian Advisory Group, 2007.\" The woman in the center is younger, but not by much.",
      ),
      person("lf_lockhart", "Dr. Evelyn Lockhart", "lockhart", { x: 40, y: 18, w: 12, h: 66 }, { not: { event: "RE12" } }),
      inspect(
        "lf_boardroom",
        "Boardroom production",
        "table",
        { x: 6, y: 50, w: 22, h: 18 },
        "The boardroom",
        "The long boardroom table has been given over to the FBI's subpoena: binders in rows, each tabbed by year, an agent and a foundation lawyer sitting at opposite ends saying nothing to each other.",
        { evidence: "E044" },
      ),
      inspect(
        "lf_window",
        "Window on Fifth Avenue",
        "window",
        { x: 66, y: 6, w: 20, h: 34 },
        "Fifth Avenue",
        "The park across the avenue, bare and white. A doorman below brushing snow off the awning. Every window in the building is polished.",
      ),
      inspect(
        "lf_assistant",
        "Assistant's desk",
        "desk",
        { x: 70, y: 50, w: 12, h: 30 },
        "The assistant's desk",
        "Beatrice Lam, the president's executive assistant, answers the phone in a low voice and writes down every name. A courier envelope sits in her out tray, unaddressed. She sees you look at it and turns it face down.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L11 Elena Marchetti's law office, Midtown Manhattan
  // -------------------------------------------------------------------------
  {
    id: "marchetti_office",
    area: "new_york",
    name: "Elena Marchetti's Law Office",
    subtitle: "Midtown Manhattan",
    mapPin: { x: 83, y: 30 },
    background: "loc.marchetti_office",
    ambience: "amb.corporate",
    available: { event: "RE05" },
    onMap: true,
    hotspots: [
      inspect(
        "mo_shelves",
        "Bookshelves",
        "bookshelf",
        { x: 4, y: 10, w: 16, h: 40 },
        "The shelves",
        "Delaware corporate law, trust and estates treatises, bound minute books with company names on the spines. Several gaps where the FBI took binders on Saturday.",
      ),
      person("mo_marchetti", "Elena Marchetti", "marchetti", { x: 36, y: 18, w: 12, h: 66 }),
      inspect(
        "mo_counsel",
        "Her defense counsel",
        "person",
        { x: 54, y: 22, w: 12, h: 60 },
        "Defense counsel",
        "Her criminal lawyer, gray suit, legal pad, a pen he taps once before every one of her answers. He has already said \"proffer\" twice and \"nothing on the record about the foundation\" once.",
      ),
      inspect(
        "mo_window",
        "Window",
        "window",
        { x: 72, y: 6, w: 22, h: 34 },
        "The window",
        "Forty floors above Midtown, the towers going gold in the short afternoon. On the sill, a dead orchid and a framed bar admission certificate.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L12 Pike Risk Services, Tysons
  // -------------------------------------------------------------------------
  {
    id: "pike_office",
    area: "northern_virginia",
    name: "Pike Risk Services",
    subtitle: "Suite 610, Leesburg Pike, Tysons, Virginia",
    mapPin: { x: 42, y: 77 },
    background: "loc.pike_office",
    ambience: "amb.corporate",
    available: { all: [{ chapter: 2 }, pikeKnown] },
    onMap: true,
    hotspots: [
      inspect(
        "po_whiteboard",
        "Back office whiteboard",
        "board",
        { x: 6, y: 10, w: 24, h: 30 },
        "The whiteboard",
        "Through the half-open door to the back office, a wall whiteboard somebody started wiping and didn't finish.",
        { evidence: "E022" },
      ),
      person("po_pike", "Conrad Pike", "pike", { x: 40, y: 18, w: 12, h: 66 }),
      inspect(
        "po_window",
        "Window",
        "window",
        { x: 70, y: 6, w: 24, h: 34 },
        "Tysons",
        "Six floors over the Leesburg Pike, the Silver Line's concrete guideway, a mall parking deck. In the lot below, a reserved space marked PRS with nothing in it.",
      ),
      inspect(
        "po_file",
        "The PITTSBURGH file",
        "folder",
        { x: 64, y: 56, w: 14, h: 12 },
        "The PITTSBURGH file",
        "An agent lifts a red folder out of a locked drawer in Pike's desk and lays it on the blotter for you. The label is typed: PITTSBURGH.",
        { evidence: "E055", visible: { chapter: 5 } },
      ),
      inspect(
        "po_search",
        "The FBI search",
        "people",
        { x: 82, y: 50, w: 14, h: 30 },
        "The search",
        "Sunday, 8:00 AM: agents boxing the office under a warrant while Pike sits very straight beside his lawyer, hands folded, watching each box go.",
        { visible: { chapter: 5 } },
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L13 Brandywine Fiduciary Company records room, Wilmington
  // -------------------------------------------------------------------------
  {
    id: "financial_archive",
    area: "delaware",
    name: "Brandywine Fiduciary Company",
    subtitle: "Records room, Rodney Square, Wilmington, Delaware",
    mapPin: { x: 66, y: 54 },
    background: "loc.financial_archive",
    ambience: "amb.corporate",
    available: { chapter: 4 },
    onMap: true,
    hotspots: [
      inspect(
        "fa_shelves",
        "Trust files",
        "shelving",
        { x: 4, y: 6, w: 30, h: 36 },
        "The records room",
        "A windowless room of rolling shelves, each trust in its own red-rope file. A trust officer stands at the door with a sign-out sheet and a federal subpoena folded in his breast pocket.",
      ),
      inspect(
        "fa_trust",
        "The Cardinal Point Trust file",
        "folder",
        { x: 10, y: 50, w: 18, h: 14 },
        "The trust file",
        "A red-rope file on the reading table, tagged MHT-2009-04. Walter Kiley has already flagged three pages with yellow tabs.",
        { evidence: "E043" },
      ),
      person("fa_ames", "Walter Kiley", "ames", { x: 46, y: 18, w: 12, h: 66 }),
      inspect(
        "fa_lamp",
        "Reading table",
        "desk",
        { x: 72, y: 50, w: 22, h: 20 },
        "The reading table",
        "Green-shaded lamps, a calculator with a paper tape, Walter's own pad covered in columns. \"Four directions,\" he says, without looking up. \"One point one million each. Bear with me.\"",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L14 Solvang Document Laboratory, Baltimore
  // -------------------------------------------------------------------------
  {
    id: "exam_facility",
    area: "baltimore",
    name: "Solvang Document Laboratory",
    subtitle: "North Charles Street, Baltimore",
    mapPin: { x: 56, y: 62 },
    background: "loc.exam_facility",
    ambience: "amb.lab",
    available: { chapter: 4 },
    onMap: true,
    hotspots: [
      person("ex_chen", "Irene Chen", "chen", { x: 6, y: 20, w: 10, h: 38 }),
      person("ex_sayer", "Benjamin Sayer", "sayer", { x: 18, y: 20, w: 10, h: 38 }, recovered),
      inspect(
        "ex_bench",
        "Imaging bench",
        "computer",
        { x: 40, y: 6, w: 30, h: 30 },
        "The imaging bench",
        "A write-blocker, two workstations and an evidence bag under a lamp. The FBI's examiner, Priya Natarajan, logs every keystroke on paper as well as on screen. Dr. Ingrid Solvang moves between the bench and the comparison microscope and says very little.",
      ),
      inspect("ex_register", "Register printout", "paper", { x: 32, y: 60, w: 12, h: 11 }, "The register", "On the light table, the register printed from the image, 412 entries, tabbed in red.", { evidence: "E031", visible: archiveOpen }),
      inspect("ex_corr", "EX-CORR printouts", "paper", { x: 45, y: 60, w: 12, h: 11 }, "The notes", "On the light table, a stack of copies of typed notes, most signed with one letter.", { evidence: "E032", visible: archiveOpen }),
      inspect("ex_fin", "EX-FIN printouts", "paper", { x: 58, y: 60, w: 12, h: 11 }, "The budgets", "On the light table, budget sheets and four trust directions laid side by side.", { evidence: "E033", visible: archiveOpen }),
      inspect("ex_intel", "Intelligence EX-7s", "paper", { x: 71, y: 60, w: 12, h: 11 }, "The intelligence forms", "On the light table, scanned EX-7 forms for one program, approval boxes inked.", { evidence: "E034", visible: archiveOpen }),
      inspect("ex_enforce", "Logistics and C-5 EX-7s", "paper", { x: 84, y: 60, w: 12, h: 11 }, "The enforcement forms", "On the light table, scanned EX-7 forms for two programs and one matter, each with a limit written in.", { evidence: "E035", visible: archiveOpen }),
      inspect("ex_concealment", "The 2014 note to counsel", "paper", { x: 32, y: 74, w: 12, h: 11 }, "The note to counsel", "On the light table, a single typed note with a memo filed behind it.", { evidence: "E036", visible: archiveOpen }),
      inspect("ex_release", "EX-2018-052", "paper", { x: 45, y: 74, w: 12, h: 11 }, "The release program", "On the light table, one EX-7 with a schedule and an amendment stapled to it.", { evidence: "E037", visible: archiveOpen }),
      inspect("ex_spec", "Specimen cards", "card", { x: 58, y: 74, w: 12, h: 11 }, "The specimen cards", "On the light table, six code cards in a row, each with a name and a signature.", { evidence: "E038", visible: archiveOpen }),
      inspect("ex_protocol", "Operating Protocol No. 1", "paper", { x: 71, y: 74, w: 12, h: 11 }, "Protocol No. 1", "On the light table, the oldest document in the archive: two typed pages dated April 6, 2009.", { evidence: "E049", visible: archiveOpen }),
    ],
  },

  // -------------------------------------------------------------------------
  // L15 NYPD, Det. Caruso's squad room
  // -------------------------------------------------------------------------
  {
    id: "nypd",
    area: "new_york",
    name: "NYPD Squad Room",
    subtitle: "Det. Anthony Caruso's squad, Manhattan",
    mapPin: { x: 87, y: 32 },
    background: "loc.nypd",
    ambience: "amb.interview",
    available: { chapter: 2 },
    onMap: true,
    hotspots: [
      inspect(
        "ny_board",
        "The Ogden board",
        "board",
        { x: 6, y: 8, w: 24, h: 34 },
        "The Ogden board",
        "A whiteboard by Caruso's desk: Nathaniel Ogden's photograph, a map of a few Midtown blocks, Gabriel Knox's booking photo, and CHARGED written across the corner in red. Under it, in smaller letters: \"Who sent him?\"",
      ),
      person("ny_caruso", "Det. Anthony Caruso", "caruso", { x: 40, y: 18, w: 12, h: 66 }, { not: { event: "RE11" } }),
      inspect(
        "ny_window",
        "Window",
        "window",
        { x: 70, y: 6, w: 24, h: 34 },
        "The window",
        "Wire glass, a fire escape, a brick wall six feet away. Caruso says the view is the best part of the job.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L16 FBI Washington Field Office
  // -------------------------------------------------------------------------
  {
    id: "fbi",
    area: "dc",
    name: "FBI Washington Field Office",
    subtitle: "601 4th Street NW, Washington, D.C.",
    mapPin: { x: 50, y: 74 },
    background: "loc.fbi",
    ambience: "amb.interview",
    available: { always: true },
    onMap: true,
    hotspots: [
      inspect(
        "fbi_window",
        "Window",
        "window",
        { x: 2, y: 6, w: 22, h: 30 },
        "Fourth Street",
        "Judiciary Square in gray December light, the National Building Museum's red brick, a line of black SUVs at the curb with their engines running.",
      ),
      person("fbi_quinlan", "SA Teresa Quinlan", "quinlan", { x: 28, y: 18, w: 11, h: 66 }),
      person("fbi_donovan", "Claire Donovan", "donovan", { x: 42, y: 18, w: 11, h: 66 }, { event: "RE02" }),
      person("fbi_sayer", "Benjamin Sayer, with counsel", "sayer", { x: 56, y: 18, w: 11, h: 66 }, { all: [recovered, { not: { chapter: 4 } }] }),
      person("fbi_holt", "Adrian Holt (video, with counsel)", "holt", { x: 70, y: 10, w: 9, h: 28 }, { chapter: 2 }),
      person("fbi_rourke", "Julian Rourke (video, with counsel)", "rourke", { x: 80, y: 10, w: 9, h: 28 }, { chapter: 2 }),
      person("fbi_kane", "Gideon Kane (video, with counsel)", "kane", { x: 90, y: 10, w: 9, h: 28 }, { chapter: 2 }),
      inspect(
        "fbi_video",
        "Video interview room",
        "monitor",
        { x: 70, y: 60, w: 26, h: 20 },
        "The video interview room",
        "A small room with a camera, a microphone and a large screen. Interviews with people in custody happen here, recorded, with their counsel on the other end of the line. Quinlan sets them up; the jail and the marshals do the rest.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L17 Meridian's former New York office, Long Island City
  // -------------------------------------------------------------------------
  {
    id: "storage_office",
    area: "new_york",
    name: "Meridian's Former New York Office",
    subtitle: "Fourth floor, Skillman Avenue, Long Island City, Queens",
    mapPin: { x: 90, y: 28 },
    secret: true,
    background: "loc.storage_office",
    ambience: "amb.vault",
    available: { event: "RE11" },
    onMap: true,
    hotspots: [
      person("st_caruso", "Det. Anthony Caruso", "caruso", { x: 6, y: 18, w: 12, h: 66 }, { event: "RE11" }),
      inspect(
        "st_window",
        "Factory windows",
        "window",
        { x: 30, y: 6, w: 30, h: 30 },
        "The windows",
        "Tall steel-framed windows, half of them painted over, the rest looking across the rail yards to the Manhattan skyline. The floor still smells of printer's ink from eighty years ago.",
      ),
      inspect(
        "st_plan",
        "Cartons from the Chair's suite",
        "box",
        { x: 24, y: 46, w: 14, h: 20 },
        "The Chair's cartons",
        "Thirty-one new cartons stacked on pallets, each marked in the same black marker: CHAIR, and a number. The building superintendent, Vito Scarpa, says they came up the freight elevator in the small hours of Friday morning. An agent opens the first few for you.",
        { evidence: "E053" },
      ),
      inspect(
        "st_review",
        "More of the Chair's cartons",
        "box",
        { x: 40, y: 46, w: 14, h: 20 },
        "The Chair's cartons",
        "Further down the pallet, cartons of typed memoranda in clear sleeves, each page signed with a single letter.",
        { evidence: "E054" },
      ),
      inspect(
        "st_castell",
        "A folder marked C.",
        "folder",
        { x: 74, y: 52, w: 14, h: 16 },
        "The folder marked C.",
        "In the last of the Chair's cartons, a slim folder with a single letter on the tab: C. Inside, four typed sheets on plain paper, each with two initials in ink in the corner.",
        { evidence: "E052" },
      ),
      inspect(
        "st_excorr",
        "Carton marked EX-CORR",
        "box",
        { x: 58, y: 52, w: 14, h: 16 },
        "A different carton",
        "Apart from the others, an older, softer carton, the label in a different hand: \"EX-CORR: hold for Administrator.\"",
        { evidence: "E059" },
      ),
      inspect(
        "st_booking",
        "Notice on the door",
        "paper",
        { x: 80, y: 10, w: 16, h: 30 },
        "The booking on the door",
        "Taped to the inside of the door, a work ticket: \"On-site shredding. Mon 12/31, 7:00 AM. 31 + 1 cartons. Bill to Pike Risk Services.\" Somebody wanted it done before the new year.",
      ),
    ],
  },

  // -------------------------------------------------------------------------
  // L18 FBI New York Field Office, 26 Federal Plaza, interview room
  // -------------------------------------------------------------------------
  {
    id: "interview_room",
    area: "new_york",
    name: "26 Federal Plaza",
    subtitle: "FBI New York Field Office, interview room",
    mapPin: { x: 85, y: 36 },
    secret: true,
    background: "loc.interview_room",
    ambience: "amb.interview",
    available: { event: "RE12" },
    onMap: true,
    hotspots: [
      inspect(
        "ir_counsel",
        "Her counsel",
        "person",
        { x: 24, y: 22, w: 12, h: 60 },
        "Her counsel",
        "Two partners from a white-shoe firm, one of whom has already placed a written statement on the table: Dr. Lockhart is here voluntarily, may leave at any time, and will answer only questions about documents she has been shown.",
      ),
      person("ir_lockhart", "Dr. Evelyn Lockhart, with counsel", "lockhart", { x: 40, y: 18, w: 14, h: 66 }),
      inspect(
        "ir_quinlan",
        "SA Quinlan",
        "person",
        { x: 60, y: 22, w: 12, h: 60 },
        "SA Quinlan",
        "Quinlan at the end of the table, a single folder closed in front of her, saying nothing. She told you in the elevator: \"One page at a time. Let the paper talk.\"",
      ),
      inspect(
        "ir_mirror",
        "Mirrored window",
        "window",
        { x: 72, y: 6, w: 24, h: 30 },
        "The mirror",
        "A long mirrored window. On the other side, someone from the U.S. Attorney's office with a legal pad. On this side, everyone pretends it is a wall.",
      ),
    ],
  },
];

export const locations: LocationDef[] = SCENES.map(withArt);
