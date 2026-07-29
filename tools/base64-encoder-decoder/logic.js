/**
 * Base64 <-> text, UTF-8 safe. Plain btoa()/atob() only handle single-byte
 * (Latin1-range) characters, so encoding through TextEncoder/TextDecoder
 * first is what makes emoji and non-English text round-trip correctly
 * instead of throwing or silently mangling. btoa/atob/TextEncoder/
 * TextDecoder are all standard globals in both browsers and modern Node,
 * so this file needs no environment-specific handling to be unit-tested.
 */

/**
 * @param {string} text
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function encodeBase64(text) {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return { ok: true, value: btoa(binary) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to encode." };
  }
}

/**
 * @param {string} base64
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function decodeBase64(base64) {
  try {
    const binary = atob(base64.trim());
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return { ok: true, value: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, error: "That isn't valid Base64 — check for missing characters or extra whitespace." };
  }
}
