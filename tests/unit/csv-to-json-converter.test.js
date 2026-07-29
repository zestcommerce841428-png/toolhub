import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { convertCsvToJson } from "../../tools/csv-to-json-converter/logic.js";

describe("convertCsvToJson", () => {
  test("converts CSV with a header row into an array of objects", () => {
    const result = convertCsvToJson("name,age\nAlice,30\nBob,25");
    assert.equal(result.ok, true);
    assert.deepEqual(JSON.parse(result.json), [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    ]);
  });
  test("without a header, returns an array of arrays", () => {
    const result = convertCsvToJson("Alice,30\nBob,25", { hasHeader: false });
    assert.deepEqual(JSON.parse(result.json), [
      ["Alice", "30"],
      ["Bob", "25"],
    ]);
  });
  test("handles quoted fields with embedded commas", () => {
    const result = convertCsvToJson('name,note\n"Doe, Jane",hello');
    assert.deepEqual(JSON.parse(result.json), [{ name: "Doe, Jane", note: "hello" }]);
  });
  test("rejects empty input", () => {
    assert.equal(convertCsvToJson("").ok, false);
    assert.equal(convertCsvToJson("   ").ok, false);
  });
  test("respects a custom delimiter", () => {
    const result = convertCsvToJson("name;age\nAlice;30", { delimiter: ";" });
    assert.deepEqual(JSON.parse(result.json), [{ name: "Alice", age: "30" }]);
  });
  test("output is indented (readable), not minified", () => {
    const result = convertCsvToJson("a\n1");
    assert.ok(result.json.includes("\n"));
  });
});
