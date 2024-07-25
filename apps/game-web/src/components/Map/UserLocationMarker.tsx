import L from "leaflet";
import { useEffect, useState, useRef, MutableRefObject } from "react";
import { toast } from "react-hot-toast";
import { Circle, Marker } from "react-leaflet";

import store from "~/store";
import { websocketUserLocation } from "~/store/websocketStore";
import { IGeoLocation } from "~/utils/usePlayerPositionWatcher.ts";

const walkingManIcon = L.icon({
  iconUrl: "assets/player.gif",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function calculateDistance(pos1: IGeoLocation, pos2: IGeoLocation): number {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = (pos1.lat * Math.PI) / 180;
  const lat2 = (pos2.lat * Math.PI) / 180;
  const deltaLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const deltaLng = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function UserLocationMarker({ location }: { location: IGeoLocation }) {
  const { serverConfigStore } = store;
  const [position, setPosition] = useState<IGeoLocation>(location);
  const markerRef: MutableRefObject<L.Marker | null> = useRef(null);
  const circleRef: MutableRefObject<L.Circle | null> = useRef(null);

  useEffect(() => {
    if (markerRef.current && circleRef.current) {
      const marker = markerRef.current;
      const circle = circleRef.current;
      const startPosition = marker.getLatLng();
      const endPosition = L.latLng(location.lat, location.lng);
      const distance = calculateDistance(startPosition, endPosition);
      const duration = Math.min(2000, Math.max(500, distance * 100)); // Adjust these values as needed

      let start: number | null = null;
      function animate(timestamp: number) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);

        const lat =
          startPosition.lat +
          (endPosition.lat - startPosition.lat) * percentage;
        const lng =
          startPosition.lng +
          (endPosition.lng - startPosition.lng) * percentage;

        const newPosition = L.latLng(lat, lng);
        marker.setLatLng(newPosition);
        circle.setLatLng(newPosition);

        if (percentage < 1) {
          requestAnimationFrame(animate);
        } else {
          setPosition(location);
        }
      }

      requestAnimationFrame(animate);
    }

    websocketUserLocation.socket?.on("location:error", (args: string) =>
      toast.error(args, { duration: 10000 }),
    );
    return () => {
      websocketUserLocation.socket?.off("location:error");
    };
  }, [location]);

  return (
    <>
      <Marker ref={markerRef} position={position} icon={walkingManIcon} />
      <Circle
        ref={circleRef}
        center={position}
        radius={serverConfigStore.config!.MAX_RADIUS_TO_TAKE_ACTION_METERS}
      />
    </>
  );
}
