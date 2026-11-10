import type { LocationDef } from "@/game/engine/types";

/*
 * CHR001 places. The whole North Pole is one walkable 3D world with no travel
 * map: every place is reached on foot, so none is on a map. Each id matches a
 * room record (chr001_<id>) in art/manifest.json, where its size, surfaces,
 * doors and models are set out (art/WALKABLE.md). Hotspots come with the walk
 * data once the design is approved.
 */

const PLACES: [id: string, name: string, subtitle: string][] = [
  ["bureau_hall", "Silver Bell Bureau", "The front hall"],
  ["jingle_office", "Jingle Division", "The investigators' office"],
  ["village_square", "The Village Square", "The heart of the North Pole"],
  ["tower_workshop", "Aldric's Workshop", "The foot of the clock tower"],
  ["gear_gallery", "The Gear Gallery", "Inside the clock tower"],
  ["chronometer_chamber", "The Chronometer Chamber", "The top of the clock tower"],
  ["tower_cellar", "The Tower Cellar", "Under the clock tower"],
  ["tunnels", "The Steam Tunnels", "Under the village"],
  ["clock_base", "Under the Great Clock", "Inside the plinth"],
  ["toy_floor", "Santa's Workshop", "The toy floor"],
  ["santa_office", "Santa's Office", "Santa's Workshop"],
  ["marigold_office", "Marigold Tinsel's Office", "Santa's Workshop"],
  ["kitchen", "The Great Kitchen", "Santa's Workshop"],
  ["archives", "The Magical Archives", "On the square"],
  ["lab", "The Engineering Lab", "On the square"],
  ["clockmakers_row", "Clockmakers' Row", "Off the square"],
  ["garrick_workshop", "Thorne Clocks", "Clockmakers' Row"],
  ["corwin_shop", "Sleet's Clock Shop", "Clockmakers' Row"],
  ["glassworks", "The Glassworks", "Clockmakers' Row"],
  ["holly_lane", "Holly Lane", "Off the square"],
  ["thorne_parlor", "The Thorne Cottage", "Holly Lane"],
  ["stable_yard", "The Stable Yard", "Off the square"],
  ["stables", "The Reindeer Stables", "The stable yard"],
  ["boiler_room", "The Boiler Room", "Behind the stables"],
  ["hangar", "The Sleigh Hangar", "The stable yard"],
  ["guard_house", "The Guard House", "On the square"],
];

export const LOCATION_IDS = PLACES.map(([id]) => id);

export const locations: LocationDef[] = PLACES.map(([id, name, subtitle]) => ({
  id,
  name,
  subtitle,
  background: `loc.${id}`,
  ambience: `amb.${id}`,
  available: { always: true },
  onMap: false,
  area: "north_pole",
  hotspots: [],
}));
