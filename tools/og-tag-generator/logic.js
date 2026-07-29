/**
 * Full Open Graph protocol tag generation — deeper than
 * tools/meta-tag-generator/logic.js's basic website-only OG tags: this
 * covers og:type-specific fields (article author/publish date, product
 * price/currency), image dimensions (which social crawlers use to avoid
 * having to fetch the image before laying out a preview), and a
 * selectable Twitter Card type rather than a single hardcoded one.
 */
import { escapeHtml } from "../../assets/js/core/utility.js";

export const OG_TYPES = ["website", "article", "product", "video.other"];
export const TWITTER_CARD_TYPES = ["summary", "summary_large_image", "player"];

/**
 * @typedef {object} OgFields
 * @property {string} type - one of OG_TYPES
 * @property {string} title
 * @property {string} description
 * @property {string} url
 * @property {string} siteName
 * @property {string} imageUrl
 * @property {string} imageWidth
 * @property {string} imageHeight
 * @property {string} locale
 * @property {string} twitterCard - one of TWITTER_CARD_TYPES
 * @property {string} twitterHandle
 * @property {string} articleAuthor
 * @property {string} articlePublishedTime - ISO 8601 date
 * @property {string} productPriceAmount
 * @property {string} productPriceCurrency
 */

/** @param {OgFields} fields @returns {string} */
export function buildOgTags(fields) {
  const lines = [];
  const tag = (property, content) => {
    if (content) lines.push(`<meta property="${property}" content="${escapeHtml(content)}" />`);
  };

  tag("og:type", fields.type || "website");
  tag("og:title", fields.title);
  tag("og:description", fields.description);
  tag("og:url", fields.url);
  tag("og:site_name", fields.siteName);
  tag("og:locale", fields.locale);
  tag("og:image", fields.imageUrl);
  tag("og:image:width", fields.imageWidth);
  tag("og:image:height", fields.imageHeight);

  if (fields.type === "article") {
    tag("article:author", fields.articleAuthor);
    tag("article:published_time", fields.articlePublishedTime);
  }
  if (fields.type === "product") {
    tag("product:price:amount", fields.productPriceAmount);
    tag("product:price:currency", fields.productPriceCurrency);
  }

  lines.push("");
  const metaName = (name, content) => {
    if (content) lines.push(`<meta name="${name}" content="${escapeHtml(content)}" />`);
  };
  metaName("twitter:card", fields.twitterCard || "summary_large_image");
  metaName("twitter:site", fields.twitterHandle);
  metaName("twitter:title", fields.title);
  metaName("twitter:description", fields.description);
  metaName("twitter:image", fields.imageUrl);

  return lines.join("\n");
}

/** Social crawlers commonly warn/reject images outside this range; used to surface a hint, not to block generation. */
export function checkImageDimensions(width, height) {
  const w = Number(width);
  const h = Number(height);
  if (!width || !height) return { status: "empty", message: "Add image dimensions so crawlers don't have to fetch the image to lay out a preview." };
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return { status: "warning", message: "Width and height should be positive numbers." };
  if (w < 200 || h < 200) return { status: "warning", message: "Below 200×200 — some platforms won't show a preview image at all." };
  const ratio = w / h;
  if (ratio < 1.7 || ratio > 1.95) {
    return { status: "warning", message: `${w}×${h} (${ratio.toFixed(2)}:1) — most platforms prefer close to 1.91:1 for large previews.` };
  }
  return { status: "good", message: `${w}×${h} — good aspect ratio for a large image preview.` };
}
