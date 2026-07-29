import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { secureRandomInt, secureShuffle, secureChoice } from "../../assets/js/core/random.js";

describe("secureRandomInt", () => {
  test("returns the only possible value when min === max", () => {
    assert.equal(secureRandomInt(5, 5), 5);
  });

  test("stays within an inclusive range across many draws", () => {
    for (let i = 0; i < 500; i++) {
      const value = secureRandomInt(3, 7);
      assert.ok(value >= 3 && value <= 7, `${value} out of range [3,7]`);
    }
  });

  test("covers a small range's every value given enough draws", () => {
    const seen = new Set();
    for (let i = 0; i < 500; i++) seen.add(secureRandomInt(0, 2));
    assert.deepEqual([...seen].sort(), [0, 1, 2]);
  });

  test("works for large ranges spanning multiple bytes", () => {
    for (let i = 0; i < 200; i++) {
      const value = secureRandomInt(0, 1_000_000);
      assert.ok(value >= 0 && value <= 1_000_000);
      assert.ok(Number.isInteger(value));
    }
  });

  test("rejects a max below min", () => {
    assert.throws(() => secureRandomInt(10, 5), RangeError);
  });

  test("rejects non-integer bounds", () => {
    assert.throws(() => secureRandomInt(1.5, 5), RangeError);
  });
});

describe("secureShuffle", () => {
  test("returns an array with the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const shuffled = secureShuffle(input);
    assert.deepEqual([...shuffled].sort(), input);
  });

  test("does not mutate the input array", () => {
    const input = [1, 2, 3];
    const original = [...input];
    secureShuffle(input);
    assert.deepEqual(input, original);
  });
});

describe("secureChoice", () => {
  test("always returns an element from the array", () => {
    const options = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) {
      assert.ok(options.includes(secureChoice(options)));
    }
  });

  test("rejects an empty array", () => {
    assert.throws(() => secureChoice([]), RangeError);
  });
});
