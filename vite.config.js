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
    port: 3000,
    open: true,
  },
  preview: {
    port: 4000,
    open: true,
  },
});
