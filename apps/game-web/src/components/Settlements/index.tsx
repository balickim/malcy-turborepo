import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import FogOfWarApi from "~/api/fog-of-war/routes";
import { ISettlementDto } from "~/api/settlements/dtos";
import CreateSettlementDragAndDrop from "~/components/CreateSettlementDragAndDrop.tsx";
import ContextMenuContainer from "~/components/Map/ContextMenuContainer.tsx";
import ArmyDeployment from "~/components/Settlements/ArmyDeployment";
import CreateSettlement from "~/components/Settlements/CreateSettlement.tsx";
import SettlementInfo from "~/components/Settlements/SettlementInfo";
import SiegeInfo from "~/components/Settlements/SiegeInfo";
import StartSiege from "~/components/Settlements/StartSiege";
import BasicModalContainer, {
  IModalHandle,
} from "~/components/ui/BasicModalContainer";
import MemoizedMarker from "~/components/ui/MemoizedMarker";
import store from "~/store";
import { IGeoLocation } from "~/utils/usePlayerPositionWatcher.ts";
import useMapBounds from "~/utils/useViewBounds.ts";

const Settlements = () => {
  const fogOfWarApi = new FogOfWarApi();
  const { serverConfigStore } = store;
  const map = useMap();
  const bounds = useMapBounds(map);
  const startSiegeModalRef = useRef<IModalHandle>(null);
  const settlementInfoModalRef = useRef<IModalHandle>(null);
  const siegeInfoModalRef = useRef<IModalHandle>(null);
  const armyDeploymentModalRef = useRef<IModalHandle>(null);
  const modalAddSettlementRef = useRef<IModalHandle>(null);
  const [dropCoords, setDropCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleDrop = (coords: IGeoLocation) => {
    setDropCoords(coords);
    modalAddSettlementRef.current?.open();
  };

  const [lookUpModalData, setLookUpModalData] = useState<
    ISettlementDto | undefined
  >();
  const [settlements, setSettlements] = useState<ISettlementDto[]>([]);
  const [openedModal, setOpenedModal] = useState<"pick_up" | "put_down">(
    "pick_up",
  );
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

  const handleMarkerClick = useCallback(
    (settlement: ISettlementDto, event: L.LeafletMouseEvent) => {
      setContextMenuData({ settlement, position: event.containerPoint });
    },
    [],
  );

  const memoizedMarkerClusterGroup = useMemo(
    () => (
      <MarkerClusterGroup chunkedLoading disableClusteringAtZoom={18}>
        {settlements.map((settlement) => (
          <MemoizedMarker
            key={settlement.id}
            settlement={settlement}
            radius={
              serverConfigStore.config
                ?.MAX_RADIUS_TO_TAKE_ACTION_METERS as number
            }
            onMarkerClick={(event) => {
              if (settlement.siege) {
                setLookUpModalData(settlement);
                return;
              }
              handleMarkerClick(settlement, event);
            }}
          />
        ))}
      </MarkerClusterGroup>
    ),
    [
      settlements,
      bounds,
      handleMarkerClick,
      setLookUpModalData,
      MemoizedMarker,
    ],
  );

  return (
    <>
      {memoizedMarkerClusterGroup}
      <CreateSettlementDragAndDrop onDrop={handleDrop} />

      <BasicModalContainer
        ref={modalAddSettlementRef}
        head={"Stwórz osadę"}
        body={
          <CreateSettlement
            modalRef={modalAddSettlementRef}
            coords={dropCoords!}
            refetch={refetchSettlementsInBounds}
          />
        }
      />

      <BasicModalContainer
        ref={settlementInfoModalRef}
        head={contextMenuData && contextMenuData.settlement.name}
        body={
          <SettlementInfo
            settlementId={contextMenuData && contextMenuData.settlement.id}
          />
        }
      />

      <BasicModalContainer
        ref={armyDeploymentModalRef}
        head={
          openedModal === "pick_up" ? "Podnieś żołnierzy" : "Upuść żołnierzy"
        }
        body={
          <ArmyDeployment
            type={openedModal}
            settlementId={contextMenuData && contextMenuData.settlement.id}
          />
        }
      />

      <BasicModalContainer
        ref={startSiegeModalRef}
        head={"Rozpocznij oblężenie"}
        body={
          <StartSiege
            refetch={refetchSettlementsInBounds}
            settlementId={contextMenuData && contextMenuData.settlement.id}
          />
        }
      />

      <BasicModalContainer
        ref={siegeInfoModalRef}
        head={"Oblężenie"}
        body={
          <SiegeInfo
            refetch={refetchSettlementsInBounds}
            settlement={lookUpModalData}
          />
        }
      />

      <ContextMenuContainer
        contextMenuData={contextMenuData}
        setContextMenuData={setContextMenuData}
        settlementInfoModalRef={settlementInfoModalRef}
        armyDeploymentModalRef={armyDeploymentModalRef}
        startSiegeModalRef={startSiegeModalRef}
        setOpenedModal={setOpenedModal}
      />
    </>
  );
};

export default memo(Settlements);
