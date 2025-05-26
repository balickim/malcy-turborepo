import { useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { toast } from "react-hot-toast";
import { useMap, useMapEvents, Marker } from "react-leaflet";
import { IDTOResponseFindHabitableZonesInBounds } from "shared-types";

import { ISettlementDto } from "~/api/settlements/dtos.ts";
import { IApiResponse } from "~/types/common.ts";
import useIsCoordinateInPolygons from "~/utils/useIsCoordinateInPolygons.ts";
import useIsCoordinateInRadius from "~/utils/useIsCoordinateInRadius.ts";
import { IGeoLocation } from "~/utils/usePlayerPositionWatcher";
import useMapBounds from "~/utils/useViewBounds.ts";

const offset = { x: -50, y: -50 };

interface IDropTargetProps {
  onDrop: (coords: IGeoLocation) => void;
}

const CreateSettlementDragAndDrop: React.FC<IDropTargetProps> = ({
  onDrop,
}) => {
  // const { serverConfigStore } = store;
  const map = useMap();
  const queryClient = useQueryClient();
  const bounds = useMapBounds(map);

  const [previewPosition, setPreviewPosition] = useState<L.LatLng | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const settlementsData: IApiResponse<ISettlementDto[]> | undefined =
    queryClient.getQueryData(["settlementBounds", bounds]);
  const habitableZonesData:
    | IApiResponse<IDTOResponseFindHabitableZonesInBounds[]>
    | undefined = queryClient.getQueryData(["habitableZonesBounds", bounds]);
  const isCoordinateInPolygons = useIsCoordinateInPolygons(
    previewPosition,
    habitableZonesData?.data,
  );
  const isCoordinateInRadius = useIsCoordinateInRadius(
    previewPosition,
    settlementsData?.data,
    5, // 5m - TODO create a config for it
  );
  const isSettlementAllowedToBePlaced =
    isCoordinateInPolygons && !isCoordinateInRadius;

  const [, drop] = useDrop({
    accept: "SETTLEMENT",
    drop: (_item, monitor) => {
      if (!isSettlementAllowedToBePlaced) {
        setIsDragging(false);
        setPreviewPosition(null);
        toast.error(
          "Osady mogą być umieszczane tylko na obszarach nadająych się do życia oraz nie mogą być umieszczane w okolicy innej osady",
        );
        return;
      }
      const sourceClientOffset = monitor.getSourceClientOffset();
      if (sourceClientOffset) {
        const point = map.containerPointToLatLng([
          sourceClientOffset.x + offset.x,
          sourceClientOffset.y + offset.y,
        ]);
        onDrop({ lat: point.lat, lng: point.lng });
        setIsDragging(false);
        setPreviewPosition(null);
      }
    },
    hover: (_item, monitor) => {
      const sourceClientOffset = monitor.getSourceClientOffset();
      if (sourceClientOffset) {
        const point = map.containerPointToLatLng([
          sourceClientOffset.x + offset.x,
          sourceClientOffset.y + offset.y,
        ]);
        setPreviewPosition(point);
        setIsDragging(true);
      }
    },
  });

  useEffect(() => {
    drop(map.getContainer());
  }, [drop, map]);

  useMapEvents({
    move: () => {
      if (isDragging && previewPosition) {
        const newPoint = map.latLngToLayerPoint(previewPosition);
        const newLatLng = map.layerPointToLatLng(newPoint);
        setPreviewPosition(newLatLng);
      }
    },
  });

  const icon = L.divIcon({
    html: `<img src="/assets/settlements/types/mining_town.webp" alt="Preview" class="w-7 h-7 rounded-full" style="${isSettlementAllowedToBePlaced ? "" : "filter: hue-rotate(-10deg) opacity(0.4);"}" />`,
    className: "preview-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return isDragging && previewPosition ? (
    <Marker position={previewPosition} icon={icon} />
  ) : null;
};

export default CreateSettlementDragAndDrop;
