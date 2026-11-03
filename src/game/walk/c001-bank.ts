/*
 * Pacific Crest Savings & Loan as one walkable room (Testing Zone): Patricia Wells's office in the loan department.
 * Facing her desk: the window over Vermont Avenue ahead, the filing cabinets on the left, the notice board
 * on the right, the glass partition onto the lobby behind.
 */
import type { WalkHouse } from "./c001-house";

export const C001_BANK: WalkHouse = {
 "id": "c001_bank",
 "name": "Pacific Crest Savings & Loan",
 "caseId": "C001",
 "eye": 1.673,
 "wall": 0.13,
 "start": [
  0.4,
  1.5,
  0
 ],
 "rooms": [
  {
   "id": "bank",
   "name": "Pacific Crest Savings & Loan",
   "center": [
    0,
    0
   ],
   "size": [
    4.267,
    4.267,
    2.844666666666667
   ],
   "floor": {
    "tex": "/rooms/c001-bank/walk/floor.webp",
    "repeat": 2
   },
   "ceil": {
    "tex": "/rooms/c001-bank/walk/ceil.webp"
   },
   "light": {
    "id": "bank",
    "at": [
     0,
     2.444666666666667,
     0
    ],
    "power": 9,
    "glow": "/rooms/c001-bank/walk/ceil_glow.webp",
    "startOn": true
   },
   "walls": {
    "front": {
     "tex": "/rooms/c001-bank/walk/window.webp",
     "cutout": true,
     "reveals": [
      {
       "rect": [
        0.115,
        0.736,
        0.163,
        0.611
       ],
       "sill": true
      }
     ],
     "outside": {
      "day": "/rooms/c001-bank/walk/outside_day.webp",
      "night": "/rooms/c001-bank/walk/outside_night.webp",
      "distance": 4.5,
      "width": 16,
      "u": 0.42,
      "y": 0.9
     }
    },
    "left": {
     "tex": "/rooms/c001-bank/walk/files.webp"
    },
    "right": {
     "tex": "/rooms/c001-bank/walk/notices.webp"
    },
    "back": {
     "tex": "/rooms/c001-bank/walk/lobby.webp"
    }
   }
  }
 ],
 "passages": [],
 "models": [
  {
   "file": "/rooms/c001-bank/models/desk.glb",
   "size": 1.7,
   "fit": "x",
   "pos": [
    0,
    0,
    -1.25
   ],
   "rotY": 0,
   "shadow": [
    1.8,
    1.0
   ]
  },
  {
   "file": "/rooms/c001-bank/models/chair.glb",
   "size": 1.15,
   "fit": "y",
   "pos": [
    0.05,
    0,
    -1.85
   ],
   "rotY": 0,
   "shadow": [
    0.7,
    0.7
   ]
  },
  {
   "file": "/rooms/c001-bank/models/visitor.glb",
   "size": 0.85,
   "fit": "y",
   "pos": [
    0.45,
    0,
    -0.25
   ],
   "rotY": 180,
   "shadow": [
    0.6,
    0.6
   ]
  },
  {
   "file": "/rooms/c001-bank/models/cabinets.glb",
   "size": 1.4,
   "fit": "x",
   "pos": [
    -1.794,
    0,
    0.45
   ],
   "rotY": 90,
   "shadow": [
    0.75,
    1.5
   ]
  },
  {
   "file": "/rooms/c001-bank/models/ficus.glb",
   "size": 1.55,
   "fit": "y",
   "pos": [
    1.684,
    0,
    -1.684
   ],
   "rotY": 0,
   "shadow": [
    0.7,
    0.7
   ]
  },
  {
   "file": "/rooms/c001-bank/models/lamp.glb",
   "size": 0.42,
   "fit": "y",
   "pos": [
    -0.6,
    0.76,
    -1.4
   ],
   "rotY": 10,
   "lamp": "bank",
   "light": {
    "at": [
     0,
     0.3,
     0.05
    ],
    "power": 1.6
   }
  },
  {
   "file": "/rooms/c001-bank/models/adder.glb",
   "size": 0.26,
   "fit": "x",
   "pos": [
    0.5,
    0.76,
    -1.1
   ],
   "rotY": -10
  },
  {
   "file": "/rooms/c001-bank/models/phone.glb",
   "size": 0.24,
   "fit": "x",
   "pos": [
    -0.2,
    0.76,
    -1.45
   ],
   "rotY": 10
  },
  {
   "file": "/rooms/c001-bank/models/deskset.glb",
   "size": 0.4,
   "fit": "x",
   "pos": [
    0.15,
    0.76,
    -1.0
   ],
   "rotY": 0
  },
  {
   "file": "/rooms/c001-bank/models/patricia.glb",
   "size": 1.68,
   "fit": "y",
   "pos": [
    -0.95,
    0,
    -0.75
   ],
   "rotY": 25,
   "shadow": [
    0.55,
    0.45
   ],
   "talk": "p_patricia",
   "mouth": "/rooms/c001-bank/models/patricia_mouth.png"
  }
 ],
 "hotspots": [
  {
   "id": "p_patricia",
   "kind": "inspect",
   "label": "Patricia Wells",
   "person": "patricia",
   "text": "Patricia Wells: Eleanor's niece and closest family. Loan officer at Pacific Crest.",
   "at": [
    -0.95,
    1.2,
    -0.75
   ]
  },
  {
   "id": "p_files",
   "kind": "inspect",
   "label": "Filing cabinets",
   "text": "Filing cabinets: Four-drawer steel cabinets. The drawer marked 'Trust & Estate Accts' is locked.",
   "at": [
    -1.7335000000000003,
    1.0,
    0.45
   ]
  },
  {
   "id": "p_adder",
   "kind": "inspect",
   "label": "Adding machine",
   "text": "Adding machine: A long paper tape curls from the machine onto the floor: a column of figures, several circled in red.",
   "at": [
    0.5,
    0.88,
    -1.1
   ]
  },
  {
   "id": "p_notices",
   "kind": "inspect",
   "label": "Notice board",
   "text": "Notice board: Rate sheet for August: 30-year fixed, 12.25%. A memo about the new IBM terminals arriving in October.",
   "at": [
    2.084,
    1.707,
    0.512
   ]
  },
  {
   "id": "p-switch",
   "kind": "switch",
   "label": "Light switch",
   "light": "bank",
   "at": [
    -0.64,
    1.3,
    2.084
   ]
  }
 ]
};
