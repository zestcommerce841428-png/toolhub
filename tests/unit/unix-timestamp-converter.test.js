import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { timestampToDate, dateToTimestamp } from "../../tools/unix-timestamp-converter/logic.js";

describe("timestampToDate", () => {
  test("Unix epoch 0 is 1970-01-01T00:00:00.000Z", () => {
    const result = timestampToDate(0, "seconds");
    assert.equal(result.ok, true);
    assert.equal(result.iso, "1970-01-01T00:00:00.000Z");
  });
  test("a well-known timestamp: 1700000000 seconds", () => {
    const result = timestampToDate(1700000000, "seconds");
    assert.equal(result.ok, true);
    assert.equal(result.iso, "2023-11-14T22:13:20.000Z");
  });
  test("milliseconds unit is interpreted directly, not multiplied", () => {
    const seconds = timestampToDate(1000, "seconds");
    const millis = timestampToDate(1000, "milliseconds");
    assert.equal(millis.iso, "1970-01-01T00:00:01.000Z");
    assert.notEqual(seconds.iso, millis.iso);
  });
  test("unixSeconds and unixMilliseconds round-trip consistently", () => {
    const result = timestampToDate(1700000000, "seconds");
    assert.equal(result.unixSeconds, 1700000000);
    assert.equal(result.unixMilliseconds, 1700000000000);
  });
  test("rejects non-numeric input", () => {
    assert.equal(timestampToDate(NaN, "seconds").ok, false);
  });
});

describe("dateToTimestamp", () => {
  test("round-trips through timestampToDate's local formatting", () => {
    const forward = timestampToDate(1700000000, "seconds");
    const backward = dateToTimestamp(forward.local.replace(" ", "T"));
    assert.equal(backward.unixSeconds, 1700000000);
  });
  test("rejects an invalid date string", () => {
    assert.equal(dateToTimestamp("not-a-date").ok, false);
  });
});
