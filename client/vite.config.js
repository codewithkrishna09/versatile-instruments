import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Cloudflare quick tunnels use a different random hostname on each run.
    // This affects only the local Vite development server.
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:5003",
      "/uploads": "http://localhost:5003",
    },
  },
});
