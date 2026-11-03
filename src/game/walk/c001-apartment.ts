/*
 * Daniel Mercer's apartment as one walkable room (Testing Zone). Two visits: A (windbreaker on the rack) and B
 * (windbreaker gone, burned scrap in the ashtray). The floor lamp and desk lamp are the room's lights.
 * Standing in the middle facing the big window: the front door on the left, the kitchenette on the right, the desk behind.
 */
import type { WalkHouse } from "./c001-house";

export const C001_DANIEL_APARTMENT: WalkHouse = {
 "id": "c001_daniel_apartment",
 "name": "Daniel Mercer's Apartment",
 "eye": 1.673,
 "wall": 0.13,
 "start": [
  -1.6,
  -1.0,
  100
 ],
 "startNight": true,
 "visits": [
  {
   "id": "A",
   "label": "first"
  },
  {
   "id": "B",
   "label": "second"
  }
 ],
 "rooms": [
  {
   "id": "apartment",
   "name": "Daniel Mercer's Apartment",
   "center": [
    0,
    0
   ],
   "size": [
    4.606,
    4.606,
    2.591
   ],
   "floor": {
    "tex": "/rooms/c001-apartment/walk/floor.webp",
    "repeat": 2
   },
   "ceil": {
    "tex": "/rooms/c001-apartment/walk/ceil.webp"
   },
   "light": {
    "id": "apt",
    "at": [
     1.0,
     1.42,
     -1.45
    ],
    "power": 6,
    "startOn": true
   },
   "walls": {
    "front": {
     "tex": "/rooms/c001-apartment/walk/window.webp",
     "cutout": true,
     "reveals": [
      {
       "rect": [
        0.11,
        0.72,
        0.12,
        0.705
       ],
       "sill": true
      }
     ],
     "outside": {
      "day": "/rooms/c001-apartment/walk/outside_day.webp",
      "night": "/rooms/c001-apartment/walk/outside_night.webp",
      "distance": 3.0,
      "width": 13,
      "u": 0.415,
      "y": 1.1
     }
    },
    "left": {
     "tex": "/rooms/c001-apartment/walk/door.webp"
    },
    "right": {
     "tex": "/rooms/c001-apartment/walk/kitchen.webp",
     "cutout": true,
     "reveals": [
      {
       "rect": [
        0.35,
        0.583,
        0.175,
        0.49
       ]
      }
     ],
     "outside": {
      "day": "/rooms/c001-apartment/walk/outside_day.webp",
      "night": "/rooms/c001-apartment/walk/outside_night.webp",
      "distance": 3.0,
      "width": 13,
      "u": 0.467,
      "y": 1.1
     }
    },
    "back": {
     "tex": "/rooms/c001-apartment/walk/back.webp"
    }
   },
   "location": "daniel_apartment"
  }
 ],
 "passages": [],
 "models": [
  {
   "file": "/rooms/c001-apartment/models/sofa.glb",
   "size": 2.1,
   "fit": "x",
   "pos": [
    -0.39,
    0,
    -1.78
   ],
   "rotY": 0,
   "shadow": [
    2.2,
    1.0
   ]
  },
  {
   "file": "/rooms/c001-apartment/models/coffeetable.glb",
   "size": 0.9,
   "fit": "x",
   "pos": [
    -0.39,
    0,
    -0.65
   ],
   "rotY": 0,
   "shadow": [
    1.0,
    1.0
   ],
   "stretch": [
    1,
    1.48,
    1
   ],
   "opacity": 0.55
  },
  {
   "file": "/rooms/c001-apartment/models/sidetable.glb",
   "size": 0.5,
   "fit": "x",
   "pos": [
    1.0,
    0,
    -2.02
   ],
   "rotY": 0,
   "shadow": [
    0.55,
    0.55
   ]
  },
  {
   "file": "/rooms/c001-apartment/models/floorlamp.glb",
   "size": 1.6,
   "fit": "y",
   "pos": [
    1.0,
    0,
    -1.45
   ],
   "rotY": 0,
   "shadow": [
    0.45,
    0.45
   ],
   "lamp": "apt",
   "glow": "/rooms/c001-apartment/models/floorlamp_glow.webp"
  },
  {
   "file": "/rooms/c001-apartment/models/counter.glb",
   "size": 1.83,
   "fit": "x",
   "pos": [
    2.0,
    0,
    -0.15
   ],
   "rotY": -90,
   "shadow": [
    0.6,
    1.9
   ],
   "stretch": [
    1,
    1.07,
    1
   ]
  },
  {
   "file": "/rooms/c001-apartment/models/desk.glb",
   "size": 1.4,
   "fit": "x",
   "pos": [
    0,
    0,
    1.92
   ],
   "rotY": 180,
   "shadow": [
    1.5,
    0.8
   ],
   "stretch": [
    1,
    1.17,
    1
   ]
  },
  {
   "file": "/rooms/c001-apartment/models/chair.glb",
   "size": 1.0,
   "fit": "y",
   "pos": [
    0.05,
    0,
    1.3
   ],
   "rotY": 0,
   "shadow": [
    0.6,
    0.6
   ]
  },
  {
   "file": "/rooms/c001-apartment/models/desklamp.glb",
   "size": 0.5,
   "fit": "y",
   "pos": [
    0.48,
    0.74,
    2.02
   ],
   "rotY": 200,
   "lamp": "apt",
   "light": {
    "at": [
     0,
     0.3,
     -0.1
    ],
    "power": 2.2
   }
  },
  {
   "file": "/rooms/c001-apartment/models/files.glb",
   "size": 0.45,
   "fit": "x",
   "pos": [
    -0.35,
    0.74,
    1.98
   ],
   "rotY": 0
  },
  {
   "file": "/rooms/c001-apartment/models/rack_a.glb",
   "size": 1.8,
   "fit": "y",
   "pos": [
    -2.0,
    0,
    0.23
   ],
   "rotY": 90,
   "shadow": [
    0.6,
    0.6
   ],
   "visit": "A",
   "showIf": "da_coats_a"
  },
  {
   "file": "/rooms/c001-apartment/models/rack_b.glb",
   "size": 1.8,
   "fit": "y",
   "pos": [
    -2.0,
    0,
    0.23
   ],
   "rotY": 90,
   "shadow": [
    0.6,
    0.6
   ],
   "visit": "B",
   "showIf": "da_coats_b"
  },
  {
   "file": "/rooms/c001-apartment/models/ashtray.glb",
   "size": 0.17,
   "fit": "x",
   "pos": [
    -0.15,
    0.4,
    -0.6
   ],
   "rotY": 0,
   "visit": "B",
   "showIf": "da_ashtray"
  },
  {
   "file": "/rooms/c001-apartment/models/daniel.glb",
   "size": 1.85,
   "fit": "y",
   "pos": [
    0.95,
    0,
    -0.88
   ],
   "rotY": -25,
   "shadow": [
    0.6,
    0.5
   ],
   "talk": "da_daniel",
   "mouth": "/rooms/c001-apartment/models/daniel_mouth.png"
  }
 ],
 "hotspots": [
  {
   "id": "da_daniel",
   "kind": "inspect",
   "label": "Daniel Mercer",
   "text": "Daniel Mercer: Forty-one. Runs a one-man bookkeeping and estate management practice from this apartment.",
   "at": [
    0.95,
    1.28,
    -0.88
   ],
   "person": "daniel"
  },
  {
   "id": "da_hand",
   "kind": "inspect",
   "label": "Daniel's right hand",
   "text": "Daniel's right hand: Daniel keeps his right hand close to his side.",
   "at": [
    0.716,
    0.88,
    -0.945
   ]
  },
  {
   "id": "da_coats_a",
   "kind": "inspect",
   "label": "Coat rack",
   "visit": "A",
   "text": "Coat rack by the door: A gray raincoat, a navy blazer and a tan nylon windbreaker. The windbreaker's right cuff looks darker than the left, and damp, as though it has been rinsed.",
   "at": [
    -1.95,
    1.35,
    0.23
   ]
  },
  {
   "id": "da_coats_b",
   "kind": "inspect",
   "label": "Coat rack",
   "visit": "B",
   "text": "Coat rack by the door: A gray raincoat and a navy blazer. The tan windbreaker that hung here on your last visit is gone.",
   "at": [
    -1.95,
    1.35,
    0.23
   ]
  },
  {
   "id": "da_desk",
   "kind": "inspect",
   "label": "Desk and client files",
   "text": "Client files: Neat stacks of client folders, each labeled. The one marked 'Whitmore' is thin.",
   "at": [
    -0.35,
    0.89,
    1.98
   ]
  },
  {
   "id": "da_ashtray",
   "kind": "inspect",
   "label": "Ashtray",
   "visit": "B",
   "text": "Ashtray: Fresh ash and the curled corner of a typed page. Legible on the scrap: '...ESTATE ACCO...'",
   "at": [
    -0.15,
    0.5,
    -0.6
   ]
  },
  {
   "id": "da-switch",
   "kind": "switch",
   "label": "Light switch",
   "light": "apt",
   "at": [
    -2.263,
    1.451,
    -0.553
   ]
  },
  {
   "id": "da_waste",
   "kind": "inspect",
   "label": "Wastebasket",
   "visit": "A",
   "text": "Wastebasket: Nearly empty. A receipt from Rexall Drugs on Sunset: 'Gauze 4in, adhesive tape, iodine. 8/17/85 9:02 AM.'",
   "at": [
    0.85,
    0.25,
    1.85
   ]
  },
  {
   "id": "da_firstaid",
   "kind": "inspect",
   "label": "First aid tin",
   "visit": "A",
   "text": "First aid tin: Open on the kitchen counter. Gauze, tape, a half-used bottle of iodine.",
   "at": [
    1.9529999999999998,
    0.98,
    0.2
   ]
  },
  {
   "id": "da_suitcase",
   "kind": "inspect",
   "label": "Suitcase",
   "visit": "B",
   "text": "Suitcase: A packed suitcase by the door, airline tag still on the handle from a trip to Phoenix in May.",
   "at": [
    -1.9529999999999998,
    0.35,
    0.85
   ]
  }
 ],
 "caseId": "C001"
};
