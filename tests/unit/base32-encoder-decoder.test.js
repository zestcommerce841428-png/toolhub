import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { base32Encode, base32Decode } from "../../tools/base32-encoder-decoder/logic.js";

// RFC 4648 §10 official test vectors.
const RFC_4648_VECTORS = [
  ["", ""],
  ["f", "MY======"],
  ["fo", "MZXQ===="],
  ["foo", "MZXW6==="],
  ["foob", "MZXW6YQ="],
  ["fooba", "MZXW6YTB"],
  ["foobar", "MZXW6YTBOI======"],
];

describe("base32Encode", () => {
  for (const [input, expected] of RFC_4648_VECTORS) {
    test(`encodes ${JSON.stringify(input)} per RFC 4648`, () => {
      assert.equal(base32Encode(input), expected);
    });
  }
});

describe("base32Decode", () => {
  for (const [expected, input] of RFC_4648_VECTORS) {
    test(`decodes ${JSON.stringify(input)} per RFC 4648`, () => {
      const result = base32Decode(input);
      assert.equal(result.ok, true);
      assert.equal(result.text, expected);
    });
  }

  test("round-trips multi-byte UTF-8 text", () => {
    const original = "héllo 世界 🎉";
    const result = base32Decode(base32Encode(original));
    assert.equal(result.ok, true);
    assert.equal(result.text, original);
  });
  test("is case-insensitive on decode", () => {
    const result = base32Decode("mzxw6ytboi======");
    assert.equal(result.ok, true);
    assert.equal(result.text, "foobar");
  });
  test("tolerates missing padding", () => {
    const result = base32Decode("MZXW6YTBOI");
    assert.equal(result.ok, true);
    assert.equal(result.text, "foobar");
  });
  test("rejects an invalid character", () => {
    const result = base32Decode("MZX@6===");
    assert.equal(result.ok, false);
    assert.match(result.error, /isn't a valid Base32 character/);
  });
});
