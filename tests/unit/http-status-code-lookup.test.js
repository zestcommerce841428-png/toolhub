import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { STATUS_CODES, CATEGORIES, searchStatusCodes } from "../../tools/http-status-code-lookup/logic.js";

describe("STATUS_CODES data integrity", () => {
  test("every entry has a code, name, category, and description", () => {
    for (const entry of STATUS_CODES) {
      assert.ok(Number.isInteger(entry.code) && entry.code >= 100 && entry.code <= 599, `bad code: ${entry.code}`);
      assert.ok(entry.name.length > 0);
      assert.ok(CATEGORIES.includes(entry.category), `unknown category for ${entry.code}: ${entry.category}`);
      assert.ok(entry.description.length > 10, `description too short for ${entry.code}`);
    }
  });
  test("no duplicate codes", () => {
    const codes = STATUS_CODES.map((entry) => entry.code);
    assert.equal(new Set(codes).size, codes.length);
  });
  test("category matches the code's leading digit", () => {
    const categoryByDigit = { 1: "Informational", 2: "Success", 3: "Redirection", 4: "Client Error", 5: "Server Error" };
    for (const entry of STATUS_CODES) {
      const digit = Math.floor(entry.code / 100);
      assert.equal(entry.category, categoryByDigit[digit], `${entry.code} miscategorized`);
    }
  });
  test("includes well-known codes with correct names", () => {
    const byCode = Object.fromEntries(STATUS_CODES.map((e) => [e.code, e.name]));
    assert.equal(byCode[200], "OK");
    assert.equal(byCode[301], "Moved Permanently");
    assert.equal(byCode[404], "Not Found");
    assert.equal(byCode[429], "Too Many Requests");
    assert.equal(byCode[500], "Internal Server Error");
    assert.equal(byCode[503], "Service Unavailable");
  });
});

describe("searchStatusCodes", () => {
  test("empty query returns everything", () => {
    assert.equal(searchStatusCodes("").length, STATUS_CODES.length);
  });
  test("matches by code prefix", () => {
    const results = searchStatusCodes("40");
    assert.ok(results.every((entry) => String(entry.code).startsWith("40")));
    assert.ok(results.some((entry) => entry.code === 400));
    assert.ok(results.some((entry) => entry.code === 404));
  });
  test("matches by name substring, case-insensitively", () => {
    const results = searchStatusCodes("not found");
    assert.ok(results.some((entry) => entry.code === 404));
  });
  test("filters by category", () => {
    const results = searchStatusCodes("", "Server Error");
    assert.ok(results.every((entry) => entry.category === "Server Error"));
    assert.ok(results.length > 0);
  });
  test("combines query and category", () => {
    const results = searchStatusCodes("4", "Redirection");
    assert.equal(results.length, 0); // no 4xx codes are Redirection
  });
});
