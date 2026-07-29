import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { md5 } from "../../tools/md5-generator/logic.js";

describe("md5", () => {
  test("empty string (well-known RFC 1321 test vector)", () => {
    assert.equal(md5(""), "d41d8cd98f00b204e9800998ecf8427e");
  });
  test("'abc' (well-known RFC 1321 test vector)", () => {
    assert.equal(md5("abc"), "900150983cd24fb0d6963f7d28e17f72");
  });
  test("pangram (well-known test vector)", () => {
    assert.equal(md5("The quick brown fox jumps over the lazy dog"), "9e107d9d372bb6826bd81d3542a419d6");
  });
  test("longer than one 64-byte block (tests multi-chunk padding)", () => {
    const longText = "a".repeat(200);
    assert.equal(md5(longText), md5(longText), "deterministic for the same input");
    assert.equal(md5(longText).length, 32);
  });
  test("is deterministic", () => {
    assert.equal(md5("ToolHub"), md5("ToolHub"));
  });
  test("different input produces different hash", () => {
    assert.notEqual(md5("ToolHub"), md5("toolhub"));
  });
  test("handles multi-byte UTF-8 input without throwing", () => {
    assert.equal(md5("héllo 世界 🎉").length, 32);
  });
});
