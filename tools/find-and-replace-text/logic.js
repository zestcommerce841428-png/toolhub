/** Find & replace with literal or regex matching, case sensitivity, whole-word matching, and replace-all vs. replace-first. */

function escapeRegExp(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} findValue
 * @param {{ useRegex?: boolean, caseSensitive?: boolean, wholeWord?: boolean, replaceAll?: boolean }} options
 * @returns {{ ok: true, regex: RegExp } | { ok: false, error: string }}
 */
function buildRegex(findValue, options) {
  if (!findValue) return { ok: false, error: "Enter something to find." };

  let pattern = options.useRegex ? findValue : escapeRegExp(findValue);
  if (options.wholeWord) pattern = `\\b${pattern}\\b`;

  // Case-sensitive is the default (matches every other find/replace tool's
  // convention) — options.caseSensitive is only ever explicitly `false`
  // when the caller wants case-insensitive matching, so a falsy-but-not-
  // literally-false value (undefined, when the caller omits it) must not
  // be treated the same as an explicit `false` here.
  const caseSensitive = options.caseSensitive ?? true;
  const flags = (caseSensitive ? "" : "i") + (options.replaceAll ? "g" : "");
  try {
    return { ok: true, regex: new RegExp(pattern, flags) };
  } catch (error) {
    return { ok: false, error: `Invalid regular expression: ${error.message}` };
  }
}

/**
 * @param {string} text
 * @param {string} findValue
 * @param {string} replaceValue
 * @param {{ useRegex?: boolean, caseSensitive?: boolean, wholeWord?: boolean, replaceAll?: boolean }} [options]
 * @returns {{ ok: true, result: string, matchCount: number } | { ok: false, error: string }}
 */
export function findAndReplace(text, findValue, replaceValue, options = {}) {
  const built = buildRegex(findValue, options);
  if (!built.ok) return built;

  const matchCount = countMatches(text, findValue, options);
  const result = text.replace(built.regex, replaceValue);
  return { ok: true, result, matchCount };
}

/**
 * @param {string} text
 * @param {string} findValue
 * @param {{ useRegex?: boolean, caseSensitive?: boolean, wholeWord?: boolean }} [options]
 * @returns {number}
 */
export function countMatches(text, findValue, options = {}) {
  const built = buildRegex(findValue, { ...options, replaceAll: true });
  if (!built.ok) return 0;
  return (text.match(built.regex) ?? []).length;
}
