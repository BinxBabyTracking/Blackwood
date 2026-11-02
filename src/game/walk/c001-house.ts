/*
 * The Whitmore File (C001): Eleanor's living room as a walkable 3D room (WASD on a computer, joystick on a phone).
 * Metres, floor at y 0, the room centered on x/z 0, the front wall (door and window) toward -z. Made from the
 * 360° room's images and its 3D furniture. Openings are in each wall's picture coordinates (0 to 1 from its top left,
 * as seen from inside). Built from scripts/testing (bake_box.py configs, render3d/c001_living_room.json).
 */
export type WalkModel = { file: string; size: number; fit: "x" | "y"; pos: number[]; rotX?: number; rotY?: number; opacity?: number; shadow?: number[] };
export type WalkHotspot = { id: string; kind: "inspect" | "switch"; label: string; text?: string; at: number[] };
export type WalkRoom = {
  id: string;
  name: string;
  size: number[];
  eye: number;
  textures: Record<"front" | "back" | "left" | "right" | "floor" | "ceil", string>;
  outside: { day: string; night: string; distance: number; width: number; center: number[] };
  window: number[];
  doorWindow: number[];
  arch: number[][];
  models: WalkModel[];
  hotspots: WalkHotspot[];
};

export const C001_LIVING_WALK: WalkRoom = {
 "id": "c001_living_room",
 "name": "Eleanor's Living Room",
 "size": [
  4.874,
  4.874,
  2.743
 ],
 "eye": 1.673,
 "textures": {
  "front": "/rooms/c001-living-room/walk/front.webp",
  "back": "/rooms/c001-living-room/walk/back.webp",
  "left": "/rooms/c001-living-room/walk/left.webp",
  "right": "/rooms/c001-living-room/walk/right.webp",
  "floor": "/rooms/c001-living-room/walk/floor.webp",
  "ceil": "/rooms/c001-living-room/walk/ceil.webp"
 },
 "outside": {
  "day": "/rooms/c001-living-room/walk/outside_day.webp",
  "night": "/rooms/c001-living-room/walk/outside_night.webp",
  "distance": 2.743,
  "width": 9.875,
  "center": [
   0.623,
   1.618
  ]
 },
 "window": [
  0.4306,
  0.9151,
  0.0831,
  0.6938
 ],
 "doorWindow": [
  0.1005,
  0.2279,
  0.153,
  0.4166
 ],
 "arch": [
  [
   0.2907,
   0.255
  ],
  [
   0.2955,
   0.221
  ],
  [
   0.3002,
   0.2019
  ],
  [
   0.305,
   0.187
  ],
  [
   0.3098,
   0.1743
  ],
  [
   0.3146,
   0.1637
  ],
  [
   0.3194,
   0.153
  ],
  [
   0.3242,
   0.1445
  ],
  [
   0.3289,
   0.1371
  ],
  [
   0.3337,
   0.1307
  ],
  [
   0.3385,
   0.1243
  ],
  [
   0.3433,
   0.118
  ],
  [
   0.3481,
   0.1126
  ],
  [
   0.3529,
   0.1084
  ],
  [
   0.3577,
   0.1031
  ],
  [
   0.3624,
   0.0988
  ],
  [
   0.3672,
   0.0956
  ],
  [
   0.372,
   0.0914
  ],
  [
   0.3768,
   0.0882
  ],
  [
   0.3816,
   0.085
  ],
  [
   0.3864,
   0.0818
  ],
  [
   0.3911,
   0.0797
  ],
  [
   0.3959,
   0.0765
  ],
  [
   0.4007,
   0.0744
  ],
  [
   0.4055,
   0.0723
  ],
  [
   0.4103,
   0.0701
  ],
  [
   0.4151,
   0.068
  ],
  [
   0.4199,
   0.0659
  ],
  [
   0.4246,
   0.0648
  ],
  [
   0.4294,
   0.0627
  ],
  [
   0.4342,
   0.0616
  ],
  [
   0.439,
   0.0606
  ],
  [
   0.4438,
   0.0584
  ],
  [
   0.4486,
   0.0574
  ],
  [
   0.4533,
   0.0574
  ],
  [
   0.4581,
   0.0563
  ],
  [
   0.4629,
   0.0553
  ],
  [
   0.4677,
   0.0542
  ],
  [
   0.4725,
   0.0542
  ],
  [
   0.4773,
   0.0531
  ],
  [
   0.4821,
   0.0531
  ],
  [
   0.4868,
   0.0531
  ],
  [
   0.4916,
   0.0531
  ],
  [
   0.4964,
   0.0531
  ],
  [
   0.5012,
   0.0531
  ],
  [
   0.506,
   0.0531
  ],
  [
   0.5108,
   0.0531
  ],
  [
   0.5156,
   0.0531
  ],
  [
   0.5203,
   0.0542
  ],
  [
   0.5251,
   0.0542
  ],
  [
   0.5299,
   0.0542
  ],
  [
   0.5347,
   0.0553
  ],
  [
   0.5395,
   0.0563
  ],
  [
   0.5443,
   0.0574
  ],
  [
   0.549,
   0.0574
  ],
  [
   0.5538,
   0.0584
  ],
  [
   0.5586,
   0.0595
  ],
  [
   0.5634,
   0.0606
  ],
  [
   0.5682,
   0.0627
  ],
  [
   0.573,
   0.0638
  ],
  [
   0.5778,
   0.0659
  ],
  [
   0.5825,
   0.067
  ],
  [
   0.5873,
   0.0691
  ],
  [
   0.5921,
   0.0712
  ],
  [
   0.5969,
   0.0733
  ],
  [
   0.6017,
   0.0755
  ],
  [
   0.6065,
   0.0776
  ],
  [
   0.6112,
   0.0808
  ],
  [
   0.616,
   0.0829
  ],
  [
   0.6208,
   0.0861
  ],
  [
   0.6256,
   0.0893
  ],
  [
   0.6304,
   0.0925
  ],
  [
   0.6352,
   0.0967
  ],
  [
   0.64,
   0.101
  ],
  [
   0.6447,
   0.1052
  ],
  [
   0.6495,
   0.1095
  ],
  [
   0.6543,
   0.1137
  ],
  [
   0.6591,
   0.119
  ],
  [
   0.6639,
   0.1243
  ],
  [
   0.6687,
   0.1307
  ],
  [
   0.6734,
   0.1371
  ],
  [
   0.6782,
   0.1445
  ],
  [
   0.683,
   0.153
  ],
  [
   0.6878,
   0.1615
  ],
  [
   0.6926,
   0.1722
  ],
  [
   0.6974,
   0.1828
  ],
  [
   0.7022,
   0.1966
  ],
  [
   0.7069,
   0.2125
  ],
  [
   0.7117,
   0.2338
  ],
  [
   0.7165,
   0.2752
  ]
 ],
 "models": [
  {
   "file": "/rooms/c001-living-room/models/sideboard.glb",
   "size": 1.8296,
   "fit": "x",
   "pos": [
    -2.109,
    0.0,
    1.371
   ],
   "rotY": 90,
   "shadow": [
    0.823,
    1.975
   ]
  },
  {
   "file": "/rooms/c001-living-room/models/cake.glb",
   "size": 0.288,
   "fit": "y",
   "pos": [
    -2.109,
    0.941,
    1.975
   ],
   "opacity": 0.6
  },
  {
   "file": "/rooms/c001-living-room/models/plates.glb",
   "size": 0.1783,
   "fit": "x",
   "pos": [
    -2.082,
    0.941,
    1.687
   ]
  },
  {
   "file": "/rooms/c001-living-room/models/tray.glb",
   "size": 0.4114,
   "fit": "x",
   "pos": [
    -2.109,
    0.941,
    1.262
   ],
   "rotY": 90,
   "opacity": 0.6
  },
  {
   "file": "/rooms/c001-living-room/models/bottle.glb",
   "size": 0.3017,
   "fit": "y",
   "pos": [
    -2.109,
    0.941,
    0.823
   ]
  },
  {
   "file": "/rooms/c001-living-room/models/sofa.glb",
   "size": 2.0847,
   "fit": "x",
   "pos": [
    0.549,
    0.0,
    -1.942
   ],
   "shadow": [
    2.304,
    1.152
   ]
  },
  {
   "file": "/rooms/c001-living-room/models/sidetable.glb",
   "size": 1.2618,
   "fit": "y",
   "pos": [
    2.057,
    0.0,
    -2.057
   ],
   "shadow": [
    0.658,
    0.658
   ]
  },
  {
   "file": "/rooms/c001-living-room/models/palm.glb",
   "size": 1.5361,
   "fit": "y",
   "pos": [
    1.92,
    0.0,
    1.92
   ],
   "shadow": [
    0.823,
    0.823
   ]
  },
  {
   "file": "/rooms/c001-living-room/models/desk.glb",
   "size": 1.4264,
   "fit": "x",
   "pos": [
    -1.75,
    0.0,
    -1.152
   ],
   "rotY": 90,
   "shadow": [
    1.371,
    1.591
   ]
  },
  {
   "file": "/rooms/c001-living-room/models/chair.glb",
   "size": 0.4389,
   "fit": "x",
   "pos": [
    -0.713,
    0.0,
    -0.905
   ],
   "rotX": -90,
   "rotY": 25,
   "shadow": [
    0.713,
    0.987
   ]
  },
  {
   "file": "/rooms/c001-living-room/models/glass.glb",
   "size": 0.3566,
   "fit": "x",
   "pos": [
    -0.357,
    0.0,
    -0.384
   ],
   "rotY": -20
  }
 ],
 "hotspots": [
  {
   "id": "lr_sofa",
   "kind": "inspect",
   "label": "Sofa",
   "text": "Where she was found: Police tape marks on the carpet between the sofa and the overturned chair show where Eleanor was found. The sofa cushions are still squared off. Nothing on this side of the room was disturbed.",
   "at": [
    0.549,
    0.466,
    -1.942
   ]
  },
  {
   "id": "lr_chair",
   "kind": "inspect",
   "label": "Overturned chair",
   "text": "Overturned chair: One of the dining chairs, brought in for coffee. It lies on its back.",
   "at": [
    -0.713,
    0.274,
    -0.905
   ]
  },
  {
   "id": "lr_glass",
   "kind": "inspect",
   "label": "Broken glass",
   "text": "Broken glass: Crystal shards on the carpet, a bagged piece beside them with an LAPD tag.",
   "at": [
    -0.357,
    0.027,
    -0.384
   ]
  },
  {
   "id": "lr_ledger",
   "kind": "inspect",
   "label": "Writing desk",
   "text": "Eleanor's writing desk: A roll-top desk. Her household ledger lies open on the blotter.",
   "at": [
    -1.646,
    0.741,
    -1.152
   ]
  },
  {
   "id": "lr_diary",
   "kind": "inspect",
   "label": "Desk diary",
   "text": "Desk diary: A leather desk diary propped open on the shelf above the blotter.",
   "at": [
    -2.057,
    1.015,
    -1.152
   ]
  },
  {
   "id": "lr_drawer",
   "kind": "inspect",
   "label": "Desk filing drawer",
   "text": "Filing drawer: A deep drawer of hanging files, each labeled in Eleanor's handwriting. One gap stands out.",
   "at": [
    -1.371,
    0.329,
    -1.646
   ]
  },
  {
   "id": "lr_sideboard",
   "kind": "inspect",
   "label": "Sideboard",
   "text": "Sideboard: A glass cake stand with a few crumbs of lemon cake, five dessert plates stacked beside it, and a tray of crystal water glasses. One place in the set is empty. A space on the runner where something long lay.",
   "at": [
    -1.783,
    0.494,
    1.371
   ]
  },
  {
   "id": "lr_wine",
   "kind": "inspect",
   "label": "Wine bottle",
   "text": "Wine bottle: A 1979 Burgundy, two-thirds empty. Fingerprint powder on the neck. The police lab report found only Eleanor's prints.",
   "at": [
    -2.109,
    1.097,
    0.823
   ]
  },
  {
   "id": "lr_front_door",
   "kind": "inspect",
   "label": "Front door",
   "text": "Front door: Solid oak, with a deadbolt and a brass chain. No damage. Margaret Ellis let herself in with her spare key at 7:40 on Saturday morning; the door was locked and the chain was off.",
   "at": [
    -1.625,
    1.431,
    -2.4
   ]
  },
  {
   "id": "lr_poker",
   "kind": "inspect",
   "label": "Fireplace tools",
   "text": "Fireplace tools: Poker, brush and shovel, hanging neatly in their stand. A film of dust on all three. The grate holds old, cold ash. No one has lit a fire here since spring.",
   "at": [
    2.4,
    0.731,
    0.859
   ]
  },
  {
   "id": "lr-switch",
   "kind": "switch",
   "label": "Light switch",
   "at": [
    -0.766,
    1.535,
    -2.4
   ]
  },
  {
   "id": "lr_to_kitchen",
   "kind": "inspect",
   "label": "Kitchen",
   "text": "Test hotspot. The kitchen is not built in 360\u00b0 yet; this will walk you through.",
   "at": [
    0.021,
    1.235,
    2.4
   ]
  }
 ]
};
