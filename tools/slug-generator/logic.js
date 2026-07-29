/**
 * URL slug generation. Diacritics are stripped via real Unicode
 * normalization (NFKD decomposition + combining-mark removal) rather than
 * a hand-maintained character substitution table — "cafe with an accent"
 * correctly becomes "cafe", not mangled into percent-encoding.
 */

// The Unicode "Combining Diacritical Marks" block (U+0300-U+036F). NFKD
// decomposes an accented letter like e-acute into a base letter (e) plus
// one of these combining marks; stripping the block removes the accent
// while leaving the base letter, for any language's diacritics.
const COMBINING_MARKS_PATTERN = /[̀-ͯ]/g;

/** @param {string} text @returns {string} */
function stripDiacritics(text) {
  return text.normalize("NFKD").replace(COMBINING_MARKS_PATTERN, "");
}

/**
 * @param {string} text
 * @param {{ separator?: "-"|"_", lowercase?: boolean, maxLength?: number }} [options]
 * @returns {string}
 */
export function generateSlug(text, options = {}) {
  const separator = options.separator ?? "-";
  const lowercase = options.lowercase ?? true;
  const maxLength = options.maxLength ?? 0;

  let result = stripDiacritics(text ?? "");
  if (lowercase) result = result.toLowerCase();

  // Anything that isn't a letter, digit, or the chosen separator becomes
  // the separator, then runs of the separator collapse to one.
  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  result = result.replace(/[^a-zA-Z0-9]+/g, separator);
  result = result.replace(new RegExp(`${escapedSeparator}{2,}`, "g"), separator);
  result = result.replace(new RegExp(`^${escapedSeparator}+|${escapedSeparator}+$`, "g"), "");

  if (maxLength > 0 && result.length > maxLength) {
    result = result.slice(0, maxLength);
    // Don't cut mid-word if a separator boundary is reasonably close by —
    // avoids "my-blog-po" instead of "my-blog".
    const lastSeparatorIndex = result.lastIndexOf(separator);
    if (lastSeparatorIndex > maxLength * 0.6) {
      result = result.slice(0, lastSeparatorIndex);
    }
  }

  return result;
}
