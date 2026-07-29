/**
 * URL/percent-encoding, offering both the strict `encodeURIComponent` form
 * (correct for a single query-string value) and the `+`-for-space
 * `application/x-www-form-urlencoded` form (correct for a full query
 * string / form body), since the two disagree on how to represent a space
 * and mixing them up is a common source of subtly-wrong URLs.
 */

/** @param {string} text @returns {{ ok: true, result: string } | { ok: false, error: string }} */
export function encodeUriComponentSafe(text) {
  try {
    return { ok: true, result: encodeURIComponent(text) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/** @param {string} text @returns {{ ok: true, result: string } | { ok: false, error: string }} */
export function decodeUriComponentSafe(text) {
  try {
    return { ok: true, result: decodeURIComponent(text) };
  } catch {
    return { ok: false, error: "Invalid percent-encoding — check for a stray % not followed by two hex digits." };
  }
}

/** Form-encodes like a browser submitting application/x-www-form-urlencoded: spaces become "+". */
export function encodeFormUrl(text) {
  try {
    return { ok: true, result: encodeURIComponent(text).replace(/%20/g, "+") };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/** Form-decodes: "+" becomes a space before percent-decoding, matching application/x-www-form-urlencoded. */
export function decodeFormUrl(text) {
  try {
    return { ok: true, result: decodeURIComponent(text.replace(/\+/g, " ")) };
  } catch {
    return { ok: false, error: "Invalid percent-encoding — check for a stray % not followed by two hex digits." };
  }
}
