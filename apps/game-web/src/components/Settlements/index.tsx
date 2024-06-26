import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import FogOfWarApi from "~/api/fog-of-war/routes";
import { ISettlementDto } from "~/api/settlements/dtos";
import ContextMenu from "~/components/ContextMenu";
import { CustomMarkerIcon } from "~/components/Settlements/CustomMarkerIcon";
import LookUpSiegeModal from "~/components/Settlements/Modals/LookUpSiegeModal";
import PickUpOrPutDownArmyModal from "~/components/Settlements/Modals/PickUpOrPutDownArmyModal";
import StartSiegeModal from "~/components/Settlements/Modals/StartSiegeModal";
import ViewSettlementModal from "~/components/Settlements/Modals/ViewSettlementModal";
import store from "~/store";
import useMapBounds from "~/utils/useViewBounds.ts";

const Settlements = () => {
  const fogOfWarApi = new FogOfWarApi();
  const { userStore } = store;
  const map = useMap();
  const bounds = useMapBounds(map);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isSiegeModalOpen, setIsSiegeModalOpen] = useState(false);
  const [lookUpModalData, setLookUpModalData] = useState<
    ISettlementDto | undefined
  >();
  const [settlements, setSettlements] = useState<ISettlementDto[]>([]);
  const [openedModal, setOpenedModal] = useState<
    "pick_up" | "put_down" | undefined
  >(undefined);
  const [contextMenuData, setContextMenuData] = useState<
    | { position: { x: number; y: number } | null; settlement: ISettlementDto }
    | undefined
  >(undefined);

  const {
    data: settlementsData,
    isSuccess,
    refetch: refetchSettlementsInBounds,
  } = useQuery({
    queryKey: ["settlementBounds", bounds],
    queryFn: () => (bounds ? fogOfWarApi.getSettlements(bounds) : undefined),
    enabled: !!bounds,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (isSuccess) {
      setSettlements((previous) => {
        const newValues = Array.isArray(settlementsData?.data)
          ? settlementsData?.data
          : [settlementsData?.data];
        const updatedSettlements = new Map(previous.map((s) => [s.id, s]));

        newValues.forEach((nv) => {
          updatedSettlements.set(nv.id, nv);
        });

        return Array.from(updatedSettlements.values());
      });
    }
  }, [isSuccess, settlementsData?.data]);

  const closeModals = useCallback(() => {
    setOpenedModal(undefined);
    setContextMenuData(undefined);
    setLookUpModalData(undefined);
    setIsSettlementModalOpen(false);
    setIsSiegeModalOpen(false);
  }, []);

  const handleMarkerClick = useCallback(
    (settlement: ISettlementDto, event: L.LeafletMouseEvent) => {
      setContextMenuData({ settlement, position: event.containerPoint });
    },
    [],
  );

  const MemoizedMarker = memo(
    ({
      settlement,
      onMarkerClick,
    }: {
      settlement: ISettlementDto;
      onMarkerClick: (event: L.LeafletMouseEvent) => void;
    }) => (
      <Marker
        key={settlement.id}
        position={settlement}
        icon={CustomMarkerIcon({ settlement, userStore })}
        eventHandlers={{
          click: onMarkerClick,
        }}
      />
    ),
  );

  MemoizedMarker.displayName = "MemoizedMarker";

  const renderContextMenu = () => {
    if (!contextMenuData || !contextMenuData.position) return null;

    const isOwn = contextMenuData.settlement.user.id === userStore.user.id;
    return (
      <ContextMenu
        setPosition={(position) =>
          setContextMenuData({ ...contextMenuData, position })
        }
        position={contextMenuData.position}
        items={[
          {
            icon: "assets/modal_info.png",
            onClick: () => setIsSettlementModalOpen(true),
          },
          ...(isOwn
            ? [
                {
                  icon: "assets/malcy_leap_off_hand.png",
                  onClick: () => setOpenedModal("put_down"),
                },
                {
                  icon: "assets/malcy_take_up.webp",
                  onClick: () => setOpenedModal("pick_up"),
                },
              ]
            : []),
          ...(!isOwn
            ? [
                {
                  icon: "assets/start_siege.webp",
                  onClick: () => setIsSiegeModalOpen(true),
                },
              ]
            : []),
        ]}
      />
    );
  };

  const memoizedMarkerClusterGroup = useMemo(
    () => (
      <MarkerClusterGroup chunkedLoading disableClusteringAtZoom={18}>
        {settlements.map((settlement) => (
          <MemoizedMarker
            key={settlement.id}
            settlement={settlement}
            onMarkerClick={(event) => {
              if (settlement.siege) {
                console.log(settlement.siege);
                setLookUpModalData(settlement);
                return;
              }
              handleMarkerClick(settlement, event);
            }}
          />
        ))}
      </MarkerClusterGroup>
    ),
    [settlements, handleMarkerClick, setLookUpModalData],
  );

  return (
    <>
      {memoizedMarkerClusterGroup}

      <ViewSettlementModal
        isOpen={isSettlementModalOpen}
        closeModal={closeModals}
        settlementId={contextMenuData && contextMenuData.settlement.id}
      />
      <PickUpOrPutDownArmyModal
        type={openedModal}
        isOpen={!!openedModal}
        closeModal={closeModals}
        settlementId={contextMenuData && contextMenuData.settlement.id}
      />
      <StartSiegeModal
        isOpen={isSiegeModalOpen}
        closeModal={closeModals}
        settlementId={contextMenuData && contextMenuData.settlement.id}
        refetch={refetchSettlementsInBounds}
      />
      <LookUpSiegeModal
        isOpen={!!lookUpModalData}
        closeModal={closeModals}
        settlement={lookUpModalData}
        refetch={refetchSettlementsInBounds}
      />

      {renderContextMenu()}
    </>
  );
};

export default memo(Settlements);
