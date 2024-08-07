import { useQuery } from "@tanstack/react-query";
import { UnitType } from "shared-types";

import RecruitmentsApi from "~/api/recruitments";
import { IPrivateSettlementDto } from "~/api/settlements/dtos";
import { CurrentRecruitments } from "~/components/Settlements/Recruitments/CurrentRecruitments";
import { RecruitUnit } from "~/components/Settlements/Recruitments/RecruitUnit";
import store from "~/store";

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

      <div className="flex flex-col gap-2">
        {availableUnits.map((unitType) => (
          <RecruitUnit
            key={unitType}
            unitType={unitType as UnitType}
            settlementData={settlementData}
            unitImage={`/assets/units/${unitType.toLowerCase()}.webp`}
            refetchRecruitments={refetchRecruitments}
            refetchSettlement={refetchSettlement}
          />
        ))}
      </div>
    </>
  );
}
