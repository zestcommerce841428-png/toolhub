/** Builds a valid sitemap.xml from a list of URL entries, per the sitemaps.org protocol. */
import { escapeHtml } from "../../assets/js/core/utility.js";

export const CHANGE_FREQUENCIES = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

/**
 * @typedef {object} SitemapUrlEntry
 * @property {string} loc
 * @property {string} [changefreq] - one of CHANGE_FREQUENCIES
 * @property {string} [priority] - "0.0"-"1.0"
 * @property {string} [lastmod] - YYYY-MM-DD
 */

/** @param {string} value @returns {boolean} */
function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Parses one URL per line, optionally "url, priority, changefreq, lastmod"
 * (comma-separated, trailing fields optional) — flags invalid URLs and
 * out-of-range priorities rather than silently dropping or clamping them.
 * @param {string} rawText
 * @returns {{ entries: SitemapUrlEntry[], errors: string[] }}
 */
export function parseUrlLines(rawText) {
  const entries = [];
  const errors = [];

  rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line, index) => {
      const [locRaw, priorityRaw, changefreqRaw, lastmodRaw] = line.split(",").map((part) => part.trim());
      const lineNumber = index + 1;

      if (!isValidUrl(locRaw)) {
        errors.push(`Line ${lineNumber}: "${locRaw}" isn't a valid absolute http(s) URL.`);
        return;
      }
      if (priorityRaw && (Number.isNaN(Number(priorityRaw)) || Number(priorityRaw) < 0 || Number(priorityRaw) > 1)) {
        errors.push(`Line ${lineNumber}: priority "${priorityRaw}" must be between 0.0 and 1.0.`);
        return;
      }
      if (changefreqRaw && !CHANGE_FREQUENCIES.includes(changefreqRaw)) {
        errors.push(`Line ${lineNumber}: changefreq "${changefreqRaw}" isn't one of ${CHANGE_FREQUENCIES.join(", ")}.`);
        return;
      }

      entries.push({
        loc: locRaw,
        priority: priorityRaw || undefined,
        changefreq: changefreqRaw || undefined,
        lastmod: lastmodRaw || undefined,
      });
    });

  return { entries, errors };
}

/** @param {SitemapUrlEntry[]} entries @returns {string} */
export function buildSitemapXml(entries) {
  const urlBlocks = entries.map((entry) => {
    const parts = [`    <loc>${escapeHtml(entry.loc)}</loc>`];
    if (entry.lastmod) parts.push(`    <lastmod>${escapeHtml(entry.lastmod)}</lastmod>`);
    if (entry.changefreq) parts.push(`    <changefreq>${escapeHtml(entry.changefreq)}</changefreq>`);
    if (entry.priority) parts.push(`    <priority>${escapeHtml(entry.priority)}</priority>`);
    return `  <url>\n${parts.join("\n")}\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlBlocks.join("\n")}\n</urlset>\n`;
}
