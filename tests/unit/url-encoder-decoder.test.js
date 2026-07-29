import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  encodeUriComponentSafe,
  decodeUriComponentSafe,
  encodeFormUrl,
  decodeFormUrl,
} from "../../tools/url-encoder-decoder/logic.js";

describe("encodeUriComponentSafe / decodeUriComponentSafe", () => {
  test("encodes a space as %20", () => {
    assert.deepEqual(encodeUriComponentSafe("hello world"), { ok: true, result: "hello%20world" });
  });
  test("round-trips", () => {
    const encoded = encodeUriComponentSafe("a=1&b=2 c/d").result;
    assert.equal(decodeUriComponentSafe(encoded).result, "a=1&b=2 c/d");
  });
  test("decode reports a friendly error on malformed percent-encoding", () => {
    const result = decodeUriComponentSafe("100%");
    assert.equal(result.ok, false);
    assert.match(result.error, /percent-encoding/i);
  });
});

describe("encodeFormUrl / decodeFormUrl", () => {
  test("encodes a space as +", () => {
    assert.equal(encodeFormUrl("hello world").result, "hello+world");
  });
  test("round-trips through decodeFormUrl", () => {
    const encoded = encodeFormUrl("q=hello world&x=1").result;
    assert.equal(decodeFormUrl(encoded).result, "q=hello world&x=1");
  });
  test("decode reports a friendly error on malformed percent-encoding", () => {
    const result = decodeFormUrl("bad%zz");
    assert.equal(result.ok, false);
  });
});
