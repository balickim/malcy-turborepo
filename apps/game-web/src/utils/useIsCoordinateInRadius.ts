import { LatLng } from "leaflet";
import { useState, useEffect } from "react";

import { IGeoLocation } from "~/utils/usePlayerPositionWatcher.ts";

type Point = {
  id: string;
  lng: number;
  lat: number;
};

// Function to calculate the distance between two coordinates in meters using Haversine formula
function getDistanceBetweenPoints(point1: IGeoLocation, point2: IGeoLocation) {
  const R = 6371e3;
  const lat1 = point1.lat * (Math.PI / 180);
  const lat2 = point2.lat * (Math.PI / 180);
  const deltaLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const deltaLng = (point2.lng - point1.lng) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

function useIsCoordinateInRadius(
  coordinate: LatLng | null,
  points?: Point[],
  radius?: number,
) {
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    function checkCoordinateInRadius() {
      if (!points || !radius) return;
      for (const point of points) {
        if (!coordinate) return;
        const pointCoordinate = { lat: point.lat, lng: point.lng };
        const distance = getDistanceBetweenPoints(coordinate, pointCoordinate);
        if (distance <= radius) {
          setIsInside(true);
          return;
        }
      }
      setIsInside(false);
    }

    checkCoordinateInRadius();
  }, [coordinate, points, radius]);

  return isInside;
}

export default useIsCoordinateInRadius;
