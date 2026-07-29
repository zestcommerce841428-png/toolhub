/**
 * Pure text-statistics logic for the Word Counter tool. No DOM access here
 * on purpose — this file is imported both by tool.js (browser) and by
 * tests/unit/word-counter.test.js (Node), so it has to work in both.
 */

const READING_WORDS_PER_MINUTE = 200;
const SPEAKING_WORDS_PER_MINUTE = 130;

/**
 * @param {string} text
 * @returns {{
 *   words: number,
 *   characters: number,
 *   charactersNoSpaces: number,
 *   sentences: number,
 *   paragraphs: number,
 *   readingTimeSeconds: number,
 *   speakingTimeSeconds: number,
 * }}
 */
export function computeTextStats(text) {
  const trimmed = text.trim();

  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  let sentences = 0;
  if (trimmed !== "") {
    const terminated = trimmed.match(/[^.!?]*[.!?]+/g);
    sentences = terminated ? terminated.filter((s) => s.trim() !== "").length : 0;
    if (sentences === 0) sentences = 1; // one incomplete sentence, e.g. "hello world"
  }

  const paragraphs = trimmed === "" ? 0 : trimmed.split(/\n\s*\n+/).filter((p) => p.trim() !== "").length;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeSeconds: Math.ceil((words / READING_WORDS_PER_MINUTE) * 60),
    speakingTimeSeconds: Math.ceil((words / SPEAKING_WORDS_PER_MINUTE) * 60),
  };
}

/** Formats a whole number of seconds as "45 sec" or "2 min 5 sec". */
export function formatDuration(totalSeconds) {
  if (totalSeconds <= 0) return "0 sec";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} sec`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}
