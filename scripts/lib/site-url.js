/**
 * Resolves the absolute site URL used for canonical links, sitemap.xml,
 * robots.txt, and JSON-LD @id/url fields.
 *
 * IMPORTANT CONSTRAINT: all of the above are pre-rendered into static
 * files at build time (see docs/ARCHITECTURE.md — that's the whole point
 * of this being a zero-backend site). A static file can't inspect a
 * `Host` header the way a server-rendered app could, so "auto-detect" here
 * means "pulled automatically from whichever platform is running the
 * build," not "figured out per visitor at request time." That's a hard
 * constraint of the architecture, not a shortcut — there is no version of
 * a purely static site that detects its own URL after deployment.
 *
 * Resolution order (first match wins):
 *   1. SITE_URL env var — explicit override, always wins, works anywhere.
 *   2. Vercel            — VERCEL_PROJECT_PRODUCTION_URL on production
 *                          builds, else VERCEL_URL (per-deployment URL).
 *   3. Netlify           — URL (the deploy's canonical/primary URL).
 *   4. Cloudflare Pages  — CF_PAGES_URL.
 *   5. GitHub Pages (via GitHub Actions) — a committed CNAME file if
 *      present (custom domain), else the default <owner>.github.io URL.
 *   6. site.config.json's `siteUrl` — last resort for a local build with
 *      no hosting env vars available (e.g. a developer laptop). Logged as
 *      a warning, since outside of one of the platforms above there is no
 *      real URL to detect.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function withProtocol(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function normalize(value) {
  return withProtocol(value).replace(/\/+$/, "");
}

/**
 * @param {string} rootDir - project root (for locating an optional CNAME file)
 * @param {string} configuredFallback - site.config.json's siteUrl
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ url: string, source: string, isFallbackPlaceholder: boolean }}
 */
export function resolveSiteUrl(rootDir, configuredFallback, env = process.env) {
  if (env.SITE_URL) {
    return { url: normalize(env.SITE_URL), source: "SITE_URL environment variable", isFallbackPlaceholder: false };
  }

  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
    return { url: normalize(env.VERCEL_PROJECT_PRODUCTION_URL), source: "Vercel (production)", isFallbackPlaceholder: false };
  }
  if (env.VERCEL_URL) {
    return { url: normalize(env.VERCEL_URL), source: "Vercel (preview deployment)", isFallbackPlaceholder: false };
  }

  if (env.URL) {
    // Netlify sets URL to the deploy's canonical address; DEPLOY_PRIME_URL
    // is the more specific per-deploy address but URL is what you want for
    // canonical tags on the primary domain.
    return { url: normalize(env.URL), source: "Netlify", isFallbackPlaceholder: false };
  }

  if (env.CF_PAGES_URL) {
    return { url: normalize(env.CF_PAGES_URL), source: "Cloudflare Pages", isFallbackPlaceholder: false };
  }

  if (env.GITHUB_ACTIONS === "true" && env.GITHUB_REPOSITORY) {
    const cnamePath = path.join(rootDir, "CNAME");
    if (existsSync(cnamePath)) {
      const domain = readFileSync(cnamePath, "utf8").trim();
      if (domain) return { url: normalize(domain), source: "GitHub Pages custom domain (CNAME file)", isFallbackPlaceholder: false };
    }
    const [owner, repo] = env.GITHUB_REPOSITORY.split("/");
    const isUserOrOrgSite = repo === `${owner}.github.io`;
    const url = isUserOrOrgSite ? `https://${owner}.github.io` : `https://${owner}.github.io/${repo}`;
    return { url, source: "GitHub Pages (default github.io domain)", isFallbackPlaceholder: false };
  }

  return { url: normalize(configuredFallback), source: "site.config.json fallback", isFallbackPlaceholder: true };
}
