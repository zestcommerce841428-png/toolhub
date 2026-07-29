import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { sha1 } from "../../tools/sha1-generator/logic.js";

describe("sha1", () => {
  test("pangram (well-known test vector)", async () => {
    assert.equal(
      await sha1("The quick brown fox jumps over the lazy dog"),
      "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"
    );
  });
  test("produces a 40-character hex string", async () => {
    assert.equal((await sha1("anything")).length, 40);
    assert.match(await sha1("anything"), /^[0-9a-f]{40}$/);
  });
});
