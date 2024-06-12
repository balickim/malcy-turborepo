import { useQuery } from "@tanstack/react-query";
import { LatLngExpression } from "leaflet";
import { useRef, useState } from "react";
import { FeatureGroup, Pane, Polygon, useMap, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

import HabitableZonesApi from "~/api/habitableZones";
import useMapBounds from "~/utils/useViewBounds.ts";

const POLYGON_COLOR = {
  GOLD: "gold",
  WOOD: "brown",
  IRON: "silver",
} as const;

const HabitableZones = () => {
  const map = useMap();
  const bounds = useMapBounds(map);
  const habitableZonesApi = new HabitableZonesApi();
  const [polygons, setPolygons] = useState<any[]>([]);
  const featureGroupRef = useRef<L.FeatureGroup<any>>(null);

  // const handleCreated = (e: any) => {
  //   const layer = e.layer;
  //   const drawnItems = featureGroupRef.current?.toGeoJSON();
  //   console.log(drawnItems);
  //   if (drawnItems) {
  //     setPolygons(drawnItems.features);
  //   }
  // };

  const { data } = useQuery({
    queryKey: ["habitableZonesBounds", bounds],
    queryFn: () =>
      bounds ? habitableZonesApi.getHabitableZones(bounds) : undefined,
    enabled: !!bounds,
    refetchInterval: 5000,
  });

  if (!data?.data) return null;
  return (
    <>
      <Pane name={"zones"}>
        {data.data.map((item) => (
          <Polygon
            key={item.id}
            positions={[...(item.area as unknown as LatLngExpression[])]}
            color={POLYGON_COLOR[item.type]}
          />
        ))}
      </Pane>
      <FeatureGroup ref={featureGroupRef}>
        {polygons.map((polygon, index) => (
          <GeoJSON key={index} data={polygon} />
        ))}
        <EditControl
          position="topright"
          // onCreated={handleCreated}
          draw={{
            rectangle: false,
            circle: false,
            marker: false,
            polyline: false,
            circlemarker: false,
          }}
        />
      </FeatureGroup>
    </>
  );
};

export default HabitableZones;
