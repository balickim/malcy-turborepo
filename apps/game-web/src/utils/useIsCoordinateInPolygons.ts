import { useState, useEffect } from "react";

import { IGeoLocation } from "~/utils/usePlayerPositionWatcher.ts";

type Polygon = {
  area: [number, number][];
};

function calculateBoundingBox(polygon: [number, number][]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of polygon) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

function isPointInBoundingBox(
  point: IGeoLocation,
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
) {
  const { lat, lng } = point;
  return (
    lat >= bbox.minX && lat <= bbox.maxX && lng >= bbox.minY && lng <= bbox.maxY
  );
}

function isPointInPolygon(point: IGeoLocation, polygon: [number, number][]) {
  const { lat, lng } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function useIsCoordinateInPolygons(
  coordinate: IGeoLocation | null,
  polygons: Polygon[] | undefined,
) {
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    function checkCoordinateInPolygons() {
      if (!polygons) return;
      for (const polygon of polygons) {
        const bbox = calculateBoundingBox(polygon.area);
        if (
          coordinate &&
          isPointInBoundingBox(coordinate, bbox) &&
          isPointInPolygon(coordinate, polygon.area)
        ) {
          setIsInside(true);
          return;
        }
      }

      setIsInside(false);
    }

    checkCoordinateInPolygons();
  }, [coordinate, polygons]);

  return isInside;
}

export default useIsCoordinateInPolygons;
