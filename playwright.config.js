/**
 * E2E test config. Runs against the already-built public/ directory
 * (`npm run build` first) — this suite tests the real, minified,
 * production-shaped output, not a dev-mode reconstruction of it, since
 * that's exactly where the two silent Tailwind bugs documented in
 * docs/ARCHITECTURE.md were actually caught.
 *
 * Set BASE_URL to point these tests at a deployed environment instead
 * (e.g. a Vercel preview or production URL) for a post-deploy smoke
 * check — see .github/workflows/ci.yml's `smoke-deployed-site` job.
 */
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:4173";
const testingDeployedSite = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  // Only manage a local server when testing the local build — pointing
  // at an already-deployed BASE_URL needs no server of our own.
  webServer: testingDeployedSite
    ? undefined
    : {
        command: "npm run serve",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
