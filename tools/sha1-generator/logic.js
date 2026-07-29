// Relative import — see docs/CONTRIBUTING.md's "logic.js needing a core
// module must use a relative path" (this file is imported directly by
// tests/unit/*.test.js under plain Node).
import { digestHex } from "../../assets/js/core/hash.js";

/** @param {string} text @returns {Promise<string>} lowercase 40-char hex SHA-1 digest */
export function sha1(text) {
  return digestHex("SHA-1", text);
}
