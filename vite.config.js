import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import { createHtmlPlugin } from "vite-plugin-html";
import htmlIncludes from "./vite-plugins/htmlIncludes.js";

export default defineConfig({
  base: "./",

  plugins: [
    htmlIncludes(),
    imagetools(),
    createHtmlPlugin({ minify: true }),
    {
      name: "optimize-critical-path",
      transformIndexHtml(html) {
        return (
          html
            // 1. Делаем CSS неблокирующим для Network dependency tree
            .replace(
              /<link rel="stylesheet"(.*?)>/g,
              '<link rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"$1><noscript><link rel="stylesheet"$1></noscript>',
            )
            // 2. Понижаем приоритет JS-бандла для Network dependency tree
            .replace(/<script type="module"/g, '<script type="module" fetchpriority="low"')
        );
      },
    },
  ],

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

  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        pricing: "pricing.html",
        plans: "plans.html",
      },
    },
  },
});
