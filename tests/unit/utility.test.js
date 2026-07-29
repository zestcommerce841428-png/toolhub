import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { clamp, uniqueId, escapeHtml, formatBytes, pluralize } from "../../assets/js/core/utility.js";

describe("clamp", () => {
  test("clamps within range", () => {
    assert.equal(clamp(5, 0, 10), 5);
    assert.equal(clamp(-5, 0, 10), 0);
    assert.equal(clamp(15, 0, 10), 10);
  });
});

test("uniqueId returns distinct, prefixed ids", () => {
  const a = uniqueId("field");
  const b = uniqueId("field");
  assert.notEqual(a, b);
  assert.ok(a.startsWith("field-"));
});

describe("escapeHtml", () => {
  test("escapes the five HTML-significant characters", () => {
    assert.equal(escapeHtml(`<a href="x">O'Brien & Co</a>`), "&lt;a href=&quot;x&quot;&gt;O&#39;Brien &amp; Co&lt;/a&gt;");
  });
  test("passes through plain text unchanged", () => {
    assert.equal(escapeHtml("just plain text 123"), "just plain text 123");
  });
});

describe("formatBytes", () => {
  test("formats common magnitudes", () => {
    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(1536), "1.5 KB");
    assert.equal(formatBytes(1024 * 1024 * 2), "2.0 MB");
  });
});

describe("pluralize", () => {
  test("singular vs plural", () => {
    assert.equal(pluralize(1, "word"), "1 word");
    assert.equal(pluralize(2, "word"), "2 words");
    assert.equal(pluralize(0, "word"), "0 words");
  });
  test("supports an irregular plural", () => {
    assert.equal(pluralize(2, "child", "children"), "2 children");
  });
});
