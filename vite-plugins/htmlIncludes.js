import { readFileSync } from "node:fs";
import { dirname, resolve, relative, isAbsolute } from "node:path";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );

export default function htmlIncludes(valuesForPage) {
  let root;
  const dependencies = new Set();
  const render = (html, file, stack = []) =>
    html.replace(/<include\s+src="([^"]+)"\s*\/?\s*>/gi, (_, src) => {
      const target = resolve(dirname(file), src);
      const local = relative(root, target);
      if (local.startsWith("..") || isAbsolute(local) || stack.includes(target)) {
        throw new Error(`Invalid or circular HTML include: ${src}`);
      }
      dependencies.add(target);
      return render(readFileSync(target, "utf8"), target, [...stack, target]);
    });
  return {
    name: "html-includes",
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        const values = valuesForPage(context.filename);
        return render(html, context.filename).replace(/\{\{(\w+)\}\}/g, (_, key) => {
          if (!(key in values)) {
            throw new Error(`Unknown HTML value: ${key}`);
          }
          return escapeHtml(values[key]);
        });
      },
    },
    handleHotUpdate(context) {
      if (dependencies.has(context.file)) {
        context.server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}
