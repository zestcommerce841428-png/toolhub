import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { digestHex } from "../../assets/js/core/hash.js";

describe("digestHex", () => {
  test("SHA-1 of empty string (well-known test vector)", async () => {
    assert.equal(await digestHex("SHA-1", ""), "da39a3ee5e6b4b0d3255bfef95601890afd80709");
  });
  test("SHA-256 of empty string (well-known test vector)", async () => {
    assert.equal(
      await digestHex("SHA-256", ""),
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });
  test("SHA-256 of 'abc' (well-known test vector)", async () => {
    assert.equal(
      await digestHex("SHA-256", "abc"),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
  test("SHA-512 of empty string (well-known test vector)", async () => {
    assert.equal(
      await digestHex("SHA-512", ""),
      "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
    );
  });
  test("is deterministic", async () => {
    assert.equal(await digestHex("SHA-256", "ToolHub"), await digestHex("SHA-256", "ToolHub"));
  });
  test("different algorithms produce different-length digests", async () => {
    const sha1Length = (await digestHex("SHA-1", "x")).length;
    const sha256Length = (await digestHex("SHA-256", "x")).length;
    const sha512Length = (await digestHex("SHA-512", "x")).length;
    assert.equal(sha1Length, 40);
    assert.equal(sha256Length, 64);
    assert.equal(sha512Length, 128);
  });
});
