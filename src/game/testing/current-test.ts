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
  /** Test buttons that cycle through states, for things that come and go in the case (deliveries on the desk). */
  toggles?: { id: string; label: string; states: string[] }[];
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
      // About 16 feet square with a 9-foot ceiling (the walls are 16:9). The player sits at the desk in the middle, facing the window.
      id: "office",
      name: "Detective's Office",
      image: "/testing/office/office.webp",
      lightmap: "/testing/office/office_light.webp",
      size: [1.7768, 1.7768],
      startYaw: 0,
      eye: 0.45,
      ambient: [0.32, 0.34, 0.42],
      // The city's glow through the blinds, warm like sodium streetlights.
      moon: [0.95, 0.7, 0.45],
      outsideToggle: "City glow",
      light: { x: 0, y: 0.96, z: 0, color: [1.0, 0.84, 0.64], strength: 8 },
      props: [
        // The desk, right in front of the chair: its far edge about 4 feet away, the near edge in your lap.
        // The desk, its front about 5 feet in front of the chair: about 6 feet wide, the top about 2½ feet off the floor.
        { id: "desk", image: "/testing/office/props/desk.webp", x: 0, z: -0.4, width: 0.7337, height: 0.3817, gain: 1.6 },
        // On the desk (layer 1, so always drawn over it). Positions are on the desk's picture: the desktop runs from its
        // far edge down to the near edge; "sink" (negative) lifts each item's bottom up to its spot on the desktop.
        // The green banker's lamp, far left corner.
        { id: "lamp", image: "/testing/office/props/lamp.webp", x: -0.165, z: -0.395, width: 0.1518, height: 0.1551, sink: -0.3245, gain: 1.5, layer: 1 },
        // The telephone, front left.
        { id: "phone", image: "/testing/office/props/phone.webp", x: -0.22, z: -0.395, width: 0.1238, height: 0.0838, sink: -0.2552, gain: 1.4, layer: 2 },
        // Det. Bennett's case file, in the middle.
        { id: "casefile", image: "/testing/office/props/casefile.webp", x: 0, z: -0.395, width: 0.11, height: 0.0732, sink: -0.2673, gain: 1.3, layer: 1 },
        // The notebook and pencil, right of the file.
        { id: "notebook", image: "/testing/office/props/notebook.webp", x: 0.132, z: -0.395, width: 0.0638, height: 0.0631, sink: -0.2673, gain: 1.3, layer: 1 },
        // The wire mail tray, back right; the lab folder lies in it, and the tape recorder sits in front of it
        // (one layer up from the tray, so the tray never covers them).
        { id: "mailtray", image: "/testing/office/props/mailtray.webp", x: 0.22, z: -0.395, width: 0.1045, height: 0.0679, sink: -0.319, gain: 1.3, layer: 1 },
        { id: "labfolder", image: "/testing/office/props/labfolder.webp", x: 0.22, z: -0.395, width: 0.066, height: 0.0473, sink: -0.3322, gain: 1.3, layer: 2 },
        { id: "recorder", image: "/testing/office/props/recorder.webp", x: 0.2475, z: -0.395, width: 0.0935, height: 0.0638, sink: -0.2552, gain: 1.3, layer: 2 },
        // Furniture around the room (the room is about 16 feet square; its walls are 0.888 from the middle).
        { id: "cabinet", image: "/testing/office/props/cabinet.webp", x: 0.72, z: -0.72, width: 0.251, height: 0.633, gain: 1.4, shadow: { width: 0.3, depth: 0.22, back: 0.05 } },
        { id: "typing-table", image: "/testing/office/props/typing_table.webp", x: -0.76, z: 0, width: 0.6, height: 0.42, gain: 1.4, shadow: { width: 0.6, depth: 0.2, back: 0.04 } },
        { id: "chair", image: "/testing/office/props/chair.webp", x: -0.72, z: 0.45, width: 0.272, height: 0.355, gain: 1.4, shadow: { width: 0.3, depth: 0.25, back: 0.05 } },
        { id: "coat-rack", image: "/testing/office/props/coat_rack.webp", x: 0.72, z: 0.72, width: 0.236, height: 0.667, gain: 1.4, shadow: { width: 0.22, depth: 0.2, back: 0.02 } },
        // Deliveries: they arrive at the front of the desk, over the file, and come and go with the case (test buttons).
        { id: "envelope-sealed", image: "/testing/office/props/envelope_sealed.webp", x: -0.077, z: -0.395, width: 0.11, height: 0.0763, sink: -0.2442, gain: 1.3, layer: 3, when: { toggle: "envelope", state: "sealed" } },
        { id: "envelope-open", image: "/testing/office/props/envelope_open.webp", x: -0.077, z: -0.395, width: 0.11, height: 0.0782, sink: -0.2442, gain: 1.3, layer: 3, when: { toggle: "envelope", state: "opened" } },
        { id: "bag-sealed", image: "/testing/office/props/evidencebag_sealed.webp", x: 0.077, z: -0.395, width: 0.0935, height: 0.0762, sink: -0.2442, gain: 1.3, layer: 3, when: { toggle: "bag", state: "sealed" } },
        { id: "bag-open", image: "/testing/office/props/evidencebag_open.webp", x: 0.077, z: -0.395, width: 0.0935, height: 0.0714, sink: -0.2442, gain: 1.3, layer: 3, when: { toggle: "bag", state: "opened" } },
        { id: "report", image: "/testing/office/props/report.webp", x: 0, z: -0.395, width: 0.11, height: 0.0759, sink: -0.2365, gain: 1.4, layer: 4, when: { toggle: "report", state: "shown" } },
      ],
      toggles: [
        { id: "envelope", label: "Envelope", states: ["none", "sealed", "opened"] },
        { id: "bag", label: "Evidence bag", states: ["none", "sealed", "opened"] },
        { id: "report", label: "Final report", states: ["none", "shown"] },
      ],
      // Under the lamp's shade, on the desk's far left corner; warm and focused.
      lamp: {
        x: -0.33, y: 0.44, z: -0.67, color: [1.0, 0.82, 0.5], strength: 2.5,
        pool: { x: -0.077, z: -0.385, lift: 0.297, width: 0.396, height: 0.121, strength: 0.55 },
      },
      hotspots: [
        { kind: "switch", id: "office-switch", yaw: 157.5, pitch: 3.6, label: "Light switch" },
        { kind: "switch", id: "office-lamp", target: "lamp", yaw: -18.4, pitch: -5.9, label: "Desk lamp" },
        { kind: "inspect", id: "office-phone", yaw: -29.1, pitch: -18.7, label: "Telephone", text: "Test hotspot. In the case this opens the phone." },
        { kind: "inspect", id: "office-casefile", yaw: 0.0, pitch: -20.3, label: "Case file from Det. Bennett", text: "Test hotspot. In the case this opens the case file." },
        { kind: "inspect", id: "office-notebook", yaw: 18.5, pitch: -19.9, label: "Notebook", text: "Test hotspot. In the case this opens your notebook." },
        { kind: "inspect", id: "office-recorder", yaw: 32.1, pitch: -19.3, label: "Police interview tapes", text: "Test hotspot. In the case this plays the interview tapes." },
        { kind: "inspect", id: "office-mail", yaw: 32.5, pitch: -10.5, label: "Opened mail", text: "Test hotspot. In the case this shows the mail you have opened." },
        { kind: "inspect", id: "office-board", yaw: 96.4, pitch: 8.1, label: "Murder board", text: "Test hotspot. In the case this opens the murder board." },
        { kind: "inspect", id: "office-map", yaw: 59.6, pitch: 7.1, label: "Street map of Los Angeles", text: "Test hotspot. In the case this opens the map to travel." },
        { kind: "inspect", id: "office-typewriter", yaw: -90, pitch: -9.7, label: "Typewriter: final report", text: "Test hotspot. In the case this is where you type the final report." },
        { kind: "inspect", id: "office-cabinet", yaw: 45, pitch: -9.2, label: "Filing cabinet", text: "Test hotspot. Old case files." },
        { kind: "inspect", id: "office-envelope", yaw: -11.0, pitch: -22.6, label: "Manila envelope", text: "Test hotspot. In the case Patricia's envelope is opened here.", when: { toggle: "envelope", state: "sealed" } },
        { kind: "inspect", id: "office-envelope-open", yaw: -11.0, pitch: -22.5, label: "Envelope from Patricia Wells", text: "Test hotspot. In the case this shows the torn bank statement.", when: { toggle: "envelope", state: "opened" } },
        { kind: "inspect", id: "office-bag", yaw: 11.0, pitch: -22.6, label: "Police evidence bag", text: "Test hotspot. In the case the evidence bag is opened here.", when: { toggle: "bag", state: "sealed" } },
        { kind: "inspect", id: "office-bag-open", yaw: 11.0, pitch: -22.9, label: "The windbreaker", text: "Test hotspot. In the case this shows the bloodstained jacket.", when: { toggle: "bag", state: "opened" } },
        { kind: "inspect", id: "office-report", yaw: 0.0, pitch: -24.0, label: "Final report folder", text: "Test hotspot. In the case this opens the final report.", when: { toggle: "report", state: "shown" } },
        { kind: "inspect", id: "office-labfolder", yaw: 27.6, pitch: -11.9, label: "Lab results", text: "Test hotspot. In the case lab results arrive here when the police lab is done." },
      ],
    },
  ] satisfies TestRoom[] as TestRoom[],
};
