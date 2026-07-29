import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildCharacterPool, generateRandomStrings } from "../../tools/random-string-generator/logic.js";

describe("buildCharacterPool", () => {
  test("combines selected categories", () => {
    const pool = buildCharacterPool({ lowercase: true, digits: true });
    assert.ok(pool.includes("a"));
    assert.ok(pool.includes("5"));
    assert.ok(!pool.includes("A"));
  });
  test("includes custom characters", () => {
    const pool = buildCharacterPool({ customChars: "€£¥" });
    assert.equal(pool, "€£¥");
  });
  test("de-duplicates overlapping characters", () => {
    const pool = buildCharacterPool({ digits: true, customChars: "5" });
    assert.equal([...pool].filter((c) => c === "5").length, 1);
  });
  test("no selections produces an empty pool", () => {
    assert.equal(buildCharacterPool({}), "");
  });
});

describe("generateRandomStrings", () => {
  test("generates the requested count, each of the requested length", () => {
    const result = generateRandomStrings(10, 5, { lowercase: true });
    assert.equal(result.ok, true);
    assert.equal(result.strings.length, 5);
    assert.ok(result.strings.every((s) => s.length === 10));
  });
  test("only uses characters from the selected pool", () => {
    const result = generateRandomStrings(50, 1, { digits: true });
    assert.match(result.strings[0], /^[0-9]+$/);
  });
  test("two generated strings are (almost certainly) different", () => {
    const result = generateRandomStrings(20, 2, { lowercase: true, uppercase: true, digits: true });
    assert.notEqual(result.strings[0], result.strings[1]);
  });
  test("rejects an empty character pool", () => {
    const result = generateRandomStrings(10, 1, {});
    assert.equal(result.ok, false);
  });
  test("rejects a non-positive length or count", () => {
    assert.equal(generateRandomStrings(0, 1, { digits: true }).ok, false);
    assert.equal(generateRandomStrings(10, 0, { digits: true }).ok, false);
  });
});
