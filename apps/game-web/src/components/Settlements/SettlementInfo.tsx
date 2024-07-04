import {
  IonContent,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { homeSharp, add } from "ionicons/icons";
import { memo, useState } from "react";

import SettlementsApi from "~/api/settlements";
import { ArmyInfo } from "~/components/ArmyInfo";
import { ResourcesInfo } from "~/components/ResourcesInfo";
import { Recruitments } from "~/components/Settlements/Recruitments";
import SettlementDetails from "~/components/Settlements/SettlementDetails";
import BasicModalBodyWrapper from "~/components/ui/BasicModalBodyWrapper";
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
                    />
                  </div>
                }
                settlementData={settlementData}
              />
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
