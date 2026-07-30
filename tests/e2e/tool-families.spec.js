/**
 * Checks for the "one logic.js shared across many thin tool pages"
 * pattern (docs/CONTRIBUTING.md) — the case-conversion family is the
 * original proof of this pattern. Category tool counts are read from
 * the live search index, never hardcoded (see helpers.js's doc comment
 * for why that matters here specifically).
 */
import { test, expect } from "@playwright/test";
import { readSearchIndex, readCategories } from "./helpers.js";

const CASE_TRANSFORMS = [
  { slug: "uppercase-converter", input: "hello world", expected: "HELLO WORLD" },
  { slug: "lowercase-converter", input: "HELLO WORLD", expected: "hello world" },
  { slug: "title-case-converter", input: "hello world", expected: "Hello World" },
  { slug: "sentence-case-converter", input: "hello world. how are you?", expected: "Hello world. How are you?" },
  { slug: "toggle-case-converter", input: "Hello World", expected: "hELLO wORLD" },
  { slug: "capitalize-words", input: "heLLo woRLd", expected: "HeLLo WoRLd" },
];

for (const { slug, input, expected } of CASE_TRANSFORMS) {
  test(`${slug}: transforms correctly`, async ({ page }) => {
    await page.goto(`/tools/${slug}/`);
    const textarea = page.locator("textarea").first();
    await textarea.fill(input);
    // Each thin wrapper's output textarea is the second textarea on the page.
    const output = page.locator("textarea").nth(1);
    await expect(output).toHaveValue(expected);
  });
}

test("case-converter's related tools include a family member", async ({ page }) => {
  await page.goto("/tools/case-converter/");
  const relatedSection = page.locator("text=Related tools").locator("..");
  await expect(relatedSection.getByText("Uppercase Converter")).toBeVisible();
});

test("every category page lists exactly as many tools as the search index says it has", async ({ page }) => {
  const searchIndex = readSearchIndex();
  const categories = readCategories(); // {slug, name} from the real category.json manifests — never guessed from the display name.

  const countsByCategoryName = new Map();
  for (const tool of searchIndex) {
    countsByCategoryName.set(tool.category, (countsByCategoryName.get(tool.category) ?? 0) + 1);
  }

  for (const category of categories) {
    const expectedCount = countsByCategoryName.get(category.name) ?? 0;
    await page.goto(`/categories/${category.slug}/`);
    const actualCount = await page.locator('a[href^="/tools/"]').count();
    expect(actualCount, `${category.name} (/categories/${category.slug}/)`).toBe(expectedCount);
  }
});
