/*
 * Test rooms for the 360° asylum prototype (owner only, from the Testing Zone).
 *
 * Each room is one equirectangular panorama (2:1). Positions are in degrees:
 * yaw 0 is the middle of the image, -180/180 its left/right edges; pitch 0 is
 * eye level, +90 straight up, -90 straight down. The viewer's "Show position"
 * readout gives the yaw and pitch at the crosshair, for placing new hotspots.
 */

export type TestHotspot =
  | { kind: "exit"; id: string; yaw: number; pitch: number; label: string; to: string }
  | { kind: "inspect"; id: string; yaw: number; pitch: number; label: string; text: string; image?: string }
  /** Turns the room's ceiling light on and off. */
  | { kind: "switch"; id: string; yaw: number; pitch: number; label: string };

/** A light drawn by the viewer in a box room (no extra artwork): position in room units, height above the floor (room height 1). */
export type TestLight = { x: number; y: number; z: number; color: [number, number, number]; strength: number };

/**
 * A cutout standing in a box room (a transparent image, always facing the
 * viewer, which looks right because the viewer never leaves the room's center).
 * Positions are in room units from the viewer: x to the right, z toward the
 * back (behind the arrival view); the floor is at -eye. x/z is where the
 * bottom of the cutout touches the floor, nearest the viewer.
 */
export type TestProp = {
  id: string;
  image: string;
  x: number;
  z: number;
  width: number;
  height: number;
  /** How far to lower the cutout below the floor line, when its feet look like they float (room units). */
  sink?: number;
  /** A soft shadow on the floor: its size, and how far behind the cutout's base its center sits. */
  shadow?: { width: number; depth: number; back: number; strength?: number };
};

export type TestRoom = {
  id: string;
  name: string;
  /** Path under /public; missing means the room has no panorama yet. */
  image?: string;
  /** Where the view faces on arrival. */
  startYaw: number;
  startPitch?: number;
  hotspots: TestHotspot[];
  /** For rooms built as a box: the eye height above the floor, in the same units as prop positions (room height is 1). */
  eye?: number;
  props?: TestProp[];
  light?: TestLight;
};

export const ASYLUM_TEST = {
  id: "asylum-360",
  title: "Asylum 360° Prototype",
  blurb: "Look around a room in 360°, up and down, and walk to the next room through its doors.",
  start: "steel_room",
  rooms: [
    {
      id: "ward",
      name: "Ward Room",
      image: "/testing/asylum/ward.webp",
      startYaw: 0,
      hotspots: [
        { kind: "exit", id: "ward-corridor", yaw: -152, pitch: -4, label: "Corridor", to: "corridor" },
        { kind: "exit", id: "ward-steel", yaw: 119, pitch: -2, label: "Steel door", to: "steel_room" },
        {
          kind: "inspect",
          id: "ward-cabinet",
          yaw: -112,
          pitch: -12,
          label: "Cabinet",
          text: "Test hotspot. The drawers are rusted shut. A real case would open a close-up image here.",
        },
      ],
    },
    { id: "corridor", name: "Corridor", startYaw: 0, hotspots: [{ kind: "exit", id: "corridor-back", yaw: 180, pitch: -4, label: "Ward Room", to: "ward" }] },
    {
      // Built from six separate images (four walls, floor, ceiling) placed as a box around the camera.
      id: "steel_room",
      name: "Isolation Room",
      image: "/testing/asylum/isolation.webp",
      startYaw: 0,
      eye: 0.55,
      // The ceiling fitting in the middle of the ceiling image, hanging a little below it. Warm, like an old incandescent bulb.
      light: { x: 0, y: 0.9, z: 0, color: [1.0, 0.78, 0.52], strength: 3.2 },
      props: [
        // The corner table, back right as seen facing the door (the room is 1.5 wide and deep, 1 high; that corner is at x -0.75, z 0.75).
        { id: "iso-table", image: "/testing/asylum/props/iso_table.webp", x: -0.6, z: 0.6, width: 0.4, height: 0.39, sink: 0.06, shadow: { width: 0.46, depth: 0.36, back: 0.1, strength: 0.9 } },
      ],
      hotspots: [
        { kind: "exit", id: "iso-door", yaw: -166, pitch: -8, label: "Ward Room", to: "ward" },
        { kind: "switch", id: "iso-switch", yaw: -148, pitch: -6, label: "Light switch" },
        { kind: "inspect", id: "iso-vent", yaw: -90, pitch: -24, label: "Vent", text: "Test hotspot. Something has scratched the paint around the grate from the inside." },
        { kind: "inspect", id: "iso-window", yaw: 22, pitch: 6, label: "Window", text: "Test hotspot. The sash is painted shut. Through the glass, the grounds are perfectly still." },
      ],
    },
  ] satisfies TestRoom[] as TestRoom[],
};
