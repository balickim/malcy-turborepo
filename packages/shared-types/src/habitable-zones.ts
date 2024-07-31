export const enum HabitableZonesTypesEnum {
  GOLD = "GOLD",
  WOOD = "WOOD",
  IRON = "IRON",
}

export interface IDtoHabitableZone {
  id: string;
  area: [number, number][];
  worldConfigId: string;
  type: HabitableZonesTypesEnum;
}
