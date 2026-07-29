/**
 * MD5 (RFC 1321) implemented directly because the Web Crypto API's
 * `crypto.subtle.digest` deliberately does not expose MD5 (it's cryptographically
 * broken for security use, but still the standard checksum for file-integrity
 * and cache-key use cases this tool targets — see content.html). Every other
 * hash tool in this family (SHA-1/256/512) instead calls `crypto.subtle.digest`
 * directly, since the browser already implements those correctly and fast;
 * hand-rolling those too would just be duplicate, harder-to-trust code for no
 * benefit. This file is the only one that needs its own bit-level implementation.
 *
 * Algorithm reference: RFC 1321 (https://www.rfc-editor.org/rfc/rfc1321).
 * Operates on UTF-8 bytes throughout, matching how every other hash tool in
 * this family treats input, so the same text produces comparable-looking
 * (if numerically different) output across the whole family.
 */

const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

// K[i] = floor(abs(sin(i + 1)) * 2^32), precomputed per RFC 1321 so the
// implementation doesn't depend on floating-point trig at runtime.
const K = new Int32Array([
  -680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426, -1473231341, -45705983,
  1770035416, -1958414417, -42063, -1990404162, 1804603682, -40341101, -1502002290, 1236535329,
  -165796510, -1069501632, 643717713, -373897302, -701558691, 38016083, -660478335, -405537848,
  568446438, -1019803690, -187363961, 1163531501, -1444681467, -51403784, 1735328473, -1926607734,
  -378558, -2022574463, 1839030562, -35309556, -1530992060, 1272893353, -155497632, -1094730640,
  681279174, -358537222, -722521979, 76029189, -640364487, -421815835, 530742520, -995338651,
  -198630844, 1126891415, -1416354905, -57434055, 1700485571, -1894986606, -1051523, -2054922799,
  1873313359, -30611744, -1560198380, 1309151649, -145523070, -1120210379, 718787259, -343485551,
]);

function toUtf8Bytes(text) {
  return new TextEncoder().encode(text);
}

/** Pads a byte array to the RFC 1321 message schedule: a 1 bit, zeros, then the 64-bit little-endian bit length. */
function md5Pad(bytes) {
  const bitLength = BigInt(bytes.length) * 8n;
  const paddedLength = ((bytes.length + 8) >> 6) * 64 + 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Number(bitLength & 0xffffffffn), true);
  view.setUint32(paddedLength - 4, Number((bitLength >> 32n) & 0xffffffffn), true);
  return padded;
}

function leftRotate(x, amount) {
  return (x << amount) | (x >>> (32 - amount));
}

/**
 * Computes the MD5 digest of `text` (UTF-8 encoded) synchronously.
 * @param {string} text
 * @returns {string} 32-character lowercase hex digest
 */
export function md5(text) {
  const padded = md5Pad(toUtf8Bytes(text));
  const view = new DataView(padded.buffer);

  let a0 = 0x67452301;
  let b0 = -0x10325477; // 0xefcdab89 as int32
  let c0 = -0x67452302; // 0x98badcfe as int32
  let d0 = 0x10325476;

  for (let chunkStart = 0; chunkStart < padded.length; chunkStart += 64) {
    const M = new Int32Array(16);
    for (let i = 0; i < 16; i++) {
      M[i] = view.getInt32(chunkStart + i * 4, true);
    }

    let [A, B, C, D] = [a0, b0, c0, d0];

    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + leftRotate(F, S[i])) | 0;
    }

    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  return [a0, b0, c0, d0].map(toLittleEndianHex).join("");
}

function toLittleEndianHex(int32) {
  const bytes = [int32 & 0xff, (int32 >>> 8) & 0xff, (int32 >>> 16) & 0xff, (int32 >>> 24) & 0xff];
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
