import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base:
    mode === "production"
      ? (process.env.VITE_PUBLIC_BASE ?? "/selflink-community/")
      : "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },
}));
