import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  {
    ignores: [
      "dist/**",
      "_source/**",
      "node_modules/**",
      "reports/**",
      "test-results/**",
      "playwright-report/**",
      ".wrangler/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { prettier: prettierPlugin },
    extends: [js.configs.recommended, prettierConfig],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "prettier/prettier": "error",
      "no-console": "warn",
      "no-unused-vars": "error",
      eqeqeq: "error",
      curly: "error",
    },
  },
  {
    files: ["server/telegram/worker.js"],
    rules: { "no-console": ["error", { allow: ["error"] }] },
  },
]);
