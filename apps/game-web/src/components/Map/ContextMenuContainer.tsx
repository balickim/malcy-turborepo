import React from "react";

import { ISettlementDto } from "~/api/settlements/dtos";
import ContextMenu from "~/components/ContextMenu";
import { IModalHandle } from "~/components/ui/BasicModalContainer";
import store from "~/store";

interface IContextMenuProps {
  contextMenuData:
    | { position: { x: number; y: number } | null; settlement: ISettlementDto }
    | undefined;
  setContextMenuData: React.Dispatch<
    React.SetStateAction<
      | {
          position: { x: number; y: number } | null;
          settlement: ISettlementDto;
        }
      | undefined
    >
  >;
  settlementInfoModalRef: React.RefObject<IModalHandle>;
  armyDeploymentModalRef: React.RefObject<IModalHandle>;
  startSiegeModalRef: React.RefObject<IModalHandle>;
  setOpenedModal: React.Dispatch<React.SetStateAction<"pick_up" | "put_down">>;
}

const ContextMenuContainer: React.FC<IContextMenuProps> = ({
  contextMenuData,
  setContextMenuData,
  settlementInfoModalRef,
  armyDeploymentModalRef,
  startSiegeModalRef,
  setOpenedModal,
}) => {
  const { userStore } = store;

  if (!contextMenuData || !contextMenuData.position) return null;

  const isOwn = contextMenuData.settlement.user.id === userStore.user.id;

  return (
    <ContextMenu
      setPosition={(position: { x: number; y: number } | null) =>
        setContextMenuData({ ...contextMenuData, position })
      }
      position={contextMenuData.position}
      items={[
        {
          icon: "assets/modal_info.png",
          onClick: () => settlementInfoModalRef.current?.open(),
        },
        ...(isOwn
          ? [
              {
                icon: "assets/malcy_leap_off_hand.png",
                onClick: () => {
                  armyDeploymentModalRef.current?.open();
                  setOpenedModal("put_down");
                },
              },
              {
                icon: "assets/malcy_take_up.webp",
                onClick: () => {
                  armyDeploymentModalRef.current?.open();
                  setOpenedModal("pick_up");
                },
              },
            ]
          : []),
        ...(!isOwn
          ? [
              {
                icon: "assets/start_siege.webp",
                onClick: () => startSiegeModalRef.current?.open(),
              },
            ]
          : []),
      ]}
    />
  );
};

export default ContextMenuContainer;
