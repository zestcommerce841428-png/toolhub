import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl } from "../../scripts/lib/site-url.js";

const ROOT = process.cwd(); // no CNAME file expected here
const FALLBACK = "https://example-toolhub.invalid";

describe("resolveSiteUrl", () => {
  test("SITE_URL env var always wins, over any platform vars", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, {
      SITE_URL: "https://override.example.com/",
      VERCEL_URL: "my-app.vercel.app",
    });
    assert.equal(result.url, "https://override.example.com");
    assert.equal(result.isFallbackPlaceholder, false);
  });

  test("Vercel production build prefers VERCEL_PROJECT_PRODUCTION_URL", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, {
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "toolhub.vercel.app",
      VERCEL_URL: "toolhub-git-main-someone.vercel.app",
    });
    assert.equal(result.url, "https://toolhub.vercel.app");
    assert.equal(result.source, "Vercel (production)");
  });

  test("Vercel preview build falls back to VERCEL_URL", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, {
      VERCEL_ENV: "preview",
      VERCEL_URL: "toolhub-git-feature-someone.vercel.app",
    });
    assert.equal(result.url, "https://toolhub-git-feature-someone.vercel.app");
    assert.equal(result.source, "Vercel (preview deployment)");
  });

  test("Netlify uses URL", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, { URL: "https://toolhub.netlify.app" });
    assert.equal(result.url, "https://toolhub.netlify.app");
    assert.equal(result.source, "Netlify");
  });

  test("Cloudflare Pages uses CF_PAGES_URL", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, { CF_PAGES_URL: "https://toolhub.pages.dev" });
    assert.equal(result.url, "https://toolhub.pages.dev");
  });

  test("GitHub Pages project site derives owner.github.io/repo", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, {
      GITHUB_ACTIONS: "true",
      GITHUB_REPOSITORY: "someone/toolhub",
    });
    assert.equal(result.url, "https://someone.github.io/toolhub");
    assert.equal(result.source, "GitHub Pages (default github.io domain)");
  });

  test("GitHub Pages user/org site (repo named <owner>.github.io) has no path suffix", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, {
      GITHUB_ACTIONS: "true",
      GITHUB_REPOSITORY: "someone/someone.github.io",
    });
    assert.equal(result.url, "https://someone.github.io");
  });

  test("falls back to configured value when nothing is detected, and flags it", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, {});
    assert.equal(result.url, FALLBACK);
    assert.equal(result.source, "site.config.json fallback");
    assert.equal(result.isFallbackPlaceholder, true);
  });

  test("normalizes: adds https:// when missing and strips trailing slashes", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, { SITE_URL: "my-site.example.com///" });
    assert.equal(result.url, "https://my-site.example.com");
  });

  test("preserves an explicit http:// scheme rather than forcing https", () => {
    const result = resolveSiteUrl(ROOT, FALLBACK, { SITE_URL: "http://localhost:4173" });
    assert.equal(result.url, "http://localhost:4173");
  });
});
