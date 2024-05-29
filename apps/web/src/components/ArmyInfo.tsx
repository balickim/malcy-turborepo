import React from "react";

import { TArmy, UnitType } from "~/types/army";

interface IArmy {
  army?: TArmy;
}

export function ArmyInfo({ army }: IArmy) {
  if (!army) return null;

  return (
    <div className={"flex justify-end gap-2"}>
      {Object.values(UnitType).map((unitType) => (
        <div key={unitType} className={"flex items-center gap-0.5"}>
          <img
            src={`assets/units/${unitType}_icon.webp`}
            alt={unitType}
            className={"w-6 h-6 rounded-full"}
          />
          <p className={"text-lg"}>{army[unitType]}</p>
        </div>
      ))}
    </div>
  );
}
