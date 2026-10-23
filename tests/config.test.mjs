import assert from "node:assert/strict";
import { test } from "node:test";
import configuration from "../vite.config.js";

test("live endpoints are validated before a site can be built", () => {
  const mode = process.env.VITE_FORM_MODE;
  const endpoint = process.env.VITE_FORM_ENDPOINT;
  try {
    process.env.VITE_FORM_MODE = "live";
    for (const value of [
      "",
      "http://enquiries.example/enquiry",
      "https://enquiries.example/wrong",
      "https://enquiries.example/enquiry?secret=example",
      "https://user:password@enquiries.example/enquiry",
    ]) {
      process.env.VITE_FORM_ENDPOINT = value;
      assert.throws(() => configuration({ mode: "production" }));
    }
    process.env.VITE_FORM_ENDPOINT = "https://enquiries.example/enquiry";
    assert.doesNotThrow(() => configuration({ mode: "production" }));
    process.env.VITE_FORM_ENDPOINT = "http://127.0.0.1:8787/enquiry";
    assert.throws(() => configuration({ mode: "production" }));
    assert.doesNotThrow(() => configuration({ mode: "development" }));
  } finally {
    if (mode === undefined) {
      delete process.env.VITE_FORM_MODE;
    } else {
      process.env.VITE_FORM_MODE = mode;
    }
    if (endpoint === undefined) {
      delete process.env.VITE_FORM_ENDPOINT;
    } else {
      process.env.VITE_FORM_ENDPOINT = endpoint;
    }
  }
});
