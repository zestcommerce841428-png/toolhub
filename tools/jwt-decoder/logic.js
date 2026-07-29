/**
 * JWT structural decoding + optional HMAC signature verification.
 * Decoding the header/payload never requires a secret (they're base64url,
 * not encrypted) — verification is a separate, optional step, and only
 * supports the HS256/HS384/HS512 (HMAC) family, since those are the only
 * algorithms where "verify" just means "recompute the signature with a
 * shared secret," which is safe and meaningful entirely client-side. RS/ES
 * (asymmetric) verification needs a public key, not a pasted secret, and
 * is out of scope for this tool.
 */
import { digestHex } from "../../assets/js/core/hash.js";

const HMAC_ALGORITHMS = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

function base64UrlToBase64(base64Url) {
  const padded = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return padded + "=".repeat(padLength);
}

function base64UrlDecodeToString(base64Url) {
  const binary = atob(base64UrlToBase64(base64Url));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64UrlEncodeBytes(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Splits and decodes a JWT's header and payload without checking the
 * signature. Does not throw — malformed tokens return `{ ok: false }`.
 * @param {string} token
 * @returns {{ ok: true, header: object, payload: object, headerRaw: string, payloadRaw: string, signature: string }
 *         | { ok: false, error: string }}
 */
export function decodeJwt(token) {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: `A JWT has 3 dot-separated parts (header.payload.signature); found ${parts.length}.` };
  }
  const [headerPart, payloadPart, signature] = parts;
  try {
    const headerRaw = base64UrlDecodeToString(headerPart);
    const payloadRaw = base64UrlDecodeToString(payloadPart);
    return {
      ok: true,
      header: JSON.parse(headerRaw),
      payload: JSON.parse(payloadRaw),
      headerRaw,
      payloadRaw,
      signature,
    };
  } catch (error) {
    return { ok: false, error: `Couldn't decode: ${error.message}` };
  }
}

/**
 * Recomputes an HS256/HS384/HS512 signature with the given secret and
 * compares it against the token's actual signature.
 * @param {string} token
 * @param {string} secret
 * @returns {Promise<{ ok: true, valid: boolean } | { ok: false, error: string }>}
 */
export async function verifyHmacSignature(token, secret) {
  const decoded = decodeJwt(token);
  if (!decoded.ok) return decoded;

  const alg = decoded.header.alg;
  const hashAlgorithm = HMAC_ALGORITHMS[alg];
  if (!hashAlgorithm) {
    return { ok: false, error: `"${alg}" isn't a supported HMAC algorithm (supported: HS256, HS384, HS512).` };
  }

  const [headerPart, payloadPart] = token.trim().split(".");
  const signingInput = new TextEncoder().encode(`${headerPart}.${payloadPart}`);
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: hashAlgorithm },
    false,
    ["sign"]
  );
  const signatureBytes = await globalThis.crypto.subtle.sign("HMAC", key, signingInput);
  const expectedSignature = base64UrlEncodeBytes(signatureBytes);

  return { ok: true, valid: expectedSignature === decoded.signature };
}

/** @param {number} exp - seconds since epoch (a JWT "exp"/"iat"/"nbf" claim) @returns {string} */
export function formatClaimTimestamp(exp) {
  if (!Number.isFinite(exp)) return "—";
  return new Date(exp * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}
