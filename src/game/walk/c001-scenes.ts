import { C001_DANIEL_APARTMENT } from "./c001-apartment";
import { C001_BANK } from "./c001-bank";
import { C001_DINER } from "./c001-diner";
import { C001_GARAGE } from "./c001-garage";
import { C001_HOUSE, type WalkHouse } from "./c001-house";
import { C001_MARGARET_HOUSE } from "./c001-margaret";
import { C001_OFFICE } from "./c001-office";

/** The 3D room for each of a case's locations, where one has been built. */
const SCENES: Record<string, Record<string, WalkHouse>> = {
  C001: {
    office: C001_OFFICE,
    living_room: C001_HOUSE,
    kitchen: C001_HOUSE,
    diner: C001_DINER,
    daniel_apartment: C001_DANIEL_APARTMENT,
    margaret_house: C001_MARGARET_HOUSE,
    robert_garage: C001_GARAGE,
    patricia_office: C001_BANK,
  },
};

export function walkSceneFor(caseId: string, locationId: string): WalkHouse | null {
  return SCENES[caseId]?.[locationId] ?? null;
}
