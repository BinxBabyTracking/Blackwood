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
  hotspots: [{ kind: "switch", id: "lr-switch", yaw: -17.7, pitch: -3.1, label: "Light switch" }],
};
