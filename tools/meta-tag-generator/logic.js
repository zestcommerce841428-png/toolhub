import { escapeHtml } from "../../assets/js/core/utility.js";

/**
 * @typedef {object} MetaFields
 * @property {string} title
 * @property {string} description
 * @property {string} url
 * @property {string} imageUrl
 * @property {string} siteName
 * @property {string} twitterHandle
 */

/**
 * Builds the full <head> snippet: title, description, canonical, Open
 * Graph, and Twitter Card tags. Fields that are empty are simply omitted
 * from the output rather than emitted as empty attributes.
 * @param {MetaFields} fields
 * @returns {string}
 */
export function buildMetaTags(fields) {
  const lines = [];

  if (fields.title) lines.push(`<title>${escapeHtml(fields.title)}</title>`);
  if (fields.description) lines.push(`<meta name="description" content="${escapeHtml(fields.description)}" />`);
  if (fields.url) lines.push(`<link rel="canonical" href="${escapeHtml(fields.url)}" />`);

  lines.push("");
  lines.push(`<meta property="og:type" content="website" />`);
  if (fields.siteName) lines.push(`<meta property="og:site_name" content="${escapeHtml(fields.siteName)}" />`);
  if (fields.title) lines.push(`<meta property="og:title" content="${escapeHtml(fields.title)}" />`);
  if (fields.description) lines.push(`<meta property="og:description" content="${escapeHtml(fields.description)}" />`);
  if (fields.url) lines.push(`<meta property="og:url" content="${escapeHtml(fields.url)}" />`);
  if (fields.imageUrl) lines.push(`<meta property="og:image" content="${escapeHtml(fields.imageUrl)}" />`);

  lines.push("");
  lines.push(`<meta name="twitter:card" content="summary_large_image" />`);
  if (fields.twitterHandle) lines.push(`<meta name="twitter:site" content="${escapeHtml(fields.twitterHandle)}" />`);
  if (fields.title) lines.push(`<meta name="twitter:title" content="${escapeHtml(fields.title)}" />`);
  if (fields.description) lines.push(`<meta name="twitter:description" content="${escapeHtml(fields.description)}" />`);
  if (fields.imageUrl) lines.push(`<meta name="twitter:image" content="${escapeHtml(fields.imageUrl)}" />`);

  return lines.join("\n");
}

/**
 * @param {string} text
 * @param {{ min: number, max: number }} idealRange
 * @param {string} label
 * @returns {{ status: "empty"|"warning"|"good", message: string }}
 */
function analyzeLength(text, idealRange, label) {
  const length = text.length;
  if (length === 0) return { status: "empty", message: `Add a ${label}.` };
  if (length < idealRange.min) {
    return { status: "warning", message: `${length} characters — a bit short; aim for ${idealRange.min}–${idealRange.max}.` };
  }
  if (length > idealRange.max) {
    return { status: "warning", message: `${length} characters — may get truncated in search results; aim for ${idealRange.min}–${idealRange.max}.` };
  }
  return { status: "good", message: `${length} characters — good length.` };
}

export function analyzeTitle(title) {
  return analyzeLength(title, { min: 50, max: 60 }, "title");
}

export function analyzeDescription(description) {
  return analyzeLength(description, { min: 120, max: 160 }, "description");
}
