export const UnitType = {
  SWORDSMAN: "swordsman",
  ARCHER: "archer",
  KNIGHT: "knight",
  LUCHADOR: "luchador",
  ARCHMAGE: "archmage",
} as const;
export type UnitTypeName = (typeof UnitType)[keyof typeof UnitType];

export type TArmy = {
  [unit in UnitTypeName]: number;
};
