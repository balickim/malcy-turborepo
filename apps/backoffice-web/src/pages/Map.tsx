import { isPlatform } from "@ionic/react";
import L from "leaflet";
import { useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { MapContainer, TileLayer } from "react-leaflet";

import HabitableZones from "~/components/Map/HabitableZones.tsx";
import { Loading } from "~/components/Map/Loading.tsx";
import { LocationFinderDummy } from "~/components/Map/LocationFinderDummy";
import PageContainer from "~/components/PageContainer";
import { useWorldConfig } from "~/utils/useWorldConfig.ts";

import "leaflet/dist/leaflet.css";

const Map = () => {
  const worldConfig = useWorldConfig({ refetchOnWindowFocus: false });
  const mapRef = useRef<L.Map>(null);

  if (worldConfig.isFetching) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }

  const cityBounds = worldConfig.data!.data.WORLD_BOUNDS!;
  return (
    <PageContainer ionContentProps={{ scrollY: false }}>
      <DndProvider backend={isPlatform("mobile") ? TouchBackend : HTML5Backend}>
        <MapContainer
          ref={mapRef}
          style={{
            height: `calc(100vh - ${isPlatform("mobile") ? "50px" : "57px"})`,
            width: "100%",
          }}
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

          <HabitableZones />

          {import.meta.env.DEV ? <LocationFinderDummy /> : null}
        </MapContainer>
      </DndProvider>
    </PageContainer>
  );
};

export default Map;
