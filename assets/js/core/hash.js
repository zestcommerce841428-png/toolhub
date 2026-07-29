/**
 * SHA-family digests via the Web Crypto API (crypto.subtle.digest), shared
 * by the SHA-1/256/512 hash-generator tools (three real call sites, plus
 * HMAC Generator computing the same digests for its keyed variant — see
 * docs/CONTRIBUTING.md's "sharing logic.js across a tool family"). MD5 is
 * deliberately not here: crypto.subtle doesn't implement it, so
 * tools/md5-generator/logic.js hand-rolls it instead. globalThis.crypto is
 * a standard global in both browsers and modern Node, so this is directly
 * unit-testable without a DOM shim.
 */

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * @param {"SHA-1"|"SHA-256"|"SHA-384"|"SHA-512"} algorithm
 * @param {string} text
 * @returns {Promise<string>} lowercase hex digest
 */
export async function digestHex(algorithm, text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest(algorithm, bytes);
  return bytesToHex(digest);
}
