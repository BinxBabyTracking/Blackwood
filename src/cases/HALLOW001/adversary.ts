import type { AdversaryDef, AdversaryMove, Condition, Effect } from "@/game/engine/types";
import { alive, craneAt, craneDownstairs, craneFree, craneInDanger, guarded, WITNESSES } from "./rules";

/*
 * Desmond Crane's playbook (docs/HALLOW001-timeline.md, "The killer").
 *
 * He learns only what he could see or hear from the main floor of the house:
 * the commotion when the study shelves are opened; an investigator sitting
 * down with Harriet over her ledger, or with Bridget over 1998, in the rooms
 * he can see; the veiled woman brought downstairs; police lights at the
 * carriage house; a report that comes back wrong. Nothing in the notebook,
 * on the board, or in a private room reaches him.
 *
 * At most one attack, ever, and never a third death. Visible police (the
 * gate) turn him away; quiet police (the lane, a guarded witness) catch him.
 */

const learned = (id: string): Condition => ({ flag: `crane_${id}` });

/** Arrested now, and before midnight if it is. */
const arrest: Effect[] = [
  { setFlag: "crane_arrested" },
  { setEnv: "crane", to: "gatehouse" },
  { when: { not: { clockAt: "00:00" } }, then: [{ setFlag: "arrested_before_midnight" }] },
];

/** Out through the lane gate to the driver: caught if the lane is watched, gone if not. */
const runForTheLane: Effect[] = [
  { when: { flag: "police_lane" }, then: [{ setFlag: "crane_caught_fleeing" }, ...arrest] },
  { when: { not: { flag: "police_lane" } }, then: [{ setFlag: "crane_escaped" }, { setEnv: "crane", to: "gone" }] },
];

/** Something an investigator in the room would notice when he starts to fear someone: not proof, just a look. */
const watching = (name: string, rooms: string[]): Effect => ({
  when: { any: rooms.map((r) => ({ at: r })) },
  then: [{ message: `Across the room, Desmond Crane is watching ${name}. He looks away when he sees you notice.` }],
});

const attack = (w: (typeof WITNESSES)[number], priority: number): AdversaryMove => ({
  id: `attack_${w.id}`,
  note: `Goes after ${w.name}, who he believes can expose him, while nobody from Blackwood is with them.`,
  priority,
  chance: 15,
  // Only once he is cornered: the net is closing, and this witness is part of it.
  when: { all: [craneInDanger, learned(`fears_${w.id}`), alive(w.id), { not: { flag: "attack_made" } }, { clockAt: "23:20" }, { not: { at: w.at } }] },
  effects: [
    { setFlag: "attack_made" },
    { setFlag: `attack_on_${w.id}` },
    // A quiet guard is there when it happens.
    { when: guarded(w.id), then: [{ setFlag: "attack_interrupted" }, ...arrest] },
    { when: { not: guarded(w.id) }, then: [{ setFlag: "second_murder" }, { setFlag: `dead_${w.id}` }] },
  ],
});

export const adversary: AdversaryDef = {
  characterId: "crane",
  env: "crane",
  start: "dining_room",
  stopped: { not: craneFree },
  learns: [
    {
      id: "passage",
      note: "Hears the commotion upstairs when the study shelves are opened, and works out that the stair has been found.",
      when: { all: [{ env: "study_shelf", is: "B" }, craneDownstairs] },
      chance: 50,
      effects: [{ setFlag: "crane_knows_passage" }],
    },
    {
      id: "chamber",
      note: "Sees the crime scene unit's lights at the carriage house from the windows.",
      when: { flag: "chamber_opened" },
      effects: [{ setFlag: "crane_knows_chamber" }],
    },
    {
      id: "harriet",
      note: "Sees an investigator sitting with Harriet Lowell over her old ledger.",
      when: { all: [{ asked: "harriet_ledger" }, { any: [craneAt("dining_room"), craneAt("library")] }] },
      chance: 50,
      effects: [{ setFlag: "crane_fears_harriet" }, watching("Harriet Lowell", ["library", "dining_room"])],
    },
    {
      id: "amos",
      note: "Decides the old caretaker, who knows the house, has told them about the back stair.",
      when: { any: [{ all: [{ asked: "amos_passage" }, craneDownstairs] }, { flag: "crane_knows_passage" }] },
      chance: 40,
      effects: [{ setFlag: "crane_fears_amos" }, watching("Amos Duffy", ["entrance_hall", "dining_room"])],
    },
    {
      id: "bridget",
      note: "Overhears Bridget Duffy talking to an investigator about Halloween 1998.",
      when: { all: [{ asked: "bridget_1998" }, craneAt("dining_room")] },
      chance: 50,
      effects: [{ setFlag: "crane_fears_bridget" }, watching("Bridget Duffy", ["dining_room"])],
    },
    {
      id: "josie",
      note: "Sees the veiled woman brought downstairs and hears her name: Lisle.",
      when: { all: [{ flag: "josie_found" }, craneDownstairs] },
      effects: [{ setFlag: "crane_fears_josie" }, watching("Josie Lisle", ["morning_room", "dining_room", "entrance_hall"])],
    },
    {
      id: "emboldened",
      note: "Hears that the investigators' report was sent back: they have named the wrong person, or not enough.",
      when: { attempts: 1 },
      effects: [{ setFlag: "crane_emboldened" }],
    },
  ],
  moves: [
    // Leaving.
    {
      id: "flee_procession",
      note: "Uses the lantern procession as cover to slip through the maze to his driver on the lane.",
      priority: 100,
      chance: 70,
      when: { all: [craneInDanger, { flag: "procession_on" }, { flag: "crane_called" }] },
      effects: runForTheLane,
    },
    {
      id: "flee_gate",
      note: "Walks out to his car in the gatehouse lot and drives out of the front gate.",
      priority: 99,
      chance: 25,
      when: { all: [craneInDanger, { not: { flag: "police_gate" } }, { clockAt: "23:40" }] },
      effects: [{ setFlag: "crane_escaped" }, { setEnv: "crane", to: "gone" }],
    },
    {
      id: "flee_lane",
      note: "Sees the officer at the gate and goes out through the maze to his driver on the lane instead.",
      priority: 98,
      chance: 30,
      when: { all: [craneInDanger, { flag: "police_gate" }, { flag: "crane_called" }, { clockAt: "23:40" }] },
      effects: runForTheLane,
    },
    // Silencing a witness: the one he fears most first.
    attack(WITNESSES[0], 84),
    attack(WITNESSES[1], 83),
    attack(WITNESSES[2], 82),
    attack(WITNESSES[3], 81),
    {
      id: "threaten_bridget",
      note: "Slips a note into Bridget Duffy's coat on the hall stand, telling her to remember what she didn't see.",
      priority: 60,
      chance: 45,
      when: { all: [learned("fears_bridget"), alive("bridget"), { not: { flag: "attack_made" } }] },
      effects: [{ setFlag: "bridget_threatened" }],
    },
    {
      id: "take_envelope",
      note: "With the investigators on the wrong track, takes Ambrose's envelope out of the library globe.",
      priority: 58,
      chance: 60,
      goTo: "library",
      rest: 1,
      when: { all: [learned("emboldened"), { not: { hasEvidence: "HE035" } }, { not: { at: "library" } }] },
      effects: [{ setFlag: "envelope_taken" }],
    },
    // The folder he took from the study.
    {
      id: "recover_folder",
      note: "With the stair found, goes down to the cellar for the folder he hid behind the port bins.",
      priority: 55,
      chance: 40,
      goTo: "wine_cellar",
      rest: 1,
      when: { all: [learned("knows_passage"), { not: { hasEvidence: "HE027" } }, { not: { inspected: "wc_bins" } }, { not: { at: "wine_cellar" } }] },
      effects: [{ setFlag: "records_moved" }],
    },
    {
      id: "burn_folder",
      note: "Burns the folder in the greenhouse stove.",
      priority: 54,
      goTo: "greenhouse",
      rest: 1,
      when: { all: [{ moved: "recover_folder" }, { not: { at: "greenhouse" } }] },
      effects: [{ setFlag: "records_burned" }],
    },
    // Getting ready.
    {
      id: "call_driver",
      note: "Takes his phone to the conservatory and calls a driver to wait on the back lane at midnight.",
      priority: 30,
      chance: 30,
      goTo: "conservatory",
      rest: 4,
      when: { all: [{ clockAt: "23:00" }, craneDownstairs] },
      effects: [{ setFlag: "crane_called" }],
    },
    {
      id: "intruder_story",
      note: "Tells the other guests the veiled woman must be an intruder, a madwoman off the road.",
      priority: 20,
      chance: 40,
      when: { all: [{ clockAt: "22:45" }, { not: { flag: "josie_found" } }] },
      effects: [{ setFlag: "rumor_intruder" }],
    },
    {
      id: "back_to_table",
      note: "Goes back to the dining room, among the other guests.",
      priority: 5,
      repeatable: true,
      goTo: "dining_room",
      when: { all: [craneFree, { not: craneAt("dining_room") }] },
    },
  ],
};
