import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildRobotsTxt } from "../../tools/robots-txt-generator/logic.js";

describe("buildRobotsTxt", () => {
  test("basic single group with disallow paths", () => {
    const output = buildRobotsTxt([{ userAgent: "*", disallow: ["/admin/", "/cart/"], allow: [], crawlDelay: null }]);
    assert.match(output, /^User-agent: \*\n/);
    assert.match(output, /Disallow: \/admin\//);
    assert.match(output, /Disallow: \/cart\//);
  });
  test("normalizes a path missing its leading slash", () => {
    const output = buildRobotsTxt([{ userAgent: "*", disallow: ["admin/"], allow: [], crawlDelay: null }]);
    assert.match(output, /Disallow: \/admin\//);
  });
  test("empty disallow and allow emits an explicit 'allow everything' line", () => {
    const output = buildRobotsTxt([{ userAgent: "*", disallow: [], allow: [], crawlDelay: null }]);
    assert.match(output, /Disallow:\s*$/m);
  });
  test("includes crawl-delay only when positive", () => {
    const withDelay = buildRobotsTxt([{ userAgent: "*", disallow: ["/x/"], allow: [], crawlDelay: 10 }]);
    assert.match(withDelay, /Crawl-delay: 10/);

    const withoutDelay = buildRobotsTxt([{ userAgent: "*", disallow: ["/x/"], allow: [], crawlDelay: null }]);
    assert.doesNotMatch(withoutDelay, /Crawl-delay/);
  });
  test("skips a group with a blank user-agent", () => {
    const output = buildRobotsTxt([
      { userAgent: "", disallow: ["/x/"], allow: [], crawlDelay: null },
      { userAgent: "*", disallow: ["/y/"], allow: [], crawlDelay: null },
    ]);
    assert.doesNotMatch(output, /\/x\//);
    assert.match(output, /\/y\//);
  });
  test("renders multiple groups separated by a blank line", () => {
    const output = buildRobotsTxt([
      { userAgent: "*", disallow: ["/a/"], allow: [], crawlDelay: null },
      { userAgent: "Googlebot", disallow: ["/b/"], allow: [], crawlDelay: null },
    ]);
    assert.match(output, /User-agent: \*[\s\S]*\n\nUser-agent: Googlebot/);
  });
  test("appends sitemap directives at the end", () => {
    const output = buildRobotsTxt([{ userAgent: "*", disallow: [], allow: [], crawlDelay: null }], ["https://example.com/sitemap.xml"]);
    assert.match(output, /Sitemap: https:\/\/example\.com\/sitemap\.xml\n$/);
  });
  test("filters out blank lines from path/sitemap textareas", () => {
    const output = buildRobotsTxt([{ userAgent: "*", disallow: ["/a/", "", "  ", "/b/"], allow: [], crawlDelay: null }]);
    const disallowCount = (output.match(/Disallow:/g) || []).length;
    assert.equal(disallowCount, 2);
  });
});
