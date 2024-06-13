import { useMutation, useQuery } from "@tanstack/react-query";
import { LatLngExpression } from "leaflet";
import { useState } from "react";
import { FeatureGroup, Polygon, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

import HabitableZonesApi from "~/api/habitableZones";
import store from "~/store";
import useMapBounds from "~/utils/useViewBounds.ts";

const POLYGON_COLOR = {
  GOLD: "gold",
  WOOD: "brown",
  IRON: "silver",
} as const;

const HabitableZones = () => {
  const [selectedType, setSelectedType] = useState<
    keyof typeof POLYGON_COLOR | null
  >(null);
  const map = useMap();
  const bounds = useMapBounds(map);
  const { selectedWorldStore } = store;
  const habitableZonesApi = new HabitableZonesApi();

  const { data } = useQuery({
    queryKey: ["habitableZonesBounds", bounds],
    queryFn: () =>
      bounds ? habitableZonesApi.getHabitableZones(bounds) : undefined,
    enabled: !!bounds,
    refetchInterval: 5000,
  });

  const createZoneMutation = useMutation({
    mutationFn: habitableZonesApi.create,
  });

  const onCreated = async (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const polygon = {
        type: "Feature",
        geometry: layer.toGeoJSON().geometry,
        properties: {
          name: "Polygon Name",
        },
      };

      try {
        console.log("selectedType", selectedType);
        await createZoneMutation.mutateAsync({
          area: polygon.geometry,
          worldConfigId: selectedWorldStore.worldId,
          type: "GOLD",
        });
      } catch (error) {
        console.error("Error sending polygons:", error);
      }
    }
  };

  const onEdited = (e: any) => {
    console.log("onEdited", e);
    const { layers } = e;
    layers.eachLayer((layer: any) => {
      const polygonId = layer.options.id;
      console.log("polygonId", polygonId);
      const updatedPolygon = layer.getLatLngs();
      // Update polygon in the database here
    });
  };

  const onDeleted = (e: any) => {
    const { layers } = e;
    layers.eachLayer((layer: any) => {
      const deletedPolygon = layer.getLatLngs();
      // Delete polygon from the database here
    });
  };

  console.log(selectedType);
  return (
    <>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
        <label>
          <input
            type="radio"
            value="GOLD"
            checked={selectedType === "GOLD"}
            onChange={() => setSelectedType("GOLD")}
          />
          Gold
        </label>
        <label>
          <input
            type="radio"
            value="WOOD"
            checked={selectedType === "WOOD"}
            onChange={() => setSelectedType("WOOD")}
          />
          Wood
        </label>
        <label>
          <input
            type="radio"
            value="IRON"
            checked={selectedType === "IRON"}
            onChange={() => setSelectedType("IRON")}
          />
          Iron
        </label>
      </div>

      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={onCreated}
          onEdited={onEdited}
          onDeleted={onDeleted}
          draw={{
            rectangle: false,
            circle: false,
            polyline: false,
            circlemarker: false,
            marker: false,
          }}
        />
        {data?.data &&
          data.data.map((item) => (
            <Polygon
              key={item.id}
              positions={[...(item.area as unknown as LatLngExpression[])]}
              color={POLYGON_COLOR[item.type]}
              // @ts-expect-error unique identifier assigned here is later used in onEdited and onDeleted functions
              pathOptions={{ id: item.id }}
            />
          ))}
      </FeatureGroup>
    </>
  );
};

export default HabitableZones;
