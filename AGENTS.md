# Digitalizing-for-Cafes

Multi-page British English landing site for a cafe POS system. Built with **Vite + SCSS + vanilla JS**.

## Quick start

```bash
npm run dev       # dev server at http://127.0.0.1:5173/Digitalizing-for-Cafes/ (opens browser)
npm run build     # outputs to dist/
npm run preview   # preview build at http://127.0.0.1:5174/Digitalizing-for-Cafes/
```

## Lint, format, typecheck

Run `npm run lint:fix` before committing (eslint + stylelint + prettier in one step).

| Command            | What it does                                      |
| ------------------ | ------------------------------------------------- |
| `npm run lint`     | eslint `.` + stylelint `**/*.{css,scss}`          |
| `npm run lint:fix` | eslint --fix + stylelint --fix + prettier --write |

There is no typecheck step (vanilla JS).

## Architecture

- **Entrypoint**: `src/js/main.js` — imports shared SCSS and initialises feature modules
- **Shared HTML**: `partials/`; nested includes are checked at build time.
- **Page CSS**: `src/scss/entries/`; shared styles remain in `main.scss`.
- **Backend**: `server/telegram/`, a separately deployed Cloudflare Worker; demo forms do not send data.
- **CSS**: SCSS with BEM, structured as: `abstracts` → `base` → `layouts` → `components` → `utilities`, with page styles loaded through separate entry points (order enforced in `src/scss/main.scss`)
- **JS**: `src/js/modules/` — one file per feature (e.g. `burger-button.js`)
- **`@` alias** maps to `/src`
- **Env vars** (`.env`): public descriptions, `VITE_SITE_URL`, `VITE_FORM_MODE`, `VITE_FORM_ENDPOINT`; production defaults are tracked in `.env.production`, and the HTML include plugin supplies per-page metadata. Never expose backend secrets through `VITE_*`.
- **Fonts**: TT Hoves Latin WOFF2 subsets (400/500), preloaded in the shared HTML head and resolved by Vite. Match filename casing exactly.

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
- _IMPORTANT_ Always try to reuse existing elements, variables, components as much as possible for convinience

## Figma

Design-to-code workflow available via MCP (`@vkhanhqui/figma-mcp-go`). See `.opencode/skills/design-to-code/`.

## Output rules

Never use comments and explanations until I asked
