# Digitalizing-for-Cafes

Multi-page Russian-language landing site for a cafe POS system. Built with **Vite + SCSS + vanilla JS**.

## Quick start

```bash
npm run dev       # dev server at http://127.0.0.1:5173 (opens browser)
npm run build     # outputs to dist/
npm run preview   # preview build at http://127.0.0.1:5174
```

## Lint, format, typecheck

Run `npm run lint:fix` before committing (eslint + stylelint + prettier in one step).

| Command | What it does |
|---|---|
| `npm run lint` | eslint `.` + stylelint `**/*.{css,scss}` |
| `npm run lint:fix` | eslint --fix + stylelint --fix + prettier --write |

There is no typecheck step (vanilla JS).

## Architecture

- **Entrypoint**: `src/js/main.js` — imports SCSS, preloads fonts, loads JS modules
- **CSS**: SCSS with BEM, structured as: `abstracts` → `base` → `pages` → `layouts` → `components` → `utilities` (order enforced in `src/scss/main.scss`)
- **JS**: `src/js/modules/` — one file per feature (e.g. `burger-button.js`)
- **`@` alias** maps to `/src`
- **Env vars** (`.env`): `VITE_SITE_TITLE`, `VITE_SITE_DESC`, `VITE_SITE_URL`, `VITE_OG_IMAGE` — referenced in `index.html` as `%VITE_*%` via `vite-plugin-html`
- **Fonts**: TT Hoves (headings) and Inter (body), preloaded in JS via `?url` import

## Tests

Tests use Playwright. Run with `--headed` flag (visible browser):

```bash
npm run test:chrome
npm run test:firefox
npm run test:safari
```

## Style conventions

- BEM: `.block__element--modifier`
- SCSS with `@use` (not `@import`)
- Desktop-first responsive design
- No external JS/CSS libraries unless requested
- Prefer semantic HTML and modern CSS
- *IMPORTANT* Always try to reuse existing elements, variables, components as much as possible for convinience

## Figma

Design-to-code workflow available via MCP (`@vkhanhqui/figma-mcp-go`). See `.opencode/skills/design-to-code/`.

## Output rules

Never use comments and explanations until I asked