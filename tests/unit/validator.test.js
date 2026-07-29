import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  isEmpty,
  isValidJson,
  tryParseJson,
  isValidHexColor,
  isValidEmail,
  isValidUrl,
  isNumeric,
  isInRange,
} from "../../assets/js/core/validator.js";

test("isEmpty", () => {
  assert.equal(isEmpty(""), true);
  assert.equal(isEmpty("   "), true);
  assert.equal(isEmpty(null), true);
  assert.equal(isEmpty(undefined), true);
  assert.equal(isEmpty("x"), false);
  assert.equal(isEmpty(0), false);
});

test("isValidJson / tryParseJson", () => {
  assert.equal(isValidJson('{"a":1}'), true);
  assert.equal(isValidJson("not json"), false);
  assert.equal(isValidJson(""), false);

  assert.deepEqual(tryParseJson('{"a":1}'), { ok: true, value: { a: 1 } });
  assert.equal(tryParseJson("{bad").ok, false);
});

test("isValidHexColor", () => {
  assert.equal(isValidHexColor("#2563eb"), true);
  assert.equal(isValidHexColor("2563eb"), true);
  assert.equal(isValidHexColor("#f0c"), true);
  assert.equal(isValidHexColor("not-a-color"), false);
});

test("isValidEmail", () => {
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("isValidUrl", () => {
  assert.equal(isValidUrl("https://example.com"), true);
  assert.equal(isValidUrl("not a url"), false);
  assert.equal(isValidUrl(""), false);
});

test("isNumeric", () => {
  assert.equal(isNumeric(42), true);
  assert.equal(isNumeric("42"), true);
  assert.equal(isNumeric("42.5"), true);
  assert.equal(isNumeric("abc"), false);
  assert.equal(isNumeric(""), false);
  assert.equal(isNumeric(NaN), false);
});

test("isInRange", () => {
  assert.equal(isInRange(5, 0, 10), true);
  assert.equal(isInRange(0, 0, 10), true);
  assert.equal(isInRange(10, 0, 10), true);
  assert.equal(isInRange(-1, 0, 10), false);
  assert.equal(isInRange("abc", 0, 10), false);
});
