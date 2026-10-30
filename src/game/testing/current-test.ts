/*
 * Test rooms for the 360° viewer (owner only, from the Testing Zone).
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
  /** Brightness of the cutout's own image before the room's light is applied (for rooms lit in code). */
  gain?: number;
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
  /**
   * Rooms lit in code: the image is the room in plain light, and this second image says where moonlight falls
   * (red) and which pixels are inside the room rather than the view outside (green). Made by the bake script.
   */
  lightmap?: string;
  /** The night level inside the room with no lights, and the moonlight's color. */
  ambient?: [number, number, number];
  moon?: [number, number, number];
};

/** The current test: the Whitmore File's office, rebuilt as a 360° room. Its art is still being made. */
export const CURRENT_TEST = {
  id: "c001-office-360",
  title: "The Whitmore File: Detective's Office (360°)",
  blurb: "The office rebuilt as a room you can look around in, lit in code. Waiting for its artwork.",
  start: "office",
  rooms: [
    {
      id: "office",
      name: "Detective's Office",
      startYaw: 0,
      eye: 0.45,
      hotspots: [],
    },
  ] satisfies TestRoom[] as TestRoom[],
};
