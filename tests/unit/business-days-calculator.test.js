import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isWeekend, addBusinessDays, countBusinessDaysBetween } from "../../tools/business-days-calculator/logic.js";

// 2024-01-01 was a Monday (verifiable public fact) — used as a stable
// anchor throughout instead of guessing at arbitrary dates' weekdays.
describe("isWeekend", () => {
  test("Saturday and Sunday are weekends", () => {
    assert.equal(isWeekend(new Date("2024-01-06T00:00:00")), true); // Saturday
    assert.equal(isWeekend(new Date("2024-01-07T00:00:00")), true); // Sunday
  });
  test("weekdays are not weekends", () => {
    assert.equal(isWeekend(new Date("2024-01-01T00:00:00")), false); // Monday
    assert.equal(isWeekend(new Date("2024-01-05T00:00:00")), false); // Friday
  });
});

describe("addBusinessDays", () => {
  test("adding 1 business day from Monday lands on Tuesday", () => {
    assert.equal(addBusinessDays("2024-01-01", 1).date, "2024-01-02");
  });
  test("adding 1 business day from Friday skips the weekend to Monday", () => {
    assert.equal(addBusinessDays("2024-01-05", 1).date, "2024-01-08");
  });
  test("adding 5 business days from Monday lands on the following Monday", () => {
    assert.equal(addBusinessDays("2024-01-01", 5).date, "2024-01-08");
  });
  test("a negative count subtracts business days", () => {
    assert.equal(addBusinessDays("2024-01-08", -1).date, "2024-01-05");
  });
  test("0 business days returns the start date unchanged", () => {
    assert.equal(addBusinessDays("2024-01-01", 0).date, "2024-01-01");
  });
  test("holidays are skipped in addition to weekends", () => {
    // Jan 2, 2024 (Tue) is a holiday, so +1 business day from Monday
    // should land on Wednesday, not Tuesday.
    assert.equal(addBusinessDays("2024-01-01", 1, ["2024-01-02"]).date, "2024-01-03");
  });
  test("rejects an invalid start date", () => {
    assert.equal(addBusinessDays("not-a-date", 1).ok, false);
  });
  test("rejects a non-integer count", () => {
    assert.equal(addBusinessDays("2024-01-01", 1.5).ok, false);
  });
});

describe("countBusinessDaysBetween", () => {
  test("Monday through Friday is 5 business days", () => {
    const result = countBusinessDaysBetween("2024-01-01", "2024-01-05");
    assert.equal(result.businessDays, 5);
    assert.equal(result.totalDays, 5);
  });
  test("Monday through Sunday is still 5 business days but 7 total days", () => {
    const result = countBusinessDaysBetween("2024-01-01", "2024-01-07");
    assert.equal(result.businessDays, 5);
    assert.equal(result.totalDays, 7);
  });
  test("order of arguments doesn't matter", () => {
    const forward = countBusinessDaysBetween("2024-01-01", "2024-01-05");
    const backward = countBusinessDaysBetween("2024-01-05", "2024-01-01");
    assert.equal(forward.businessDays, backward.businessDays);
  });
  test("the same date twice is 1 business day if it's a weekday", () => {
    assert.equal(countBusinessDaysBetween("2024-01-01", "2024-01-01").businessDays, 1);
  });
  test("the same date twice is 0 business days if it's a weekend", () => {
    assert.equal(countBusinessDaysBetween("2024-01-06", "2024-01-06").businessDays, 0);
  });
  test("excludes a holiday from the count", () => {
    const result = countBusinessDaysBetween("2024-01-01", "2024-01-05", ["2024-01-03"]);
    assert.equal(result.businessDays, 4);
  });
});
