/**
 * HMAC generation via the Web Crypto API — the same primitive
 * tools/jwt-decoder/logic.js uses internally for signature verification,
 * exposed here as a general-purpose, standalone tool (message + secret in,
 * hex digest out) rather than baked into the JWT-specific flow.
 */

export const HMAC_ALGORITHMS = { "HMAC-SHA1": "SHA-1", "HMAC-SHA256": "SHA-256", "HMAC-SHA384": "SHA-384", "HMAC-SHA512": "SHA-512" };

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * @param {string} message
 * @param {string} secret
 * @param {keyof typeof HMAC_ALGORITHMS} algorithmId
 * @returns {Promise<string>} lowercase hex HMAC digest
 */
export async function computeHmac(message, secret, algorithmId) {
  const hashAlgorithm = HMAC_ALGORITHMS[algorithmId];
  if (!hashAlgorithm) throw new Error(`Unknown HMAC algorithm: ${algorithmId}`);

  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: hashAlgorithm },
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bytesToHex(signature);
}
