import { IonContent, IonModal, IonPopover } from "@ionic/react";
import { useRef } from "react";

import {
  IPrivateSettlementDto,
  SettlementTypesEnum,
} from "~/api/settlements/dtos";

interface ISettlement {
  additionalInfo?: React.ReactNode;
  settlementData: IPrivateSettlementDto;
}

function SettlementDetails(props: ISettlement) {
  const { settlementData, additionalInfo } = props;
  const modal = useRef<HTMLIonModalElement>(null);

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

  const settlementTypeName = {
    [SettlementTypesEnum.MINING_TOWN]: "Osada wydobywcza",
    [SettlementTypesEnum.CASTLE_TOWN]: "Miasteczko zamkowe",
    [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: "Forteca",
    [SettlementTypesEnum.CAPITOL_SETTLEMENT]: "Kapitol",
  };

  return (
    <>
      {additionalInfo}
      <div className="flex flex-col items-center">
        <div className="relative mx-auto flex-shrink-0 flex items-center justify-center h-40 w-40 sm:h-24 sm:w-24 rounded-full overflow-hidden">
          <IonPopover
            trigger={`trigger-${settlementData.type}`}
            triggerAction="hover"
            showBackdrop={false}
          >
            <img
              src={settlementImage[settlementData.type]}
              alt={settlementData.type}
              className="w-full h-full object-cover"
            />
          </IonPopover>
          <img
            id={`trigger-${settlementData.type}`}
            src={settlementImage[settlementData.type]}
            alt={settlementData.type}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
          <h4 className="text-md leading-6 font-medium text-gray-900">
            {settlementTypeName[settlementData.type]}
          </h4>
          <h3 className="text-xl leading-6 font-medium text-gray-900">
            {settlementData.name}
          </h3>
          <p
            className="text-sm mt-1 cursor-pointer text-blue-500"
            id="open-modal"
          >
            {settlementData.user.username}
          </p>
        </div>
      </div>

      <IonModal
        ref={modal}
        trigger="open-modal"
        initialBreakpoint={0.5}
        breakpoints={[0.5, 0.75]}
      >
        <IonContent className="ion-padding">
          <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-4">
            <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
              <h3 className="text-xl leading-6 font-medium text-gray-900">
                {settlementData.user.username}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                User ID: {settlementData.user.id}
              </p>
            </div>
          </div>
        </IonContent>
      </IonModal>
    </>
  );
}

export default SettlementDetails;
