import { defineConfig, loadEnv } from "vite";
import { basename } from "node:path";
import { createHtmlPlugin } from "vite-plugin-html";
import htmlIncludes from "./vite-plugins/htmlIncludes.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = new URL(
    env.VITE_SITE_URL || "https://ikatenev.github.io/Digitalizing-for-Cafes/",
  );
  if (!siteUrl.pathname.endsWith("/")) {
    siteUrl.pathname += "/";
  }
  const pages = {
    "index.html": {
      title: "Absolut POS | POS Systems for Cafés and Retail",
      description:
        env.VITE_MAIN_SITE_DESC ||
        "Run your café or shop with Absolut POS. Manage sales, stock and reporting in one system.",
    },
    "pricing.html": {
      title: "Pricing and Hardware | Absolut POS",
      description:
        env.VITE_PRICING_SITE_DESC ||
        "Explore tools, hardware and illustrative GBP pricing for cafés, restaurants and shops.",
    },
    "plans.html": {
      title: "Compare Plans | Absolut POS",
      description:
        env.VITE_PLANS_SITE_DESC ||
        "Compare Absolut POS plans, features and included devices for your business.",
    },
  };
  const endpoint = env.VITE_FORM_MODE === "live" ? env.VITE_FORM_ENDPOINT || "" : "";
  if (env.VITE_FORM_MODE === "live") {
    const url = new URL(endpoint);
    const local =
      mode !== "production" &&
      url.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(url.hostname);
    if (
      (!local && url.protocol !== "https:") ||
      url.pathname !== "/enquiry" ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    ) {
      throw new Error(
        "Live forms require an HTTPS endpoint ending in /enquiry (HTTP localhost is allowed only in development).",
      );
    }
  }
  const valuesForPage = (file) => {
    const name = basename(file);
    const page = pages[name];
    if (!page) {
      throw new Error(`Unknown page: ${name}`);
    }
    return {
      pageTitle: page.title,
      pageStyles: `/src/scss/entries/${name === "index.html" ? "home" : name.replace(".html", "")}.scss`,
      description: page.description,
      canonical: new URL(name === "index.html" ? "" : name, siteUrl).href,
      socialImage: new URL("og-image.webp", siteUrl).href,
      formEndpoint: endpoint,
      formDescription: endpoint
        ? "Tell us about your setup and we will help you choose suitable equipment."
        : "Enter your details to check the form. This demo does not send or store your enquiry.",
      submitLabel: endpoint ? "Send enquiry" : "Check details",
      privacyText: endpoint
        ? "Submitting sends your name, email address and phone number to our enquiry service and Telegram so we can respond. Do not include sensitive information."
        : "Your details stay in this browser tab and are not submitted or saved by this demo. Example contact details are not monitored.",
    };
  };
  return {
    base: siteUrl.pathname,
    appType: "mpa",
    plugins: [
      htmlIncludes(valuesForPage),
      ...createHtmlPlugin({ minify: true }).map((plugin) => ({ ...plugin, apply: "build" })),
      {
        name: "public-site-metadata",
        generateBundle() {
          const urls = Object.keys(pages).map(
            (name) => new URL(name === "index.html" ? "" : name, siteUrl).href,
          );
          this.emitFile({
            type: "asset",
            fileName: "sitemap.xml",
            source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`,
          });
          this.emitFile({
            type: "asset",
            fileName: "robots.txt",
            source: `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", siteUrl).href}\n`,
          });
        },
      },
    ],
    resolve: { alias: { "@": "/src" } },
    server: {
      host: "127.0.0.1",
      port: 5173,
      open: true,
      fs: {
        deny: [
          "**/.env*",
          "**/*.{crt,pem,key}",
          "**/.git/**",
          "**/config.php",
          "**/telegram.php",
          "**/server/**",
        ],
      },
    },
    preview: { host: "127.0.0.1", port: 5174, strictPort: true, open: true },
    build: {
      assetsInlineLimit: 1024,
      rollupOptions: {
        input: { main: "index.html", pricing: "pricing.html", plans: "plans.html" },
      },
    },
  };
});
