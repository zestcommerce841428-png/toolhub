import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeTextStats, formatDuration } from "../../tools/word-counter/logic.js";

describe("computeTextStats", () => {
  test("empty text", () => {
    const stats = computeTextStats("");
    assert.deepEqual(stats, {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeSeconds: 0,
      speakingTimeSeconds: 0,
    });
  });

  test("counts words, characters, sentences, paragraphs", () => {
    const text = "Hello world. This is ToolHub!\n\nA new paragraph here.";
    const stats = computeTextStats(text);
    assert.equal(stats.words, 9);
    assert.equal(stats.sentences, 3);
    assert.equal(stats.paragraphs, 2);
    assert.equal(stats.characters, text.length);
  });

  test("text with no terminal punctuation still counts as one sentence", () => {
    const stats = computeTextStats("just a phrase with no period");
    assert.equal(stats.sentences, 1);
  });

  test("charactersNoSpaces excludes whitespace only", () => {
    const stats = computeTextStats("a b\tc\nd");
    assert.equal(stats.charactersNoSpaces, 4);
  });

  test("reading/speaking time scale with word count", () => {
    const words = Array.from({ length: 200 }, () => "word").join(" ");
    const stats = computeTextStats(words);
    assert.equal(stats.words, 200);
    assert.equal(stats.readingTimeSeconds, 60); // 200 words at 200wpm = 1 minute
  });
});

describe("formatDuration", () => {
  test("zero or negative", () => {
    assert.equal(formatDuration(0), "0 sec");
    assert.equal(formatDuration(-5), "0 sec");
  });
  test("seconds only", () => {
    assert.equal(formatDuration(45), "45 sec");
  });
  test("whole minutes", () => {
    assert.equal(formatDuration(120), "2 min");
  });
  test("minutes and seconds", () => {
    assert.equal(formatDuration(125), "2 min 5 sec");
  });
});
