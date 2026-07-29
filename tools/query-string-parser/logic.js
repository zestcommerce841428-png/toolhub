/**
 * Parses a URL or bare query string into an ordered list of key/value
 * pairs — deliberately a list, not an object, since query strings can
 * legitimately repeat a key (?tag=a&tag=b) and collapsing that into an
 * object would silently drop the first value.
 */

/**
 * @param {string} input - a full URL, or just a query string (with or without a leading "?")
 * @returns {Array<{ key: string, value: string }>}
 */
export function parseQueryString(input) {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const questionMarkIndex = trimmed.indexOf("?");
  if (questionMarkIndex === -1) {
    // No "?" at all: if this looks like a full URL (has a scheme), there's
    // simply no query string to parse. If it doesn't, treat the whole
    // trimmed input as a bare query string (e.g. "a=1&b=2" pasted with no
    // leading "?") rather than silently returning nothing.
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return [];
  }
  let queryPart = questionMarkIndex !== -1 ? trimmed.slice(questionMarkIndex + 1) : trimmed;
  // Strip a URL fragment if the caller pasted one along with the query string.
  const hashIndex = queryPart.indexOf("#");
  if (hashIndex !== -1) queryPart = queryPart.slice(0, hashIndex);

  if (!queryPart) return [];

  return queryPart.split("&").map((pair) => {
    const equalsIndex = pair.indexOf("=");
    if (equalsIndex === -1) {
      return { key: safeDecode(pair), value: "" };
    }
    return { key: safeDecode(pair.slice(0, equalsIndex)), value: safeDecode(pair.slice(equalsIndex + 1)) };
  });
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

/**
 * @param {Array<{ key: string, value: string }>} pairs
 * @returns {string} a query string (no leading "?")
 */
export function buildQueryString(pairs) {
  return pairs
    .filter((pair) => pair.key.trim().length > 0)
    .map((pair) => `${encodeURIComponent(pair.key)}=${encodeURIComponent(pair.value)}`)
    .join("&");
}
