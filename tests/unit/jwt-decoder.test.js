import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { decodeJwt, verifyHmacSignature, formatClaimTimestamp } from "../../tools/jwt-decoder/logic.js";

// A real, well-known example HS256 token (from jwt.io's own default example),
// signed with the secret "your-256-bit-secret".
const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("decodeJwt", () => {
  test("decodes header and payload of a real token", () => {
    const result = decodeJwt(SAMPLE_TOKEN);
    assert.equal(result.ok, true);
    assert.deepEqual(result.header, { alg: "HS256", typ: "JWT" });
    assert.equal(result.payload.sub, "1234567890");
    assert.equal(result.payload.name, "John Doe");
  });
  test("rejects a token without 3 parts", () => {
    const result = decodeJwt("not.a.jwt.token.here");
    assert.equal(result.ok, false);
    assert.match(result.error, /3 dot-separated parts/);
  });
  test("rejects malformed base64/JSON", () => {
    const result = decodeJwt("not-base64.also-not-base64.sig");
    assert.equal(result.ok, false);
  });
  test("handles leading/trailing whitespace", () => {
    assert.equal(decodeJwt(`  ${SAMPLE_TOKEN}  `).ok, true);
  });
});

describe("verifyHmacSignature", () => {
  test("validates the correct secret for a well-known token", async () => {
    const result = await verifyHmacSignature(SAMPLE_TOKEN, "your-256-bit-secret");
    assert.equal(result.ok, true);
    assert.equal(result.valid, true);
  });
  test("rejects the wrong secret", async () => {
    const result = await verifyHmacSignature(SAMPLE_TOKEN, "wrong-secret");
    assert.equal(result.ok, true);
    assert.equal(result.valid, false);
  });
  test("reports an error for a non-HMAC algorithm", async () => {
    const rs256Header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: "x" })).toString("base64url");
    const result = await verifyHmacSignature(`${rs256Header}.${payload}.sig`, "secret");
    assert.equal(result.ok, false);
    assert.match(result.error, /RS256/);
  });
});

describe("formatClaimTimestamp", () => {
  test("formats a known epoch second value", () => {
    assert.equal(formatClaimTimestamp(1516239022), "2018-01-18 01:30:22 UTC");
  });
  test("handles non-finite input", () => {
    assert.equal(formatClaimTimestamp(NaN), "—");
  });
});
