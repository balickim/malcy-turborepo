import { useQuery } from "@tanstack/react-query";
import React from "react";

import RecruitmentsApi from "~/api/recruitments";
import { IPrivateSettlementDto } from "~/api/settlements/dtos";
import { CurrentRecruitments } from "~/components/Settlements/Recruitments/CurrentRecruitments";
import { RecruitUnit } from "~/components/Settlements/Recruitments/RecruitUnit";
import store from "~/store";
import { UnitTypeName } from "~/types/army";

interface IRecruitments {
  settlementData: IPrivateSettlementDto;
  refetchSettlement: () => void;
}

export function Recruitments({
  settlementData,
  refetchSettlement,
}: IRecruitments) {
  const recruitmentsApi = new RecruitmentsApi();
  const { serverConfigStore } = store;
  const { data: currentRecruitments, refetch: refetchRecruitments } = useQuery({
    queryKey: ["currentRecruitments", settlementData.id],
    queryFn: () =>
      recruitmentsApi.getUnfinishedRecruitmentsBySettlementId(
        settlementData.id,
      ),
    refetchInterval: 5000,
  });
  const availableUnits = Object.keys(
    serverConfigStore.config!.SETTLEMENT[settlementData.type].RECRUITMENT,
  );

  return (
    <>
      <CurrentRecruitments
        currentRecruitments={currentRecruitments}
        refetchRecruitments={refetchRecruitments}
        refetchSettlements={refetchSettlement}
      />

      {availableUnits.map((unitType) => (
        <RecruitUnit
          key={unitType}
          unitType={unitType as UnitTypeName}
          settlementData={settlementData}
          unitImage={`/assets/units/${unitType.toLowerCase()}.webp`}
          refetchRecruitments={refetchRecruitments}
          refetchSettlement={refetchSettlement}
        />
      ))}
    </>
  );
}
