import { IonCol, IonInput, IonPopover, IonRange, IonRow } from "@ionic/react";
import React from "react";

import Button from "~/components/ui/Button.tsx";
import { UnitType } from "~/types/army";

const UNITTYPE_TRANSLATIONS = {
  [UnitType.SWORDSMAN]: "miecznik",
  [UnitType.ARCHER]: "łucznik",
  [UnitType.KNIGHT]: "mroczny rycerz",
  [UnitType.LUCHADOR]: "luczador",
  [UnitType.ARCHMAGE]: "arcymag",
} as const;

interface IRecruitUnitProps {
  unitType: (typeof UnitType)[keyof typeof UnitType];
  unitCount: number;
  setUnitCount: (unitCount: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
  resourcesInfo?: React.ReactNode;
  buttonAction?: { action: () => void; isLoading: boolean };
}

export const UnitSlider: React.FC<IRecruitUnitProps> = ({
  unitType,
  unitCount,
  setUnitCount,
  min,
  max,
  resourcesInfo,
  buttonAction,
}) => {
  const unitImage = `/assets/units/${unitType.toLowerCase()}.webp`;
  return (
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

      <IonCol
        size={buttonAction ? "7" : "10"}
        className="text-center justify-center"
      >
        <p className="capitalize text-primary font-bold text-nowrap">
          {/* @ts-expect-error aaa */}
          {UNITTYPE_TRANSLATIONS[unitType.toLowerCase()]}
        </p>
        {resourcesInfo}
        <IonRange
          min={min}
          max={max}
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
              onClick={() => setUnitCount(max)}
            >
              ({max})
            </p>
          </IonCol>
        </IonRow>
      </IonCol>

      {buttonAction ? (
        <IonCol size="3">
          <Button
            onClick={buttonAction.action}
            isLoading={buttonAction.isLoading}
          >
            <p className="text-xs">Start</p>
          </Button>
        </IonCol>
      ) : null}
    </IonRow>
  );
};
