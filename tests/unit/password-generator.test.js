import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generatePassword, enabledCategories, estimateEntropyBits, strengthLabel } from "../../tools/password-generator/logic.js";

const baseOptions = {
  length: 16,
  useLowercase: true,
  useUppercase: true,
  useNumbers: true,
  useSymbols: true,
  excludeAmbiguous: false,
};

describe("generatePassword", () => {
  test("generates a password of the requested length", () => {
    const result = generatePassword(baseOptions);
    assert.equal(result.ok, true);
    assert.equal(result.password.length, 16);
  });

  test("includes at least one character from every selected category", () => {
    for (let i = 0; i < 25; i++) {
      const result = generatePassword(baseOptions);
      assert.equal(result.ok, true);
      assert.ok(/[a-z]/.test(result.password), `missing lowercase: ${result.password}`);
      assert.ok(/[A-Z]/.test(result.password), `missing uppercase: ${result.password}`);
      assert.ok(/[0-9]/.test(result.password), `missing number: ${result.password}`);
      assert.ok(/[^a-zA-Z0-9]/.test(result.password), `missing symbol: ${result.password}`);
    }
  });

  test("two consecutive passwords are (almost certainly) different", () => {
    const a = generatePassword(baseOptions);
    const b = generatePassword(baseOptions);
    assert.notEqual(a.password, b.password);
  });

  test("fails when no character type is selected", () => {
    const result = generatePassword({ ...baseOptions, useLowercase: false, useUppercase: false, useNumbers: false, useSymbols: false });
    assert.equal(result.ok, false);
  });

  test("fails when length is shorter than the number of required categories", () => {
    const result = generatePassword({ ...baseOptions, length: 2 });
    assert.equal(result.ok, false);
  });

  test("excludeAmbiguous removes ambiguous characters", () => {
    for (let i = 0; i < 15; i++) {
      const result = generatePassword({ ...baseOptions, length: 40, excludeAmbiguous: true });
      assert.equal(result.ok, true);
      assert.ok(!/[il1IlL0Oo]/.test(result.password), `contains ambiguous char: ${result.password}`);
    }
  });
});

test("enabledCategories reflects the options passed in", () => {
  assert.deepEqual(enabledCategories(baseOptions), ["lowercase", "uppercase", "numbers", "symbols"]);
  assert.deepEqual(enabledCategories({ ...baseOptions, useSymbols: false }), ["lowercase", "uppercase", "numbers"]);
});

describe("strength estimation", () => {
  test("more entropy for a larger pool/length", () => {
    const small = estimateEntropyBits(8, 26);
    const large = estimateEntropyBits(20, 90);
    assert.ok(large > small);
  });

  test("strengthLabel buckets correctly", () => {
    assert.equal(strengthLabel(20), "Weak");
    assert.equal(strengthLabel(45), "Fair");
    assert.equal(strengthLabel(65), "Strong");
    assert.equal(strengthLabel(100), "Very strong");
  });
});
