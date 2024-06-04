import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pane, Polygon, useMap } from "react-leaflet";

import FogOfWarApi from "~/api/fog-of-war/routes.ts";
import { IBounds } from "~/types/settlement.ts";

const POLYGON_COLOR = {
  GOLD: "gold",
  WOOD: "brown",
  IRON: "silver",
} as const;

const HabitableZones = () => {
  const fogOfWarApi = new FogOfWarApi();
  const [bounds, setBounds] = useState<IBounds>();
  const map = useMap();
  const { data } = useQuery({
    queryKey: ["habitableZonesBounds", bounds],
    queryFn: () => (bounds ? fogOfWarApi.getHabitableZones(bounds) : undefined),
    enabled: !!bounds,
    refetchInterval: 5000,
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

  if (!data?.data) return null;
  return (
    <Pane name={"zones"}>
      {data.data.map((item) => (
        <Polygon
          key={item.id}
          positions={[...item.area]}
          color={POLYGON_COLOR[item.type]}
        />
      ))}
    </Pane>
  );
};

export default HabitableZones;
