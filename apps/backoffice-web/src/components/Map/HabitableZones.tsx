import { IonRadio, IonRadioGroup } from "@ionic/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import L from "leaflet";
import { DrawEvents, LatLngExpression } from "leaflet";
import { useState, useEffect, useRef } from "react";
import { FeatureGroup, Polygon, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { HabitableZonesTypesEnum, IDtoHabitableZone } from "shared-types";

import HabitableZonesApi from "~/api/habitableZones";
import store from "~/store";
import useMapBounds from "~/utils/useViewBounds.ts";

const POLYGON_COLOR = {
  GOLD: "gold",
  WOOD: "brown",
  IRON: "silver",
} as const;

function HabitableZones() {
  const map = useMap();
  const bounds = useMapBounds(map);
  const { selectedWorldStore } = store;
  const habitableZonesApi = new HabitableZonesApi();

  const [selectedType, setSelectedType] =
    useState<HabitableZonesTypesEnum | null>(null);
  const selectedTypeRef = useRef(selectedType);

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

  const editZoneMutation = useMutation({
    mutationFn: habitableZonesApi.edit,
  });

  const deleteZoneMutation = useMutation({
    mutationFn: habitableZonesApi.delete,
  });

  useEffect(() => {
    selectedTypeRef.current = selectedType;
  }, [selectedType]);

  const handleTypeSelect = (value: HabitableZonesTypesEnum | null) => {
    setSelectedType(() => {
      return value;
    });
  };

  const onCreated = async (e: DrawEvents.Created) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const polygon = {
        type: "Feature",
        geometry: layer.toGeoJSON().geometry,
      };

      try {
        await createZoneMutation.mutateAsync({
          area: polygon.geometry as IDtoHabitableZone["area"],
          worldConfigId: selectedWorldStore.worldId!,
          type: selectedTypeRef.current!, // Use the latest state value from ref
        });
      } catch (error) {
        console.error("Error sending polygons:", error);
      }
    }
  };

  const onEdited = async (e: DrawEvents.Edited) => {
    const { layers } = e;

    layers.eachLayer(async (layer) => {
      // @ts-expect-error unique identifier assigned here from pathOptions prop
      const polygonId = layer.options.id;

      if (layer instanceof L.Polygon) {
        const polygon = {
          type: "Feature",
          geometry: layer.toGeoJSON().geometry,
        };

        try {
          await editZoneMutation.mutateAsync({
            id: polygonId,
            area: polygon.geometry as unknown as IDtoHabitableZone["area"],
            worldConfigId: selectedWorldStore.worldId!,
            type: selectedTypeRef.current!,
          });
        } catch (error) {
          console.error("Error sending polygons:", error);
        }
      }
    });
  };

  const onDeleted = (e: DrawEvents.Deleted) => {
    const { layers } = e;

    layers.eachLayer(async (layer) => {
      // @ts-expect-error unique identifier assigned here from pathOptions prop
      const polygonId = layer.options.id;

      if (layer instanceof L.Polygon) {
        try {
          await deleteZoneMutation.mutateAsync({
            id: polygonId,
          });
        } catch (error) {
          console.error("Error sending polygons:", error);
        }
      }
    });
  };

  return (
    <>
      <div style={{ position: "absolute", top: 200, right: 10, zIndex: 1000 }}>
        <IonRadioGroup
          value={selectedType}
          onIonChange={(e) => handleTypeSelect(e.detail.value)}
        >
          <IonRadio value="GOLD">Gold</IonRadio>
          <br />
          <IonRadio value="WOOD">Wood</IonRadio>
          <br />
          <IonRadio value="IRON">Iron</IonRadio>
          <br />
          <IonRadio value={null}>None</IonRadio>
        </IonRadioGroup>
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
              color={POLYGON_COLOR[item.type] || "green"}
              // @ts-expect-error unique identifier assigned here is later used in onEdited and onDeleted functions
              pathOptions={{ id: item.id }}
            />
          ))}
      </FeatureGroup>
    </>
  );
}

export default HabitableZones;
