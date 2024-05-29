import React from "react";

import { ResourceTypeEnum } from "~/api/config/dtos";

interface IResources {
  gold?: number;
  goldMax?: number;
  wood?: number;
  woodMax?: number;
}

export function ResourcesInfo(resources: IResources) {
  if (resources.gold === undefined || resources.wood === undefined) return null;

  const gold = ResourceTypeEnum.gold;
  const goldMax = resources.goldMax;
  const wood = ResourceTypeEnum.wood;
  const woodMax = resources.woodMax;

  return (
    <div className={"flex justify-end gap-2"}>
      <div key={gold} className={"flex items-center gap-0.5"}>
        <img
          src={`assets/units/${gold}_icon.webp`}
          alt={gold}
          className={"w-6 h-6 rounded-full"}
        />
        <p
          className={`text-lg ${goldMax && resources[gold] >= goldMax ? "text-red-500" : ""}`}
        >
          {resources[gold]}
        </p>
      </div>

      <div key={wood} className={"flex items-center gap-0.5"}>
        <img
          src={`assets/units/${wood}_icon.webp`}
          alt={wood}
          className={"w-6 h-6 rounded-full"}
        />
        <p
          className={`text-lg ${woodMax && resources[wood] >= woodMax ? "text-red-500" : ""}`}
        >
          {resources[wood]}
        </p>
      </div>
    </div>
  );
}
