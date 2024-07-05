import { Capacitor } from "@capacitor/core";
import {
  IonCol,
  IonGrid,
  IonProgressBar,
  IonRow,
  IonText,
  isPlatform,
} from "@ionic/react";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { MapContainer, TileLayer } from "react-leaflet";

import ChatWindowOnMap from "~/components/Chat/ChatWindowOnMap";
import DropTarget from "~/components/DropTarget";
import Buttons from "~/components/Map/Buttons";
import FogOfWar from "~/components/Map/FogOfWar";
import HabitableZones from "~/components/Map/HabitableZones.tsx";
import { LocationFinderDummy } from "~/components/Map/LocationFinderDummy";
import { OtherPlayersLocationMarker } from "~/components/Map/OtherPlayersLocationsMarkers";
import { UserLocationMarker } from "~/components/Map/UserLocationMarker";
import UserStatsOnMap from "~/components/Map/UserStatsOnMap";
import PageContainer from "~/components/PageContainer";
import Settlements from "~/components/Settlements";
import CreateSettlement from "~/components/Settlements/CreateSettlement";
import store from "~/store";
import { startBackgroundGeolocation } from "~/utils/backgroundGeolocation";
import { useOthersPlayersPositionsWatcher } from "~/utils/useOtherPlayersPositionsWatcher";
import { usePlayerPositionWatcher } from "~/utils/usePlayerPositionWatcher";
import { useUser } from "~/utils/useUser";
import { useWorldConfig } from "~/utils/useWorldConfig.ts";

import "leaflet/dist/leaflet.css";

const Map = () => {
  const playerLocation = usePlayerPositionWatcher();
  const otherPlayersPositions = useOthersPlayersPositionsWatcher();
  const worldConfig = useWorldConfig({ refetchOnWindowFocus: false });
  useUser({ refetchInterval: 5000 });

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      startBackgroundGeolocation(store.userStore.user.id);
    }
  }, []);

  const mapRef = useRef<L.Map>(null);
  const modalAddSettlementRef = useRef<HTMLIonModalElement>(null);
  const [dropCoords, setDropCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleDrop = (coords: { lat: number; lng: number }) => {
    if (modalAddSettlementRef.current) {
      setDropCoords(coords);
      modalAddSettlementRef.current.present();
    }
  };

  if (!playerLocation || worldConfig.isFetching) {
    const part1 = playerLocation ? 50 : 0;
    const part2 = !worldConfig.isFetching ? 50 : 0;

    const ionProgressBarValue = part1 + part2;
    return (
      <PageContainer>
        <div className="flex justify-center items-end h-5/6">
          <IonGrid>
            <IonRow className="ion-align-items-center ion-justify-content-center">
              <IonCol>
                <IonText color={"light"} className="text-2xl animate-pulse">
                  Ładowanie...
                </IonText>
                <IonProgressBar value={ionProgressBarValue}></IonProgressBar>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </PageContainer>
    );
  }

  const cityBounds = worldConfig.data!.data.WORLD_BOUNDS!;
  return (
    <PageContainer ionContentProps={{ scrollY: false }}>
      <CreateSettlement modalRef={modalAddSettlementRef} coords={dropCoords} />

      <DndProvider backend={isPlatform("mobile") ? TouchBackend : HTML5Backend}>
        <MapContainer
          ref={mapRef}
          style={{
            width: "100%",
            height: "100%",
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

          <Buttons mapRef={mapRef} playerLocation={playerLocation} />
          <UserStatsOnMap />
          <ChatWindowOnMap />

          <FogOfWar cityBounds={cityBounds} />
          <HabitableZones />

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
