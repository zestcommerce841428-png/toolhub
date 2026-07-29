import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseUrlLines, buildSitemapXml, CHANGE_FREQUENCIES } from "../../tools/xml-sitemap-generator/logic.js";

describe("parseUrlLines", () => {
  test("parses a bare URL with no optional fields", () => {
    const { entries, errors } = parseUrlLines("https://example.com/");
    assert.equal(errors.length, 0);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].loc, "https://example.com/");
    assert.equal(entries[0].priority, undefined);
  });
  test("parses a full url, priority, changefreq, lastmod line", () => {
    const { entries, errors } = parseUrlLines("https://example.com/about, 0.8, monthly, 2026-01-15");
    assert.equal(errors.length, 0);
    assert.deepEqual(entries[0], {
      loc: "https://example.com/about",
      priority: "0.8",
      changefreq: "monthly",
      lastmod: "2026-01-15",
    });
  });
  test("flags a non-absolute URL", () => {
    const { errors } = parseUrlLines("/relative/path");
    assert.equal(errors.length, 1);
    assert.match(errors[0], /valid absolute/);
  });
  test("flags a priority out of 0.0-1.0 range", () => {
    const { errors } = parseUrlLines("https://example.com/, 1.5");
    assert.equal(errors.length, 1);
    assert.match(errors[0], /priority/);
  });
  test("flags an invalid changefreq value", () => {
    const { errors } = parseUrlLines("https://example.com/, 0.5, sometimes");
    assert.equal(errors.length, 1);
    assert.match(errors[0], /changefreq/);
  });
  test("accepts every valid changefreq value", () => {
    for (const freq of CHANGE_FREQUENCIES) {
      const { errors } = parseUrlLines(`https://example.com/, , ${freq}`);
      assert.equal(errors.length, 0, `${freq} should be valid`);
    }
  });
  test("ignores blank lines", () => {
    const { entries } = parseUrlLines("https://example.com/\n\n  \nhttps://example.com/2");
    assert.equal(entries.length, 2);
  });
  test("reports the correct line number in an error with multiple lines", () => {
    const { errors } = parseUrlLines("https://example.com/\nnot-a-url\nhttps://example.com/2");
    assert.match(errors[0], /^Line 2:/);
  });
});

describe("buildSitemapXml", () => {
  test("produces well-formed XML with a urlset root", () => {
    const xml = buildSitemapXml([{ loc: "https://example.com/" }]);
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.match(xml, /<loc>https:\/\/example\.com\/<\/loc>/);
    assert.match(xml, /<\/urlset>\n$/);
  });
  test("includes optional fields only when present", () => {
    const xml = buildSitemapXml([{ loc: "https://example.com/", priority: "0.9" }]);
    assert.match(xml, /<priority>0\.9<\/priority>/);
    assert.doesNotMatch(xml, /<changefreq>/);
  });
  test("XML-escapes special characters in the URL", () => {
    const xml = buildSitemapXml([{ loc: "https://example.com/?a=1&b=2" }]);
    assert.match(xml, /&amp;/);
    assert.doesNotMatch(xml, /&b=2</);
  });
  test("emits one <url> block per entry", () => {
    const xml = buildSitemapXml([{ loc: "https://example.com/1" }, { loc: "https://example.com/2" }]);
    assert.equal((xml.match(/<url>/g) || []).length, 2);
  });
});
