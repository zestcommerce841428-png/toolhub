import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { relativeLuminance, contrastRatio, evaluateWcagCompliance, checkContrast } from "../../tools/color-contrast-checker/logic.js";

describe("relativeLuminance", () => {
  test("black is 0", () => {
    assert.equal(relativeLuminance({ r: 0, g: 0, b: 0 }), 0);
  });
  test("white is 1", () => {
    assert.ok(Math.abs(relativeLuminance({ r: 255, g: 255, b: 255 }) - 1) < 1e-9);
  });
});

describe("contrastRatio", () => {
  test("black on white is the maximum possible ratio, 21:1", () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    assert.ok(Math.abs(ratio - 21) < 0.01);
  });
  test("a color against itself is always 1:1", () => {
    const ratio = contrastRatio({ r: 128, g: 64, b: 200 }, { r: 128, g: 64, b: 200 });
    assert.ok(Math.abs(ratio - 1) < 1e-9);
  });
  test("order of the two colors doesn't matter", () => {
    const a = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 200, g: 200, b: 200 });
    const b = contrastRatio({ r: 200, g: 200, b: 200 }, { r: 0, g: 0, b: 0 });
    assert.equal(a, b);
  });
});

describe("evaluateWcagCompliance", () => {
  test("21:1 (black/white) passes every threshold", () => {
    const compliance = evaluateWcagCompliance(21);
    assert.ok(Object.values(compliance).every(Boolean));
  });
  test("1:1 (identical colors) fails every threshold", () => {
    const compliance = evaluateWcagCompliance(1);
    assert.ok(Object.values(compliance).every((v) => v === false));
  });
  test("4.5:1 passes AA normal text exactly at the boundary", () => {
    assert.equal(evaluateWcagCompliance(4.5).aaNormal, true);
    assert.equal(evaluateWcagCompliance(4.49).aaNormal, false);
  });
  test("3:1 passes AA large text but not AA normal text", () => {
    const compliance = evaluateWcagCompliance(3);
    assert.equal(compliance.aaLarge, true);
    assert.equal(compliance.aaNormal, false);
  });
});

describe("checkContrast", () => {
  test("black vs white end to end", () => {
    const result = checkContrast("#000000", "#ffffff");
    assert.equal(result.ok, true);
    assert.ok(Math.abs(result.ratio - 21) < 0.01);
    assert.equal(result.compliance.aaaNormal, true);
  });
  test("rejects an invalid hex color", () => {
    assert.equal(checkContrast("not-a-color", "#ffffff").ok, false);
    assert.equal(checkContrast("#ffffff", "not-a-color").ok, false);
  });
  test("accepts shorthand 3-digit hex", () => {
    const result = checkContrast("#000", "#fff");
    assert.equal(result.ok, true);
    assert.ok(Math.abs(result.ratio - 21) < 0.01);
  });
});
