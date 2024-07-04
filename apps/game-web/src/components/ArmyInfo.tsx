import { TArmy, UnitType } from "~/types/army";

interface IArmy {
  army?: TArmy;
}

export function ArmyInfo({ army }: IArmy) {
  if (!army) return null;

  return (
    <div className={"flex gap-2"}>
      {Object.values(UnitType).map((unitType) => (
        <div key={unitType} className={"flex items-center gap-0.5"}>
          <img
            src={`assets/units/${unitType}_icon.webp`}
            alt={unitType}
            className={"w-4 h-4 rounded-full"}
          />
          <p>{army[unitType]}</p>
        </div>
      ))}
    </div>
  );
}
