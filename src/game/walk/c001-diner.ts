/*
 * The Maple Street Diner as one walkable room (Testing Zone). Same format as the house: painted walls with
 * the glass cut out, the parking lot and Sunset Boulevard outside, and Meshy furniture placed in metres.
 * Standing inside the front door: the counter and kitchen pass ahead, the window booths on the left, the jukebox on the right.
 */
import type { WalkHouse } from "./c001-house";

export const C001_DINER: WalkHouse = {
 "id": "c001_diner",
 "name": "Maple Street Diner",
 "eye": 1.673,
 "wall": 0.13,
 "start": [
  0.2,
  1.7,
  0
 ],
 "startNight": true,
 "rooms": [
  {
   "id": "diner",
   "name": "Maple Street Diner",
   "center": [
    0,
    0
   ],
   "size": [
    4.874,
    4.874,
    2.743
   ],
   "floor": {
    "tex": "/rooms/c001-diner/walk/floor.webp",
    "repeat": 2
   },
   "ceil": {
    "tex": "/rooms/c001-diner/walk/ceil.webp"
   },
   "light": {
    "id": "diner",
    "at": [
     0,
     2.2929999999999997,
     0
    ],
    "power": 11,
    "glow": "/rooms/c001-diner/walk/ceil_glow.webp",
    "startOn": true
   },
   "walls": {
    "front": {
     "tex": "/rooms/c001-diner/walk/pass.webp"
    },
    "back": {
     "tex": "/rooms/c001-diner/walk/door.webp",
     "cutout": true,
     "reveals": [
      {
       "rect": [
        0.1615,
        0.3431,
        0.1551,
        0.6736
       ]
      },
      {
       "rect": [
        0.6471,
        0.7839,
        0.1551,
        0.6725
       ]
      }
     ],
     "outside": {
      "day": "/rooms/c001-diner/walk/outside_day.webp",
      "night": "/rooms/c001-diner/walk/outside_night.webp",
      "distance": 3.0,
      "width": 14,
      "u": 0.5,
      "y": 1.4
     }
    },
    "left": {
     "tex": "/rooms/c001-diner/walk/windows.webp",
     "cutout": true,
     "reveals": [
      {
       "rect": [
        0.0475,
        0.3236,
        0.1493,
        0.6887
       ]
      },
      {
       "rect": [
        0.36,
        0.6387,
        0.1528,
        0.6887
       ]
      },
      {
       "rect": [
        0.6758,
        0.9544,
        0.1516,
        0.6887
       ]
      }
     ],
     "outside": {
      "day": "/rooms/c001-diner/walk/outside_day.webp",
      "night": "/rooms/c001-diner/walk/outside_night.webp",
      "distance": 2.5,
      "width": 14,
      "u": 0.5,
      "y": 1.35
     }
    },
    "right": {
     "tex": "/rooms/c001-diner/walk/jukebox.webp"
    }
   }
  }
 ],
 "passages": [],
 "models": [
  {
   "file": "/rooms/c001-diner/models/counter.glb",
   "size": 2.9,
   "fit": "x",
   "pos": [
    0.25,
    0,
    -1.25
   ],
   "rotY": 0,
   "shadow": [
    3.0,
    0.8
   ],
   "stretch": [
    1,
    1.45,
    1.0
   ]
  },
  {
   "file": "/rooms/c001-diner/models/backcounter.glb",
   "size": 2.2,
   "fit": "x",
   "pos": [
    -2.06,
    0,
    -1.32
   ],
   "rotY": 90,
   "shadow": [
    0.8,
    2.3
   ]
  },
  {
   "file": "/rooms/c001-diner/models/coffee.glb",
   "size": 0.5,
   "fit": "y",
   "pos": [
    -2.1,
    0.79,
    -1.7
   ],
   "rotY": 90
  },
  {
   "file": "/rooms/c001-diner/models/register.glb",
   "size": 0.42,
   "fit": "x",
   "pos": [
    1.35,
    1.06,
    -1.3
   ],
   "rotY": 180
  },
  {
   "file": "/rooms/c001-diner/models/spike.glb",
   "size": 0.2,
   "fit": "y",
   "pos": [
    1.0,
    1.06,
    -1.25
   ],
   "rotY": 0
  },
  {
   "file": "/rooms/c001-diner/models/pie.glb",
   "size": 0.55,
   "fit": "x",
   "pos": [
    -0.7,
    1.06,
    -1.3
   ],
   "rotY": 0
  },
  {
   "file": "/rooms/c001-diner/models/jukebox.glb",
   "size": 1.4,
   "fit": "y",
   "pos": [
    2.1,
    0,
    0.35
   ],
   "rotY": -90,
   "shadow": [
    0.7,
    1.0
   ]
  },
  {
   "file": "/rooms/c001-diner/models/booth.glb",
   "size": 1.8,
   "fit": "x",
   "pos": [
    -1.9,
    0,
    1.25
   ],
   "rotY": 90,
   "shadow": [
    1.1,
    1.9
   ]
  },
  {
   "file": "/rooms/c001-diner/models/rosa.glb",
   "size": 1.63,
   "fit": "y",
   "pos": [
    0.3,
    0,
    -1.95
   ],
   "rotY": 0,
   "shadow": [
    0.5,
    0.4
   ],
   "talk": "d_rosa",
   "mouth": "/rooms/c001-diner/models/rosa_mouth.png"
  },
  {
   "file": "/rooms/c001-diner/models/stool.glb",
   "size": 0.74,
   "fit": "y",
   "pos": [
    -0.85,
    0,
    -0.6
   ],
   "rotY": 0,
   "shadow": [
    0.45,
    0.45
   ]
  },
  {
   "file": "/rooms/c001-diner/models/stool.glb",
   "size": 0.74,
   "fit": "y",
   "pos": [
    -0.3,
    0,
    -0.6
   ],
   "rotY": 0,
   "shadow": [
    0.45,
    0.45
   ]
  },
  {
   "file": "/rooms/c001-diner/models/stool.glb",
   "size": 0.74,
   "fit": "y",
   "pos": [
    0.25,
    0,
    -0.6
   ],
   "rotY": 0,
   "shadow": [
    0.45,
    0.45
   ]
  },
  {
   "file": "/rooms/c001-diner/models/stool.glb",
   "size": 0.74,
   "fit": "y",
   "pos": [
    0.8,
    0,
    -0.6
   ],
   "rotY": 0,
   "shadow": [
    0.45,
    0.45
   ]
  },
  {
   "file": "/rooms/c001-diner/models/stool.glb",
   "size": 0.74,
   "fit": "y",
   "pos": [
    1.35,
    0,
    -0.6
   ],
   "rotY": 0,
   "shadow": [
    0.45,
    0.45
   ]
  },
  {
   "file": "/rooms/c001-diner/models/schedule.glb",
   "size": 0.72,
   "fit": "x",
   "pos": [
    1.95,
    1.0,
    -2.4
   ],
   "rotY": 0
  }
 ],
 "hotspots": [
  {
   "id": "d_rosa",
   "kind": "inspect",
   "label": "Rosa Delgado, waitress",
   "text": "Rosa Delgado: The night waitress, a coffee pot in her hand. \"I've got tables waiting. Holler if you need anything else.\"",
   "at": [
    0.3,
    1.15,
    -1.95
   ],
   "person": "rosa"
  },
  {
   "id": "d_schedule",
   "kind": "inspect",
   "label": "Staff schedule",
   "text": "Staff schedule: The week's shifts, pinned beside the kitchen pass.",
   "at": [
    1.95,
    1.4,
    -2.3
   ]
  },
  {
   "id": "d_spike",
   "kind": "inspect",
   "label": "Ticket spike",
   "text": "Ticket spike: Guest checks waiting for the manager. One near the top has writing on the back.",
   "at": [
    1.0,
    1.21,
    -1.25
   ]
  },
  {
   "id": "d_booth",
   "kind": "inspect",
   "label": "Window booth",
   "text": "Window booth: Table six. A clear view of the parking lot and the pay phone on the corner of Maple and Sunset.",
   "at": [
    -1.95,
    0.95,
    1.25
   ]
  },
  {
   "id": "d_pie",
   "kind": "inspect",
   "label": "Pie case",
   "text": "Pie case: Cherry, apple and lemon meringue. Sixty-five cents a slice. The cherry is nearly gone.",
   "at": [
    -0.7,
    1.36,
    -1.3
   ]
  },
  {
   "id": "d_jukebox",
   "kind": "inspect",
   "label": "Jukebox",
   "text": "Jukebox: A chrome Seeburg, three plays for a quarter. Someone has put on the same Hall & Oates song twice.",
   "at": [
    2.05,
    1.15,
    0.35
   ]
  }
 ],
 "caseId": "C001"
};
