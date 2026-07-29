import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveUpcADigits, buildUpcAModules } from "../../tools/upc-a-barcode-generator/logic.js";
import { buildEan13Modules } from "../../tools/ean13-barcode-generator/logic.js";

describe("resolveUpcADigits", () => {
  test("accepts 11 digits and computes the 12th", () => {
    // Well-known real UPC-A: 036000291452 (a widely-cited example, Wrigley's gum).
    const result = resolveUpcADigits("03600029145");
    assert.equal(result.ok, true);
    assert.equal(result.digits, "036000291452");
  });
  test("accepts 12 digits with a correct check digit", () => {
    assert.equal(resolveUpcADigits("036000291452").ok, true);
  });
  test("rejects 12 digits with a wrong check digit", () => {
    const result = resolveUpcADigits("036000291459");
    assert.equal(result.ok, false);
    assert.match(result.error, /036000291452/);
  });
  test("rejects the wrong length", () => {
    assert.equal(resolveUpcADigits("123").ok, false);
  });
});

describe("buildUpcAModules", () => {
  test("is exactly 95 modules, same as EAN-13", () => {
    assert.equal(buildUpcAModules("036000291452").length, 95);
  });
  test("is identical to encoding the same digits as EAN-13 with a leading 0", () => {
    const upcModules = buildUpcAModules("036000291452");
    const ean13Modules = buildEan13Modules("0036000291452");
    assert.equal(upcModules, ean13Modules);
  });
  test("throws on the wrong length", () => {
    assert.throws(() => buildUpcAModules("123"));
  });
});
