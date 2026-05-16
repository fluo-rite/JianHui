import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? "/api";
const devProxyTarget = process.env.VITE_DEV_PROXY_TARGET ?? "http://localhost:5000";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:
    apiBaseUrl === "/api"
      ? {
          proxy: {
            "/api": {
              target: devProxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
});
