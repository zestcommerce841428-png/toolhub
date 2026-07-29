/**
 * robots.txt generation from a structured list of rule groups — building
 * valid syntax by hand (correct blank-line group separation, one
 * directive per line, an optional crawl-delay, a trailing sitemap
 * directive) rather than leaving users to get the format right themselves.
 */

/**
 * @typedef {object} RuleGroup
 * @property {string} userAgent - e.g. "*" or "Googlebot"
 * @property {string[]} disallow - paths to block, e.g. ["/admin/"]
 * @property {string[]} allow - paths to explicitly allow
 * @property {number|null} crawlDelay - seconds, or null to omit
 */

/** Normalizes a path: ensures it starts with "/", trims whitespace, drops empties. */
function normalizePaths(paths) {
  return paths
    .map((path) => path.trim())
    .filter((path) => path.length > 0)
    .map((path) => (path.startsWith("/") || path === "*" ? path : `/${path}`));
}

/**
 * @param {RuleGroup[]} groups
 * @param {string[]} sitemapUrls
 * @returns {string}
 */
export function buildRobotsTxt(groups, sitemapUrls = []) {
  const blocks = groups
    .filter((group) => group.userAgent.trim().length > 0)
    .map((group) => {
      const lines = [`User-agent: ${group.userAgent.trim()}`];
      const disallow = normalizePaths(group.disallow ?? []);
      const allow = normalizePaths(group.allow ?? []);

      if (disallow.length === 0 && allow.length === 0) {
        // An explicit "Disallow:" with an empty value means "block nothing" —
        // the standard way to say "this user-agent may crawl everything."
        lines.push("Disallow:");
      } else {
        disallow.forEach((path) => lines.push(`Disallow: ${path}`));
        allow.forEach((path) => lines.push(`Allow: ${path}`));
      }

      if (Number.isFinite(group.crawlDelay) && group.crawlDelay > 0) {
        lines.push(`Crawl-delay: ${group.crawlDelay}`);
      }
      return lines.join("\n");
    });

  const sitemapLines = sitemapUrls
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .map((url) => `Sitemap: ${url}`);

  return [...blocks, ...(sitemapLines.length > 0 ? [sitemapLines.join("\n")] : [])].join("\n\n") + "\n";
}
