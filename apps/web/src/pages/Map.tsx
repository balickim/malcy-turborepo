import { isPlatform } from "@ionic/react";
import L, { LatLngTuple } from "leaflet";
import React, { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { MapContainer, TileLayer } from "react-leaflet";

import ChatWindowOnMap from "~/components/Chat/ChatWindowOnMap";
import DropTarget from "~/components/DropTarget";
import ArmyInfoOnMap from "~/components/Map/ArmyInfoOnMap";
import Buttons from "~/components/Map/Buttons";
import FogOfWar from "~/components/Map/FogOfWar";
import { LocationFinderDummy } from "~/components/Map/LocationFinderDummy";
import { NoPlayerPositionInfo } from "~/components/Map/NoPlayerPositionInfo";
import { OtherPlayersLocationMarker } from "~/components/Map/OtherPlayersLocationsMarkers";
import ResourcesInfoOnMap from "~/components/Map/ResourcesInfoOnMap";
import { UserLocationMarker } from "~/components/Map/UserLocationMarker";
import PageContainer from "~/components/PageContainer";
import Settlements from "~/components/Settlements";
import AddSettlementModal from "~/components/Settlements/Modals/AddSettlementModal";
import { useOthersPlayersPositionsWatcher } from "~/utils/useOtherPlayersPositionsWatcher";
import { usePlayerPositionWatcher } from "~/utils/usePlayerPositionWatcher";
import { useServerConfig } from "~/utils/useServerConfig";
import { useUser } from "~/utils/useUser";

import "leaflet/dist/leaflet.css";

const Map = () => {
  const playerLocation = usePlayerPositionWatcher();
  const otherPlayersPositions = useOthersPlayersPositionsWatcher();
  const serverConfig = useServerConfig({ refetchOnWindowFocus: false });
  useUser({ refetchInterval: 5000 });

  const mapRef = useRef<L.Map>(null);
  const modalAddSettlementRef = useRef<HTMLIonModalElement>(null);
  const [dropCoords, setDropCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const cityBounds: LatLngTuple[] = [
    [53.391874, 14.424565], // south-west
    [53.516425, 14.424565], // north-west
    [53.516425, 14.653759], // north-east
    [53.391874, 14.653759], // south-east
  ];

  const handleDrop = (coords: { lat: number; lng: number }) => {
    if (modalAddSettlementRef.current) {
      setDropCoords(coords);
      modalAddSettlementRef.current.present();
    }
  };

  if (!playerLocation || serverConfig.isFetching) {
    return (
      <PageContainer>
        <NoPlayerPositionInfo />
      </PageContainer>
    );
  }

  return (
    <PageContainer ionContentProps={{ scrollY: false }}>
      <ArmyInfoOnMap />
      <ResourcesInfoOnMap />
      <ChatWindowOnMap />

      <AddSettlementModal
        modalRef={modalAddSettlementRef}
        coords={dropCoords}
      />

      <DndProvider backend={isPlatform("mobile") ? TouchBackend : HTML5Backend}>
        <Buttons mapRef={mapRef} playerLocation={playerLocation} />
        <MapContainer
          ref={mapRef}
          style={{
            height: `calc(100vh - ${isPlatform("mobile") ? "50px" : "57px"})`,
            width: "100%",
          }}
          center={[playerLocation.lat, playerLocation.lng]}
          zoom={18}
          minZoom={13}
          maxZoom={18}
          maxBounds={cityBounds}
          maxBoundsViscosity={1}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <FogOfWar cityBounds={cityBounds} />

          <UserLocationMarker location={playerLocation} />
          <OtherPlayersLocationMarker locations={otherPlayersPositions} />
          <Settlements />
          <DropTarget onDrop={handleDrop} />

          {import.meta.env.DEV ? <LocationFinderDummy /> : null}
        </MapContainer>
      </DndProvider>
    </PageContainer>
  );
};

export default Map;
