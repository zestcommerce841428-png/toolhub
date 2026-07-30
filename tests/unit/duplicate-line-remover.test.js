import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { removeDuplicateLines } from "../../tools/duplicate-line-remover/logic.js";

describe("removeDuplicateLines", () => {
  test("removes duplicates, keeping the first occurrence by default", () => {
    const result = removeDuplicateLines("a\nb\na\nc");
    assert.equal(result.result, "a\nb\nc");
    assert.equal(result.removedCount, 1);
  });
  test("keepLast keeps the last occurrence, in original relative order", () => {
    const result = removeDuplicateLines("a\nb\na\nc", { keepLast: true });
    assert.equal(result.result, "b\na\nc");
  });
  test("case-sensitive by default: 'A' and 'a' are different lines", () => {
    const result = removeDuplicateLines("A\na");
    assert.equal(result.result, "A\na");
    assert.equal(result.removedCount, 0);
  });
  test("caseSensitive: false treats 'A' and 'a' as duplicates", () => {
    const result = removeDuplicateLines("A\na", { caseSensitive: false });
    assert.equal(result.result, "A");
    assert.equal(result.removedCount, 1);
  });
  test("trimLines treats ' a' and 'a' as duplicates", () => {
    const result = removeDuplicateLines("a\n a ", { trimLines: true });
    assert.equal(result.removedCount, 1);
  });
  test("no duplicates leaves text unchanged", () => {
    const result = removeDuplicateLines("a\nb\nc");
    assert.equal(result.result, "a\nb\nc");
    assert.equal(result.removedCount, 0);
  });
  test("empty input", () => {
    const result = removeDuplicateLines("");
    assert.equal(result.result, "");
    assert.equal(result.removedCount, 0);
  });
});
