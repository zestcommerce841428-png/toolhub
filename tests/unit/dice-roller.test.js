import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { rollDice, summarizeRolls } from "../../tools/dice-roller/logic.js";

describe("rollDice", () => {
  test("rolls the requested number of dice", () => {
    const result = rollDice(5, 6);
    assert.equal(result.ok, true);
    assert.equal(result.rolls.length, 5);
  });
  test("every roll is within [1, sides]", () => {
    const result = rollDice(100, 6);
    assert.equal(result.ok, true);
    assert.ok(result.rolls.every((roll) => roll >= 1 && roll <= 6));
  });
  test("rejects more than 100 dice", () => {
    assert.equal(rollDice(101, 6).ok, false);
  });
  test("total is the sum of individual rolls", () => {
    const result = rollDice(3, 6);
    assert.equal(result.total, result.rolls.reduce((sum, r) => sum + r, 0));
  });
  test("a d2 (coin-like) only ever rolls 1 or 2", () => {
    const result = rollDice(100, 2);
    assert.ok(result.rolls.every((roll) => roll === 1 || roll === 2));
  });
  test("rejects 0 or negative dice count", () => {
    assert.equal(rollDice(0, 6).ok, false);
    assert.equal(rollDice(-1, 6).ok, false);
  });
  test("rejects fewer than 2 sides", () => {
    assert.equal(rollDice(1, 1).ok, false);
  });
  test("rejects a non-integer dice count", () => {
    assert.equal(rollDice(2.5, 6).ok, false);
  });
});

describe("summarizeRolls", () => {
  test("computes count, min, max, and average", () => {
    const summary = summarizeRolls([1, 2, 3, 4, 5, 6]);
    assert.equal(summary.count, 6);
    assert.equal(summary.min, 1);
    assert.equal(summary.max, 6);
    assert.equal(summary.average, 3.5);
  });
  test("empty history returns zeroed stats, not NaN", () => {
    const summary = summarizeRolls([]);
    assert.deepEqual(summary, { count: 0, min: 0, max: 0, average: 0 });
  });
});
