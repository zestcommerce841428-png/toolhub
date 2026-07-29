/**
 * Pure text-case transforms. Each function is intentionally a single,
 * narrow responsibility so it can also back a future single-purpose page
 * (e.g. an "Uppercase Converter" tool) without duplicating the logic —
 * see docs/CONTRIBUTING.md, "sharing logic.js across a tool family".
 */

export function toUpperCase(text) {
  return text.toUpperCase();
}

export function toLowerCase(text) {
  return text.toLowerCase();
}

/** Lowercases everything, then capitalizes the first letter of each word. */
export function toTitleCase(text) {
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Capitalizes the first letter of every sentence; leaves the rest of each sentence untouched apart from lowercasing everything first. */
export function toSentenceCase(text) {
  const lowered = text.toLowerCase();
  return lowered.replace(/(^\s*\w)|([.!?]\s+\w)/g, (match) => match.toUpperCase());
}

/** Swaps the case of every letter. */
export function toToggleCase(text) {
  return [...text].map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())).join("");
}

/** Uppercases the first letter of every word, leaving the remainder of each word as typed. */
export function toCapitalizedWords(text) {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const CASE_MODES = [
  { id: "uppercase", label: "UPPERCASE", transform: toUpperCase },
  { id: "lowercase", label: "lowercase", transform: toLowerCase },
  { id: "title", label: "Title Case", transform: toTitleCase },
  { id: "sentence", label: "Sentence case", transform: toSentenceCase },
  { id: "toggle", label: "tOGGLE cASE", transform: toToggleCase },
  { id: "capitalize", label: "Capitalize Words", transform: toCapitalizedWords },
];
