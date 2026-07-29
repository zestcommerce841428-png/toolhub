import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseQueryString, buildQueryString } from "../../tools/query-string-parser/logic.js";

describe("parseQueryString", () => {
  test("parses a bare query string", () => {
    assert.deepEqual(parseQueryString("a=1&b=2"), [
      { key: "a", value: "1" },
      { key: "b", value: "2" },
    ]);
  });
  test("parses a full URL, ignoring the origin and path", () => {
    assert.deepEqual(parseQueryString("https://example.com/search?q=hello&page=2"), [
      { key: "q", value: "hello" },
      { key: "page", value: "2" },
    ]);
  });
  test("accepts a leading ? on a bare query string", () => {
    assert.deepEqual(parseQueryString("?a=1"), [{ key: "a", value: "1" }]);
  });
  test("strips a trailing fragment", () => {
    assert.deepEqual(parseQueryString("https://example.com/?a=1#section"), [{ key: "a", value: "1" }]);
  });
  test("preserves duplicate keys as separate entries, not collapsed", () => {
    assert.deepEqual(parseQueryString("tag=a&tag=b"), [
      { key: "tag", value: "a" },
      { key: "tag", value: "b" },
    ]);
  });
  test("decodes percent-encoded and + values", () => {
    assert.deepEqual(parseQueryString("q=hello+world&x=a%26b"), [
      { key: "q", value: "hello world" },
      { key: "x", value: "a&b" },
    ]);
  });
  test("handles a key with no value", () => {
    assert.deepEqual(parseQueryString("flag"), [{ key: "flag", value: "" }]);
  });
  test("empty input returns an empty array", () => {
    assert.deepEqual(parseQueryString(""), []);
  });
  test("a URL with no query string returns an empty array", () => {
    assert.deepEqual(parseQueryString("https://example.com/"), []);
  });
});

describe("buildQueryString", () => {
  test("builds a query string from pairs", () => {
    assert.equal(
      buildQueryString([
        { key: "a", value: "1" },
        { key: "b", value: "2" },
      ]),
      "a=1&b=2"
    );
  });
  test("url-encodes keys and values", () => {
    assert.equal(buildQueryString([{ key: "q", value: "hello world & more" }]), "q=hello%20world%20%26%20more");
  });
  test("skips pairs with an empty key", () => {
    assert.equal(buildQueryString([{ key: "", value: "x" }, { key: "a", value: "1" }]), "a=1");
  });
  test("round-trips with parseQueryString", () => {
    const original = "a=1&b=hello+world&tag=x&tag=y";
    const rebuilt = buildQueryString(parseQueryString(original));
    assert.deepEqual(parseQueryString(rebuilt), parseQueryString(original));
  });
});
