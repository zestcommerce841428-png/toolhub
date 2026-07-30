import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  validateStops,
  buildLinearGradient,
  buildRadialGradient,
  evenlyDistributedPositions,
} from "../../tools/css-gradient-generator/logic.js";

describe("validateStops", () => {
  test("accepts 2 valid stops", () => {
    assert.equal(validateStops([{ color: "#ff0000", position: 0 }, { color: "#0000ff", position: 100 }]).ok, true);
  });
  test("rejects fewer than 2 stops", () => {
    assert.equal(validateStops([{ color: "#ff0000", position: 0 }]).ok, false);
  });
  test("rejects an invalid hex color", () => {
    assert.equal(validateStops([{ color: "not-a-color", position: 0 }, { color: "#000", position: 100 }]).ok, false);
  });
  test("rejects a position outside 0-100", () => {
    assert.equal(validateStops([{ color: "#ff0000", position: -5 }, { color: "#000", position: 100 }]).ok, false);
    assert.equal(validateStops([{ color: "#ff0000", position: 0 }, { color: "#000", position: 105 }]).ok, false);
  });
});

describe("buildLinearGradient", () => {
  test("produces a valid linear-gradient CSS string", () => {
    const result = buildLinearGradient([{ color: "#ff0000", position: 0 }, { color: "#0000ff", position: 100 }], 90);
    assert.equal(result.ok, true);
    assert.equal(result.css, "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)");
  });
  test("supports 3+ stops", () => {
    const result = buildLinearGradient(
      [
        { color: "#ff0000", position: 0 },
        { color: "#00ff00", position: 50 },
        { color: "#0000ff", position: 100 },
      ],
      45
    );
    assert.match(result.css, /^linear-gradient\(45deg, #ff0000 0%, #00ff00 50%, #0000ff 100%\)$/);
  });
  test("propagates a validation error", () => {
    const result = buildLinearGradient([{ color: "bad", position: 0 }], 90);
    assert.equal(result.ok, false);
  });
});

describe("buildRadialGradient", () => {
  test("produces a valid radial-gradient CSS string", () => {
    const result = buildRadialGradient([{ color: "#ff0000", position: 0 }, { color: "#0000ff", position: 100 }], "circle");
    assert.equal(result.ok, true);
    assert.equal(result.css, "radial-gradient(circle, #ff0000 0%, #0000ff 100%)");
  });
  test("supports the ellipse shape", () => {
    const result = buildRadialGradient([{ color: "#ff0000", position: 0 }, { color: "#0000ff", position: 100 }], "ellipse");
    assert.match(result.css, /^radial-gradient\(ellipse,/);
  });
});

describe("evenlyDistributedPositions", () => {
  test("2 stops are at 0 and 100", () => {
    assert.deepEqual(evenlyDistributedPositions(2), [0, 100]);
  });
  test("3 stops are at 0, 50, 100", () => {
    assert.deepEqual(evenlyDistributedPositions(3), [0, 50, 100]);
  });
  test("1 stop is just 0", () => {
    assert.deepEqual(evenlyDistributedPositions(1), [0]);
  });
});
