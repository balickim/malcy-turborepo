import L, { LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";
import { ImageOverlay } from "react-leaflet";

import { websocketUserLocation } from "~/store/websocketStore";

function getBoundsFromPolygon(polygon: LatLngTuple[]) {
  return L.latLngBounds(polygon);
}

function drawPolygonOnCanvas(
  canvas: HTMLCanvasElement,
  worldBounds: LatLngTuple[],
  discoveredAreas: number[][][],
  visibleAreas: number[][][],
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Fill whole world as dark fog
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";
  visibleAreas.forEach((area) => {
    ctx.beginPath();
    area.forEach(([lat, lng], i) => {
      const x =
        ((lng - worldBounds[0][1]) / (worldBounds[2][1] - worldBounds[0][1])) *
        canvas.width;
      const y =
        ((worldBounds[0][0] - lat) / (worldBounds[0][0] - worldBounds[2][0])) *
        canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  discoveredAreas.forEach((area) => {
    ctx.beginPath();
    area.forEach(([lat, lng], i) => {
      const x =
        ((lng - worldBounds[0][1]) / (worldBounds[2][1] - worldBounds[0][1])) *
        canvas.width;
      const y =
        ((worldBounds[0][0] - lat) / (worldBounds[0][0] - worldBounds[2][0])) *
        canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalCompositeOperation = "source-over";
}

interface IFogOfWar {
  worldBounds: LatLngTuple[];
}

const FogOfWar = ({ worldBounds }: IFogOfWar) => {
  const [discoveredAreas, setDiscoveredAreas] = useState<number[][][]>([]);
  const [visibleAreas, setVisibleAreas] = useState<number[][][]>([]);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    websocketUserLocation.socket?.on(
      "allDiscoveredByUser",
      (args: number[][][]) => setDiscoveredAreas(args),
    );
    websocketUserLocation.socket?.on("allVisibleByUser", (args: number[][][]) =>
      setVisibleAreas(args),
    );
    return () => {
      websocketUserLocation.socket?.off("allDiscoveredByUser");
      websocketUserLocation.socket?.off("allVisibleByUser");
    };
  }, []);

  useEffect(() => {
    // Generate image when discovered/visible areas change
    if (!worldBounds || worldBounds.length < 4) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    drawPolygonOnCanvas(canvas, worldBounds, discoveredAreas, visibleAreas);
    setImgUrl(canvas.toDataURL("image/png"));
  }, [worldBounds, discoveredAreas, visibleAreas]);

  if (!imgUrl) return null;
  const bounds = getBoundsFromPolygon(worldBounds);

  return <ImageOverlay url={imgUrl} bounds={bounds} opacity={1} zIndex={500} />;
};

export default FogOfWar;
