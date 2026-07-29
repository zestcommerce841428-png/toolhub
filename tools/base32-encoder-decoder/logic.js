/**
 * RFC 4648 Base32 encode/decode, hand-implemented because — unlike
 * Base64, which the browser provides natively via atob/btoa — there is no
 * built-in Base32 in JavaScript. Base32 is what TOTP/2FA secret keys and
 * some case-insensitive identifiers (e.g. in DNS-adjacent contexts) are
 * conventionally encoded in.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const CHAR_TO_VALUE = new Map([...ALPHABET].map((char, index) => [char, index]));

/**
 * @param {string} text - encoded as UTF-8 bytes before Base32 encoding
 * @returns {string}
 */
export function base32Encode(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length === 0) return "";

  let bitBuffer = 0;
  let bitCount = 0;
  let output = "";

  for (const byte of bytes) {
    bitBuffer = (bitBuffer << 8) | byte;
    bitCount += 8;
    while (bitCount >= 5) {
      bitCount -= 5;
      output += ALPHABET[(bitBuffer >> bitCount) & 0b11111];
    }
  }
  if (bitCount > 0) {
    output += ALPHABET[(bitBuffer << (5 - bitCount)) & 0b11111];
  }

  // Pad to a multiple of 8 characters with "=", per RFC 4648.
  const padding = (8 - (output.length % 8)) % 8;
  return output + "=".repeat(padding);
}

/**
 * @param {string} encoded
 * @returns {{ ok: true, text: string } | { ok: false, error: string }}
 */
export function base32Decode(encoded) {
  const cleaned = encoded.trim().toUpperCase().replace(/=+$/, "");
  if (cleaned.length === 0) return { ok: true, text: "" };

  const bytes = [];
  let bitBuffer = 0;
  let bitCount = 0;

  for (const char of cleaned) {
    const value = CHAR_TO_VALUE.get(char);
    if (value === undefined) {
      return { ok: false, error: `"${char}" isn't a valid Base32 character (expected A-Z or 2-7).` };
    }
    bitBuffer = (bitBuffer << 5) | value;
    bitCount += 5;
    if (bitCount >= 8) {
      bitCount -= 8;
      bytes.push((bitBuffer >> bitCount) & 0xff);
    }
  }

  try {
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes)) };
  } catch {
    return { ok: false, error: "Decoded bytes aren't valid UTF-8 text — this may not be a Base32-encoded text string." };
  }
}
