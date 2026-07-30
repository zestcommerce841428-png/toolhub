/**
 * Functional checks for one tool per major UI shape this site uses
 * (live text analysis, multi-mode transform + accessible radiogroup,
 * parse/validate/format, secure generation, bidirectional sync,
 * unit-converting calculator). Not exhaustive coverage of all 69 tools'
 * logic — that's what the 655 unit tests in tests/unit/ are for — this
 * is "does the DOM wiring actually work in a real browser" for a
 * representative sample across every interaction pattern in use.
 */
import { test, expect } from "@playwright/test";

test("Word Counter: stats update live as you type", async ({ page }) => {
  await page.goto("/tools/word-counter/");
  await page.fill("#word-counter-input", "Hello world. This is ToolHub! It works great.\n\nSecond paragraph here.");
  await expect(page.locator("#stat-words")).toHaveText("11");
  await expect(page.locator("#stat-sentences")).toHaveText("4");
  await expect(page.locator("#stat-paragraphs")).toHaveText("2");
});

test("Case Converter: mode buttons and keyboard radiogroup navigation both work", async ({ page }) => {
  await page.goto("/tools/case-converter/");
  await page.fill("#case-converter-input", "hello world");
  await page.click('[data-mode="uppercase"]');
  await expect(page.locator("#case-converter-output")).toHaveValue("HELLO WORLD");

  await page.locator('[data-mode="uppercase"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveAttribute("data-mode", "lowercase");
  await expect(page.locator("#case-converter-output")).toHaveValue("hello world");
});

test("JSON Formatter: validates, formats, and minifies", async ({ page }) => {
  await page.goto("/tools/json-formatter/");

  await page.fill("#json-input", '{"a": 1,}');
  await page.click("#json-format");
  await expect(page.locator("#json-status")).toContainText(/line \d+, column \d+/);

  await page.fill("#json-input", '{"b":2,"a":1}');
  await page.click("#json-format");
  const formatted = await page.inputValue("#json-input");
  expect(formatted).toContain("\n");
  await expect(page.locator("#json-status")).toContainText("Valid JSON");

  await page.click("#json-minify");
  await expect(page.locator("#json-input")).toHaveValue('{"b":2,"a":1}');
});

test("Password Generator: length slider and regenerate both work, strength is reported", async ({ page }) => {
  await page.goto("/tools/password-generator/");
  const before = await page.inputValue("#password-output");

  await page.locator("#password-length").fill("32");
  await page.locator("#password-length").dispatchEvent("input");
  await expect(page.locator("#password-length-value")).toHaveText("32");
  const after = await page.inputValue("#password-output");
  expect(after).toHaveLength(32);
  expect(after).not.toBe(before);

  await expect(page.locator("#password-strength")).toContainText(/Strength: (Weak|Fair|Strong|Very strong)/);
});

test("HEX/RGB Converter: syncs bidirectionally", async ({ page }) => {
  await page.goto("/tools/hex-rgb-converter/");
  await page.fill("#hex-input", "#ff0000");
  await expect(page.locator("#rgb-r")).toHaveValue("255");
  await expect(page.locator("#rgb-g")).toHaveValue("0");
  await expect(page.locator("#rgb-b")).toHaveValue("0");

  await page.fill("#rgb-r", "0");
  await page.fill("#rgb-g", "255");
  await page.fill("#rgb-b", "0");
  await page.locator("#rgb-b").dispatchEvent("input");
  const hex = await page.inputValue("#hex-input");
  expect(hex.toLowerCase()).toBe("#00ff00");
});

test("BMI Calculator: computes metric BMI and switches to imperial fields", async ({ page }) => {
  await page.goto("/tools/bmi-calculator/");
  await page.fill("#bmi-height-cm", "175");
  await page.fill("#bmi-weight-kg", "70");
  await page.locator("#bmi-weight-kg").dispatchEvent("input");
  await expect(page.locator("#bmi-value")).toHaveText("22.9");
  await expect(page.locator("#bmi-category")).toHaveText("Normal weight");

  await page.locator('[data-unit="imperial"]').click();
  await expect(page.locator('[data-unit-fields="imperial"]').first()).toBeVisible();
});

test("Text Encryptor: round-trips a message through encrypt then decrypt", async ({ page }) => {
  await page.goto("/tools/text-encryptor/");
  await page.fill("#enc-input", "a secret message");
  await page.fill("#enc-passphrase", "correct horse battery staple");
  await page.click("#enc-run");
  await expect(page.locator("#enc-output")).not.toHaveValue("", { timeout: 5000 });
  const encrypted = await page.inputValue("#enc-output");

  await page.click('[data-mode="decrypt"]');
  await page.fill("#enc-input", encrypted);
  await page.click("#enc-run");
  await expect(page.locator("#enc-output")).toHaveValue("a secret message", { timeout: 5000 });
});
