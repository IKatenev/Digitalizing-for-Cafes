import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig({
  base: "./",

  plugins: [imagetools(), createHtmlPlugin()],

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  server: {
    host: "127.0.0.1",
    port: 5173,
    open: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 5174,
    open: true,
  },
});
