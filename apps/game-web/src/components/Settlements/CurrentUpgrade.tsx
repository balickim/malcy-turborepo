import { IonButton, IonIcon, IonPopover, IonProgressBar } from "@ionic/react";
import { useMutation } from "@tanstack/react-query";
import { trashOutline } from "ionicons/icons";
import { toast } from "react-hot-toast";
import { ResponseStartUpgradeDto } from "shared-nestjs";

import SettlementsApi from "~/api/settlements";
import { SettlementTypesEnum } from "~/api/settlements/dtos.ts";
import { IApiResponse, IJob } from "~/types/common";

const settlementTypeName = {
  [SettlementTypesEnum.MINING_TOWN]: "Osada wydobywcza",
  [SettlementTypesEnum.CASTLE_TOWN]: "Miasteczko zamkowe",
  [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: "Forteca",
  [SettlementTypesEnum.CAPITOL_SETTLEMENT]: "Kapitol",
};

interface ICurrentUpgrade {
  currentUpgrade?: IApiResponse<IJob<ResponseStartUpgradeDto>[]>;
  refetchUpgrade: () => Promise<unknown>;
  refetchSettlements: () => void;
}

export function CurrentUpgrade({
  currentUpgrade,
  refetchUpgrade,
  refetchSettlements,
}: ICurrentUpgrade) {
  const settlementsApi = new SettlementsApi();

  const recruitmentMutation = useMutation({
    mutationFn: settlementsApi.cancelRecruitment,
  });

  const handleCancel = async (settlementId: string, jobId: number) => {
    return recruitmentMutation
      .mutateAsync({ settlementId, jobId })
      .then((res) => {
        if (res.statusCode === 200) {
          toast.success("Rekrutacja anulowana");
          refetchUpgrade();
          refetchSettlements();
        }
      });
  };

  if (!currentUpgrade) return null;
  return (
    <>
      {currentUpgrade.data.map((upgradeJob) => {
        const endTimeFormatted = new Date(
          upgradeJob.data.finishesOn,
        ).toLocaleTimeString();

        const unitImage = `/assets/settlements/types/${upgradeJob.data.nextSettlementType.toLowerCase()}.webp`;
        return (
          <div
            key={upgradeJob.id}
            className="bg-white shadow-md rounded p-4 max-w-sm w-full mx-auto flex items-center justify-between"
          >
            <IonPopover
              trigger={`trigger-${upgradeJob.data.nextSettlementType.toLowerCase()}`}
              triggerAction="hover"
              showBackdrop={false}
            >
              <img
                src={unitImage}
                alt={upgradeJob.data.nextSettlementType.toLowerCase()}
              />
            </IonPopover>
            <img
              id={`trigger-${upgradeJob.data.nextSettlementType.toLowerCase()}}`}
              src={unitImage}
              alt={upgradeJob.data.nextSettlementType.toLowerCase()}
              className="h-16 w-16"
            />

            <div className="flex-grow mx-4">
              <h2 className="text-lg font-semibold capitalize">
                {settlementTypeName[upgradeJob.data.nextSettlementType]}
              </h2>
              <div className={"flex items-center gap-2"}>
                <IonProgressBar value={upgradeJob.progress / 100} />
              </div>
              <p className="text-gray-700 whitespace-nowrap">
                Dzisiaj o {endTimeFormatted}
              </p>
            </div>

            <IonButton
              onClick={() =>
                handleCancel(upgradeJob.data.settlementId, upgradeJob.id)
              }
              className="text-black"
            >
              <IonIcon
                size="small"
                slot="icon-only"
                className={"text-white"}
                md={trashOutline}
                ios={trashOutline}
              />
            </IonButton>
          </div>
        );
      })}
    </>
  );
}
