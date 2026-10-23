import { validateEnquiry } from "./validation.js";

const MAX_BYTES = 4096;

export function createHandler(send = fetch) {
  return async (request, env) => {
    const origin = request.headers.get("Origin");
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      Vary: "Origin",
      "X-Content-Type-Options": "nosniff",
    };
    const reply = (status, message, extra = {}) =>
      new Response(JSON.stringify({ success: status < 400, message }), {
        status,
        headers: { ...headers, ...extra },
      });
    if (!origin || !allowed.includes(origin)) {
      return reply(403, "This origin is not allowed.");
    }
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    if (new URL(request.url).pathname !== "/enquiry") {
      return reply(404, "Endpoint not found.");
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") {
      return reply(405, "Use POST for enquiries.", { Allow: "POST, OPTIONS" });
    }
    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
      return reply(415, "Use a JSON request.");
    }
    if (Number(request.headers.get("Content-Length")) > MAX_BYTES) {
      return reply(413, "The enquiry is too large.");
    }
    if (
      !env.TELEGRAM_BOT_TOKEN ||
      !env.TELEGRAM_CHAT_ID ||
      !env.ENQUIRY_LIMITER ||
      !env.GLOBAL_LIMITER
    ) {
      return reply(503, "The enquiry service is not configured.");
    }
    try {
      const ip = request.headers.get("CF-Connecting-IP");
      if (!ip) {
        return reply(400, "Unable to identify the request.");
      }
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
      const key = [...new Uint8Array(digest)]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      const local = await env.ENQUIRY_LIMITER.limit({ key });
      const global = await env.GLOBAL_LIMITER.limit({ key: "enquiries" });
      if (!local.success || !global.success) {
        return reply(429, "Too many enquiries. Please try again in a minute.", {
          "Retry-After": "60",
        });
      }
      const reader = request.body?.getReader();
      if (!reader) {
        return reply(400, "The enquiry is empty.");
      }
      const chunks = [];
      let size = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        size += value.byteLength;
        if (size > MAX_BYTES) {
          await reader.cancel();
          return reply(413, "The enquiry is too large.");
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      let data;
      try {
        data = JSON.parse(new TextDecoder().decode(bytes));
      } catch {
        return reply(400, "The enquiry is not valid JSON.");
      }
      if (typeof data?.website === "string" && data.website.trim()) {
        return reply(400, "Unable to accept this enquiry.");
      }
      const enquiry = validateEnquiry(data);
      if (!enquiry) {
        return reply(
          400,
          "Please check your name, email address, UK phone number and privacy acknowledgement.",
        );
      }
      const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());
      const response = await send(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: `New website enquiry\n\nName: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nTime (Europe/London): ${time}`,
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        console.error("telegram_delivery_failed", response.status, result.error_code ?? "unknown");
        return reply(502, "Your enquiry could not be delivered. Please try again later.");
      }
      return reply(200, "Your enquiry has been sent. Thank you for getting in touch.");
    } catch {
      console.error("enquiry_service_unavailable");
      return reply(502, "The enquiry service is unavailable. Please try again later.");
    }
  };
}

export default { fetch: createHandler() };
