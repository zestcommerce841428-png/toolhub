import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { detectBrowser, detectOs, detectDeviceType, parseUserAgent } from "../../tools/user-agent-parser/logic.js";

const UA = {
  chromeWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  firefoxWindows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  safariMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  edgeWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  chromeAndroid:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  safariIphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  safariIpad:
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
};

describe("detectBrowser", () => {
  test("identifies Chrome on Windows, not Safari (WebKit-heritage false positive)", () => {
    assert.deepEqual(detectBrowser(UA.chromeWindows), { name: "Chrome", version: "120.0.0.0" });
  });
  test("identifies Firefox", () => {
    assert.deepEqual(detectBrowser(UA.firefoxWindows), { name: "Firefox", version: "121.0" });
  });
  test("identifies Safari on macOS", () => {
    assert.deepEqual(detectBrowser(UA.safariMac), { name: "Safari", version: "17.0" });
  });
  test("identifies Edge, not Chrome (Chromium-heritage false positive)", () => {
    assert.deepEqual(detectBrowser(UA.edgeWindows), { name: "Edge", version: "120.0.0.0" });
  });
  test("identifies Chrome on Android", () => {
    assert.deepEqual(detectBrowser(UA.chromeAndroid), { name: "Chrome", version: "120.0.0.0" });
  });
  test("identifies Safari on iPhone", () => {
    assert.deepEqual(detectBrowser(UA.safariIphone), { name: "Safari", version: "17.0" });
  });
  test("returns Unknown for an unrecognized string", () => {
    assert.equal(detectBrowser("some-custom-bot/1.0").name, "Unknown");
  });
});

describe("detectOs", () => {
  test("identifies Windows 10/11 from NT 10.0", () => {
    assert.deepEqual(detectOs(UA.chromeWindows), { name: "Windows", version: "10/11" });
  });
  test("identifies macOS with dots instead of underscores", () => {
    assert.deepEqual(detectOs(UA.safariMac), { name: "macOS", version: "10.15.7" });
  });
  test("identifies Android with its version number", () => {
    assert.deepEqual(detectOs(UA.chromeAndroid), { name: "Android", version: "13" });
  });
  test("identifies iOS with dots instead of underscores", () => {
    assert.deepEqual(detectOs(UA.safariIphone), { name: "iOS", version: "17.0" });
  });
});

describe("detectDeviceType", () => {
  test("desktop for a plain Windows/macOS UA", () => {
    assert.equal(detectDeviceType(UA.chromeWindows), "desktop");
    assert.equal(detectDeviceType(UA.safariMac), "desktop");
  });
  test("mobile for an iPhone", () => {
    assert.equal(detectDeviceType(UA.safariIphone), "mobile");
  });
  test("mobile for Android with a Mobile token", () => {
    assert.equal(detectDeviceType(UA.chromeAndroid), "mobile");
  });
  test("tablet for an iPad", () => {
    assert.equal(detectDeviceType(UA.safariIpad), "tablet");
  });
});

describe("parseUserAgent", () => {
  test("combines browser, os, and device type in one call", () => {
    const result = parseUserAgent(UA.edgeWindows);
    assert.equal(result.browser.name, "Edge");
    assert.equal(result.os.name, "Windows");
    assert.equal(result.deviceType, "desktop");
  });
});
