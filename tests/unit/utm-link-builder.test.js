import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildUtmUrl, hasRequiredUtmParams } from "../../tools/utm-link-builder/logic.js";

describe("buildUtmUrl", () => {
  test("appends UTM params to a clean URL", () => {
    const result = buildUtmUrl("https://example.com/", {
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring_sale",
    });
    assert.equal(result.ok, true);
    const url = new URL(result.url);
    assert.equal(url.searchParams.get("utm_source"), "newsletter");
    assert.equal(url.searchParams.get("utm_medium"), "email");
    assert.equal(url.searchParams.get("utm_campaign"), "spring_sale");
  });
  test("merges with an existing query string instead of overwriting it", () => {
    const result = buildUtmUrl("https://example.com/page?ref=123", { utm_source: "twitter", utm_medium: "social" });
    const url = new URL(result.url);
    assert.equal(url.searchParams.get("ref"), "123");
    assert.equal(url.searchParams.get("utm_source"), "twitter");
  });
  test("URL-encodes values with spaces and special characters", () => {
    const result = buildUtmUrl("https://example.com/", { utm_campaign: "summer sale & clearance" });
    assert.ok(result.url.includes("utm_campaign=summer+sale+%26+clearance"));
  });
  test("omits empty UTM fields entirely", () => {
    const result = buildUtmUrl("https://example.com/", { utm_source: "google", utm_medium: "", utm_campaign: "" });
    assert.ok(!result.url.includes("utm_medium"));
    assert.ok(!result.url.includes("utm_campaign"));
  });
  test("rejects an invalid base URL", () => {
    const result = buildUtmUrl("not a url", { utm_source: "x" });
    assert.equal(result.ok, false);
  });
  test("rejects a relative URL", () => {
    const result = buildUtmUrl("/relative/path", { utm_source: "x" });
    assert.equal(result.ok, false);
  });
});

describe("hasRequiredUtmParams", () => {
  test("true when source, medium, and campaign are all present", () => {
    assert.equal(hasRequiredUtmParams({ utm_source: "a", utm_medium: "b", utm_campaign: "c" }), true);
  });
  test("false when any required field is missing", () => {
    assert.equal(hasRequiredUtmParams({ utm_source: "a", utm_medium: "b" }), false);
  });
  test("false when a required field is only whitespace", () => {
    assert.equal(hasRequiredUtmParams({ utm_source: "a", utm_medium: "b", utm_campaign: "   " }), false);
  });
});
