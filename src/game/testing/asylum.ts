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
  | { kind: "inspect"; id: string; yaw: number; pitch: number; label: string; text: string; image?: string };

export type TestRoom = {
  id: string;
  name: string;
  /** Path under /public; missing means the room has no panorama yet. */
  image?: string;
  /** Where the view faces on arrival. */
  startYaw: number;
  startPitch?: number;
  hotspots: TestHotspot[];
};

export const ASYLUM_TEST = {
  id: "asylum-360",
  title: "Asylum 360° Prototype",
  blurb: "Look around a room in 360°, up and down, and walk to the next room through its doors.",
  start: "ward",
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
      hotspots: [
        { kind: "exit", id: "iso-door", yaw: -166, pitch: -8, label: "Ward Room", to: "ward" },
        { kind: "inspect", id: "iso-vent", yaw: -90, pitch: -24, label: "Vent", text: "Test hotspot. Something has scratched the paint around the grate from the inside." },
        { kind: "inspect", id: "iso-window", yaw: 22, pitch: 6, label: "Window", text: "Test hotspot. The sash is painted shut. Through the glass, the grounds are perfectly still." },
      ],
    },
  ] satisfies TestRoom[] as TestRoom[],
};
