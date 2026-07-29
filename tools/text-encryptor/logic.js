/**
 * Real, passphrase-based text encryption via the Web Crypto API —
 * PBKDF2 (SHA-256, 250,000 iterations) to derive an AES-256-GCM key from
 * the passphrase, with a fresh random salt and IV per encryption. Output
 * is salt(16 bytes) + iv(12 bytes) + ciphertext, concatenated and
 * base64-encoded into one copy-pasteable string — nothing to manage
 * separately. AES-GCM is authenticated, so a wrong passphrase or any
 * tampering makes decryption fail loudly rather than silently returning
 * garbage.
 */

const PBKDF2_ITERATIONS = 250_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** @param {string} passphrase @param {Uint8Array} salt @returns {Promise<CryptoKey>} */
async function deriveKey(passphrase, salt) {
  const baseKey = await globalThis.crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);
  return globalThis.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * @param {string} plaintext
 * @param {string} passphrase
 * @returns {Promise<string>} base64-encoded salt+iv+ciphertext
 */
export async function encryptText(plaintext, passphrase) {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await globalThis.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));

  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
  return bytesToBase64(combined);
}

/**
 * @param {string} encoded - the base64 string encryptText produced
 * @param {string} passphrase
 * @returns {Promise<{ ok: true, plaintext: string } | { ok: false, error: string }>}
 */
export async function decryptText(encoded, passphrase) {
  let combined;
  try {
    combined = base64ToBytes(encoded.trim());
  } catch {
    return { ok: false, error: "That doesn't look like valid encrypted output — check for a copy/paste issue." };
  }
  if (combined.length < SALT_LENGTH + IV_LENGTH + 1) {
    return { ok: false, error: "Too short to be valid encrypted output." };
  }

  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

  try {
    const key = await deriveKey(passphrase, salt);
    const plaintextBytes = await globalThis.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return { ok: true, plaintext: new TextDecoder().decode(plaintextBytes) };
  } catch {
    // AES-GCM's built-in authentication tag check fails the same way for
    // a wrong passphrase as for tampered/corrupted ciphertext — there's no
    // way to distinguish the two from the failure alone, which is a
    // deliberate property of authenticated encryption, not a limitation
    // of this tool.
    return { ok: false, error: "Decryption failed — wrong passphrase, or the encrypted text was altered/corrupted." };
  }
}
