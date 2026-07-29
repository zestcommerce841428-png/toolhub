import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateSku, randomDigits } from "../../tools/sku-generator/logic.js";

describe("generateSku", () => {
  test("builds a SKU from all fields with the default hyphen separator", () => {
    const result = generateSku({ categoryCode: "elec", productName: "Wireless Mouse", variant: "black", suffixLength: 0 });
    assert.equal(result.ok, true);
    assert.equal(result.sku, "ELEC-WIRELESSMOUSE-BLACK");
  });

  test("strips non-alphanumeric characters and uppercases", () => {
    const result = generateSku({ categoryCode: "e-lec!", productName: "", variant: "", suffixLength: 0 });
    assert.equal(result.ok, true);
    assert.equal(result.sku, "ELEC");
  });

  test("respects a custom separator, including none", () => {
    const underscored = generateSku({ categoryCode: "A", productName: "B", suffixLength: 0, separator: "_" });
    assert.equal(underscored.sku, "A_B");
    const joined = generateSku({ categoryCode: "A", productName: "B", suffixLength: 0, separator: "" });
    assert.equal(joined.sku, "AB");
  });

  test("appends a zero-padded random numeric suffix of the requested length", () => {
    const result = generateSku({ categoryCode: "A", suffixLength: 4 });
    assert.equal(result.ok, true);
    const parts = result.sku.split("-");
    const suffix = parts[parts.length - 1];
    assert.equal(suffix.length, 4);
    assert.match(suffix, /^\d{4}$/);
  });

  test("fails when there's nothing to build from and no suffix", () => {
    const result = generateSku({ categoryCode: "", productName: "", variant: "", suffixLength: 0 });
    assert.equal(result.ok, false);
  });

  test("succeeds with only a random suffix when every field is blank", () => {
    const result = generateSku({ suffixLength: 6 });
    assert.equal(result.ok, true);
    assert.match(result.sku, /^\d{6}$/);
  });
});

describe("randomDigits", () => {
  test("returns a string of the requested length", () => {
    assert.equal(randomDigits(5).length, 5);
  });
  test("returns an empty string for length 0", () => {
    assert.equal(randomDigits(0), "");
  });
  test("zero-pads short random values", () => {
    for (let i = 0; i < 30; i++) {
      assert.match(randomDigits(3), /^\d{3}$/);
    }
  });
});
