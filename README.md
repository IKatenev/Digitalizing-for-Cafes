# Digitalizing for Cafés

A British English POS website built with Vite, SCSS and vanilla JavaScript. GitHub Pages serves the static website; an optional Cloudflare Worker forwards enquiries to Telegram.

## Development

Use Node.js 22.19 or newer.

```sh
npm ci
npm run dev
```

The development URL is `http://127.0.0.1:5173/Digitalizing-for-Cafes/`.

```sh
npm run lint
npm run format:check
npm run build
npm run preview
npm run test:unit
npm run test:chrome
npm run audit:performance
```

Playwright checks the production build in a visible browser. Install its browsers with `npx playwright install`. To use an installed Chrome on Windows, set `PLAYWRIGHT_CHANNEL=chrome`. Firefox and WebKit have separate `test:firefox` and `test:safari` commands. The test server owns port 5174; stop an existing preview before running browser tests. On Linux CI, the headed browser runs through Xvfb.

Performance audits run against the built site, start their own preview and write ignored reports under `reports/lighthouse/`. Set `CHROME_PATH` if Chrome is not discovered automatically. Set `AUDIT_RUNS=3` for per-page medians; add `-- --desktop` for desktop or `-- --assert` for the CI budget. `AUDIT_BASE_URL` can point to a deployed site instead of the local preview. Build before auditing.

## Structure

- `index.html`, `pricing.html`, `plans.html`: page-specific content.
- `partials/`: shared head, navigation, pricing, hardware, support and form.
- `vite-plugins/htmlIncludes.js`: nested HTML includes, checked template values and partial reloads. Invalid, circular or missing includes fail the build.
- `src/scss/main.scss`: shared tokens, base styles, layouts, components and utilities.
- `src/scss/entries/`: page stylesheet entry points; only the relevant page stylesheet is loaded.
- `src/js/modules/`: small feature initialisers. Form submission is disabled in the default demo mode.
- `scripts/prepare-images.mjs`: generates responsive WebP sizes before development/build. Generated images are ignored by Git.
- `server/telegram/`: separately deployable Telegram endpoint.
- `tests/`: browser regressions and backend tests with mocked Telegram delivery.

## Public configuration

`.env.production` contains public production descriptions, the canonical site URL and demo form defaults. Vite supports local overrides through ignored `.env.local` and `.env.production.local` files. Changing `VITE_SITE_URL` also changes Vite's deployment base and generated sitemap. The default is the GitHub Pages repository path.

Never put a bot token in a `VITE_` variable: those variables can be embedded in public browser assets. The only frontend backend setting is its public endpoint URL.

The build emits page-specific canonical/Open Graph URLs, `robots.txt` and `sitemap.xml`. `public/og-image.webp` is copied to the deployed site without renaming.

## Fonts

Fonts stay under `src/assets/fonts`; moving them to `public` is unnecessary. Vite processes the same source URLs in the font preload links and `@font-face`, emits hashed assets and applies the deployment base.

The original repository records lowercase font filenames, while earlier stylesheet/preload paths used uppercase letters. Windows hid this mismatch; Linux/GitHub builds are case-sensitive. Current URLs consistently reference lowercase Latin subsets.

The website uses the existing TT Hoves family at weights 400 and 500. H1 uses 500. Latin subsets retain extended Latin, punctuation, currency symbols and relevant arrows; original files remain available. To regenerate subsets after replacing source fonts, install `fonttools[woff]` in a Python environment and run `python scripts/subset-fonts.py`. This is a one-off asset task, not a normal build dependency.

## Telegram and demo mode

The checked-in production build validates form data locally without sending or saving it. Demonstration contacts and GBP prices are not commercial offers. The existing PHP prototype is retained for reference and is not published by the build.

For backend deployment and optional live mode, see [the Worker setup](server/telegram/README.md). Tests mock every Telegram call and do not send real messages.

## Deployment

Pushes to `main` run lint, formatting, backend tests, a production build, headed browser smoke tests and Lighthouse budgets before publishing the tested `dist` artifact. Enable GitHub Actions as the repository's Pages source. Manual workflow dispatch is also available.

Optional repository variables `VITE_FORM_MODE` and `VITE_FORM_ENDPOINT` can enable a separately deployed endpoint; they are public configuration, not secrets. Leave them unset for the portfolio demo.
