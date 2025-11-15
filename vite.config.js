import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: ["*.ngrok-free.app"],
    proxy: {
      '/api': {
        target: 'http://localhost/clockmate',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },

  // server: {
  //   port: 3000, // Set your desired port here
  //   allowedHosts: ['3aa52a2a8754.ngrok-free.app'],
  // },
});
