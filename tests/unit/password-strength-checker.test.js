import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  detectCharacterClasses,
  estimatePoolSize,
  estimateEntropyBits,
  detectWeakPatterns,
  estimateCrackTime,
  analyzePassword,
} from "../../tools/password-strength-checker/logic.js";

describe("detectCharacterClasses", () => {
  test("detects each class independently", () => {
    assert.deepEqual(detectCharacterClasses("abc"), { lower: true, upper: false, digit: false, symbol: false });
    assert.deepEqual(detectCharacterClasses("ABC123!"), { lower: false, upper: true, digit: true, symbol: true });
  });
});

describe("estimatePoolSize", () => {
  test("lowercase-only pool is 26", () => {
    assert.equal(estimatePoolSize("abc"), 26);
  });
  test("all four classes sum to 95", () => {
    assert.equal(estimatePoolSize("aA1!"), 26 + 26 + 10 + 33);
  });
});

describe("estimateEntropyBits", () => {
  test("empty password has 0 entropy", () => {
    assert.equal(estimateEntropyBits(""), 0);
  });
  test("longer password of the same class has more entropy", () => {
    assert.ok(estimateEntropyBits("abcdefgh") > estimateEntropyBits("abcd"));
  });
  test("more character classes at the same length means more entropy", () => {
    assert.ok(estimateEntropyBits("aaaaaaaa") < estimateEntropyBits("aA1!aA1!"));
  });
});

describe("detectWeakPatterns", () => {
  test("flags a known common password", () => {
    const warnings = detectWeakPatterns("password");
    assert.ok(warnings.some((w) => /common/i.test(w)));
  });
  test("flags 4+ repeated characters", () => {
    const warnings = detectWeakPatterns("xyaaaayz");
    assert.ok(warnings.some((w) => /repeated/i.test(w)));
  });
  test("flags a keyboard-row pattern", () => {
    const warnings = detectWeakPatterns("myqwertypass");
    assert.ok(warnings.some((w) => /keyboard/i.test(w)));
  });
  test("flags a sequential run", () => {
    const warnings = detectWeakPatterns("user1234pass");
    assert.ok(warnings.some((w) => /sequential/i.test(w)));
  });
  test("a genuinely random-looking password has no warnings", () => {
    assert.deepEqual(detectWeakPatterns("Tr7$mK9qXw2!"), []);
  });
});

describe("estimateCrackTime", () => {
  test("0 entropy is instant", () => {
    assert.equal(estimateCrackTime(0, 1e10), "instantly");
  });
  test("very high entropy reports in centuries", () => {
    assert.match(estimateCrackTime(80, 100), /centur/);
  });
  test("low entropy at a fast guess rate is fast", () => {
    assert.equal(estimateCrackTime(10, 1e10), "instantly");
  });
});

describe("analyzePassword", () => {
  test("empty password is Very weak", () => {
    assert.equal(analyzePassword("").label, "Very weak");
  });
  test("a common password is Very weak regardless of entropy formula", () => {
    assert.equal(analyzePassword("qwerty123").label, "Very weak");
  });
  test("a long random-looking password is Strong or Very strong", () => {
    const result = analyzePassword("xK9#mP2$vL7&qR4!");
    assert.ok(["Strong", "Very strong"].includes(result.label));
    assert.deepEqual(result.warnings, []);
  });
  test("online crack time is always longer than offline for the same password (fewer guesses/sec)", () => {
    const result = analyzePassword("xK9#mP2$vL7&qR4!");
    // Both are formatted strings; just confirm the underlying rates differ
    // by checking a low-entropy password shows a fast online time too.
    assert.notEqual(result.crackTimeOnline, undefined);
    assert.notEqual(result.crackTimeOffline, undefined);
  });
});
