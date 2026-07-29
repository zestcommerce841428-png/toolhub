/**
 * Cryptographically-random password generation. Uses the Web Crypto API
 * (globalThis.crypto.getRandomValues) rather than Math.random(), which is
 * not designed to be unpredictable and must never back a security tool.
 * globalThis.crypto is also available in modern Node, so this file is
 * testable directly with node:test — no browser shim required.
 */

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/",
};

// Characters that are easy to misread in most fonts: 1/l/I, 0/O, etc.
const AMBIGUOUS_CHARS = new Set("il1IlL0Oo");

/**
 * Returns a cryptographically secure random integer in [0, maxExclusive),
 * using rejection sampling so the result is uniformly distributed (a plain
 * `randomByte % maxExclusive` would bias low values whenever maxExclusive
 * doesn't evenly divide 256).
 */
function secureRandomInt(maxExclusive) {
  if (maxExclusive <= 0) throw new RangeError("maxExclusive must be positive");
  const maxValidByte = 256 - (256 % maxExclusive);
  const bytes = new Uint8Array(1);
  let value;
  do {
    globalThis.crypto.getRandomValues(bytes);
    value = bytes[0];
  } while (value >= maxValidByte);
  return value % maxExclusive;
}

/** Fisher-Yates shuffle using the same secure randomness source. */
function secureShuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * @typedef {object} PasswordOptions
 * @property {number} length
 * @property {boolean} useLowercase
 * @property {boolean} useUppercase
 * @property {boolean} useNumbers
 * @property {boolean} useSymbols
 * @property {boolean} excludeAmbiguous
 */

/** Returns the enabled category keys, e.g. ["lowercase", "numbers"]. */
export function enabledCategories(options) {
  return Object.keys(CHAR_SETS).filter((key) => options[`use${capitalize(key)}`]);
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function categoryPool(key, excludeAmbiguous) {
  const chars = CHAR_SETS[key];
  return excludeAmbiguous ? [...chars].filter((char) => !AMBIGUOUS_CHARS.has(char)).join("") : chars;
}

/**
 * Generates a random password meeting the given options.
 * @param {PasswordOptions} options
 * @returns {{ ok: true, password: string, poolSize: number } | { ok: false, error: string }}
 */
export function generatePassword(options) {
  const categories = enabledCategories(options);
  if (categories.length === 0) {
    return { ok: false, error: "Select at least one character type." };
  }
  if (!Number.isInteger(options.length) || options.length < categories.length) {
    return { ok: false, error: `Length must be at least ${categories.length} to include every selected character type.` };
  }

  const pools = categories.map((key) => categoryPool(key, options.excludeAmbiguous));
  const combinedPool = pools.join("");
  if (combinedPool.length === 0) {
    return { ok: false, error: "No characters remain after excluding ambiguous characters — try a wider selection." };
  }

  // Guarantee one character from every selected category...
  const guaranteed = pools.map((pool) => pool[secureRandomInt(pool.length)]);
  // ...then fill the remaining length from the combined pool...
  const remainingCount = options.length - guaranteed.length;
  const filler = Array.from({ length: remainingCount }, () => combinedPool[secureRandomInt(combinedPool.length)]);
  // ...and shuffle so the guaranteed characters aren't always first.
  const password = secureShuffle([...guaranteed, ...filler]).join("");

  return { ok: true, password, poolSize: combinedPool.length };
}

/** Shannon-style entropy estimate in bits for a password of `length` drawn uniformly from a pool of `poolSize`. */
export function estimateEntropyBits(length, poolSize) {
  if (poolSize <= 1 || length <= 0) return 0;
  return Math.floor(length * Math.log2(poolSize));
}

/** @returns {"Weak"|"Fair"|"Strong"|"Very strong"} */
export function strengthLabel(entropyBits) {
  if (entropyBits < 40) return "Weak";
  if (entropyBits < 60) return "Fair";
  if (entropyBits < 80) return "Strong";
  return "Very strong";
}
