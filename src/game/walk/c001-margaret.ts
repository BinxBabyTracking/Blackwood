/*
 * Margaret Ellis's living room as one walkable room (Testing Zone), across Hollister Avenue from the Whitmore house.
 * Standing in the middle facing the front window (Eleanor's porch, the jacaranda and the streetlight across the street):
 * the front door on the left, the bookshelves on the right, the dining room arch behind.
 */
import type { WalkHouse } from "./c001-house";

export const C001_MARGARET_HOUSE: WalkHouse = {
 "id": "c001_margaret_house",
 "name": "Margaret Ellis's House",
 "eye": 1.673,
 "wall": 0.13,
 "start": [
  0.6,
  1.1,
  -20
 ],
 "startNight": true,
 "rooms": [
  {
   "id": "margaret",
   "name": "Margaret Ellis's House",
   "center": [
    0,
    0
   ],
   "size": [
    4.115,
    4.115,
    2.743
   ],
   "floor": {
    "tex": "/rooms/c001-margaret/walk/floor.webp",
    "repeat": 2
   },
   "ceil": {
    "tex": "/rooms/c001-margaret/walk/ceil.webp"
   },
   "light": {
    "id": "mg",
    "at": [
     0,
     2.243,
     0
    ],
    "power": 8,
    "startOn": true
   },
   "walls": {
    "front": {
     "tex": "/rooms/c001-margaret/walk/window.webp",
     "cutout": true,
     "reveals": [
      {
       "rect": [
        0.155,
        0.686,
        0.155,
        0.735
       ],
       "sill": true
      }
     ],
     "outside": {
      "day": "/rooms/c001-margaret/walk/outside_day.webp",
      "night": "/rooms/c001-margaret/walk/outside_night.webp",
      "distance": 3.2,
      "width": 8.5,
      "u": 0.33,
      "y": 1.15
     }
    },
    "left": {
     "tex": "/rooms/c001-margaret/walk/door.webp"
    },
    "right": {
     "tex": "/rooms/c001-margaret/walk/books.webp"
    },
    "back": {
     "tex": "/rooms/c001-margaret/walk/back.webp"
    }
   }
  }
 ],
 "passages": [],
 "models": [
  {
   "file": "/rooms/c001-margaret/models/tv.glb",
   "size": 0.85,
   "fit": "x",
   "pos": [
    1.6,
    0,
    1.758
   ],
   "rotY": 180,
   "shadow": [
    0.95,
    0.5
   ]
  },
  {
   "file": "/rooms/c001-margaret/models/armchair.glb",
   "size": 0.95,
   "fit": "y",
   "pos": [
    1.25,
    0,
    -0.35
   ],
   "rotY": 15,
   "shadow": [
    0.95,
    0.95
   ]
  },
  {
   "file": "/rooms/c001-margaret/models/endtable.glb",
   "size": 0.6,
   "fit": "y",
   "pos": [
    1.8,
    0,
    -1.05
   ],
   "rotY": 0,
   "shadow": [
    0.55,
    0.55
   ]
  },
  {
   "file": "/rooms/c001-margaret/models/lamp.glb",
   "size": 0.6,
   "fit": "y",
   "pos": [
    1.8,
    0.6,
    -1.05
   ],
   "rotY": 0,
   "lamp": "mg",
   "glow": "/rooms/c001-margaret/models/lamp_glow.webp",
   "light": {
    "at": [
     0,
     0.45,
     0
    ],
    "power": 2.5
   }
  },
  {
   "file": "/rooms/c001-margaret/models/listings.glb",
   "size": 0.2,
   "fit": "x",
   "pos": [
    1.66,
    0.6,
    -0.92
   ],
   "rotY": 30,
   "rotX": -90
  },
  {
   "file": "/rooms/c001-margaret/models/plant.glb",
   "size": 1.1,
   "fit": "y",
   "pos": [
    -1.7,
    0,
    -1.7
   ],
   "rotY": 0,
   "shadow": [
    0.5,
    0.5
   ]
  },
  {
   "file": "/rooms/c001-margaret/models/cabinet.glb",
   "size": 0.8,
   "fit": "y",
   "pos": [
    -1.55,
    0,
    1.778
   ],
   "rotY": 180,
   "shadow": [
    1.0,
    0.5
   ]
  },
  {
   "file": "/rooms/c001-margaret/models/photo.glb",
   "size": 0.22,
   "fit": "y",
   "pos": [
    -1.8,
    0.543,
    1.728
   ],
   "rotY": 200
  },
  {
   "file": "/rooms/c001-margaret/models/cat.glb",
   "size": 0.6,
   "fit": "x",
   "pos": [
    0.25,
    0,
    0.35
   ],
   "rotY": 40,
   "shadow": [
    0.6,
    0.45
   ]
  },
  {
   "file": "/rooms/c001-margaret/models/margaret.glb",
   "size": 1.62,
   "fit": "y",
   "pos": [
    -0.55,
    0,
    -1.15
   ],
   "rotY": 20,
   "shadow": [
    0.55,
    0.45
   ]
  },
  {
   "file": "/rooms/c001-shared/models/flush_light.glb",
   "size": 0.4,
   "fit": "x",
   "pos": [
    0,
    2.599,
    0
   ],
   "rotY": 0,
   "lamp": "mg",
   "glow": "/rooms/c001-shared/models/flush_light_glow.webp"
  }
 ],
 "hotspots": [
  {
   "id": "m_margaret",
   "kind": "inspect",
   "label": "Margaret Ellis",
   "text": "Margaret Ellis: Retired schoolteacher. She has lived across Hollister Avenue from the Whitmore house for twenty years. \"I've told you everything I can think of. If anything else comes back to me, I'll telephone your office.\"",
   "at": [
    -0.55,
    1.5,
    -1.15
   ]
  },
  {
   "id": "m_window",
   "kind": "inspect",
   "label": "Front window",
   "text": "Front window: Through the lace curtains you can see Eleanor's porch and the jacaranda tree at her curb. The streetlight is directly beside it.",
   "at": [
    -0.329,
    1.55,
    -1.938
   ]
  },
  {
   "id": "m_tv",
   "kind": "inspect",
   "label": "Television",
   "text": "Television: A Zenith console set. A TV Guide lies open at Friday: the late news on Channel 2 ended at 11:30.",
   "at": [
    1.6,
    0.75,
    1.7575
   ]
  },
  {
   "id": "m_photo",
   "kind": "inspect",
   "label": "Framed photograph",
   "text": "Framed photograph: Opening of the reading room at the Hollister branch library, 1983. Eleanor holds the scissors at the ribbon. Margaret stands beside her.",
   "at": [
    -1.8,
    0.7,
    1.728
   ]
  },
  {
   "id": "m_cat",
   "kind": "inspect",
   "label": "Cat",
   "text": "Cat: A large ginger tom, asleep on the rug. He has a habit of being let in late.",
   "at": [
    0.25,
    0.25,
    0.35
   ]
  },
  {
   "id": "m-switch",
   "kind": "switch",
   "label": "Light switch",
   "light": "mg",
   "at": [
    -2.018,
    1.564,
    -0.206
   ]
  }
 ],
 "decals": [
  {
   "tex": "/rooms/c001-margaret/walk/rug.webp",
   "pos": [
    0.1,
    0.25
   ],
   "size": [
    2.6,
    1.73
   ]
  }
 ]
};
