import { LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";
import { Pane, Polygon } from "react-leaflet";

import { websocketUserLocation } from "~/store/websocketStore";

interface IFogOfWar {
  worldBounds: LatLngTuple[];
}

const FogOfWar = ({ worldBounds }: IFogOfWar) => {
  const [discoveredAreas, setDiscoveredAreas] = useState([]);
  const [visibleAreas, setVisibleAreas] = useState([]);
  useEffect(() => {
    websocketUserLocation.socket?.on("allDiscoveredByUser", (args) =>
      setDiscoveredAreas(args),
    );
    websocketUserLocation.socket?.on("allVisibleByUser", (args) =>
      setVisibleAreas(args),
    );
    return () => {
      websocketUserLocation.socket?.off("allDiscoveredByUser");
      websocketUserLocation.socket?.off("allVisibleByUser");
    };
  }, []);

  return (
    <>
      <Pane name={"discoveredAreas"}>
        <Polygon
          positions={[worldBounds, ...discoveredAreas]}
          color="black"
          fillOpacity={0.2}
          weight={0}
        />
      </Pane>
      <Pane name={"visibleAreas"}>
        <Polygon
          positions={[worldBounds, ...visibleAreas]}
          color="black"
          fillOpacity={0.5}
          weight={0}
        />
      </Pane>
    </>
  );
};

export default FogOfWar;
