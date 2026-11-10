# Walkable rooms: how their art is listed

Every case after C001 is played in walkable 3D rooms (WASD or a controller), the way C001's rooms already are. This file is the contract for the art those rooms need: what each picture is, how its prompt is written, and the room record (`rooms` in `art/manifest.json`) that says how big each room is and where every piece goes. Admin's Artwork tab makes the pictures from these entries; a later step builds each case's walk data (`src/game/walk/*.ts`) from the room records.

## Rules for every room

- **Bigger than C001.** C001's rooms feel cramped (most are 14 to 16 feet square, 196 to 256 sq ft). Every new room has about **50% more floor area** than it would have had at C001's scale. A rectangle is fine and often better. Guide: an ordinary room (office, bedroom, living room, kitchen, small shop) 320 to 400 sq ft (18 x 20, 16 x 24, 20 x 20 ft); a small room (bathroom, cell, closet, booth) at least 10 x 12 ft; a large space (newsroom, warehouse, chapel, restaurant, squad room) at least 24 x 32 ft. Hallways at least 6 ft wide. Doorways between rooms at least 3.5 ft wide. Room for up to six players to move without crowding.
- **Ceilings:** 9 ft in homes, 10 to 12 ft in offices and shops, higher where the place calls for it (a church, a warehouse, a Victorian hall).
- **Walls are plain, tileable surfaces.** Nothing is painted on a wall picture. Doors, windows, pictures, boards, signs, shelves, radiators and switches are separate **pieces** placed on the wall in code. So any wall length works and everything lines up.
- **Trim is separate too.** Baseboards, chair rails and crown molding are **trim** textures that code runs all the way around the room at a set height, broken only where a door or opening is. No wall, floor or ceiling picture ever shows trim, corners or the edge of another surface.
- **Lit in code.** No picture has lighting painted in: soft, even, flat light, no cast shadows, no light patches, no lamps switched on, no glow, no sunlight beams. The look line (see below) carries the case's painterly style without its lighting.
- **Furniture and objects are 3D models** made in Meshy, listed as **model** entries. Each has a reference picture (made on Admin, for Meshy's image-to-3D) and a text prompt to copy. Describe every object in its normal, upright position; nothing knocked over or open unless that is the point (the room is arranged in code).
- **Readable words** in any picture are spelled out exactly, in quotes, in the subject ("a brass plate that reads exactly \"DET. BUREAU\""). Everything else is soft and unreadable.
- **American spelling.** No em dashes anywhere.

## Picture kinds

| Kind | Size | Background | What it is |
| --- | --- | --- | --- |
| `wall` | 1024x1024 | opaque | Seamless, tileable plain wall surface, straight on: plaster, wallpaper, paneling, brick, block, tile. |
| `floor` | 1024x1024 | opaque | Seamless, tileable floor looking straight down: boards, tile, linoleum, carpet, concrete, flagstone, ground (dirt, grass, gravel, snow) for outdoor places. |
| `ceiling` | 1024x1024 | opaque | Seamless, tileable ceiling looking straight up, with no fixtures. |
| `trim` | 1536x1024 | opaque | A length of molding seen straight on, filling the image top to bottom and running off both sides, tiling left to right. Code gives it its depth. |
| `piece` | 1024x1536 (tall), 1536x1024 (wide) or 1024x1024 | transparent | One thing on or in a wall, seen straight on and flat: a door, a window, a framed picture, a board, a sign, a wall telephone, a radiator, a light switch, a wall clock. Glass and openings are transparent. |
| `fixture` | 1024x1024 | transparent | A ceiling light seen from directly below, switched off. |
| `outside` | 1536x1024 | opaque | The view through a window or open door, or one side of the surroundings of an outdoor place: just the view, no frame. |
| `model` | 1024x1024 | transparent | Reference picture of one piece of furniture or object for Meshy, plus its Meshy text prompt. |
| `turn` | 1024x1536 | opaque, plain light gray | A person seen from the front, side or back for the 3D character (made from the portrait). Listed automatically for every person. |

Portraits, evidence close-ups, maps, site art and talking-portrait frames stay as they are.

## Ids

All lowercase, letters, digits and underscores. `<case>` is the case prefix (`c002`, `s001c03`, `hallow001`); `<loc>` is the location id from `src/cases/<CASE>/locations.ts`.

- `<case>_<loc>_wall`, and `<case>_<loc>_wall_lower` for a different surface below a chair rail (wainscot, tile)
- `<case>_<loc>_floor`, `<case>_<loc>_ceiling`
- `<case>_<loc>_trim_base`, `<case>_<loc>_trim_rail`, `<case>_<loc>_trim_crown`
- `<case>_<loc>_piece_<name>`, `<case>_<loc>_fixture_<name>`, `<case>_<loc>_outside_<name>`, `<case>_<loc>_model_<name>`

Rooms in the same building may share a wall, floor or trim: list the picture once and name it in each room record.

## Subjects

The subject says only what is special about this picture. The kind adds the framing (tileable, straight on, flat light, transparent background and so on) and the case's look line adds the style, so neither is repeated in the subject. Be concrete: material, color, age, wear, era-correct details, pattern scale ("a small diamond wallpaper pattern, each diamond about two inches across"). For a `model`, say what it is, its materials, colors and real size.

## The room record

```json
{
  "id": "c002_hale_bedroom",
  "case": "C002",
  "location": "hale_bedroom",
  "name": "The Hales' Bedroom",
  "type": "interior",
  "sizeFt": [18, 20, 9],
  "note": "A one-story 1950s stucco house; enter from the hall door in the back wall.",
  "wall": { "image": "c002_hale_bedroom_wall", "tileFt": 4, "lower": "c002_hale_bedroom_wall_lower" },
  "floor": { "image": "c002_hale_bedroom_floor", "tileFt": 4 },
  "ceiling": { "image": "c002_hale_bedroom_ceiling", "tileFt": 4 },
  "trim": {
    "base": { "image": "c002_hale_bedroom_trim_base", "heightIn": 5 },
    "rail": { "image": "c002_hale_bedroom_trim_rail", "atIn": 34, "heightIn": 3 },
    "crown": { "image": "c002_hale_bedroom_trim_crown", "heightIn": 4 }
  },
  "fixtures": [{ "image": "c002_hale_bedroom_fixture_ceiling", "atFt": [9, 10], "sizeFt": [1.5, 1.5], "light": true }],
  "walls": {
    "front": [{ "image": "c002_hale_bedroom_piece_window", "fromLeftFt": 7, "bottomFt": 3, "widthFt": 4, "heightFt": 4.5, "opening": true, "outside": "c002_hale_bedroom_outside_yard" }],
    "back": [{ "image": "c002_hale_bedroom_piece_door_hall", "fromLeftFt": 2, "bottomFt": 0, "widthFt": 3.5, "heightFt": 7, "opening": true }],
    "left": [],
    "right": []
  },
  "models": [{ "image": "c002_hale_bedroom_model_bed", "atFt": [9, 6], "facing": "back", "sizeFt": [5, 6.7, 2] }],
  "people": ["tom"]
}
```

- **Directions:** you come in through the **back** wall and face the **front**; **left** and **right** are as you face the front. A piece's `fromLeftFt` is measured from the left end of that wall as you stand in the room facing it. `atFt` for models and fixtures is `[x, z]`: feet from the left wall and feet from the front wall. `facing` is the wall the model's front faces.
- `opening: true` cuts a hole in the wall behind the piece (doors you walk through, windows you see out of, arches). `outside` names the view seen through it. A door that leads to another room of the case names it in `to` (a location id).
- `type: "exterior"` for outdoor places: `floor` is the ground, there is no `ceiling` or `trim`, `wall` is left out, and `walls.front` and the others each hold one `{ "outside": id }` backdrop (the surroundings in that direction) plus any pieces. Buildings, fences, cars, trees and so on are `model` entries.
- `visit` on a piece or model ("A" or "B") for things that change between visits.
- `reuse`: a room that is the same as an existing built room, such as the agency's own 80s Office for a case set in the 1980s. Give `"reuse": "80s Office"` with `name`, and leave out the rest.
- `people`: character ids (without the case prefix) who can be found here.
- `reuse` with `extras`: a room built once and shared, such as the 2018 Pittsburgh field office (`c003_office`), which C003 and all six S001 cases use. `extras` holds only that case's own things (`models`, and `walls` pieces by side): its deliveries, case file and the series' rolling cork board.

## Extra fields

Used where the basic record can't say enough. The walk builder reads them all.

- **Models:** `elevFt` is how high its base sits off the floor (on a desk, counter or shelf); `on` names the model it sits on, when the height should come from that model; `rotX` tips it (90 lays a chair on its side) while the model itself stays upright; `solid: false` for something flat you walk over; `note` for anything the builder needs to know. For a desk, `facing` is the side the person sitting at it uses.
- **Doors:** `toRoom` on a door piece names the room record it opens into, when one location has more than one room. `doors` on an outdoor room lists models you walk into (`{ "model": id, "to": location, "toRoom": room id }`), such as a site office trailer.
- **Decals:** `decals` lays flat pictures on the floor or ground: `{ "image": id, "atFt": [x, z] centre, "sizeFt": [w, d], "tileFt"?, "rotY"? }`. Lawns and sidewalks over a street's asphalt, a rug, a chalk outline, an oil stain.
- **Outdoor size:** an exterior's `sizeFt` may be just `[width, depth]`, or add a third number for how tall its surroundings stand.
