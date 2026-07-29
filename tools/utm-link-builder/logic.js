/** Builds a URL with UTM campaign-tracking parameters appended, merging correctly with any query string the base URL already has. */

export const UTM_PARAM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

/**
 * @typedef {object} UtmParams
 * @property {string} utm_source
 * @property {string} utm_medium
 * @property {string} utm_campaign
 * @property {string} [utm_term]
 * @property {string} [utm_content]
 */

/**
 * @param {string} baseUrl
 * @param {UtmParams} params
 * @returns {{ ok: true, url: string } | { ok: false, error: string }}
 */
export function buildUtmUrl(baseUrl, params) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    return { ok: false, error: "Enter a valid, absolute URL (including https://)." };
  }

  for (const key of UTM_PARAM_KEYS) {
    const value = (params[key] ?? "").trim();
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  }

  return { ok: true, url: url.toString() };
}

/** True if utm_source, utm_medium, and utm_campaign — the three UTM parameters Google Analytics treats as required — are all filled in. */
export function hasRequiredUtmParams(params) {
  return Boolean(params.utm_source?.trim() && params.utm_medium?.trim() && params.utm_campaign?.trim());
}
