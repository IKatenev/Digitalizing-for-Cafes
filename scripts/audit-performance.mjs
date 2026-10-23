import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preview } from "vite";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:5174/Digitalizing-for-Cafes/";
const runs = Number(process.env.AUDIT_RUNS || 1);
const desktop = process.argv.includes("--desktop");
const check = process.argv.includes("--assert");
const server = process.env.AUDIT_BASE_URL ? null : await preview({ preview: { open: false } });
await mkdir("reports/lighthouse", { recursive: true });
const summary = [];
try {
  for (const file of ["index.html", "pricing.html", "plans.html"]) {
    const results = [];
    for (let run = 1; run <= runs; run++) {
      const output = `reports/lighthouse/${file.replace(".html", "")}-${desktop ? "desktop" : "mobile"}-${run}.json`;
      const args = [
        fileURLToPath(new URL("../node_modules/lighthouse/cli/index.js", import.meta.url)),
        new URL(file, baseUrl).href,
        `--chrome-flags=${process.env.LIGHTHOUSE_CHROME_FLAGS || "--headless=new"}`,
        "--only-categories=performance,accessibility,best-practices,seo",
        "--output=json",
        `--output-path=${output}`,
        "--quiet",
      ];
      if (desktop) {
        args.push("--preset=desktop");
      }
      await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, args, { stdio: "inherit" });
        child.on("error", reject);
        child.on("exit", (code) =>
          code === 0 ? resolve() : reject(new Error(`Lighthouse exited with ${code}`)),
        );
      });
      const report = JSON.parse(await readFile(output, "utf8"));
      results.push({
        performance: Math.round(report.categories.performance.score * 100),
        accessibility: Math.round(report.categories.accessibility.score * 100),
        bestPractices: Math.round(report.categories["best-practices"].score * 100),
        seo: Math.round(report.categories.seo.score * 100),
        lcp: report.audits["largest-contentful-paint"].numericValue,
        cls: report.audits["cumulative-layout-shift"].numericValue,
        tbt: report.audits["total-blocking-time"].numericValue,
      });
    }
    const median = Object.fromEntries(
      Object.keys(results[0]).map((key) => [
        key,
        results.map((result) => result[key]).sort((a, b) => a - b)[Math.floor(runs / 2)],
      ]),
    );
    summary.push({ page: file, ...median });
  }
  await writeFile(
    `reports/lighthouse/summary-${desktop ? "desktop" : "mobile"}.json`,
    JSON.stringify({ runs, baseUrl, results: summary }, null, 2),
  );
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (
    check &&
    summary.some(
      (page) =>
        page.performance < 90 ||
        page.accessibility < 100 ||
        page.bestPractices < 100 ||
        page.seo < 100 ||
        page.cls > 0.1,
    )
  ) {
    process.exitCode = 1;
  }
} finally {
  await server?.httpServer.close();
}
