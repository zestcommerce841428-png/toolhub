/**
 * Runs real Lighthouse audits against a few representative pages of the
 * already-built + already-served site and fails (non-zero exit) if any
 * score drops below its asserted threshold — a regression budget, not
 * just a report to eyeball.
 *
 * Deliberately hand-rolled against the plain `lighthouse` package instead
 * of the `@lhci/cli` wrapper: `@lhci/cli` pulls in an old, separately-
 * pinned `chrome-launcher` (via a legacy interactive-CLI dependency
 * chain — `inquirer`'s editor-prompt support, unused in non-interactive
 * CI runs) with real, if CI-context-low-risk, high-severity advisories
 * (`npm audit`), while the `lighthouse` package's own bundled
 * `chrome-launcher` is current and clean. Same reasoning this project
 * already applied once before to reject `to-ico` (see
 * docs/ARCHITECTURE.md) — prefer a smaller, audited dependency surface
 * over a convenience wrapper that reintroduces a vulnerable chain to get
 * the same result.
 *
 * Reuses Playwright's already-downloaded Chromium (chrome-launcher just
 * needs a real Chrome/Chromium binary path) rather than installing a
 * second browser purely for this script.
 */
// Imported from @playwright/test (a direct devDependency) rather than the
// transitive playwright-core package it happens to hoist, so this keeps
// working regardless of how npm's dependency tree happens to flatten.
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";

// Every URL audited, and the minimum score (0-100) required in each
// Lighthouse category. This site actually measures 99-100 across all
// four categories on every page below (verified locally, not assumed —
// getting there required two real fixes: an accessible name missing from
// the header logo link on narrow viewports, and --color-text-subtle
// failing WCAG AA contrast for body-sized text in nine places sitewide;
// see the git history for both). Performance keeps the most headroom
// since it's the one category sensitive to machine/CI-runner load, not
// just the code; accessibility and SEO are static-analysis-style checks
// with no legitimate run-to-run variance, so they're held close to 100.
const PAGES = [
  { name: "home", path: "/", thresholds: { performance: 90, accessibility: 100, "best-practices": 95, seo: 100 } },
  { name: "tool", path: "/tools/word-counter/", thresholds: { performance: 90, accessibility: 100, "best-practices": 95, seo: 100 } },
  { name: "category", path: "/categories/text/", thresholds: { performance: 90, accessibility: 100, "best-practices": 95, seo: 100 } },
];

async function auditPage({ name, path, thresholds }, chromePort) {
  const result = await lighthouse(
    `${BASE}${path}`,
    { port: chromePort, output: "json", logLevel: "error", onlyCategories: Object.keys(thresholds) },
    undefined
  );

  const scores = {};
  for (const category of Object.keys(thresholds)) {
    scores[category] = Math.round((result.lhr.categories[category]?.score ?? 0) * 100);
  }

  const failures = Object.entries(thresholds).filter(([category, min]) => scores[category] < min);
  return { name, path, scores, thresholds, failures };
}

async function main() {
  const chromePath = chromium.executablePath();
  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });

  let allFailures = [];
  try {
    for (const pageConfig of PAGES) {
      const result = await auditPage(pageConfig, chrome.port);
      const scoreLine = Object.entries(result.scores)
        .map(([category, score]) => `${category}=${score}`)
        .join(" ");
      console.log(`${result.failures.length === 0 ? "PASS" : "FAIL"} - ${result.name} (${result.path}): ${scoreLine}`);
      if (result.failures.length > 0) {
        for (const [category, min] of result.failures) {
          console.log(`  ✗ ${category}: ${result.scores[category]} is below the required minimum of ${min}`);
        }
      }
      allFailures = allFailures.concat(result.failures.map(([category]) => `${result.name}/${category}`));
    }
  } finally {
    // chrome-launcher's own temp-profile cleanup can hit a transient EPERM
    // on Windows (the OS hasn't released Chrome's file handles yet at the
    // moment rmSync runs) — harmless to the actual audit results already
    // collected above, so it must not be allowed to overwrite a real
    // pass/fail outcome with a spurious crash.
    try {
      await chrome.kill();
    } catch (cleanupError) {
      console.warn(`(non-fatal) Chrome temp-profile cleanup failed: ${cleanupError.message}`);
    }
  }

  if (allFailures.length > 0) {
    console.error(`\n${allFailures.length} Lighthouse threshold(s) failed: ${allFailures.join(", ")}`);
    process.exit(1);
  }
  console.log("\nAll Lighthouse thresholds passed.");
}

main().catch((error) => {
  console.error("Lighthouse run failed:", error);
  process.exit(1);
});
