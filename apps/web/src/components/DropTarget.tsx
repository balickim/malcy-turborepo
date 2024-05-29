import React, { useEffect } from "react";
import { useDrop } from "react-dnd";
import { useMapEvents } from "react-leaflet";

interface IDropTargetProps {
  onDrop: (coords: { lat: number; lng: number }) => void;
}

const DropTarget: React.FC<IDropTargetProps> = ({ onDrop }) => {
  const map = useMapEvents({});

  const [, drop] = useDrop(() => ({
    accept: "SETTLER",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        const point = map.containerPointToLatLng([offset.x, offset.y]);
        onDrop({ lat: point.lat, lng: point.lng });
      }
    },
  }));

  useEffect(() => {
    drop(map.getContainer());
  }, [drop, map]);

  return null;
};

export default DropTarget;
