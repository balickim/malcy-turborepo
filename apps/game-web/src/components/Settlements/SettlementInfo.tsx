import {
  IonContent,
  IonIcon,
  IonLabel,
  IonRow,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { add, arrowUpCircleOutline, homeSharp } from "ionicons/icons";
import { memo, useState } from "react";
import { ResourceTypeEnum } from "shared-types";

import SettlementsApi from "~/api/settlements";
import { ArmyInfo } from "~/components/ArmyInfo";
import { ResourcesInfo } from "~/components/ResourcesInfo";
import { CurrentUpgrade } from "~/components/Settlements/CurrentUpgrade.tsx";
import { Recruitments } from "~/components/Settlements/Recruitments";
import SettlementDetails from "~/components/Settlements/SettlementDetails";
import BasicModalBodyWrapper from "~/components/ui/BasicModalBodyWrapper";
import Button from "~/components/ui/Button.tsx";
import Tile from "~/components/ui/Tile";
import store from "~/store";

interface ISettlementInfo {
  settlementId?: string;
}

const SettlementInfo = memo(({ settlementId }: ISettlementInfo) => {
  const { userStore, serverConfigStore } = store;
  const settlementsApi = new SettlementsApi();
  const [activeTab, setActiveTab] = useState<string>("settlement");
  const { data, refetch: refetchSettlement } = useQuery({
    queryKey: ["getSettlementById", settlementId],
    queryFn: () =>
      settlementId ? settlementsApi.getSettlementById(settlementId) : undefined,
    enabled: !!settlementId,
    refetchInterval: 5000,
  });
  const settlementData = data?.data;
  const upgradeMutation = useMutation({
    mutationFn: () =>
      settlementsApi.upgradeSettlement({
        settlementId: settlementData?.id ? settlementData?.id : "0",
      }),
  });
  const { data: currentUpgrade, refetch: refetchUpgrade } = useQuery({
    queryKey: ["currentUpgrade", settlementData?.id],
    queryFn: () =>
      settlementData
        ? settlementsApi.getUnfinishedUpgradeBySettlementId(settlementData.id)
        : undefined,
    enabled: !!settlementData,
    refetchInterval: 5000,
  });

  const startUpgrade = async () => {
    await upgradeMutation.mutateAsync().finally(async () => {
      await Promise.allSettled([refetchSettlement(), refetchUpgrade()]);
    });
  };

  if (!settlementData) return null;
  const resourcesCap =
    serverConfigStore.config?.SETTLEMENT[settlementData.type].RESOURCES_CAP;
  const isUserOwner = userStore.user.id === settlementData.user.id;
  return (
    <>
      <IonSegment
        value={activeTab}
        onIonChange={(e) => setActiveTab(e.detail.value as string)}
      >
        <IonSegmentButton value="settlement">
          <IonIcon icon={homeSharp} />
          <IonLabel>Osada</IonLabel>
        </IonSegmentButton>

        <IonSegmentButton value="recruitment" disabled={!isUserOwner}>
          <IonIcon icon={add} />
          <IonLabel>Rekrutacja</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      <IonContent>
        {activeTab === "settlement" && (
          <BasicModalBodyWrapper>
            {currentUpgrade?.data.length ? (
              <Tile>
                <CurrentUpgrade
                  currentUpgrade={currentUpgrade}
                  refetchUpgrade={refetchUpgrade}
                  refetchSettlements={refetchSettlement}
                />
              </Tile>
            ) : null}
            {currentUpgrade?.data.length ? <div className={"my-2"} /> : null}
            <Tile>
              <SettlementDetails
                additionalInfo={
                  <div className="flex flex-col items-end">
                    <ArmyInfo army={settlementData.army} />
                    <ResourcesInfo
                      gold={settlementData.gold}
                      goldMax={resourcesCap && resourcesCap.gold}
                      wood={settlementData.wood}
                      woodMax={resourcesCap && resourcesCap.wood}
                      iron={settlementData.iron}
                      ironMax={resourcesCap && resourcesCap.iron}
                    />
                  </div>
                }
                settlementData={settlementData}
              />
              {serverConfigStore.config?.SETTLEMENT[settlementData.type]
                .NEXT_TYPE ? (
                <IonRow className={"justify-center"}>
                  <Button
                    size={"small"}
                    disabled={
                      upgradeMutation.isPending || !!currentUpgrade?.data.length
                    }
                    onClick={startUpgrade}
                  >
                    Ulepsz{" "}
                    <IonIcon icon={arrowUpCircleOutline} size={"large"} />
                  </Button>
                  <ResourcesInfo
                    gold={
                      serverConfigStore.config?.SETTLEMENT[settlementData.type]
                        .UPGRADE.COST[ResourceTypeEnum.gold]
                    }
                    goldMax={settlementData.gold}
                    iron={
                      serverConfigStore.config?.SETTLEMENT[settlementData.type]
                        .UPGRADE.COST[ResourceTypeEnum.iron]
                    }
                    ironMax={settlementData.iron}
                    wood={
                      serverConfigStore.config?.SETTLEMENT[settlementData.type]
                        .UPGRADE.COST[ResourceTypeEnum.wood]
                    }
                    woodMax={settlementData.wood}
                  />
                </IonRow>
              ) : null}
            </Tile>
          </BasicModalBodyWrapper>
        )}
        {activeTab === "recruitment" && (
          <BasicModalBodyWrapper>
            <Tile>
              <Recruitments
                settlementData={settlementData}
                refetchSettlement={refetchSettlement}
              />
            </Tile>
          </BasicModalBodyWrapper>
        )}
      </IonContent>
    </>
  );
});
SettlementInfo.displayName = "SettlementInfo";

export default SettlementInfo;
