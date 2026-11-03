/*
 * Hale Automotive as one walkable room (Testing Zone): Robert Hale's service bay on Fletcher Drive.
 * Facing the street: the open roll-up door ahead, the pegboard and bench on the left, the office wall
 * (work order board) on the right, tire racks and parts shelves behind.
 */
import type { WalkHouse } from "./c001-house";

export const C001_GARAGE: WalkHouse = {
 "id": "c001_garage",
 "name": "Hale Automotive",
 "caseId": "C001",
 "eye": 1.673,
 "wall": 0.2,
 "start": [
  0.2,
  -2.4,
  180
 ],
 "rooms": [
  {
   "id": "garage",
   "name": "Hale Automotive",
   "center": [
    0,
    0
   ],
   "size": [
    7.315,
    7.315,
    4.877
   ],
   "floor": {
    "tex": "/rooms/c001-garage/walk/floor.webp",
    "repeat": 2
   },
   "ceil": {
    "tex": "/rooms/c001-garage/walk/ceil.webp"
   },
   "light": {
    "id": "garage",
    "at": [
     0,
     4.077,
     0
    ],
    "power": 26,
    "glow": "/rooms/c001-garage/walk/ceil_glow.webp",
    "startOn": true
   },
   "walls": {
    "front": {
     "tex": "/rooms/c001-garage/walk/door.webp",
     "cutout": true,
     "reveals": [
      {
       "rect": [
        0.1797,
        0.8184,
        0.2637,
        1.0
       ]
      }
     ],
     "outside": {
      "day": "/rooms/c001-garage/walk/outside_day.webp",
      "night": "/rooms/c001-garage/walk/outside_night.webp",
      "distance": 4.0,
      "width": 22,
      "u": 0.5,
      "y": 2.0
     }
    },
    "left": {
     "tex": "/rooms/c001-garage/walk/pegboard.webp"
    },
    "right": {
     "tex": "/rooms/c001-garage/walk/office.webp"
    },
    "back": {
     "tex": "/rooms/c001-garage/walk/back.webp"
    }
   }
  }
 ],
 "passages": [],
 "models": [
  {
   "file": "/rooms/c001-garage/models/pickup.glb",
   "size": 3.3,
   "fit": "y",
   "pos": [
    0.5,
    0,
    0.5
   ],
   "rotY": 0,
   "shadow": [
    2.4,
    5.0
   ]
  },
  {
   "file": "/rooms/c001-garage/models/drainpan.glb",
   "size": 0.8,
   "fit": "x",
   "pos": [
    0.6,
    0,
    1.1
   ],
   "rotY": 20,
   "solid": false
  },
  {
   "file": "/rooms/c001-garage/models/droplight.glb",
   "size": 0.45,
   "fit": "y",
   "pos": [
    1.25,
    1.2,
    0.6
   ],
   "rotY": 0
  },
  {
   "file": "/rooms/c001-garage/models/bench.glb",
   "size": 2.44,
   "fit": "x",
   "pos": [
    -3.238,
    0,
    0.6
   ],
   "rotY": 90,
   "shadow": [
    0.9,
    2.5
   ]
  },
  {
   "file": "/rooms/c001-garage/models/toolchest.glb",
   "size": 1.05,
   "fit": "y",
   "pos": [
    -3.238,
    0,
    -1.6
   ],
   "rotY": 90,
   "shadow": [
    0.6,
    0.9
   ]
  },
  {
   "file": "/rooms/c001-garage/models/jack.glb",
   "size": 0.75,
   "fit": "x",
   "pos": [
    -0.6,
    0,
    -1.9
   ],
   "rotY": 35,
   "shadow": [
    0.5,
    0.8
   ]
  },
  {
   "file": "/rooms/c001-garage/models/drum.glb",
   "size": 0.9,
   "fit": "y",
   "pos": [
    3.208,
    0,
    -3.208
   ],
   "rotY": 0,
   "shadow": [
    0.7,
    0.7
   ]
  },
  {
   "file": "/rooms/c001-garage/models/tires.glb",
   "size": 0.75,
   "fit": "y",
   "pos": [
    3.107,
    0,
    3.058
   ],
   "rotY": 0,
   "shadow": [
    0.8,
    0.8
   ]
  },
  {
   "file": "/rooms/c001-garage/models/orders.glb",
   "size": 1.1,
   "fit": "y",
   "pos": [
    3.598,
    0.95,
    0.37
   ],
   "rotY": -90
  },
  {
   "file": "/rooms/c001-garage/models/robert.glb",
   "size": 1.8,
   "fit": "y",
   "pos": [
    -1.7,
    0,
    -0.6
   ],
   "rotY": 140,
   "shadow": [
    0.6,
    0.5
   ],
   "talk": "g_robert",
   "mouth": "/rooms/c001-garage/models/robert_mouth.png"
  }
 ],
 "hotspots": [
  {
   "id": "g_robert",
   "kind": "inspect",
   "label": "Robert Hale",
   "person": "robert",
   "text": "Robert Hale: Owns Hale Automotive. Kept Harold Whitmore's trucks running for fifteen years.",
   "at": [
    -1.7,
    1.25,
    -0.6
   ]
  },
  {
   "id": "g_lift",
   "kind": "inspect",
   "label": "Pickup on the lift",
   "text": "On the lift: A 1978 Ford pickup with the oil pan off. A drop light hangs from the frame.",
   "at": [
    0.5,
    1.9,
    -0.9
   ]
  },
  {
   "id": "g_orders",
   "kind": "inspect",
   "label": "Work order board",
   "text": "Work order board: Carbon copies of quotes and work orders on nails. One near the bottom: 'D. Mercer. 1981 Buick LeSabre, dk green. Rear L fender crumpled, quote $240. Declined 6/22.'",
   "at": [
    3.5075000000000003,
    1.4,
    0.37
   ]
  },
  {
   "id": "g_bench",
   "kind": "inspect",
   "label": "Tool bench",
   "text": "Tool bench: Sockets in labeled trays, a radio tuned to the Dodgers, a coffee can full of bolts. Everything has its place.",
   "at": [
    -3.2075,
    1.05,
    0.6
   ]
  }
 ]
};
