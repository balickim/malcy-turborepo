import { Map } from "leaflet";
import { useEffect, useState } from "react";

type Bounds = {
  northEastLat: number;
  northEastLng: number;
  southWestLat: number;
  southWestLng: number;
};

const useMapBounds = (map: Map) => {
  const [bounds, setBounds] = useState<Bounds>({
    northEastLat: 0,
    northEastLng: 0,
    southWestLat: 0,
    southWestLng: 0,
  });

  useEffect(() => {
    const onMapMove = () => {
      const tmpBounds = map.getBounds();
      const northEastLat = tmpBounds.getNorthEast().lat;
      const northEastLng = tmpBounds.getNorthEast().lng;
      const southWestLat = tmpBounds.getSouthWest().lat;
      const southWestLng = tmpBounds.getSouthWest().lng;

      setBounds({ northEastLat, northEastLng, southWestLat, southWestLng });
    };

    onMapMove();
    map.on("moveend", onMapMove);
    return () => {
      map.off("moveend", onMapMove);
    };
  }, [map]);

  return bounds;
};

export default useMapBounds;
