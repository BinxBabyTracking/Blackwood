/*
 * Test rooms for the 360° viewer (owner only, from the Testing Zone).
 *
 * Each room is one equirectangular panorama (2:1). Positions are in degrees:
 * yaw 0 is the middle of the image, -180/180 its left/right edges; pitch 0 is
 * eye level, +90 straight up, -90 straight down. The viewer's "Show position"
 * readout gives the yaw and pitch at the crosshair, for placing new hotspots.
 */

/** Shown only while a test toggle is in this state (see TestRoom.toggles). */
export type TestWhen = { toggle: string; state: string };

export type TestHotspot = { when?: TestWhen } & (
  | { kind: "exit"; id: string; yaw: number; pitch: number; label: string; to: string }
  | { kind: "inspect"; id: string; yaw: number; pitch: number; label: string; text: string; image?: string }
  /** Turns the room's ceiling light on and off. */
  | { kind: "switch"; id: string; yaw: number; pitch: number; label: string; target?: "ceiling" | "lamp" }
);

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
  /**
   * Stands flat, parallel to a wall, instead of turning to face the viewer: the direction (yaw, degrees) you would look
   * to see it straight on. 0 = against the front wall, 90 = the right wall, -90 = the left wall, 180 = the back wall.
   * For furniture drawn straight on from the front.
   */
  facing?: number;
  /**
   * Art painted over a reference view from the player's eye (scripts/testing/ref_view.py): the whole picture is set
   * up as a screen at the box's distance, square to that view, so the piece lands exactly in its box. x and z are the
   * box's middle (for drawing order); width, height and sink are not used.
   */
  view?: { yaw: number; pitch: number; fovv: number; aspect: number; dist: number };
  /** Drawn over lower layers whatever their distance: 1 for things that sit on top of furniture (desk items). */
  layer?: number;
  /** Shown only while a test toggle is in this state. */
  when?: TestWhen;
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
   * A second light, like a desk lamp, with its own switch. Its light goes mostly down. "pool" is the warm patch it
   * throws on the cutout under it (a desk): a soft glow placed like a cutout, at its base point and size.
   */
  lamp?: TestLight & { pool?: { x: number; z: number; lift: number; width: number; height: number; strength: number } };
  /** Box rooms: width and depth in room units (the height is 1). Defaults to 1.5 by 1.5. */
  size?: [number, number];
  /** Show the test button that hides and brings back the light from outside (the moon). */
  outsideToggle?: string;
  /** Versions of the room you can switch between (day and night): each swaps the room image, its light map and its light levels. */
  variants?: { label: string; options: { name: string; image: string; lightmap?: string; ambient?: [number, number, number]; moon?: [number, number, number] }[] };
  /** Test buttons that cycle through states, for things that come and go in the case (deliveries on the desk). */
  toggles?: { id: string; label: string; states: string[] }[];
  /**
   * Rooms lit in code: the image is the room in plain light, and this second image says where moonlight falls
   * (red) and which pixels are inside the room rather than the view outside (green). Made by the bake script.
   */
  lightmap?: string;
  /** The night level inside the room with no lights, and the moonlight's color. */
  ambient?: [number, number, number];
  /**
   * Furniture rendered from 3D models into one 360° picture with transparency (scripts/testing/render3d/render360.html),
   * drawn over the room and lit with it. "gain" brightens it to sit with the room's plain light.
   */
  furniture?: { image: string; gain?: number };
  moon?: [number, number, number];
};

/** The current test: the Whitmore File's office, rebuilt as a 360° room. Its art is still being made. */
import { OFFICE_80S } from "@/game/rooms/office-80s";
import { C001_LIVING_ROOM } from "@/game/rooms/c001-living-room";

/** The current test: the Whitmore File's rooms in 360° (the menu at the top right goes between them). */
export const CURRENT_TEST = {
  id: "c001-360",
  title: "The Whitmore File (360°)",
  blurb: "The Whitmore File's rooms in 360°, lit in code: the 80s Office and Eleanor's living room. Use the menu at the top right to move between them.",
  start: "office",
  rooms: [OFFICE_80S, C001_LIVING_ROOM],
};
