import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 5173 },
  plugins: [
    react({
      jsxImportSource: "@welldone-software/why-did-you-render",
    }),
    legacy(),
  ],
  resolve: {
    alias: {
      "~": "/src",
    },
  },
  // @ts-expect-error blah
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
