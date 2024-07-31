import { HabitableZonesTypesEnum } from "./habitable-zones";

export interface IDTOResponseFindHabitableZonesInBounds {
  id: string;
  type: HabitableZonesTypesEnum;
  area: [number, number][];
}
