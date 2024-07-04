import { ResourceTypeEnum } from "shared-types";

interface IResources {
  gold?: number;
  goldMax?: number;
  wood?: number;
  woodMax?: number;
}

export function ResourcesInfo({ gold, goldMax, wood, woodMax }: IResources) {
  if (gold === undefined || wood === undefined) return null;

  const resources = [
    { type: ResourceTypeEnum.gold, value: gold, max: goldMax },
    { type: ResourceTypeEnum.wood, value: wood, max: woodMax },
  ];

  return (
    <div className={"flex gap-2"}>
      {resources.map(({ type, value, max }) => (
        <div key={type} className={"flex items-center gap-0.5"}>
          <img
            src={`assets/units/${type}_icon.webp`}
            alt={type}
            className={"w-4 h-4 rounded-full"}
          />
          <p className={`${max && value >= max ? "text-red-500" : ""}`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
