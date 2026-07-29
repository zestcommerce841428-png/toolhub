import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { encryptText, decryptText } from "../../tools/text-encryptor/logic.js";

describe("encryptText / decryptText", () => {
  test("round-trips plaintext through encrypt then decrypt", async () => {
    const encrypted = await encryptText("Hello, ToolHub!", "correct horse battery staple");
    const result = await decryptText(encrypted, "correct horse battery staple");
    assert.equal(result.ok, true);
    assert.equal(result.plaintext, "Hello, ToolHub!");
  });
  test("round-trips multi-byte UTF-8 text", async () => {
    const original = "héllo 世界 🎉";
    const encrypted = await encryptText(original, "passphrase");
    const result = await decryptText(encrypted, "passphrase");
    assert.equal(result.plaintext, original);
  });
  test("round-trips empty string", async () => {
    const encrypted = await encryptText("", "passphrase");
    const result = await decryptText(encrypted, "passphrase");
    assert.equal(result.ok, true);
    assert.equal(result.plaintext, "");
  });
  test("fails decryption with the wrong passphrase", async () => {
    const encrypted = await encryptText("secret message", "right-passphrase");
    const result = await decryptText(encrypted, "wrong-passphrase");
    assert.equal(result.ok, false);
    assert.match(result.error, /wrong passphrase/i);
  });
  test("two encryptions of the same plaintext produce different ciphertext (random salt/IV)", async () => {
    const a = await encryptText("same message", "same passphrase");
    const b = await encryptText("same message", "same passphrase");
    assert.notEqual(a, b);
  });
  test("rejects garbage input that isn't valid base64", async () => {
    const result = await decryptText("not valid base64 !!! @@@", "passphrase");
    assert.equal(result.ok, false);
  });
  test("rejects input that's too short to contain a salt+iv+ciphertext", async () => {
    const result = await decryptText("YWJj", "passphrase"); // "abc" in base64, way too short
    assert.equal(result.ok, false);
    assert.match(result.error, /too short/i);
  });
  test("detects tampered ciphertext (authenticated encryption)", async () => {
    const encrypted = await encryptText("original message", "passphrase");
    const tamperedChars = encrypted.split("");
    // Flip a character somewhere in the middle (inside the ciphertext, past salt+iv).
    const midpoint = Math.floor(tamperedChars.length / 2);
    tamperedChars[midpoint] = tamperedChars[midpoint] === "A" ? "B" : "A";
    const result = await decryptText(tamperedChars.join(""), "passphrase");
    assert.equal(result.ok, false);
  });
});
