import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeLineDiff, summarizeDiff } from "../../tools/text-diff-checker/logic.js";

describe("computeLineDiff", () => {
  test("identical texts produce an all-equal diff", () => {
    const result = computeLineDiff("a\nb\nc", "a\nb\nc");
    assert.equal(result.ok, true);
    assert.ok(result.diff.every((entry) => entry.type === "equal"));
    assert.equal(result.diff.length, 3);
  });
  test("a single added line", () => {
    const result = computeLineDiff("a\nc", "a\nb\nc");
    assert.deepEqual(result.diff, [
      { type: "equal", line: "a" },
      { type: "add", line: "b" },
      { type: "equal", line: "c" },
    ]);
  });
  test("a single removed line", () => {
    const result = computeLineDiff("a\nb\nc", "a\nc");
    assert.deepEqual(result.diff, [
      { type: "equal", line: "a" },
      { type: "remove", line: "b" },
      { type: "equal", line: "c" },
    ]);
  });
  test("a changed line shows as a remove followed by an add", () => {
    const result = computeLineDiff("hello world", "hello there");
    assert.deepEqual(result.diff, [
      { type: "remove", line: "hello world" },
      { type: "add", line: "hello there" },
    ]);
  });
  test("completely different texts show all removed then all added", () => {
    const result = computeLineDiff("x\ny", "p\nq");
    const types = result.diff.map((entry) => entry.type);
    assert.ok(types.includes("remove"));
    assert.ok(types.includes("add"));
    assert.ok(!types.includes("equal"));
  });
  test("empty vs. non-empty text", () => {
    const result = computeLineDiff("", "a\nb");
    // "" splits to one empty-string line, so expect one remove + two adds.
    assert.equal(result.diff.filter((e) => e.type === "add").length, 2);
  });
  test("rejects pathologically large inputs rather than hanging", () => {
    const huge = Array.from({ length: 3000 }, (_, i) => `line ${i}`).join("\n");
    const result = computeLineDiff(huge, huge + "\nmore");
    // 3000 x 3001 = 9,003,000 > MAX_CELLS (4,000,000)
    assert.equal(result.ok, false);
    assert.match(result.error, /Too large/);
  });
});

describe("summarizeDiff", () => {
  test("counts each type correctly", () => {
    const result = computeLineDiff("a\nb\nc", "a\nx\nc");
    const summary = summarizeDiff(result.diff);
    assert.equal(summary.unchanged, 2);
    assert.equal(summary.removals, 1);
    assert.equal(summary.additions, 1);
  });
});
