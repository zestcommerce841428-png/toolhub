import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateAge } from "../../tools/age-calculator/logic.js";

function daysBetween(aIso, bIso) {
  return Math.round((new Date(`${bIso}T00:00:00`).getTime() - new Date(`${aIso}T00:00:00`).getTime()) / 86_400_000);
}

describe("calculateAge", () => {
  test("computes a calendar-correct years/months/days breakdown", () => {
    const result = calculateAge("2000-01-15", "2026-07-29");
    assert.equal(result.ok, true);
    assert.equal(result.years, 26);
    assert.equal(result.months, 6);
    assert.equal(result.days, 14);
  });

  test("totalDays matches a plain date subtraction", () => {
    const result = calculateAge("2000-01-15", "2026-07-29");
    assert.equal(result.totalDays, daysBetween("2000-01-15", "2026-07-29"));
  });

  test("next birthday rolls to next year when this year's has passed", () => {
    // Born Jan 15; "as of" July 29 means this year's Jan 15 already happened.
    const result = calculateAge("2000-01-15", "2026-07-29");
    assert.equal(result.nextBirthday.date, "2027-01-15");
    assert.equal(result.nextBirthday.daysUntil, daysBetween("2026-07-29", "2027-01-15"));
  });

  test("next birthday stays this year when it hasn't happened yet", () => {
    // Born Dec 25; "as of" July 29 means this year's Dec 25 is still ahead.
    const result = calculateAge("1990-12-25", "2026-07-29");
    assert.equal(result.nextBirthday.date, "2026-12-25");
  });

  test("birthday exactly today: zero days until next birthday", () => {
    const result = calculateAge("2000-07-29", "2026-07-29");
    assert.equal(result.years, 26);
    assert.equal(result.months, 0);
    assert.equal(result.days, 0);
    assert.equal(result.nextBirthday.daysUntil, 0);
  });

  test("rejects a birth date after the as-of date", () => {
    const result = calculateAge("2027-01-01", "2026-07-29");
    assert.equal(result.ok, false);
  });

  test("rejects invalid date strings", () => {
    assert.equal(calculateAge("not-a-date", "2026-07-29").ok, false);
    assert.equal(calculateAge("2000-01-15", "not-a-date").ok, false);
  });
});
