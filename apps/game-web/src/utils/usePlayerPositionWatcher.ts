import { Geolocation } from "@capacitor/geolocation";
import { useEffect, useState } from "react";

import store from "~/store";
import { websocketUserLocation } from "~/store/websocketStore";

export interface IGeoLocation {
  lat: number;
  lng: number;
}

export function usePlayerPositionWatcher() {
  const { userStore } = store;
  const [playerPosition, setPlayerPosition] = useState<IGeoLocation | null>(
    null,
  );

  useEffect(() => {
    let watchId: string | null = null;

    const setupGeolocation = async () => {
      watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
        (position) => {
          if (position) {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            websocketUserLocation.socket?.emit("playerPosition", {
              location,
              userId: userStore.user.id,
            });
            setPlayerPosition(location);
          }
        },
      );
    };

    void setupGeolocation();

    return () => {
      if (watchId !== null) {
        void Geolocation.clearWatch({ id: watchId });
      }
    };
  }, []);

  return playerPosition;
}
