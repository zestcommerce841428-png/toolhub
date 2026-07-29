import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { DATA_UNITS, convertDataSize, convertToAllUnits, formatDataSize } from "../../tools/data-storage-converter/logic.js";

describe("convertDataSize", () => {
  test("1 byte is 8 bits", () => {
    assert.equal(convertDataSize(1, "byte", "bit"), 8);
  });
  test("same unit is a no-op", () => {
    assert.equal(convertDataSize(3, "gb", "gb"), 3);
  });
  test("1 KB (decimal) is 1000 bytes", () => {
    assert.equal(convertDataSize(1, "kb", "byte"), 1000);
  });
  test("1 KiB (binary) is 1024 bytes — genuinely different from KB", () => {
    assert.equal(convertDataSize(1, "kib", "byte"), 1024);
  });
  test("1 TB (decimal) is less than 1 TiB (binary) when both expressed in bytes", () => {
    const tbInBytes = convertDataSize(1, "tb", "byte");
    const tibInBytes = convertDataSize(1, "tib", "byte");
    assert.ok(tbInBytes < tibInBytes);
  });
  test("reproduces the well-known '1 TB drive shows ~931 GiB' fact", () => {
    const tbInGib = convertDataSize(1, "tb", "gib");
    assert.ok(Math.abs(tbInGib - 931.32) < 0.01);
  });
  test("throws on an unknown unit", () => {
    assert.throws(() => convertDataSize(1, "nibbles", "byte"));
  });
});

describe("convertToAllUnits", () => {
  test("returns one entry per supported unit", () => {
    assert.equal(convertToAllUnits(1, "gb").length, DATA_UNITS.length);
  });
});

describe("formatDataSize", () => {
  test("handles non-finite input", () => {
    assert.equal(formatDataSize(NaN), "—");
  });
});
