import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { convertJsonToCsv } from "../../tools/json-to-csv-converter/logic.js";

describe("convertJsonToCsv", () => {
  test("converts an array of flat objects into CSV", () => {
    const result = convertJsonToCsv(JSON.stringify([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]));
    assert.equal(result.ok, true);
    assert.equal(result.csv, "name,age\r\nAlice,30\r\nBob,25");
  });
  test("builds the header from the union of keys across all objects", () => {
    const result = convertJsonToCsv(JSON.stringify([{ a: 1 }, { a: 2, b: 3 }]));
    assert.equal(result.ok, true);
    assert.match(result.csv, /^a,b/);
  });
  test("quotes a value containing a comma", () => {
    const result = convertJsonToCsv(JSON.stringify([{ note: "Doe, Jane" }]));
    assert.match(result.csv, /"Doe, Jane"/);
  });
  test("rejects invalid JSON with a helpful error", () => {
    const result = convertJsonToCsv("{not valid json");
    assert.equal(result.ok, false);
    assert.match(result.error, /Invalid JSON/);
  });
  test("rejects a JSON value that isn't an array", () => {
    const result = convertJsonToCsv(JSON.stringify({ a: 1 }));
    assert.equal(result.ok, false);
    assert.match(result.error, /array of objects/);
  });
  test("rejects an empty array", () => {
    const result = convertJsonToCsv("[]");
    assert.equal(result.ok, false);
  });
  test("rejects an array containing non-object entries", () => {
    const result = convertJsonToCsv(JSON.stringify([1, 2, 3]));
    assert.equal(result.ok, false);
    assert.match(result.error, /flat object/);
  });
  test("round-trips through csv-to-json-converter's parser", async () => {
    const { convertCsvToJson } = await import("../../tools/csv-to-json-converter/logic.js");
    const original = [{ name: "Alice", city: "Boston" }, { name: "Bob", city: "Denver" }];
    const csvResult = convertJsonToCsv(JSON.stringify(original));
    const jsonResult = convertCsvToJson(csvResult.csv);
    assert.deepEqual(JSON.parse(jsonResult.json), original.map((o) => ({ name: o.name, city: o.city })));
  });
});
