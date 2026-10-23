# Implementation and deployment report

Status: implementation complete locally; GitHub Pages publication and live Cloudflare setup have not been performed.

## Changes delivered

| Area              | Problem found                                                                                               | Implemented solution                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Headings          | H1 needed one weight step                                                                                   | All H1 headings use TT Hoves Medium, weight 500 instead of 400.                                                                                                                    |
| Fonts             | Git filenames were lowercase but references used uppercase; Windows concealed the Linux mismatch            | Consistent lowercase source paths, matching Vite-managed preloads and CSS, hashed deployed assets. Fonts remain in `src`.                                                          |
| Font transfer     | Three fonts totalled 134.37 kB, including a 600 weight used only by links                                   | Reused weight 500 for those links and supplied Latin/extended-Latin subsets for 400/500: 50.62 kB total. Original fonts are preserved.                                             |
| Navigation        | Root-absolute page links escaped the repository base; many controls had placeholder destinations            | Relative page URLs and real section targets, revised header labels, hardware/enquiry links and honest demo information.                                                            |
| Shared content    | Pricing, hardware, support, forms and head metadata were duplicated                                         | Shared build-time HTML partials with checked template values, nested includes, missing/circular include errors and development reloads.                                            |
| Style structure   | Shared sections lived in the home stylesheet; base/component imports pulled utilities into the wrong layer  | Shared component files, consistent layer order, no backwards layer imports, separate page CSS entry points.                                                                        |
| Loading strategy  | Blanket asynchronous CSS and low-priority entry JS lacked evidence of benefit                               | Normal stylesheet and module loading; small common JS bundle; no additional client framework.                                                                                      |
| Images and HTML   | Image query strings were not generating useful variants; larger inline assets inflated HTML                 | Build-generated responsive WebP sources for the main image, accurate image alternative, lazy offscreen images, 1 kB inline threshold and cacheable external assets.                |
| Responsive layout | The retail slider exceeded the mobile viewport; fixed card layouts overflowed with enlarged text            | Viewport-sized scrolling container and adaptive grids. All pages checked from 320 to 1920 px and at 200% root text size.                                                           |
| Accessibility     | Skip link stayed visually hidden; checkbox focus was invisible; menu focus could land in hidden transitions | Focus-visible skip link/controls, inert closed menu, focus return/trapping, transitions restricted to visual properties, reduced-motion handling.                                  |
| Plan comparison   | Columns were missing clear headings and relied on fragile spacing; tabs lacked keyboard behaviour           | Visible plan headings, aligned feature groups, named panels, roving tab focus, arrow/Home/End navigation and desktop/mobile state synchronisation.                                 |
| Forms             | Old handler failed at undefined `this.log()`; submission behaviour was unclear                              | Local UK validation in demo mode; explicit optional live endpoint; pending-state lock, timeout, preserved failure data and confirmed-success-only reset.                           |
| SEO               | Public sitemap variables were not expanded; canonical URLs and social image were wrong                      | Generated sitemap/robots, per-page canonical/Open Graph metadata, published absolute social image URL and fixed public documentation links.                                        |
| Checks            | Generated output was linted, existing SCSS findings prevented useful gates, browser tests only paused       | Scoped lint/format checks, resolved findings, 9 headed browser regression tests and 7 native configuration/backend tests.                                                          |
| Dependencies      | Several heavyweight unused plugins and vulnerable tool versions remained installed                          | Removed unused image/PWA/critical-CSS/injection plugins, added only build/audit tools and updated compatible dependencies. `npm audit` reports zero vulnerabilities.               |
| Deployment        | Build-only publishing could release broken navigation/assets                                                | Lint, formatting, backend tests, production browser checks and performance budgets gate the GitHub Pages artifact. Headed CI runs through Xvfb.                                    |
| Telegram          | PHP could not execute on Vite or GitHub Pages                                                               | Separate Cloudflare Worker with secret storage, independent validation, bounded requests, exact-origin CORS, rate-limit bindings, plain-text Telegram messages and error handling. |

## Verification

- Production build passes.
- ESLint, Stylelint and Prettier checks pass.
- Nine headed Chrome browser tests pass, covering all pages, font responses/MIME types, canonical URLs, real navigation destinations, images, seven viewport widths, enlarged text, menus, comparison tabs and both demo/live form behaviour.
- Live form browser tests intercept the endpoint; no real enquiry is sent.
- Seven Node configuration/backend tests pass with mocked Telegram responses, including invalid input, rate limits, malformed/oversized bodies and upstream failures.
- Worker dry-run bundling passes with both configured Cloudflare rate-limit bindings. No Cloudflare resource was published.
- Development root and all three page URLs return HTTP 200 without the previous redirect loop. Private PHP/configuration/backend paths are denied by the development server.
- Build output contains the correct lowercase subset font filenames and matching preload/CSS references. Browser checks confirm the actual 400/500 faces load rather than merely observing a CSS family declaration.

Final mobile Lighthouse medians are recorded below. All nine browser regressions pass in headed Chrome, Firefox and WebKit (27 checks total). WebKit here is Playwright’s Windows test engine, not a claim of testing Safari on macOS or a real iPhone.

## Asset comparison

Build estimates; gzip sizes are estimates rather than a promise about a particular hosting response.

| Resource                   | Before    | After                                                              |
| -------------------------- | --------- | ------------------------------------------------------------------ |
| Fonts emitted              | 134.37 kB | 50.62 kB                                                           |
| Home HTML, gzip            | 17.10 kB  | 6.40 kB                                                            |
| Pricing HTML, gzip         | 15.79 kB  | 5.78 kB                                                            |
| Plans HTML, gzip           | 6.46 kB   | 5.30 kB                                                            |
| CSS on home, gzip          | 9.66 kB   | About 9.20 kB                                                      |
| CSS on pricing/plans, gzip | 9.66 kB   | About 7.98 / 8.07 kB                                               |
| Shared JavaScript, gzip    | 2.01 kB   | About 2.87 kB, including keyboard and optional live form behaviour |

The small shared JS bundle is retained to avoid unnecessary fragmentation. Normal CSS loading is retained for predictable first paint. Tiny SVGs stay inline; larger assets are externally cached. No service worker or runtime framework was introduced. Font subsetting is an optional one-off Python asset-generation task; normal development and CI require only Node.

## Performance verification

The initial local mobile Lighthouse run for the home page scored 91, with LCP 3.5 s, CLS 0 and TBT 0 ms. It was a single baseline run.

Final runs use the same local production preview and simulated mobile throttling. Performance, LCP, CLS and TBT use three runs per page; accessibility, Best Practices and SEO scores reflect the final verification run. Desktop results are separate. They are laboratory measurements, not field data or deployed GitHub Pages results. The saved JSON reports live in ignored `reports/lighthouse/` and can be regenerated with `npm run audit:performance`.

| Page         | Mobile performance | LCP    | CLS | TBT  | Accessibility / Best Practices / SEO |
| ------------ | ------------------ | ------ | --- | ---- | ------------------------------------ |
| index.html   | 97                 | 2.63 s | 0   | 0 ms | 100 / 100 / 100                      |
| pricing.html | 99                 | 2.26 s | 0   | 0 ms | 100 / 100 / 100                      |
| plans.html   | 98                 | 2.41 s | 0   | 0 ms | 100 / 100 / 100                      |

The home page median LCP is still slightly above the 2.5 s target under simulated mobile throttling; actual hosting and field data must be measured after publication. No claim of a perfect performance score is made.

Desktop Lighthouse results: all three pages score 100 in Performance, Accessibility, Best Practices and SEO. Desktop LCP ranges from 0.53 to 0.57 s, with CLS and TBT both zero. Desktop uses one run per page.

The CI budget requires performance >= 90, accessibility/Best Practices/SEO = 100 and CLS <= 0.1. A repeatable high score is preferred to a noisy requirement for exactly 100. Published-page audits can use `AUDIT_BASE_URL`; field INP needs actual user traffic.

## Remaining external setup

1. Commit/push the prepared changes and run the GitHub Pages workflow. This task has not changed the remote repository.
2. For actual Telegram delivery, sign in to Cloudflare, add the bot token/chat ID as Worker secrets and deploy. Follow `server/telegram/README.md`.
3. Keep `VITE_FORM_MODE=demo` for the portfolio. To opt into live mode later, set the public endpoint URL and live mode repository variables, provide real business/privacy/contact information and verify bot chat permissions.
4. Audit the published GitHub Pages URLs after deployment. Static hosting controls cache/compression headers; the repository does not attempt to configure unsupported server headers.

## PHP diagnosis retained

The old form called an undefined `this.log()` before submission. Vite returned the raw PHP source; a real PHP server returned the expected HTTP 405 JSON response. PHP syntax and cURL were valid locally. Credentials and chat permissions were not tested. The prototype remains outside the published artifact and is blocked from raw development serving.

## References

- [Vite asset handling](https://vite.dev/guide/assets.html)
- [GitHub Pages static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Lighthouse scoring and variability](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage)
