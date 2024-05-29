import { IonButton, IonIcon, IonPopover, IonProgressBar } from "@ionic/react";
import { useMutation } from "@tanstack/react-query";
import { trashOutline } from "ionicons/icons";
import React from "react";
import { toast } from "react-hot-toast";

import RecruitmentsApi from "~/api/recruitments";
import { IResponseRecruitmentDto } from "~/api/recruitments/dtos";
import { IApiResponse, IJob } from "~/types/common";

interface IRecruitment {
  currentRecruitments?: IApiResponse<IJob<IResponseRecruitmentDto>[]>;
  refetchRecruitments: () => Promise<unknown>;
  refetchSettlements: () => void;
}

export function CurrentRecruitments({
  currentRecruitments,
  refetchRecruitments,
  refetchSettlements,
}: IRecruitment) {
  const recruitmentsApi = new RecruitmentsApi();

  const recruitmentMutation = useMutation({
    mutationFn: recruitmentsApi.cancelRecruitment,
  });

  const handleCancel = async (settlementId: string, jobId: number) => {
    return recruitmentMutation
      .mutateAsync({ settlementId, jobId })
      .then((res) => {
        if (res.statusCode === 200) {
          toast.success("Rekrutacja anulowana");
          refetchRecruitments();
          refetchSettlements();
        }
      });
  };

  if (!currentRecruitments) return null;

  const currentRecruitmentsSorted = currentRecruitments?.data.sort((a, b) => {
    return (
      new Date(a.data.finishesOn).getTime() -
      new Date(b.data.finishesOn).getTime()
    );
  });
  return currentRecruitmentsSorted.map((recruitmentJob) => {
    const recruitedUnits = recruitmentJob.progress;
    const totalUnits = recruitmentJob.data.unitCount;
    const endTimeFormatted = new Date(
      recruitmentJob.data.finishesOn,
    ).toLocaleTimeString();

    const unitImage = `assets/units/${recruitmentJob.data.unitType}.webp`;
    const unitType = recruitmentJob.data.unitType;
    return (
      <div
        key={recruitmentJob.id}
        className="bg-white shadow-md rounded p-4 max-w-sm w-full mx-auto flex items-center justify-between"
      >
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
        <div className="flex-grow mx-4">
          <h2 className="text-lg font-semibold">Rekrutacja: {unitType}</h2>
          <div className={"flex items-center gap-2"}>
            <IonProgressBar value={recruitedUnits / totalUnits} />
            <span className={"whitespace-nowrap"}>
              ({recruitedUnits} / {totalUnits})
            </span>
          </div>
          <p className="text-gray-700 whitespace-nowrap">
            Czas zakończenia: {endTimeFormatted}
          </p>
          {/*delay: {recruitmentJob.opts.delay / 1000 / 60}*/}
        </div>
        <IonButton
          onClick={() =>
            handleCancel(recruitmentJob.data.settlementId, recruitmentJob.id)
          }
          className="text-black"
        >
          <IonIcon
            slot="icon-only"
            className={"text-white"}
            md={trashOutline}
            ios={trashOutline}
          />
        </IonButton>
      </div>
    );
  });
}
