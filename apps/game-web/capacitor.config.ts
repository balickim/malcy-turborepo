import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "malcy.game",
  appName: "Malcy",
  webDir: "dist",
  server: {
    androidScheme: "http",
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
