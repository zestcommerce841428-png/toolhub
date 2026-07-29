import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeHmac, HMAC_ALGORITHMS } from "../../tools/hmac-generator/logic.js";

describe("computeHmac", () => {
  test("HMAC-SHA256 matches the well-known RFC 4231 test vector", async () => {
    // RFC 4231 test case 1: key = 0x0b * 20, data = "Hi There".
    const key = String.fromCharCode(...Array(20).fill(0x0b));
    const hmac = await computeHmac("Hi There", key, "HMAC-SHA256");
    assert.equal(hmac, "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7");
  });
  test("is deterministic", async () => {
    const a = await computeHmac("message", "secret", "HMAC-SHA256");
    const b = await computeHmac("message", "secret", "HMAC-SHA256");
    assert.equal(a, b);
  });
  test("different secrets produce different digests", async () => {
    const a = await computeHmac("message", "secret1", "HMAC-SHA256");
    const b = await computeHmac("message", "secret2", "HMAC-SHA256");
    assert.notEqual(a, b);
  });
  test("different algorithms produce different-length digests", async () => {
    const sha1 = await computeHmac("x", "k", "HMAC-SHA1");
    const sha256 = await computeHmac("x", "k", "HMAC-SHA256");
    const sha512 = await computeHmac("x", "k", "HMAC-SHA512");
    assert.equal(sha1.length, 40);
    assert.equal(sha256.length, 64);
    assert.equal(sha512.length, 128);
  });
  test("throws on an unknown algorithm", async () => {
    await assert.rejects(() => computeHmac("x", "k", "HMAC-MD5"));
  });
  test("exposes exactly the four supported algorithms", () => {
    assert.deepEqual(Object.keys(HMAC_ALGORITHMS), ["HMAC-SHA1", "HMAC-SHA256", "HMAC-SHA384", "HMAC-SHA512"]);
  });
});
