/**
 * User-agent string parsing. Order matters throughout: Edge and Opera UAs
 * both contain "Chrome" and "Safari" tokens (they're Chromium-based), and
 * Chrome UAs contain "Safari" too (WebKit heritage) — each browser check
 * below only runs after ruling out every browser whose UA is a superset
 * of its tokens, so a more-specific match always wins.
 */

const BROWSER_MATCHERS = [
  { name: "Edge", regex: /Edg\/([\d.]+)/ },
  { name: "Opera", regex: /(?:OPR|Opera)\/([\d.]+)/ },
  { name: "Samsung Internet", regex: /SamsungBrowser\/([\d.]+)/ },
  { name: "Firefox", regex: /Firefox\/([\d.]+)/ },
  { name: "Chrome", regex: /Chrome\/([\d.]+)/ },
  { name: "Internet Explorer", regex: /(?:MSIE |rv:)([\d.]+).*Trident/ },
  { name: "Internet Explorer", regex: /Trident.*rv:([\d.]+)/ },
  // Safari must come last: its own UA also matches "Version/x.y ... Safari/x.y"
  // with no Chrome/Firefox/Edg/OPR token, which is exactly what makes it
  // Safari rather than one of those — but every other engine's UA that
  // happens to also contain the literal word "Safari" needs to be ruled
  // out first, which the ordering above already guarantees.
  { name: "Safari", regex: /Version\/([\d.]+).*Safari/ },
];

const OS_MATCHERS = [
  { name: "iOS", regex: /(?:iPhone|iPad|iPod).*OS (\d+[_.]\d+)/, formatVersion: (v) => v.replace(/_/g, ".") },
  { name: "Android", regex: /Android (\d+(?:\.\d+)?)/ },
  { name: "Windows", regex: /Windows NT (\d+\.\d+)/, formatVersion: formatWindowsVersion },
  { name: "macOS", regex: /Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/, formatVersion: (v) => v.replace(/_/g, ".") },
  { name: "Chrome OS", regex: /CrOS \w+ (\d+\.\d+\.\d+)/ },
  { name: "Linux", regex: /(Linux)/, formatVersion: () => "" },
];

function formatWindowsVersion(ntVersion) {
  const map = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista", "5.1": "XP" };
  return map[ntVersion] ?? ntVersion;
}

/** @param {string} userAgent @returns {{ name: string, version: string }} */
export function detectBrowser(userAgent) {
  for (const { name, regex } of BROWSER_MATCHERS) {
    const match = userAgent.match(regex);
    if (match) return { name, version: match[1] };
  }
  return { name: "Unknown", version: "" };
}

/** @param {string} userAgent @returns {{ name: string, version: string }} */
export function detectOs(userAgent) {
  for (const { name, regex, formatVersion } of OS_MATCHERS) {
    const match = userAgent.match(regex);
    if (match) return { name, version: formatVersion ? formatVersion(match[1]) : match[1] ?? "" };
  }
  return { name: "Unknown", version: "" };
}

/** @param {string} userAgent @returns {"mobile"|"tablet"|"desktop"} */
export function detectDeviceType(userAgent) {
  if (/iPad/.test(userAgent) || (/Android/.test(userAgent) && !/Mobile/.test(userAgent))) return "tablet";
  if (/Mobi|iPhone|iPod/.test(userAgent)) return "mobile";
  return "desktop";
}

/**
 * @param {string} userAgent
 * @returns {{ browser: {name:string,version:string}, os: {name:string,version:string}, deviceType: string }}
 */
export function parseUserAgent(userAgent) {
  return {
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent),
    deviceType: detectDeviceType(userAgent),
  };
}
