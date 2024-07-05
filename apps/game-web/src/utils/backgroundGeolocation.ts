import { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import { App } from "@capacitor/app";
import { Capacitor, registerPlugin } from "@capacitor/core";

import { websocketUserLocation } from "~/store/websocketStore";

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  "BackgroundGeolocation",
);

let watcherId: string | null = null;
let backgroundTimeout: NodeJS.Timeout | null = null;

const clearBackgroundTimer = () => {
  if (backgroundTimeout) {
    clearTimeout(backgroundTimeout);
    backgroundTimeout = null;
  }
};

export const stopBackgroundGeolocation = async () => {
  if (watcherId) {
    await BackgroundGeolocation.removeWatcher({ id: watcherId });
    watcherId = null;
  }
  clearBackgroundTimer();
};

const startBackgroundTimer = () => {
  clearBackgroundTimer();
  backgroundTimeout = setTimeout(
    () => {
      stopBackgroundGeolocation();
    },
    5 * 60 * 1000, // 5 minutes
  );
};

export const startBackgroundGeolocation = async (userId: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: "Tracking your location",
          backgroundTitle: "Location Tracking",
          requestPermissions: true,
          stale: false,
          distanceFilter: 10,
        },
        (location, error) => {
          if (error) {
            console.error("Background Geolocation error:", error);
            return;
          }
          if (location) {
            const newLocation = {
              lat: location.latitude,
              lng: location.longitude,
            };
            websocketUserLocation.socket?.emit("playerPosition", {
              location: newLocation,
              userId: userId,
              timestamp: new Date().toISOString(),
            });
          }
        },
      );

      App.addListener("appStateChange", ({ isActive }) => {
        if (!isActive) {
          // App going to background, start the 5-minute timer
          startBackgroundTimer();
        } else {
          // App coming to foreground, clear the timer
          clearBackgroundTimer();
        }
      });
    } catch (error) {
      console.error("Error setting up background geolocation:", error);
    }
  }
};
