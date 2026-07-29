import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateRandomInts } from "../../tools/random-number-generator/logic.js";

describe("generateRandomInts", () => {
  test("generates the requested count within range, duplicates allowed", () => {
    const result = generateRandomInts({ min: 1, max: 10, count: 20, allowDuplicates: true });
    assert.equal(result.ok, true);
    assert.equal(result.values.length, 20);
    assert.ok(result.values.every((v) => v >= 1 && v <= 10));
  });

  test("no-duplicates mode returns unique values", () => {
    const result = generateRandomInts({ min: 1, max: 50, count: 20, allowDuplicates: false });
    assert.equal(result.ok, true);
    assert.equal(new Set(result.values).size, 20);
  });

  test("no-duplicates mode can exactly exhaust the range", () => {
    const result = generateRandomInts({ min: 1, max: 5, count: 5, allowDuplicates: false });
    assert.equal(result.ok, true);
    assert.deepEqual([...result.values].sort((a, b) => a - b), [1, 2, 3, 4, 5]);
  });

  test("rejects requesting more unique values than the range contains", () => {
    const result = generateRandomInts({ min: 1, max: 3, count: 4, allowDuplicates: false });
    assert.equal(result.ok, false);
  });

  test("rejects min > max", () => {
    assert.equal(generateRandomInts({ min: 10, max: 1, count: 1, allowDuplicates: true }).ok, false);
  });

  test("rejects a non-positive count", () => {
    assert.equal(generateRandomInts({ min: 1, max: 10, count: 0, allowDuplicates: true }).ok, false);
  });
});
