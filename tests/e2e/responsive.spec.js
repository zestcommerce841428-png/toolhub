/**
 * Responsive layout sweep across the widths that previously exposed real
 * bugs during this project's build (see docs/ARCHITECTURE.md's "Design
 * tokens" section and docs/ROADMAP.md's Phase 1.6/2 entries — a header
 * nav overflow and a sitewide spacing doubling bug were both first caught
 * this way). Checks for horizontal overflow and that the header's
 * categories dropdown is present and complete at every width, since a
 * header that degrades gracefully at every viewport is exactly what a
 * catalog meant to grow past 1,000 tools needs to keep being true.
 */
import { test, expect } from "@playwright/test";
import { readCategories } from "./helpers.js";

const WIDTHS = [320, 375, 428, 640, 768, 834, 900, 1024, 1100, 1280, 1440, 1920];
const PAGES = [
  { name: "home", path: "/" },
  { name: "tool", path: "/tools/word-counter/" },
  { name: "category", path: "/categories/text/" },
  { name: "categories-index", path: "/categories/" },
];

for (const width of WIDTHS) {
  test.describe(`viewport ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const { name, path } of PAGES) {
      test(`${name}: no horizontal overflow, categories dropdown intact`, async ({ page }) => {
        await page.goto(path, { waitUntil: "networkidle" });
        const categoryCount = readCategories().length;

        const state = await page.evaluate(() => {
          const doc = document.documentElement;
          const categoriesDetails = document.querySelector("header details");
          const detailsRect = categoriesDetails ? categoriesDetails.getBoundingClientRect() : null;
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            categoriesButtonVisible: !!detailsRect && detailsRect.width > 0,
            categoryLinkCount: categoriesDetails ? categoriesDetails.querySelectorAll("a").length : 0,
          };
        });

        expect(state.scrollWidth, "page should not overflow horizontally").toBeLessThanOrEqual(state.clientWidth + 1);
        expect(state.categoriesButtonVisible, "categories dropdown should be visible").toBe(true);
        // +1 for the "All categories" link alongside the per-category links.
        expect(state.categoryLinkCount).toBeGreaterThanOrEqual(categoryCount + 1);
      });
    }
  });
}
