import assert from "node:assert/strict";
import { test } from "node:test";
import { createHandler } from "../server/telegram/worker.js";
import { normalisePhone } from "../server/telegram/validation.js";

const origin = "https://ikatenev.github.io";
const valid = {
  name: "Alex <Smith>",
  email: "alex@example.com",
  phone: "+44 7700 900123",
  agreement: true,
  website: "",
};
const environment = () => ({
  ALLOWED_ORIGINS: origin,
  TELEGRAM_BOT_TOKEN: "test-token",
  TELEGRAM_CHAT_ID: "test-chat",
  ENQUIRY_LIMITER: { limit: async () => ({ success: true }) },
  GLOBAL_LIMITER: { limit: async () => ({ success: true }) },
});
const request = (body = valid, extras = {}) =>
  new Request("https://enquiries.example/enquiry", {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "CF-Connecting-IP": "192.0.2.1",
      ...extras,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

test("UK phone formats normalise consistently", () => {
  for (const phone of [
    "07700 900123",
    "+44 7700 900123",
    "0044 7700 900123",
    "+44 (0)7700 900123",
  ]) {
    assert.equal(normalisePhone(phone), "+447700900123");
  }
  for (const phone of ["+7 800 777 89 67", "07700abc900123", "123", "++44 7700 900123"]) {
    assert.equal(normalisePhone(phone), "");
  }
});

test("delivery uses backend secrets and plain text and waits for Telegram", async () => {
  let calls = 0;
  const handler = createHandler(async (url, options) => {
    calls++;
    assert.equal(url, "https://api.telegram.org/bottest-token/sendMessage");
    const payload = JSON.parse(options.body);
    assert.equal(payload.chat_id, "test-chat");
    assert.ok(payload.text.includes("Alex <Smith>"));
    assert.equal(payload.parse_mode, undefined);
    return Response.json({ ok: true });
  });
  const response = await handler(request(), environment());
  assert.equal(response.status, 200);
  assert.equal(calls, 1);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), origin);
  assert.ok(!(await response.text()).includes("test-token"));
});

test("invalid input, honeypot and malformed JSON never reach Telegram", async () => {
  const handler = createHandler(() => {
    throw new Error("Unexpected network call");
  });
  for (const data of [
    { ...valid, email: "invalid" },
    { ...valid, name: "" },
    { ...valid, phone: "123" },
    { ...valid, agreement: false },
    { ...valid, website: "bot" },
    null,
    "{broken",
  ]) {
    assert.equal((await handler(request(data), environment())).status, 400);
  }
});

test("disallowed origins, methods, content types and large requests fail", async () => {
  const handler = createHandler(() => {
    throw new Error("Unexpected network call");
  });
  assert.equal(
    (await handler(request(valid, { Origin: "https://other.example" }), environment())).status,
    403,
  );
  assert.equal(
    (await handler(request(valid, { "Content-Type": "text/plain" }), environment())).status,
    415,
  );
  assert.equal((await handler(request("x".repeat(4097)), environment())).status, 413);
  const get = new Request("https://enquiries.example/enquiry", { headers: { Origin: origin } });
  assert.equal((await handler(get, environment())).status, 405);
  const options = new Request("https://enquiries.example/enquiry", {
    method: "OPTIONS",
    headers: { Origin: origin },
  });
  assert.equal((await handler(options, environment())).status, 204);
});

test("rate limiting and missing configuration stop delivery", async () => {
  const handler = createHandler(() => {
    throw new Error("Unexpected network call");
  });
  const env = environment();
  env.ENQUIRY_LIMITER.limit = async () => ({ success: false });
  assert.equal((await handler(request(), env)).status, 429);
  delete env.TELEGRAM_BOT_TOKEN;
  assert.equal((await handler(request(), env)).status, 503);
});

test("Telegram rejections and transport failures are not reported as success", async () => {
  for (const send of [
    async () => Response.json({ ok: false }, { status: 400 }),
    async () => {
      throw new Error("Offline");
    },
  ]) {
    const response = await createHandler(send)(request(), environment());
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, false);
  }
});
