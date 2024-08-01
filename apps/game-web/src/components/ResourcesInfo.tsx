import { ResourceTypeEnum } from "shared-types";

interface IResources {
  gold?: number;
  goldMax?: number;
  goldMin?: number;
  wood?: number;
  woodMax?: number;
  woodMin?: number;
  iron?: number;
  ironMax?: number;
  ironMin?: number;
}

export function ResourcesInfo({
  gold,
  goldMax,
  goldMin,
  wood,
  woodMax,
  woodMin,
  iron,
  ironMax,
  ironMin,
}: IResources) {
  if (gold === undefined || wood === undefined || iron === undefined)
    return null;

  const resources = [
    { type: ResourceTypeEnum.gold, value: gold, min: goldMin, max: goldMax },
    { type: ResourceTypeEnum.wood, value: wood, min: woodMin, max: woodMax },
    { type: ResourceTypeEnum.iron, value: iron, min: ironMin, max: ironMax },
  ];

  return (
    <div className={"flex gap-2"}>
      {resources.map(({ type, value, min, max }) => (
        <div key={type} className={"flex items-center gap-0.5"}>
          <img
            src={`assets/${type}_icon.webp`}
            alt={type}
            className={"w-4 h-4 rounded-full"}
          />
          <p
            className={`${
              (max && value > max) || (min && value < min) ? "text-red-500" : ""
            }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
