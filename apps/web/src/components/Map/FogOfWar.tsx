import { LatLngTuple } from "leaflet";
import React, { useEffect, useState } from "react";
import { Pane, Polygon } from "react-leaflet";

import { websocketUserLocation } from "~/store/websocketStore";

interface IFogOfWar {
  cityBounds: LatLngTuple[];
}

const FogOfWar = ({ cityBounds }: IFogOfWar) => {
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
  }, [websocketUserLocation.socket]);

  return (
    <>
      <Pane name={"discoveredArea"}>
        <Polygon
          positions={[cityBounds, discoveredAreas.map((area) => area)]}
          color="black"
          fillOpacity={0.2}
          weight={0}
        />
      </Pane>
      <Pane name={"visibleArea"}>
        <Polygon
          positions={[cityBounds, visibleAreas.map((area) => area)]}
          color="black"
          fillOpacity={0.5}
          weight={0}
        />
      </Pane>
    </>
  );
};

export default FogOfWar;
