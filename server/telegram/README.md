# Telegram enquiry Worker

The website remains on GitHub Pages. This Worker is deployed separately to Cloudflare and accepts `POST /enquiry` JSON requests.

## Setup

1. Sign in to the Cloudflare account that should own the Worker: `npx wrangler@4 login`.
2. Review `server/telegram/wrangler.json`. `ALLOWED_ORIGINS` contains exact browser origins, separated by commas. An origin has no path or trailing slash. Rate-limit namespace IDs must be unique within the account if counters should not be shared with another Worker.
3. Store backend secrets interactively:

```sh
npx wrangler@4 secret put TELEGRAM_BOT_TOKEN --config server/telegram/wrangler.json
npx wrangler@4 secret put TELEGRAM_CHAT_ID --config server/telegram/wrangler.json
```

4. Deploy:

```sh
npx wrangler@4 deploy --config server/telegram/wrangler.json
```

5. Take the HTTPS `workers.dev` URL printed by Wrangler and append `/enquiry`. Configure the frontend's public settings:

```dotenv
VITE_FORM_MODE=live
VITE_FORM_ENDPOINT=https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/enquiry
```

For GitHub Pages, set these as repository variables consumed by the deployment workflow, then rebuild. For local builds, use an ignored `.env.production.local`. Keep the checked-in portfolio defaults in demo mode. Confirm real contact/privacy information before inviting actual enquiries.

The previous PHP configuration uses `TELEGRAM_BOT_CHAT_ID`; the new Worker secret is named `TELEGRAM_CHAT_ID`. Copy the value through the secret prompt, never into browser code or tracked files.

## Local development

Backend secrets for local testing can live in ignored `server/telegram/.dev.vars`. Add an exact local frontend origin such as `http://127.0.0.1:5173` to `ALLOWED_ORIGINS` there. Run `npx wrangler@4 dev --config server/telegram/wrangler.json`.

An ignored `.env.development.local` can enable live mode with `http://127.0.0.1:8787/enquiry`; HTTP localhost endpoints are permitted only outside production. Local live testing with real secrets sends actual Telegram messages. Prefer `npm run test:unit` and browser mocks when verifying code without sending anything.

## Contract and failure behaviour

Request fields: `name`, `email`, `phone`, `agreement: true`, `website: ""`. UK national and international phone formats are normalised before forwarding. The endpoint validates inputs independently of the browser, caps the body at 4 KiB, rejects the honeypot and requires an allowed Origin.

Cloudflare rate-limit bindings cap traffic at 5 requests per minute per hashed connecting IP and 30 per minute per Cloudflare location for this Worker. These limits are approximate and IP limits may affect users sharing a network. CORS is not authentication or complete bot protection. Add stronger challenge/authentication controls if the service becomes a spam target.

Telegram credentials exist only in backend secrets. Messages are plain text, so input cannot inject Telegram HTML. Success is returned only after Telegram accepts delivery; validation, configuration, rate-limit, timeout and Telegram failures return non-success HTTP statuses. Responses use `no-store`. Application observability is disabled in the supplied configuration; do not enable request-body logging for enquiries.

The frontend prevents duplicate submissions while a request is pending, preserves entered data after failure and resets only after confirmed success. Demo mode never calls the endpoint.

For delivery diagnostics, run `npx wrangler@4 tail --config server/telegram/wrangler.json`. Only a fixed failure label and Telegram HTTP/API error codes are logged; credentials and enquiry fields are not logged. `telegram_delivery_failed` indicates an upstream rejection; `enquiry_service_unavailable` indicates a transport/parsing failure.

## Validation already performed

- Native Node tests mock Telegram transport and rate-limit bindings.
- `npx wrangler@4 deploy --dry-run --config server/telegram/wrangler.json` successfully bundles the Worker and validates its bindings.
- No Cloudflare resource was deployed and no real Telegram message was sent during implementation.

## PHP prototype diagnosis

The previous browser handler called an undefined `this.log()` before submission. Vite also served `telegram.php` as source instead of running PHP. A separate PHP server correctly returned the expected method-not-allowed JSON response; local PHP syntax and cURL checks passed. Bot credentials and chat permissions were not verified. GitHub Pages cannot execute the PHP prototype.

## References

- [Cloudflare backend secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare rate-limit bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage)
