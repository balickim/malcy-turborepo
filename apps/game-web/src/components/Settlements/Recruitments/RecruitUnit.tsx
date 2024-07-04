import {
  IonCol,
  IonGrid,
  IonInput,
  IonPopover,
  IonRange,
  IonRow,
} from "@ionic/react";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";

import RecruitmentsApi from "~/api/recruitments";
import { IRequestRecruitmentDto } from "~/api/recruitments/dtos";
import { IPrivateSettlementDto } from "~/api/settlements/dtos";
import { ResourcesInfo } from "~/components/ResourcesInfo";
import Button from "~/components/ui/Button";
import store from "~/store";
import { UnitType } from "~/types/army";

interface IRecruitUnitProps {
  unitType: (typeof UnitType)[keyof typeof UnitType];
  settlementData: IPrivateSettlementDto;
  unitImage: string;
  refetchRecruitments: () => void;
  refetchSettlement: () => void;
}

const UNITTYPE_TRANSLATIONS = {
  [UnitType.SWORDSMAN]: "miecznik",
  [UnitType.ARCHER]: "łucznik",
  [UnitType.KNIGHT]: "mroczny rycerz",
  [UnitType.LUCHADOR]: "luczador",
  [UnitType.ARCHMAGE]: "arcymag",
} as const;

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mutation = useMutation({
    mutationFn: (data: IRequestRecruitmentDto) =>
      recruitmentsApi.startRecruitment(data),
  });

  const start = async (data: IRequestRecruitmentDto) => {
    setIsLoading(true);
    await mutation.mutateAsync(data);
    setUnitCount(0);
    await Promise.allSettled([refetchSettlement(), refetchRecruitments()]);
    setIsLoading(false);
  };

  const unitCost =
    serverConfigStore.config!.SETTLEMENT[settlementData.type].RECRUITMENT[
      unitType
    ]!.COST;
  const maxUnitsByGold = Math.floor(settlementData.gold / unitCost.gold);
  const maxUnitsByWood = Math.floor(settlementData.wood / unitCost.wood);
  const maxUnits = Math.min(maxUnitsByGold, maxUnitsByWood);

  return (
    <IonGrid className="mx-auto border-b-2">
      <IonRow class="ion-align-items-center">
        <IonCol size="2">
          <IonPopover
            trigger={`trigger-${unitType.toLowerCase()}`}
            triggerAction="hover"
            showBackdrop={false}
          >
            <img src={unitImage} alt={unitType.toLowerCase()} />
          </IonPopover>
          <img
            id={`trigger-${unitType.toLowerCase()}`}
            src={unitImage}
            alt={unitType}
            className="h-12 w-12"
          />
        </IonCol>

        <IonCol size="5" className="text-center justify-center">
          <p className="capitalize text-primary font-bold text-nowrap">
            {/* @ts-expect-error aaa */}
            {UNITTYPE_TRANSLATIONS[unitType.toLowerCase()]}
          </p>
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
            className="w-full hidden md:relative"
          />

          <IonRow class="ion-align-items-center">
            <IonCol size="6">
              <IonInput
                type="number"
                value={unitCount}
                onIonChange={(e) => setUnitCount(e.target.value as number)}
                className="w-full !pl-1 text-start border-2 rounded-lg"
              />
            </IonCol>
            <IonCol size="6">
              <p
                className={
                  "text-sm text-cyan-300 hover:cursor-pointer hover:text-cyan-500"
                }
                onClick={() => setUnitCount(maxUnits)}
              >
                ({maxUnits})
              </p>
            </IonCol>
          </IonRow>
        </IonCol>

        <IonCol size="5">
          <Button
            onClick={() =>
              start({ unitCount, unitType, settlementId: settlementData.id })
            }
            isLoading={isLoading}
          >
            <p className="text-xs">Zrekrutuj</p>
          </Button>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
