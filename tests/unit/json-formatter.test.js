import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { formatJson, minifyJson, locateJsonError } from "../../tools/json-formatter/logic.js";

describe("formatJson", () => {
  test("formats valid JSON with the requested indent", () => {
    const result = formatJson('{"b":2,"a":1}', 2);
    assert.equal(result.ok, true);
    assert.equal(result.value, '{\n  "b": 2,\n  "a": 1\n}');
  });

  test("reports an error with location for invalid JSON", () => {
    const result = formatJson('{"a": 1,}');
    assert.equal(result.ok, false);
    assert.equal(typeof result.message, "string");
  });
});

describe("minifyJson", () => {
  test("strips whitespace from valid JSON", () => {
    const result = minifyJson('{\n  "a": 1,\n  "b": [1, 2, 3]\n}');
    assert.equal(result.ok, true);
    assert.equal(result.value, '{"a":1,"b":[1,2,3]}');
  });

  test("fails on invalid JSON", () => {
    const result = minifyJson("{not valid}");
    assert.equal(result.ok, false);
  });
});

describe("locateJsonError", () => {
  test("computes line/column from a position-bearing message", () => {
    const text = '{\n  "a": 1,\n  "b": ,\n}';
    const location = locateJsonError(text, "Unexpected token , in JSON at position 18");
    assert.ok(location);
    assert.equal(location.position, 18);
    assert.equal(location.line, 3);
  });

  test("returns null when the message has no position", () => {
    assert.equal(locateJsonError("{}", "Some other error"), null);
  });
});
