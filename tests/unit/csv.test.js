import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, rowsToObjects, serializeCsv, objectsToRows } from "../../assets/js/core/csv.js";

describe("parseCsv", () => {
  test("parses a simple unquoted CSV", () => {
    assert.deepEqual(parseCsv("a,b,c\n1,2,3"), [
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });
  test("parses a quoted field containing a comma", () => {
    assert.deepEqual(parseCsv('name,note\n"Doe, Jane",hello'), [
      ["name", "note"],
      ["Doe, Jane", "hello"],
    ]);
  });
  test("parses an escaped quote inside a quoted field", () => {
    assert.deepEqual(parseCsv('quote\n"She said ""hi"""'), [["quote"], ['She said "hi"']]);
  });
  test("parses an embedded newline inside a quoted field", () => {
    assert.deepEqual(parseCsv('note\n"line one\nline two"'), [["note"], ["line one\nline two"]]);
  });
  test("handles CRLF line endings", () => {
    assert.deepEqual(parseCsv("a,b\r\n1,2\r\n"), [
      ["a", "b"],
      ["1", "2"],
    ]);
  });
  test("supports a custom delimiter", () => {
    assert.deepEqual(parseCsv("a;b\n1;2", { delimiter: ";" }), [
      ["a", "b"],
      ["1", "2"],
    ]);
  });
  test("empty input produces no rows", () => {
    assert.deepEqual(parseCsv(""), []);
  });
});

describe("rowsToObjects", () => {
  test("uses the first row as headers", () => {
    const rows = [
      ["name", "age"],
      ["Alice", "30"],
      ["Bob", "25"],
    ];
    assert.deepEqual(rowsToObjects(rows), [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    ]);
  });
  test("fills a missing trailing field with an empty string", () => {
    const rows = [["a", "b"], ["1"]];
    assert.deepEqual(rowsToObjects(rows), [{ a: "1", b: "" }]);
  });
  test("empty rows produces an empty array", () => {
    assert.deepEqual(rowsToObjects([]), []);
  });
});

describe("serializeCsv", () => {
  test("joins simple rows with commas and CRLF", () => {
    assert.equal(
      serializeCsv([
        ["a", "b"],
        ["1", "2"],
      ]),
      "a,b\r\n1,2"
    );
  });
  test("quotes a field containing the delimiter", () => {
    assert.equal(serializeCsv([["Doe, Jane"]]), '"Doe, Jane"');
  });
  test("quotes and escapes a field containing a quote character", () => {
    assert.equal(serializeCsv([['She said "hi"']]), '"She said ""hi"""');
  });
  test("quotes a field containing a newline", () => {
    assert.equal(serializeCsv([["line one\nline two"]]), '"line one\nline two"');
  });
  test("leaves a plain field unquoted", () => {
    assert.equal(serializeCsv([["plain"]]), "plain");
  });
});

describe("objectsToRows", () => {
  test("builds a header row from the union of all keys", () => {
    const objects = [{ a: 1, b: 2 }, { a: 3, c: 4 }];
    const rows = objectsToRows(objects);
    assert.deepEqual(rows[0], ["a", "b", "c"]);
  });
  test("fills missing keys with an empty string, not undefined", () => {
    const rows = objectsToRows([{ a: 1, b: 2 }, { a: 3 }]);
    assert.deepEqual(rows[2], ["3", ""]);
  });
});

describe("round-trip", () => {
  test("parseCsv -> rowsToObjects -> objectsToRows -> serializeCsv preserves data", () => {
    const original = 'name,note\n"Doe, Jane","said ""hi"""\nBob,plain';
    const objects = rowsToObjects(parseCsv(original));
    const rebuilt = serializeCsv(objectsToRows(objects));
    const reparsed = rowsToObjects(parseCsv(rebuilt));
    assert.deepEqual(reparsed, objects);
  });
});
