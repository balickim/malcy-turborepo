import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "malcy.game",
  appName: "Malcy",
  webDir: "dist",
  server: {
    androidScheme: "http",
    allowNavigation: ["*"],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    BackgroundGeolocation: {
      locationPermissionDescription:
        "We need your location for game functionality",
      backgroundPermissionRationale:
        "We need to access your location in the background for game functionality",
      locationUpdateInterval: 5000,
      startOnBoot: true,
    },
  },
};

export default config;
