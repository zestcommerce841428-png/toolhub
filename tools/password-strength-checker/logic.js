/**
 * Analyzes an arbitrary, already-typed password — genuinely different
 * from password-generator's strength meter, which already knows the exact
 * character pool it drew from. Here the pool has to be inferred from
 * which character classes actually appear, and real passwords are full of
 * non-random patterns (dictionary words, keyboard walks, repeats) that a
 * pure entropy formula doesn't see at all — both are accounted for below.
 */

const CLASS_POOL_SIZES = { lower: 26, upper: 26, digit: 10, symbol: 33 };

// A short, real sample of the most common leaked passwords (from public
// breach-analysis top-10-style lists) — enough to catch the most
// catastrophic choices without shipping a multi-megabyte wordlist to the
// browser for a client-side tool.
const COMMON_PASSWORDS = new Set([
  "123456", "password", "123456789", "12345678", "12345", "qwerty",
  "abc123", "password1", "111111", "123123", "admin", "letmein",
  "welcome", "monkey", "dragon", "iloveyou", "qwerty123", "football",
]);

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

/** @param {string} password @returns {{ lower: boolean, upper: boolean, digit: boolean, symbol: boolean }} */
export function detectCharacterClasses(password) {
  return {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  };
}

/** Sum of the character-class pool sizes actually present — the effective alphabet size for the entropy estimate below. */
export function estimatePoolSize(password) {
  const classes = detectCharacterClasses(password);
  return Object.entries(classes).reduce((total, [key, present]) => total + (present ? CLASS_POOL_SIZES[key] : 0), 0);
}

/** Shannon-style entropy estimate: length x log2(pool size) — the same formula password-generator uses, applied to an inferred rather than a known pool. */
export function estimateEntropyBits(password) {
  if (!password) return 0;
  const poolSize = estimatePoolSize(password);
  if (poolSize <= 1) return 0;
  return Math.floor(password.length * Math.log2(poolSize));
}

/**
 * Flags non-random structure that a pure entropy estimate can't see:
 * being a known common password, 4+ repeated characters in a row, or a
 * 4+ character run lifted straight from a keyboard row (forward or
 * reversed) or a numeric/alphabetic sequence.
 * @param {string} password
 * @returns {string[]} human-readable warnings, empty if none found
 */
export function detectWeakPatterns(password) {
  const warnings = [];
  const lower = password.toLowerCase();

  if (COMMON_PASSWORDS.has(lower)) {
    warnings.push("This is one of the most common leaked passwords — treat it as public.");
  }
  if (/(.)\1{3,}/.test(password)) {
    warnings.push("Contains 4+ repeated characters in a row (e.g. \"aaaa\").");
  }

  const hasKeyboardWalk = KEYBOARD_ROWS.some((row) => {
    const reversed = [...row].reverse().join("");
    for (let start = 0; start <= row.length - 4; start++) {
      const chunk = row.slice(start, start + 4);
      if (lower.includes(chunk) || lower.includes(reversed.slice(start, start + 4))) return true;
    }
    return false;
  });
  if (hasKeyboardWalk) {
    warnings.push("Contains a keyboard-row pattern (e.g. \"qwer\", \"asdf\") — easy for crackers to guess.");
  }

  if (hasSequentialRun(lower, 4)) {
    warnings.push("Contains a sequential run (e.g. \"1234\" or \"abcd\") — easy for crackers to guess.");
  }

  return warnings;
}

function hasSequentialRun(text, minLength) {
  let ascendingRun = 1;
  let descendingRun = 1;
  for (let i = 1; i < text.length; i++) {
    const diff = text.charCodeAt(i) - text.charCodeAt(i - 1);
    ascendingRun = diff === 1 ? ascendingRun + 1 : 1;
    descendingRun = diff === -1 ? descendingRun + 1 : 1;
    if (ascendingRun >= minLength || descendingRun >= minLength) return true;
  }
  return false;
}

/**
 * Human-readable estimated time to exhaust the search space at a stated
 * guess rate — using entropy bits reduced by a penalty when weak patterns
 * are present, since a pattern-based attack tries those first regardless
 * of raw entropy.
 * @param {number} entropyBits
 * @param {number} guessesPerSecond
 * @returns {string}
 */
export function estimateCrackTime(entropyBits, guessesPerSecond) {
  if (entropyBits <= 0 || guessesPerSecond <= 0) return "instantly";
  const combinations = 2 ** entropyBits;
  const seconds = combinations / guessesPerSecond / 2; // average case: half the search space

  const UNITS = [
    ["century", 60 * 60 * 24 * 365 * 100],
    ["year", 60 * 60 * 24 * 365],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  if (seconds < 1) return "instantly";
  for (const [label, unitSeconds] of UNITS) {
    const value = seconds / unitSeconds;
    if (value >= 1) {
      const rounded = value >= 100 ? Math.round(value).toLocaleString() : value.toFixed(1);
      return `~${rounded} ${label}${value >= 2 ? "s" : ""}${label === "century" && value > 1000 ? "+" : ""}`;
    }
  }
  return "instantly";
}

/**
 * @param {string} password
 * @returns {{
 *   entropyBits: number,
 *   label: "Very weak"|"Weak"|"Fair"|"Strong"|"Very strong",
 *   warnings: string[],
 *   crackTimeOffline: string,
 *   crackTimeOnline: string
 * }}
 */
export function analyzePassword(password) {
  const entropyBits = estimateEntropyBits(password);
  const warnings = detectWeakPatterns(password);
  // A password matching a known-weak pattern is attacked with a targeted
  // wordlist/pattern search first, not brute force — capping well inside
  // the "Very weak" bucket reflects that it's effectively guessable
  // almost immediately, regardless of how much raw entropy the character
  // mix would otherwise suggest.
  const effectiveBits = warnings.length > 0 ? Math.min(entropyBits, 16) : entropyBits;

  let label;
  if (!password) label = "Very weak";
  else if (effectiveBits < 28) label = "Very weak";
  else if (effectiveBits < 40) label = "Weak";
  else if (effectiveBits < 60) label = "Fair";
  else if (effectiveBits < 80) label = "Strong";
  else label = "Very strong";

  return {
    entropyBits,
    label,
    warnings,
    // 10 billion guesses/sec: a realistic offline GPU-cluster attack against a fast (unsalted-equivalent) hash.
    crackTimeOffline: estimateCrackTime(effectiveBits, 1e10),
    // 100 guesses/sec: a realistic online, rate-limited login attempt.
    crackTimeOnline: estimateCrackTime(effectiveBits, 100),
  };
}
