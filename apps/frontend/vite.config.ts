import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    // HMR connects through nginx on :8080, not directly to Vite on :5173
    hmr: {
      clientPort: 8080,
    },
    watch: {
      // Docker volume mounts don't always emit filesystem events on Linux/WSL;
      // polling is the reliable fallback for hot reload.
      usePolling: true,
      interval: 300,
    },
  },
});
