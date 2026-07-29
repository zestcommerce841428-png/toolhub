import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildOgTags, checkImageDimensions } from "../../tools/og-tag-generator/logic.js";

describe("buildOgTags", () => {
  test("emits basic website tags", () => {
    const output = buildOgTags({ type: "website", title: "Hello", description: "A page", url: "https://x.com" });
    assert.match(output, /<meta property="og:type" content="website" \/>/);
    assert.match(output, /<meta property="og:title" content="Hello" \/>/);
    assert.match(output, /<meta property="og:description" content="A page" \/>/);
    assert.match(output, /<meta property="og:url" content="https:\/\/x.com" \/>/);
  });
  test("escapes HTML-unsafe characters in field values", () => {
    const output = buildOgTags({ type: "website", title: '<script>alert("x")</script>' });
    assert.doesNotMatch(output, /<script>/);
    assert.match(output, /&lt;script&gt;/);
  });
  test("omits empty fields instead of emitting empty content attributes", () => {
    const output = buildOgTags({ type: "website", title: "Hello" });
    assert.doesNotMatch(output, /og:description/);
  });
  test("includes article-specific tags only when type is article", () => {
    const article = buildOgTags({ type: "article", articleAuthor: "Jane", articlePublishedTime: "2026-01-01" });
    assert.match(article, /article:author/);
    assert.match(article, /article:published_time/);

    const website = buildOgTags({ type: "website", articleAuthor: "Jane" });
    assert.doesNotMatch(website, /article:author/);
  });
  test("includes product-specific tags only when type is product", () => {
    const product = buildOgTags({ type: "product", productPriceAmount: "29.99", productPriceCurrency: "USD" });
    assert.match(product, /product:price:amount/);
    assert.match(product, /product:price:currency/);
  });
  test("defaults twitter:card to summary_large_image when not specified", () => {
    const output = buildOgTags({ type: "website" });
    assert.match(output, /twitter:card" content="summary_large_image"/);
  });
  test("uses the specified twitter card type", () => {
    const output = buildOgTags({ type: "website", twitterCard: "summary" });
    assert.match(output, /twitter:card" content="summary"/);
  });
});

describe("checkImageDimensions", () => {
  test("flags missing dimensions", () => {
    assert.equal(checkImageDimensions("", "").status, "empty");
  });
  test("flags an image that's too small", () => {
    assert.equal(checkImageDimensions(100, 100).status, "warning");
  });
  test("approves the recommended 1200x630 ratio", () => {
    assert.equal(checkImageDimensions(1200, 630).status, "good");
  });
  test("warns about an unusual aspect ratio even if large enough", () => {
    assert.equal(checkImageDimensions(1200, 1200).status, "warning");
  });
});
