import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseHex, rgbToHex, formatRgbString, parseRgbString, clampByte } from "../../tools/hex-rgb-converter/logic.js";

describe("parseHex", () => {
  test("parses 6-digit hex", () => {
    assert.deepEqual(parseHex("#2563eb"), { r: 37, g: 99, b: 235, a: 1 });
  });
  test("parses without a leading #", () => {
    assert.deepEqual(parseHex("2563eb"), { r: 37, g: 99, b: 235, a: 1 });
  });
  test("expands 3-digit shorthand", () => {
    assert.deepEqual(parseHex("#f0c"), { r: 255, g: 0, b: 204, a: 1 });
  });
  test("parses 8-digit hex with alpha", () => {
    const result = parseHex("#ff00cc80");
    assert.equal(result.r, 255);
    assert.equal(result.g, 0);
    assert.equal(result.b, 204);
    assert.ok(Math.abs(result.a - 0.502) < 0.01);
  });
  test("rejects invalid input", () => {
    assert.equal(parseHex("not-a-color"), null);
    assert.equal(parseHex("#12345"), null);
  });
});

describe("rgbToHex", () => {
  test("formats opaque colors as 6 digits", () => {
    assert.equal(rgbToHex({ r: 37, g: 99, b: 235, a: 1 }), "#2563eb");
  });
  test("formats translucent colors as 8 digits", () => {
    assert.equal(rgbToHex({ r: 255, g: 0, b: 0, a: 0.5 }), "#ff000080");
  });
  test("clamps out-of-range values", () => {
    assert.equal(rgbToHex({ r: 300, g: -10, b: 128 }), "#ff0080");
  });
});

test("round trip: parseHex -> rgbToHex is stable for opaque colors", () => {
  const original = "#2563eb";
  assert.equal(rgbToHex(parseHex(original)), original);
});

describe("formatRgbString", () => {
  test("formats opaque as rgb()", () => {
    assert.equal(formatRgbString({ r: 37, g: 99, b: 235, a: 1 }), "rgb(37, 99, 235)");
  });
  test("formats translucent as rgba()", () => {
    assert.equal(formatRgbString({ r: 37, g: 99, b: 235, a: 0.4 }), "rgba(37, 99, 235, 0.4)");
  });
});

describe("parseRgbString", () => {
  test("parses rgb() syntax", () => {
    assert.deepEqual(parseRgbString("rgb(37, 99, 235)"), { r: 37, g: 99, b: 235, a: 1 });
  });
  test("parses bare comma-separated values", () => {
    assert.deepEqual(parseRgbString("255, 0, 0"), { r: 255, g: 0, b: 0, a: 1 });
  });
  test("rejects out-of-range components", () => {
    assert.equal(parseRgbString("300, 0, 0"), null);
  });
  test("rejects garbage input", () => {
    assert.equal(parseRgbString("not a color"), null);
  });
});

test("clampByte rounds and clamps to 0-255", () => {
  assert.equal(clampByte(-5), 0);
  assert.equal(clampByte(300), 255);
  assert.equal(clampByte(127.6), 128);
});
