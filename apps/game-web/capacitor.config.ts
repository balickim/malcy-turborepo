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
  },
};

export default config;
