import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "malcy.backoffice",
  appName: "Malcy Backoffice",
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
