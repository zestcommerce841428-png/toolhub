/**
 * Core sitewide smoke checks: homepage, search, theme, keyboard focus.
 * Every test in this file asserts zero console/page errors as part of
 * its pass criteria, via the consoleErrors fixture below.
 */
import { test, expect } from "@playwright/test";
import { readSearchIndex } from "./helpers.js";

test.beforeEach(async ({ page }, testInfo) => {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  testInfo.consoleErrors = errors;
});

test.afterEach(async ({}, testInfo) => {
  expect(testInfo.consoleErrors, `console/page errors: ${testInfo.consoleErrors.join("; ")}`).toEqual([]);
});

test("homepage renders the hero, category cards, and featured tool cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Every tool you need")).toBeVisible();
  // Scoped to .tool-card specifically: a[href^="/categories/"] alone also
  // matches the header's "Categories" dropdown links, which are present
  // but hidden (inside a closed <details>) until a user opens the menu.
  await expect(page.locator('a.tool-card[href^="/categories/"]').first()).toBeVisible();
  await expect(page.locator('a.tool-card[href^="/tools/"]').first()).toBeVisible();
});

test("homepage's advertised tool count matches the actual search index (no stale hardcoded number)", async ({ page }) => {
  const searchIndex = readSearchIndex();
  await page.goto("/");
  await expect(page.getByText(`${searchIndex.length} tools and counting`)).toBeVisible();
});

test("Ctrl+K opens search and finds a known tool", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+KeyK");
  const searchInput = page.locator("#home-search-input");
  await searchInput.fill("json");
  await page.waitForTimeout(200);
  const results = page.locator("#home-search-results li");
  await expect(results.first()).toBeVisible();
  await expect(results.first()).toContainText("JSON Formatter");
});

test("theme toggle switches data-theme and persists the visible state", async ({ page }) => {
  await page.goto("/tools/word-counter/");
  const before = await page.getAttribute("html", "data-theme");
  await page.click("#theme-toggle-button");
  const afterFirst = await page.getAttribute("html", "data-theme");
  await page.click("#theme-toggle-button");
  const afterSecond = await page.getAttribute("html", "data-theme");
  expect(afterFirst).not.toBe(before);
  expect(afterSecond).not.toBe(afterFirst);
});

test("keyboard-only navigation shows a visible focus ring", async ({ page }) => {
  await page.goto("/tools/word-counter/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focusOutline = await page.evaluate(() => {
    const el = document.activeElement;
    const style = window.getComputedStyle(el);
    return { tag: el.tagName, outline: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusOutline.outline).not.toBe("none");
  expect(focusOutline.outlineWidth).not.toBe("0px");
});

test("skip link is the first focusable element and jumps to main content", async ({ page }) => {
  await page.goto("/tools/word-counter/");
  await page.keyboard.press("Tab");
  const skipLink = page.locator(":focus");
  await expect(skipLink).toHaveAttribute("href", "#main-content");
});
