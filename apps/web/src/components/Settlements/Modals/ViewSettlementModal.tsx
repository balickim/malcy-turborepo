import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonPopover,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import React, { memo } from "react";

import SettlementsApi from "~/api/settlements";
import { SettlementTypesEnum } from "~/api/settlements/dtos";
import { ArmyInfo } from "~/components/ArmyInfo";
import { ResourcesInfo } from "~/components/ResourcesInfo";
import { Recruitments } from "~/components/Settlements/Recruitments";
import store from "~/store";

interface IViewSettlementModal {
  isOpen: boolean;
  closeModal: () => void;
  settlementId?: string;
}

const ViewSettlementModal = memo(
  ({ isOpen, closeModal, settlementId }: IViewSettlementModal) => {
    const { userStore, serverConfigStore } = store;
    const settlementImage = {
      [SettlementTypesEnum.MINING_TOWN]:
        "assets/settlements/types/mining_town.webp",
      [SettlementTypesEnum.CASTLE_TOWN]:
        "assets/settlements/types/castle_town.webp",
      [SettlementTypesEnum.FORTIFIED_SETTLEMENT]:
        "assets/settlements/types/fortified_settlement.webp",
      [SettlementTypesEnum.CAPITOL_SETTLEMENT]:
        "assets/settlements/types/capitol_settlement.webp",
    };

    const settlementsApi = new SettlementsApi();
    const { data, refetch: refetchSettlement } = useQuery({
      queryKey: ["getSettlementById", settlementId],
      queryFn: () =>
        settlementId
          ? settlementsApi.getSettlementById(settlementId)
          : undefined,
      enabled: !!settlementId,
      refetchInterval: 5000,
    });
    const settlementData = data?.data;

    if (!settlementData) return null;
    const resourcesCap =
      serverConfigStore.config?.SETTLEMENT[settlementData.type].RESOURCES_CAP;
    const isOwn = userStore.user.id === settlementData.user.id;
    return (
      <IonModal isOpen={isOpen} onWillDismiss={() => closeModal()}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => closeModal()}>Cancel</IonButton>
            </IonButtons>
            <IonTitle>{settlementData?.name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {isOwn ? <ArmyInfo army={settlementData.army} /> : null}
          {isOwn ? (
            <ResourcesInfo
              gold={settlementData.gold}
              goldMax={resourcesCap && resourcesCap.gold}
              wood={settlementData.wood}
              woodMax={resourcesCap && resourcesCap.wood}
            />
          ) : null}

          <div className="flex">
            <div className="inline-block w-full align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mt-2 sm:mt-0 sm:ml-4">
                  <h4 className="text-lg leading-6 font-medium text-gray-900">
                    User Profile
                  </h4>
                  <p className="text-sm text-gray-500">
                    username: {settlementData.user.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    user id: {settlementData.user.id}
                  </p>
                </div>

                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                      <IonPopover
                        trigger={`trigger-${settlementData.type}`}
                        triggerAction="hover"
                        showBackdrop={false}
                      >
                        <img
                          src={settlementImage[settlementData.type]}
                          alt={settlementData.type}
                        />
                      </IonPopover>
                      <img
                        id={`trigger-${settlementData.type}`}
                        src={settlementImage[settlementData.type]}
                        alt={settlementData.type}
                        className="max-h-40 mx-auto rounded-full"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        {settlementData.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        settlement id: {settlementData.id}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Type: {settlementData.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isOwn ? (
            <Recruitments
              settlementData={settlementData}
              refetchSettlement={refetchSettlement}
            />
          ) : null}
        </IonContent>
      </IonModal>
    );
  },
);
ViewSettlementModal.displayName = "ViewSettlementModal";

export default ViewSettlementModal;
