import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildMetaTags, analyzeTitle, analyzeDescription } from "../../tools/meta-tag-generator/logic.js";

describe("buildMetaTags", () => {
  test("includes filled fields", () => {
    const html = buildMetaTags({
      title: "My Page",
      description: "A short description.",
      url: "https://example.com/",
      imageUrl: "https://example.com/og.png",
      siteName: "ExampleSite",
      twitterHandle: "@example",
    });
    assert.match(html, /<title>My Page<\/title>/);
    assert.match(html, /name="description" content="A short description\."/);
    assert.match(html, /rel="canonical" href="https:\/\/example\.com\/"/);
    assert.match(html, /property="og:title" content="My Page"/);
    assert.match(html, /name="twitter:site" content="@example"/);
  });

  test("omits empty fields instead of emitting empty attributes", () => {
    const html = buildMetaTags({ title: "Only Title", description: "", url: "", imageUrl: "", siteName: "", twitterHandle: "" });
    assert.match(html, /<title>Only Title<\/title>/);
    assert.doesNotMatch(html, /name="description"/);
    assert.doesNotMatch(html, /rel="canonical"/);
    assert.doesNotMatch(html, /og:image/);
  });

  test("escapes HTML-significant characters in field values", () => {
    const html = buildMetaTags({ title: '<script>alert(1)</script>', description: "", url: "", imageUrl: "", siteName: "", twitterHandle: "" });
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&lt;script&gt;/);
  });
});

describe("analyzeTitle", () => {
  test("flags an empty title", () => {
    assert.equal(analyzeTitle("").status, "empty");
  });
  test("flags a too-short title", () => {
    assert.equal(analyzeTitle("Short").status, "warning");
  });
  test("accepts a well-sized title", () => {
    const title = "A".repeat(55);
    assert.equal(analyzeTitle(title).status, "good");
  });
  test("flags a too-long title", () => {
    const title = "A".repeat(90);
    assert.equal(analyzeTitle(title).status, "warning");
  });
});

describe("analyzeDescription", () => {
  test("flags an empty description", () => {
    assert.equal(analyzeDescription("").status, "empty");
  });
  test("accepts a well-sized description", () => {
    const description = "A".repeat(140);
    assert.equal(analyzeDescription(description).status, "good");
  });
});
