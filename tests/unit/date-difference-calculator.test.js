import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateDateDifference } from "../../tools/date-difference-calculator/logic.js";

describe("calculateDateDifference", () => {
  test("computes years/months/days breakdown", () => {
    const result = calculateDateDifference("2020-01-15", "2026-07-30");
    assert.equal(result.ok, true);
    assert.equal(result.years, 6);
    assert.equal(result.months, 6);
    assert.equal(result.days, 15);
  });
  test("order of arguments doesn't matter — result is the same either way", () => {
    const forward = calculateDateDifference("2020-01-15", "2026-07-30");
    const backward = calculateDateDifference("2026-07-30", "2020-01-15");
    assert.equal(forward.years, backward.years);
    assert.equal(forward.months, backward.months);
    assert.equal(forward.days, backward.days);
    assert.equal(forward.totalDays, backward.totalDays);
  });
  test("identifies which date is earlier regardless of argument order", () => {
    const result = calculateDateDifference("2026-07-30", "2020-01-15");
    assert.equal(result.earlier, "2020-01-15");
    assert.equal(result.later, "2026-07-30");
  });
  test("the same date twice is a zero difference", () => {
    const result = calculateDateDifference("2026-01-01", "2026-01-01");
    assert.equal(result.isSameDay, true);
    assert.equal(result.totalDays, 0);
  });
  test("totalDays matches a known 365-day non-leap-year gap", () => {
    const result = calculateDateDifference("2025-01-01", "2026-01-01");
    assert.equal(result.totalDays, 365);
  });
  test("totalWeeks is totalDays divided by 7, floored", () => {
    const result = calculateDateDifference("2026-01-01", "2026-01-10");
    assert.equal(result.totalDays, 9);
    assert.equal(result.totalWeeks, 1);
  });
  test("rejects an invalid date", () => {
    assert.equal(calculateDateDifference("not-a-date", "2026-01-01").ok, false);
  });
});
