/*
 * The detective's office at Blackwood Investigations as one walkable room (Testing Zone).
 * Facing the desk: the window over Wilshire Boulevard ahead, the murder board and telephone on the left,
 * the street map, filing cabinet and coat stand on the right, the office door behind.
 */
import type { WalkHouse } from "./c001-house";

export const C001_OFFICE: WalkHouse = {
 "id": "c001_office",
 "name": "Detective's Office",
 "caseId": "C001",
 "eye": 1.673,
 "wall": 0.15,
 "start": [
  0.3,
  1.5,
  0
 ],
 "startNight": true,
 "rooms": [
  {
   "id": "office",
   "name": "Detective's Office",
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
    "tex": "/rooms/c001-office/walk/floor.webp",
    "repeat": 2
   },
   "ceil": {
    "tex": "/rooms/c001-office/walk/ceil.webp"
   },
   "light": {
    "id": "office",
    "at": [
     0,
     2.094666666666667,
     0
    ],
    "power": 10,
    "startOn": true
   },
   "walls": {
    "front": {
     "tex": "/rooms/c001-office/walk/window.webp",
     "cutout": true,
     "reveals": [
      {
       "rect": [
        0.08,
        0.8,
        0.17,
        0.635
       ],
       "sill": true
      }
     ],
     "outside": {
      "day": "/rooms/c001-office/walk/outside_day.webp",
      "night": "/rooms/c001-office/walk/outside_night.webp",
      "distance": 6,
      "width": 18,
      "u": 0.45,
      "y": -1.2
     }
    },
    "left": {
     "tex": "/rooms/c001-office/walk/board.webp"
    },
    "right": {
     "tex": "/rooms/c001-office/walk/map.webp"
    },
    "back": {
     "tex": "/rooms/c001-office/walk/door.webp"
    }
   }
  }
 ],
 "passages": [],
 "models": [
  {
   "file": "/rooms/c001-office/models/desk.glb",
   "size": 1.6,
   "fit": "x",
   "pos": [
    0,
    0,
    -1.15
   ],
   "rotY": 0,
   "shadow": [
    1.7,
    1.0
   ]
  },
  {
   "file": "/rooms/c001-office/models/chair.glb",
   "size": 1.0,
   "fit": "y",
   "pos": [
    0.05,
    0,
    -1.9
   ],
   "rotY": 180,
   "shadow": [
    0.7,
    0.7
   ]
  },
  {
   "file": "/rooms/c001-office/models/client.glb",
   "size": 0.95,
   "fit": "y",
   "pos": [
    0.35,
    0,
    -0.05
   ],
   "rotY": 200,
   "shadow": [
    0.6,
    0.6
   ]
  },
  {
   "file": "/rooms/c001-office/models/typewriter.glb",
   "size": 0.45,
   "fit": "x",
   "pos": [
    0.45,
    0.925,
    -1.2
   ],
   "rotY": 180
  },
  {
   "file": "/rooms/c001-office/models/recorder.glb",
   "size": 0.32,
   "fit": "x",
   "pos": [
    -0.55,
    0.925,
    -1.0
   ],
   "rotY": 170
  },
  {
   "file": "/rooms/c001-office/models/casefile.glb",
   "size": 0.34,
   "fit": "x",
   "pos": [
    -0.05,
    0.925,
    -0.97
   ],
   "rotY": 5,
   "rotX": -90
  },
  {
   "file": "/rooms/c001-office/models/notebook.glb",
   "size": 0.22,
   "fit": "x",
   "pos": [
    -0.35,
    0.925,
    -0.9
   ],
   "rotY": -20,
   "rotX": -90
  },
  {
   "file": "/rooms/c001-office/models/mail.glb",
   "size": 0.34,
   "fit": "x",
   "pos": [
    0.65,
    0.925,
    -0.87
   ],
   "rotY": 0
  },
  {
   "file": "/rooms/c001-office/models/lamp.glb",
   "size": 0.45,
   "fit": "y",
   "pos": [
    -0.62,
    0.925,
    -1.37
   ],
   "rotY": 160,
   "lamp": "office",
   "light": {
    "at": [
     0,
     0.35,
     0.05
    ],
    "power": 2.2
   }
  },
  {
   "file": "/rooms/c001-office/models/board.glb",
   "size": 1.55,
   "fit": "x",
   "pos": [
    -2.084,
    1.05,
    0.15
   ],
   "rotY": 90
  },
  {
   "file": "/rooms/c001-office/models/map.glb",
   "size": 1.25,
   "fit": "x",
   "pos": [
    2.084,
    1.1,
    -0.75
   ],
   "rotY": -90
  },
  {
   "file": "/rooms/c001-office/models/cabinet.glb",
   "size": 1.35,
   "fit": "y",
   "pos": [
    1.834,
    0,
    0.95
   ],
   "rotY": -90,
   "shadow": [
    0.6,
    0.7
   ]
  },
  {
   "file": "/rooms/c001-office/models/coatrack.glb",
   "size": 1.8,
   "fit": "y",
   "pos": [
    1.784,
    0,
    1.784
   ],
   "rotY": 0,
   "shadow": [
    0.5,
    0.5
   ]
  },
  {
   "file": "/rooms/c001-office/models/fan.glb",
   "size": 1.15,
   "fit": "x",
   "pos": [
    0,
    2.295,
    0
   ],
   "rotY": 0,
   "lamp": "office",
   "glow": "/rooms/c001-office/models/fan_glow.webp"
  }
 ],
 "hotspots": [
  {
   "id": "o_casefile",
   "kind": "inspect",
   "label": "Case file",
   "text": "Case file from Det. Bennett: The LAPD file on Eleanor Whitmore. Read it to start the investigation.",
   "at": [
    -0.05,
    1.005,
    -0.97
   ]
  },
  {
   "id": "o_board",
   "kind": "inspect",
   "label": "Murder board",
   "text": "Murder board: An empty cork board, a coil of red string and a handful of pins. Evidence you find gets pinned here.",
   "at": [
    -2.0335,
    1.6,
    0.15
   ]
  },
  {
   "id": "o_map",
   "kind": "inspect",
   "label": "Street map",
   "text": "Street map of Los Angeles: Los Feliz, Silver Lake and Atwater Village circled in red. This is how you travel.",
   "at": [
    2.0335,
    1.6,
    -0.75
   ]
  },
  {
   "id": "o_recorder",
   "kind": "inspect",
   "label": "Police interview tapes",
   "text": "Police interview tapes: The statements the guests gave the police on Saturday.",
   "at": [
    -0.55,
    1.045,
    -0.9999999999999999
   ]
  },
  {
   "id": "o_notebook",
   "kind": "inspect",
   "label": "Notebook",
   "text": "Notebook: Everything you have learned, and the contradictions you have caught.",
   "at": [
    -0.35,
    0.975,
    -0.8999999999999999
   ]
  },
  {
   "id": "o_mail",
   "kind": "inspect",
   "label": "Opened mail",
   "text": "Opened mail: Deliveries and lab results land here.",
   "at": [
    0.65,
    1.025,
    -0.8699999999999999
   ]
  },
  {
   "id": "o_typewriter",
   "kind": "inspect",
   "label": "Typewriter",
   "text": "Typewriter: Where the final report gets written, once you know who did it.",
   "at": [
    0.45,
    1.075,
    -1.2
   ]
  },
  {
   "id": "o-switch",
   "kind": "switch",
   "label": "Light switch",
   "light": "office",
   "at": [
    -1.067,
    1.35,
    2.084
   ]
  }
 ]
};
