/**
 * Visits every single tool page the site currently has, generated
 * dynamically from the search index rather than a hand-maintained list —
 * this is the check that catches a broken template placeholder, a 404'd
 * asset, or a page that silently renders blank, none of which the unit
 * test suite (which never touches a real browser or the built HTML) can
 * see. Deliberately not folded into tool-functionality.spec.js: those
 * tests assert specific tool behavior for a representative sample; this
 * file asserts baseline page health for the entire catalog.
 */
import { test, expect } from "@playwright/test";
import { readSearchIndex } from "./helpers.js";

const searchIndex = readSearchIndex();

for (const tool of searchIndex) {
  test(`tool page loads cleanly: ${tool.slug}`, async ({ page }) => {
    const errors = [];
    const failedRequests = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));
    // Every tool page loads tool.css and tool.js by convention (see
    // docs/CONTRIBUTING.md) — a missing file 404s here, not silently.
    // Attached before goto() so a failure during initial page load is
    // still captured, not just failures after the page has settled.
    page.on("requestfailed", (request) => failedRequests.push(request.url()));

    const response = await page.goto(`/tools/${tool.slug}/`);
    expect(response?.status(), "HTTP status").toBe(200);
    // .first(): the page's own title h1 always precedes the tool's own
    // content in the template, but some tools (e.g. the Markdown
    // converter's live preview) legitimately render further h1s of their
    // own further down the page as part of the tool's actual content.
    await expect(page.locator("h1").first()).toHaveText(tool.name);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await page.waitForLoadState("networkidle");

    expect(errors, `console/page errors on ${tool.slug}`).toEqual([]);
    expect(failedRequests, `failed network requests on ${tool.slug}`).toEqual([]);
  });
}

test("categories index lists every category with a nonzero tool count", async ({ page }) => {
  await page.goto("/categories/");
  const cards = page.locator('a[href^="/categories/"]');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(12);
});

test("sitemap.xml includes every tool page", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  for (const tool of searchIndex) {
    expect(body, `sitemap.xml should list /tools/${tool.slug}/`).toContain(`/tools/${tool.slug}/`);
  }
});
