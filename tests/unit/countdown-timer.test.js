import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeRemaining, pad2 } from "../../tools/countdown-timer/logic.js";

describe("computeRemaining", () => {
  test("computes days/hours/minutes/seconds for a future target", () => {
    const now = new Date("2026-01-01T00:00:00").getTime();
    const target = "2026-01-03T01:02:03";
    const result = computeRemaining(target, now);
    assert.equal(result.ok, true);
    assert.equal(result.isPast, false);
    assert.equal(result.days, 2);
    assert.equal(result.hours, 1);
    assert.equal(result.minutes, 2);
    assert.equal(result.seconds, 3);
  });
  test("marks a past target as isPast", () => {
    const now = new Date("2026-01-05T00:00:00").getTime();
    const result = computeRemaining("2026-01-01T00:00:00", now);
    assert.equal(result.isPast, true);
    assert.equal(result.days, 4);
  });
  test("the exact target moment is treated as past (0 remaining)", () => {
    const now = new Date("2026-01-01T00:00:00").getTime();
    const result = computeRemaining("2026-01-01T00:00:00", now);
    assert.equal(result.isPast, true);
    assert.equal(result.totalMs, 0);
  });
  test("rejects an invalid date string", () => {
    const result = computeRemaining("not-a-date", Date.now());
    assert.equal(result.ok, false);
  });
});

describe("pad2", () => {
  test("pads single digits", () => {
    assert.equal(pad2(5), "05");
  });
  test("leaves two-digit numbers unchanged", () => {
    assert.equal(pad2(42), "42");
  });
});
