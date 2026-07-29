import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateSlug } from "../../tools/slug-generator/logic.js";

describe("generateSlug", () => {
  test("basic title case sentence", () => {
    assert.equal(generateSlug("My Blog Post Title"), "my-blog-post-title");
  });
  test("strips accents to their base letter", () => {
    assert.equal(generateSlug("Amelie"), "amelie");
    assert.equal(generateSlug(String.fromCharCode(67, 97, 102, 233)), "cafe");
  });
  test("collapses multiple special characters into one separator", () => {
    assert.equal(generateSlug("Hello   World!!!  2026"), "hello-world-2026");
  });
  test("trims leading/trailing separators", () => {
    assert.equal(generateSlug("  --Hello World--  "), "hello-world");
  });
  test("supports an underscore separator", () => {
    assert.equal(generateSlug("Hello World", { separator: "_" }), "hello_world");
  });
  test("preserving-case option keeps original case", () => {
    assert.equal(generateSlug("Hello World", { lowercase: false }), "Hello-World");
  });
  test("truncates at a separator boundary near maxLength, not mid-word", () => {
    const slug = generateSlug("my very long blog post title here", { maxLength: 15 });
    assert.ok(slug.length <= 15);
    assert.ok(!slug.endsWith("-"));
  });
  test("empty input produces an empty slug", () => {
    assert.equal(generateSlug(""), "");
  });
  test("is idempotent — slugifying a slug returns the same slug", () => {
    const once = generateSlug("Hello, World! 2026");
    assert.equal(generateSlug(once), once);
  });
});
