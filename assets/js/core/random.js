/**
 * Cryptographically secure random primitives, shared by every tool that
 * needs unpredictable randomness (password generation, UUIDs, random
 * number/pick generators, shuffling) — built on crypto.getRandomValues(),
 * never Math.random(), which offers no unpredictability guarantee.
 * globalThis.crypto is a standard global in both browsers and modern
 * Node, so this file needs no environment-specific handling to be
 * unit-tested directly.
 */

/**
 * Returns a cryptographically secure random integer in the inclusive
 * range [min, max], using rejection sampling so the result is uniformly
 * distributed — a plain `randomValue % range` would bias low values
 * whenever `range` doesn't evenly divide the random source's range.
 * Works for ranges of any size (not just 0-255), unlike a single-byte-only
 * implementation, by drawing exactly as many bytes as the range needs.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function secureRandomInt(min, max) {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new RangeError("secureRandomInt: min and max must be integers");
  }
  if (max < min) throw new RangeError("secureRandomInt: max must be >= min");
  if (max === min) return min;

  const range = max - min + 1;
  const bytesNeeded = Math.max(1, Math.ceil(Math.log2(range) / 8));
  const totalPossibleValues = 256 ** bytesNeeded;
  const maxValidValue = totalPossibleValues - (totalPossibleValues % range);

  const bytes = new Uint8Array(bytesNeeded);
  let value;
  do {
    globalThis.crypto.getRandomValues(bytes);
    value = bytes.reduce((accumulator, byte) => accumulator * 256 + byte, 0);
  } while (value >= maxValidValue);

  return min + (value % range);
}

/** Fisher-Yates shuffle using the same secure randomness source. Returns a new array; does not mutate the input. */
export function secureShuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Picks one random element from a non-empty array. */
export function secureChoice(array) {
  if (array.length === 0) throw new RangeError("secureChoice: array must not be empty");
  return array[secureRandomInt(0, array.length - 1)];
}
