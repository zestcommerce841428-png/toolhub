import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  toToggleCase,
  toCapitalizedWords,
  CASE_MODES,
} from "../../tools/case-converter/logic.js";

test("toUpperCase / toLowerCase", () => {
  assert.equal(toUpperCase("Hello World"), "HELLO WORLD");
  assert.equal(toLowerCase("Hello World"), "hello world");
});

test("toTitleCase lowercases first, then capitalizes each word", () => {
  assert.equal(toTitleCase("hELLO wORLD"), "Hello World");
  assert.equal(toTitleCase("the QUICK brown Fox"), "The Quick Brown Fox");
});

test("toCapitalizedWords only uppercases first letters, leaves the rest of each word untouched", () => {
  // Mixed mid-word casing that Title Case would flatten to lowercase first —
  // Capitalize Words must NOT flatten it, only touch each word's first letter.
  assert.equal(toCapitalizedWords("heLLo woRLd"), "HeLLo WoRLd");
});

test("toSentenceCase capitalizes first letter of each sentence", () => {
  assert.equal(toSentenceCase("hello world. how are you? fine!"), "Hello world. How are you? Fine!");
});

test("toToggleCase swaps every character's case", () => {
  assert.equal(toToggleCase("Hello World"), "hELLO wORLD");
});

describe("CASE_MODES", () => {
  test("every mode has a unique id and a working transform", () => {
    const ids = CASE_MODES.map((mode) => mode.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const mode of CASE_MODES) {
      assert.equal(typeof mode.transform("abc"), "string");
    }
  });
});
