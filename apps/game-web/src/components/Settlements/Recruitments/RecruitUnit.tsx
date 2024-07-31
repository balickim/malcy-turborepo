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
import { StartRecruitmentDto } from "shared-nestjs";
import { UnitType } from "shared-types";

import RecruitmentsApi from "~/api/recruitments";
import { IPrivateSettlementDto } from "~/api/settlements/dtos";
import { ResourcesInfo } from "~/components/ResourcesInfo";
import Button from "~/components/ui/Button";
import store from "~/store";

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
  const [unitCount, setUnitCount] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mutation = useMutation({
    mutationFn: (data: StartRecruitmentDto) =>
      recruitmentsApi.startRecruitment(data),
  });

  const start = async (data: StartRecruitmentDto) => {
    setIsLoading(true);
    await mutation.mutateAsync(data).finally(async () => {
      await Promise.allSettled([refetchSettlement(), refetchRecruitments()]);
      setIsLoading(false);
    });
    setUnitCount(undefined);
  };

  const unitCost =
    serverConfigStore.config!.SETTLEMENT[settlementData.type].RECRUITMENT[
      unitType
    ]!.COST;
  const maxUnitsByGold = Math.floor(settlementData.gold / unitCost.gold);
  const maxUnitsByWood = Math.floor(settlementData.wood / unitCost.wood);
  const maxUnitsByIron = Math.floor(settlementData.iron / unitCost.iron);
  const maxUnits = Math.min(maxUnitsByGold, maxUnitsByWood, maxUnitsByIron);

  return (
    <IonGrid className="mx-auto border-b-2">
      <IonRow className="ion-align-items-center">
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

        <IonCol size="7" className="text-center justify-center">
          <p className="capitalize text-primary font-bold text-nowrap">
            {/* @ts-expect-error aaa */}
            {UNITTYPE_TRANSLATIONS[unitType.toLowerCase()]}
          </p>
          <ResourcesInfo
            wood={unitCost.wood * (unitCount || 0)}
            woodMax={settlementData.wood}
            gold={unitCost.gold * (unitCount || 0)}
            goldMax={settlementData.gold}
            iron={unitCost.iron * (unitCount || 0)}
            ironMax={settlementData.iron}
          />
          <IonRange
            min={0}
            max={maxUnits}
            step={1}
            value={unitCount}
            onIonInput={(e) => setUnitCount(e.detail.value as number)}
            className="w-full hidden md:relative"
          />

          <IonRow className="ion-align-items-center">
            <IonCol size="8">
              <IonInput
                type="number"
                value={unitCount}
                clearInput={true}
                onIonInput={(e) => {
                  const value = e.target.value as string;
                  const formattedValue = value.replace(/^0+/, "");
                  setUnitCount(Number(formattedValue));
                }}
                className="w-full !pl-1 text-start border-2 rounded-lg h-2"
              />
            </IonCol>
            <IonCol size="4">
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

        <IonCol size="3">
          <Button
            onClick={() =>
              start({
                unitCount: unitCount || 0,
                unitType,
                settlementId: settlementData.id,
              })
            }
            isLoading={isLoading}
          >
            <p className="text-xs">Start</p>
          </Button>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
