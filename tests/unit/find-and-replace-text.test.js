import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { findAndReplace, countMatches } from "../../tools/find-and-replace-text/logic.js";

describe("findAndReplace", () => {
  test("replaces the first occurrence by default", () => {
    const result = findAndReplace("cat cat cat", "cat", "dog");
    assert.equal(result.ok, true);
    assert.equal(result.result, "dog cat cat");
  });
  test("replaceAll replaces every occurrence", () => {
    const result = findAndReplace("cat cat cat", "cat", "dog", { replaceAll: true });
    assert.equal(result.result, "dog dog dog");
    assert.equal(result.matchCount, 3);
  });
  test("is case-sensitive by default", () => {
    const result = findAndReplace("Cat cat", "cat", "dog", { replaceAll: true });
    assert.equal(result.result, "Cat dog");
  });
  test("caseSensitive: false matches regardless of case", () => {
    const result = findAndReplace("Cat cat", "cat", "dog", { replaceAll: true, caseSensitive: false });
    assert.equal(result.result, "dog dog");
  });
  test("wholeWord avoids matching inside a longer word", () => {
    const result = findAndReplace("cat catalog cat", "cat", "dog", { replaceAll: true, wholeWord: true });
    assert.equal(result.result, "dog catalog dog");
  });
  test("without wholeWord, matches inside longer words too", () => {
    const result = findAndReplace("cat catalog", "cat", "dog", { replaceAll: true });
    assert.equal(result.result, "dog dogalog");
  });
  test("literal mode escapes regex special characters", () => {
    const result = findAndReplace("3.14 is pi", ".", "_", { replaceAll: true });
    assert.equal(result.result, "3_14 is pi");
  });
  test("regex mode treats the find value as a real pattern", () => {
    const result = findAndReplace("cat1 cat2 cat3", "cat\\d", "dog", { useRegex: true, replaceAll: true });
    assert.equal(result.result, "dog dog dog");
  });
  test("regex capture groups work in the replacement", () => {
    const result = findAndReplace("2026-07-30", "(\\d+)-(\\d+)-(\\d+)", "$2/$3/$1", { useRegex: true });
    assert.equal(result.result, "07/30/2026");
  });
  test("rejects an invalid regex pattern", () => {
    const result = findAndReplace("text", "(unclosed", "x", { useRegex: true });
    assert.equal(result.ok, false);
  });
  test("rejects an empty find value", () => {
    assert.equal(findAndReplace("text", "", "x").ok, false);
  });
});

describe("countMatches", () => {
  test("counts all occurrences regardless of replace-all option", () => {
    assert.equal(countMatches("a a a", "a"), 3);
  });
  test("returns 0 for no matches", () => {
    assert.equal(countMatches("hello", "xyz"), 0);
  });
  test("returns 0 (not throwing) for an invalid regex", () => {
    assert.equal(countMatches("text", "(bad", { useRegex: true }), 0);
  });
});
