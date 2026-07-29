/**
 * UUID v4 generation and validation. Built on crypto.getRandomValues()
 * directly (RFC 4122 bit-twiddling) rather than the newer
 * crypto.randomUUID() convenience method, for the same reason
 * password-generator/logic.js does its own generation: consistent,
 * explicit randomness sourcing across every security-sensitive tool, and
 * broader browser support. globalThis.crypto is available in modern Node
 * too, so this is directly unit-testable.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Generates one random UUID v4 as a lowercase, hyphenated string. */
export function generateUuidV4() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx (RFC 4122)

  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return [hex.slice(0, 4).join(""), hex.slice(4, 6).join(""), hex.slice(6, 8).join(""), hex.slice(8, 10).join(""), hex.slice(10, 16).join("")].join(
    "-"
  );
}

/**
 * @param {number} count
 * @param {{ uppercase?: boolean, hyphens?: boolean }} [options]
 * @returns {string[]}
 */
export function generateUuids(count, options = {}) {
  const { uppercase = false, hyphens = true } = options;
  const results = [];
  for (let i = 0; i < count; i++) {
    let uuid = generateUuidV4();
    if (!hyphens) uuid = uuid.replace(/-/g, "");
    if (uppercase) uuid = uuid.toUpperCase();
    results.push(uuid);
  }
  return results;
}

/** Validates the canonical 8-4-4-4-12 hyphenated UUID format (any version/variant). */
export function isValidUuid(value) {
  return typeof value === "string" && UUID_RE.test(value.trim());
}
