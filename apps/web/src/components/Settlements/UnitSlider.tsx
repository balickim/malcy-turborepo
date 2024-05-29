import { IonPopover, IonRange } from "@ionic/react";
import React from "react";

import { UnitType } from "~/types/army";

interface IRecruitUnitProps {
  unitType: (typeof UnitType)[keyof typeof UnitType];
  unitCount: number;
  setUnitCount: (unitCount: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export const UnitSlider: React.FC<IRecruitUnitProps> = ({
  unitType,
  unitCount,
  setUnitCount,
  min,
  max,
  disabled,
}) => {
  const unitImage = `/assets/units/${unitType.toLowerCase()}.webp`;
  return (
    <div className="flex items-center w-full gap-2">
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
      <IonRange
        min={min}
        max={max}
        step={1}
        value={unitCount}
        disabled={disabled}
        onIonInput={(e) => setUnitCount(e.detail.value as number)}
        className="flex-1"
      />
      <input
        type="number"
        value={unitCount}
        onChange={(e) => setUnitCount(parseInt(e.target.value))}
        className="w-10 text-center"
      />
    </div>
  );
};
