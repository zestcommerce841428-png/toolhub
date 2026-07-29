import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { sha256 } from "../../tools/sha256-generator/logic.js";

describe("sha256", () => {
  test("pangram (well-known test vector)", async () => {
    assert.equal(
      await sha256("The quick brown fox jumps over the lazy dog"),
      "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"
    );
  });
  test("produces a 64-character hex string", async () => {
    assert.equal((await sha256("anything")).length, 64);
    assert.match(await sha256("anything"), /^[0-9a-f]{64}$/);
  });
});
