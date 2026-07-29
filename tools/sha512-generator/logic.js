import { digestHex } from "../../assets/js/core/hash.js";

/** @param {string} text @returns {Promise<string>} lowercase 128-char hex SHA-512 digest */
export function sha512(text) {
  return digestHex("SHA-512", text);
}
