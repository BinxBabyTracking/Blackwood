import type { TestRoom } from "@/game/testing/current-test";

/*
 * The Whitmore File (C001): Eleanor's living room, 1418 Hollister Avenue, as a 360° room lit in code.
 * About 16 feet square with a 9-foot ceiling; the player stands in the middle (eyes about 5½ feet up) facing the front
 * door and window. Fireplace on the right, the arch to the kitchen behind, the desk wall on the left.
 * Day and night versions (the view outside and the light through the window). The floor is the office floor for now.
 * Built with scripts/testing/bake_box.py and scripts/testing/living_day.json / living_night.json.
 */
export const C001_LIVING_ROOM: TestRoom = {
  id: "c001_living_room",
  name: "Eleanor's Living Room",
  image: "/rooms/c001-living-room/living_day.webp",
  lightmap: "/rooms/c001-living-room/living_day_light.webp",
  size: [1.7768, 1.7768],
  startYaw: 0,
  eye: 0.61,
  ambient: [0.82, 0.78, 0.7],
  moon: [0.95, 0.8, 0.58],
  variants: {
    label: "Time",
    options: [
      { name: "day", image: "/rooms/c001-living-room/living_day.webp", lightmap: "/rooms/c001-living-room/living_day_light.webp", ambient: [0.82, 0.78, 0.7], moon: [0.95, 0.8, 0.58] },
      { name: "night", image: "/rooms/c001-living-room/living_night.webp", lightmap: "/rooms/c001-living-room/living_night_light.webp", ambient: [0.2, 0.22, 0.32], moon: [0.42, 0.34, 0.21] },
    ],
  },
  // The wrought iron chandelier in the middle of the ceiling.
  light: { x: 0, y: 0.86, z: 0, color: [1.0, 0.84, 0.62], strength: 7 },
  props: [
    // Under the front window.
    { id: "sofa", image: "/rooms/c001-living-room/props/sofa.webp", x: 0.23, z: -0.64, width: 0.78, height: 0.345, gain: 1.2, facing: 0, shadow: { width: 0.8, depth: 0.28, back: 0.08 } },
    // Front right corner, beside the sofa.
    { id: "side-table", image: "/rooms/c001-living-room/props/side_table.webp", x: 0.74, z: -0.72, width: 0.22, height: 0.46, gain: 1.2, shadow: { width: 0.22, depth: 0.2, back: 0.03 } },
    // On the rug, a little left of the tape marks (the tape marks and broken glass are laid into the floor image).
    { id: "chair", image: "/rooms/c001-living-room/props/chair.webp", x: -0.33, z: -0.36, width: 0.36, height: 0.28, gain: 1.2, shadow: { width: 0.36, depth: 0.25, back: 0.06 } },
    // Left wall: the roll-top desk toward the front door, the sideboard toward the kitchen arch.
    { id: "rolltop", image: "/rooms/c001-living-room/props/rolltop.webp", x: -0.6, z: -0.42, width: 0.58, height: 0.4625, gain: 1.2, facing: -90, shadow: { width: 0.55, depth: 0.3, back: 0.12 } },
    { id: "sideboard", image: "/rooms/c001-living-room/props/sideboard.webp", x: -0.7, z: 0.52, width: 0.68, height: 0.477, gain: 1.2, shadow: { width: 0.62, depth: 0.22, back: 0.05 } },
    // Back right corner, by the fireplace and the kitchen arch.
    { id: "palm", image: "/rooms/c001-living-room/props/palm.webp", x: 0.7, z: 0.7, width: 0.4, height: 0.62, gain: 1.2, shadow: { width: 0.25, depth: 0.22, back: 0.02 } },
  ],
  hotspots: [
    { kind: "switch", id: "lr-switch", yaw: -17.7, pitch: -3.1, label: "Light switch" },
    { kind: "inspect", id: "lr_chair", yaw: -42.5, pitch: -43.9, label: "Overturned chair", text: "Overturned chair: One of the dining chairs, brought in for coffee. It lies on its back." },
    { kind: "inspect", id: "lr_glass", yaw: -49.6, pitch: -66.7, label: "Broken glass", text: "Broken glass: Crystal shards on the carpet, a bagged piece beside them with an LAPD tag." },
    { kind: "inspect", id: "lr_sofa", yaw: 19.8, pitch: -32.9, label: "Sofa", text: "Where she was found: Police tape marks on the carpet between the sofa and the overturned chair show where Eleanor was found. The sofa cushions are still squared off. Nothing on this side of the room was disturbed." },
    { kind: "inspect", id: "lr_ledger", yaw: -55.0, pitch: -23.8, label: "Writing desk", text: "Eleanor's writing desk: A roll-top desk. Her household ledger lies open on the blotter." },
    { kind: "inspect", id: "lr_diary", yaw: -54.6, pitch: -18.1, label: "Desk diary", text: "Desk diary: A leather desk diary propped open on the shelf above the blotter." },
    { kind: "inspect", id: "lr_drawer", yaw: -45.9, pitch: -27.4, label: "Desk filing drawer", text: "Filing drawer: A deep drawer of hanging files, each labeled in Eleanor's handwriting. One gap stands out." },
    { kind: "inspect", id: "lr_sideboard", yaw: -126.6, pitch: -25.7, label: "Sideboard", text: "Sideboard: A glass cake stand with a few crumbs of lemon cake, five dessert plates stacked beside it, and a tray of crystal water glasses. One place in the set is empty. A space on the runner where something long lay." },
    { kind: "inspect", id: "lr_wine", yaw: -119.9, pitch: -14.3, label: "Wine bottle", text: "Wine bottle: A 1979 Burgundy, two-thirds empty. Fingerprint powder on the neck. The police lab report found only Eleanor's prints." },
    { kind: "inspect", id: "lr_poker", yaw: 109.7, pitch: -20.0, label: "Fireplace tools", text: "Fireplace tools: Poker, brush and shovel, hanging neatly in their stand. A film of dust on all three. The grate holds old, cold ash. No one has lit a fire here since spring." },
    { kind: "inspect", id: "lr_front_door", yaw: -34.1, pitch: -4.7, label: "Front door", text: "Front door: Solid oak, with a deadbolt and a brass chain. No damage. Margaret Ellis let herself in with her spare key at 7:40 on Saturday morning; the door was locked and the chain was off." },
    { kind: "inspect", id: "lr_to_kitchen", yaw: 179.5, pitch: -10.2, label: "Kitchen", text: "Test hotspot. The kitchen is not built in 360° yet; this will walk you through." },
  ],
};
