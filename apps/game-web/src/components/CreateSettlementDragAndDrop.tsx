import L from "leaflet";
import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { useMap, useMapEvents, Marker } from "react-leaflet";

import { IGeoLocation } from "~/utils/usePlayerPositionWatcher";

interface IDropTargetProps {
  onDrop: (coords: IGeoLocation) => void;
}

const CreateSettlementDragAndDrop: React.FC<IDropTargetProps> = ({
  onDrop,
}) => {
  const map = useMap();
  const [previewPosition, setPreviewPosition] = useState<L.LatLng | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [, drop] = useDrop({
    accept: "SETTLEMENT",
    drop: (_item, monitor) => {
      const sourceClientOffset = monitor.getSourceClientOffset();
      if (sourceClientOffset) {
        const point = map.containerPointToLatLng([
          sourceClientOffset.x,
          sourceClientOffset.y,
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
          sourceClientOffset.x,
          sourceClientOffset.y,
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
    html: '<img src="/assets/settlements/types/mining_town.webp" alt="Preview" class="w-7 h-7 rounded-full" />',
    className: "preview-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return isDragging && previewPosition ? (
    <Marker position={previewPosition} icon={icon} />
  ) : null;
};

export default CreateSettlementDragAndDrop;
