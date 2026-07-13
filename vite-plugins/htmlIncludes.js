import { readFileSync } from "fs";
import { resolve, dirname } from "path";

export default function htmlIncludes() {
  const INCLUDE_REGEX = /<include\s+src="([^"]+)"\s*\/?>/gi;

  function resolveIncludes(html, htmlFilePath) {
    const htmlDir = dirname(htmlFilePath);

    return html.replace(INCLUDE_REGEX, (match, src) => {
      const partialPath = resolve(htmlDir, src);

      try {
        return readFileSync(partialPath, "utf-8");
      } catch {
        // eslint-disable-next-line no-console
        console.warn(`[htmlIncludes] Не найден файл: ${partialPath}`);
        return `<!-- include not found: ${src} -->`;
      }
    });
  }

  return {
    name: "vite-plugin-html-includes",

    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const filePath = ctx.filename;
        return resolveIncludes(html, filePath);
      },
    },
  };
}
