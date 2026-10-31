import type { TestRoom } from "@/game/testing/current-test";

/*
 * The 80s Office: Blackwood's detective office as a 360° room, lit in code (night, city glow through the blinds,
 * ceiling light by the door, green desk lamp). First built for the Whitmore File (C001). Saved as a finished room,
 * so later tests can change without touching it. Artwork lives in public/rooms/office-80s.
 * Built with scripts/testing/bake_box.py and scripts/testing/office.json.
 */
export const OFFICE_80S: TestRoom = {
      // About 16 feet square with a 9-foot ceiling (the walls are 16:9). The player sits at the desk in the middle, facing the window.
      id: "office",
      name: "Detective's Office",
      image: "/rooms/office-80s/office.webp",
      lightmap: "/rooms/office-80s/office_light.webp",
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
        { id: "desk", image: "/rooms/office-80s/props/desk.webp", x: 0, z: -0.4, width: 0.8438, height: 0.4188, gain: 1.6 },
        // On the desk (layer 1, so always drawn over it). Positions are on the desk's picture: the desktop runs from its
        // far edge down to the near edge; "sink" (negative) lifts each item's bottom up to its spot on the desktop.
        // The green banker's lamp, far left corner.
        { id: "lamp", image: "/rooms/office-80s/props/lamp.webp", x: -0.2, z: -0.395, width: 0.1397, height: 0.1427, sink: -0.3778, gain: 1.5, layer: 1 },
        // The telephone, front left.
        { id: "phone", image: "/rooms/office-80s/props/phone.webp", x: -0.29, z: -0.395, width: 0.1139, height: 0.0771, sink: -0.3277, gain: 1.4, layer: 2 },
        // Det. Bennett's case file, in the middle.
        { id: "casefile", image: "/rooms/office-80s/props/casefile.webp", x: -0.075, z: -0.395, width: 0.1265, height: 0.0842, sink: -0.3365, gain: 1.3, layer: 1 },
        // The notebook and pencil, right of the file.
        { id: "notebook", image: "/rooms/office-80s/props/notebook.webp", x: 0.1518, z: -0.395, width: 0.0734, height: 0.0726, sink: -0.3365, gain: 1.3, layer: 1 },
        // The wire mail tray, back right; the lab folder lies in it, and the tape recorder sits in front of it
        // (one layer up from the tray, so the tray never covers them).
        { id: "mailtray", image: "/rooms/office-80s/props/mailtray.webp", x: 0.253, z: -0.395, width: 0.1202, height: 0.0781, sink: -0.3737, gain: 1.3, layer: 1 },
        { id: "labfolder", image: "/rooms/office-80s/props/labfolder.webp", x: 0.253, z: -0.395, width: 0.0759, height: 0.0544, sink: -0.3833, gain: 1.3, layer: 2 },
        { id: "recorder", image: "/rooms/office-80s/props/recorder.webp", x: 0.305, z: -0.395, width: 0.1075, height: 0.0734, sink: -0.315, gain: 1.3, layer: 2 },
        // Furniture around the room (the room is about 16 feet square; its walls are 0.888 from the middle).
        { id: "cabinet", image: "/rooms/office-80s/props/cabinet.webp", x: 0.72, z: -0.72, width: 0.251, height: 0.633, gain: 1.4, shadow: { width: 0.3, depth: 0.22, back: 0.05 } },
        { id: "typing-table", image: "/rooms/office-80s/props/typing_table.webp", x: -0.76, z: 0, width: 0.6, height: 0.42, gain: 1.4, shadow: { width: 0.6, depth: 0.2, back: 0.04 } },
        { id: "chair", image: "/rooms/office-80s/props/chair.webp", x: -0.72, z: 0.45, width: 0.272, height: 0.355, gain: 1.4, shadow: { width: 0.3, depth: 0.25, back: 0.05 } },
        { id: "coat-rack", image: "/rooms/office-80s/props/coat_rack.webp", x: 0.72, z: 0.72, width: 0.236, height: 0.667, gain: 1.4, shadow: { width: 0.22, depth: 0.2, back: 0.02 } },
        // Deliveries: they arrive at the front of the desk, over the file, and come and go with the case (test buttons).
        { id: "envelope-sealed", image: "/rooms/office-80s/props/envelope_sealed.webp", x: -0.0885, z: -0.395, width: 0.1265, height: 0.0877, sink: -0.3198, gain: 1.3, layer: 3, when: { toggle: "envelope", state: "sealed" } },
        { id: "envelope-open", image: "/rooms/office-80s/props/envelope_open.webp", x: -0.0885, z: -0.395, width: 0.1265, height: 0.0899, sink: -0.3198, gain: 1.3, layer: 3, when: { toggle: "envelope", state: "opened" } },
        { id: "bag-sealed", image: "/rooms/office-80s/props/evidencebag_sealed.webp", x: 0.0885, z: -0.395, width: 0.1075, height: 0.0876, sink: -0.3198, gain: 1.3, layer: 3, when: { toggle: "bag", state: "sealed" } },
        { id: "bag-open", image: "/rooms/office-80s/props/evidencebag_open.webp", x: 0.0885, z: -0.395, width: 0.1075, height: 0.0821, sink: -0.3198, gain: 1.3, layer: 3, when: { toggle: "bag", state: "opened" } },
        { id: "report", image: "/rooms/office-80s/props/report.webp", x: 0, z: -0.395, width: 0.1265, height: 0.0873, sink: -0.3142, gain: 1.4, layer: 4, when: { toggle: "report", state: "shown" } },
      ],
      toggles: [
        { id: "envelope", label: "Envelope", states: ["none", "sealed", "opened"] },
        { id: "bag", label: "Evidence bag", states: ["none", "sealed", "opened"] },
        { id: "report", label: "Final report", states: ["none", "shown"] },
      ],
      // Under the lamp's shade, on the desk's far left corner; warm and focused.
      lamp: {
        x: -0.36, y: 0.48, z: -0.67, color: [1.0, 0.82, 0.5], strength: 2.5,
        pool: { x: -0.0885, z: -0.385, lift: 0.3579, width: 0.4554, height: 0.0874, strength: 0.55 },
      },
      hotspots: [
        { kind: "switch", id: "office-switch", yaw: 157.5, pitch: 3.6, label: "Light switch" },
        { kind: "switch", id: "office-lamp", target: "lamp", yaw: -23.2, pitch: 0.5, label: "Desk lamp" },
        { kind: "inspect", id: "office-phone", yaw: -36.3, pitch: -9.7, label: "Telephone", text: "Test hotspot. In the case this opens the phone." },
        { kind: "inspect", id: "office-casefile", yaw: -10.8, pitch: -10.1, label: "Case file from Det. Bennett", text: "Test hotspot. In the case this opens the case file." },
        { kind: "inspect", id: "office-notebook", yaw: 21.0, pitch: -10.3, label: "Notebook", text: "Test hotspot. In the case this opens your notebook." },
        { kind: "inspect", id: "office-recorder", yaw: 37.7, pitch: -11.1, label: "Police interview tapes", text: "Test hotspot. In the case this plays the interview tapes." },
        { kind: "inspect", id: "office-mail", yaw: 36.2, pitch: -3.0, label: "Opened mail", text: "Test hotspot. In the case this shows the mail you have opened." },
        { kind: "inspect", id: "office-board", yaw: 96.4, pitch: 8.1, label: "Murder board", text: "Test hotspot. In the case this opens the murder board." },
        { kind: "inspect", id: "office-map", yaw: 59.6, pitch: 7.1, label: "Street map of Los Angeles", text: "Test hotspot. In the case this opens the map to travel." },
        { kind: "inspect", id: "office-typewriter", yaw: -90, pitch: -9.7, label: "Typewriter: final report", text: "Test hotspot. In the case this is where you type the final report." },
        { kind: "inspect", id: "office-cabinet", yaw: 45, pitch: -9.2, label: "Filing cabinet", text: "Test hotspot. Old case files." },
        { kind: "inspect", id: "office-envelope", yaw: -12.6, pitch: -12.0, label: "Manila envelope", text: "Test hotspot. In the case Patricia's envelope is opened here.", when: { toggle: "envelope", state: "sealed" } },
        { kind: "inspect", id: "office-envelope-open", yaw: -12.6, pitch: -11.9, label: "Envelope from Patricia Wells", text: "Test hotspot. In the case this shows the torn bank statement.", when: { toggle: "envelope", state: "opened" } },
        { kind: "inspect", id: "office-bag", yaw: 12.6, pitch: -12.0, label: "Police evidence bag", text: "Test hotspot. In the case the evidence bag is opened here.", when: { toggle: "bag", state: "sealed" } },
        { kind: "inspect", id: "office-bag-open", yaw: 12.6, pitch: -12.4, label: "The windbreaker", text: "Test hotspot. In the case this shows the bloodstained jacket.", when: { toggle: "bag", state: "opened" } },
        { kind: "inspect", id: "office-report", yaw: 0.0, pitch: -13.1, label: "Final report folder", text: "Test hotspot. In the case this opens the final report.", when: { toggle: "report", state: "shown" } },
        { kind: "inspect", id: "office-labfolder", yaw: 31.1, pitch: -4.9, label: "Lab results", text: "Test hotspot. In the case lab results arrive here when the police lab is done." },
      ],
    };
