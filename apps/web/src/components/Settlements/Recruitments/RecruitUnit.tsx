import { IonPopover, IonRange } from "@ionic/react";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";

import RecruitmentsApi from "~/api/recruitments";
import { IRequestRecruitmentDto } from "~/api/recruitments/dtos";
import { IPrivateSettlementDto } from "~/api/settlements/dtos";
import { ResourcesInfo } from "~/components/ResourcesInfo";
import store from "~/store";
import { UnitType } from "~/types/army";

interface IRecruitUnitProps {
  unitType: (typeof UnitType)[keyof typeof UnitType];
  settlementData: IPrivateSettlementDto;
  unitImage: string;
  refetchRecruitments: () => void;
  refetchSettlement: () => void;
}

export const RecruitUnit: React.FC<IRecruitUnitProps> = ({
  unitType,
  settlementData,
  unitImage,
  refetchRecruitments,
  refetchSettlement,
}) => {
  const { serverConfigStore } = store;
  const recruitmentsApi = new RecruitmentsApi();
  const [unitCount, setUnitCount] = useState<number>(0);

  const mutation = useMutation({
    mutationFn: (data: IRequestRecruitmentDto) =>
      recruitmentsApi.startRecruitment(data),
  });

  const start = async (data: IRequestRecruitmentDto) => {
    await mutation.mutateAsync(data);
    setUnitCount(0);
    return Promise.allSettled([refetchSettlement, refetchRecruitments]);
  };

  const unitCost =
    serverConfigStore.config!.SETTLEMENT[settlementData.type].RECRUITMENT[
      unitType
    ]!.COST;
  const maxUnitsByGold = Math.floor(settlementData.gold / unitCost.gold);
  const maxUnitsByWood = Math.floor(settlementData.wood / unitCost.wood);
  const maxUnits = Math.min(maxUnitsByGold, maxUnitsByWood);
  return (
    <div className="flex items-center gap-2 mx-auto">
      <IonPopover
        trigger={`trigger-${unitType}`}
        triggerAction="hover"
        showBackdrop={false}
      >
        <img src={unitImage} alt={unitType} />
      </IonPopover>
      <img
        id={`trigger-${unitType}`}
        src={unitImage}
        alt={unitType}
        className="h-16 w-16"
      />
      <div className="flex flex-col flex-grow items-center gap-2">
        <ResourcesInfo
          wood={unitCost.wood * unitCount}
          woodMax={settlementData.wood}
          gold={unitCost.gold * unitCount}
          goldMax={settlementData.gold}
        />
        <IonRange
          min={0}
          max={maxUnits}
          step={1}
          value={unitCount}
          onIonInput={(e) => setUnitCount(e.detail.value as number)}
          className="w-full"
        />
      </div>
      <input
        type="number"
        value={unitCount}
        onChange={(e) => setUnitCount(parseInt(e.target.value))}
        className="w-10 text-center"
      />
      <p
        className={"text-cyan-300 hover:cursor-pointer hover:text-cyan-500"}
        onClick={() => setUnitCount(maxUnits)}
      >
        ({maxUnits})
      </p>
      <button
        onClick={() =>
          start({ unitCount, unitType, settlementId: settlementData.id })
        }
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Zrekrutuj
      </button>
    </div>
  );
};
