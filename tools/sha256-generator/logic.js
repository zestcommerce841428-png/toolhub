import { digestHex } from "../../assets/js/core/hash.js";

/** @param {string} text @returns {Promise<string>} lowercase 64-char hex SHA-256 digest */
export function sha256(text) {
  return digestHex("SHA-256", text);
}
