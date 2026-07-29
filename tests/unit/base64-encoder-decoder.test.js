import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { encodeBase64, decodeBase64 } from "../../tools/base64-encoder-decoder/logic.js";

describe("encodeBase64", () => {
  test("encodes plain ASCII", () => {
    assert.deepEqual(encodeBase64("Hello, World!"), { ok: true, value: "SGVsbG8sIFdvcmxkIQ==" });
  });
  test("encodes an empty string", () => {
    assert.deepEqual(encodeBase64(""), { ok: true, value: "" });
  });
  test("round-trips UTF-8 text (emoji + accents)", () => {
    const original = "héllo 👋 wörld";
    const encoded = encodeBase64(original);
    assert.equal(encoded.ok, true);
    assert.deepEqual(decodeBase64(encoded.value), { ok: true, value: original });
  });
});

describe("decodeBase64", () => {
  test("decodes valid Base64", () => {
    assert.deepEqual(decodeBase64("SGVsbG8sIFdvcmxkIQ=="), { ok: true, value: "Hello, World!" });
  });
  test("rejects invalid Base64", () => {
    const result = decodeBase64("not valid base64!!!");
    assert.equal(result.ok, false);
    assert.equal(typeof result.error, "string");
  });
  test("tolerates surrounding whitespace", () => {
    assert.deepEqual(decodeBase64("  SGVsbG8=  "), { ok: true, value: "Hello" });
  });
});
