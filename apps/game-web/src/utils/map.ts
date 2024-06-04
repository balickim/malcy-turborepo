import L from "leaflet";
import { RefObject } from "react";

import { IGeoLocation } from "~/utils/usePlayerPositionWatcher";

export const centerMapOnPlayer = (
  mapRef: RefObject<L.Map>,
  playerLocation: IGeoLocation,
) => {
  if (mapRef.current && playerLocation) {
    mapRef.current.flyTo(playerLocation, mapRef.current.getZoom(), {
      animate: true,
    });
  }
};
