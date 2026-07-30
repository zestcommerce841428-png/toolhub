/** Removes duplicate lines from text, with an option to ignore case and to keep the first vs. last occurrence. */

/**
 * @param {string} text
 * @param {{ caseSensitive?: boolean, keepLast?: boolean, trimLines?: boolean }} [options]
 * @returns {{ result: string, removedCount: number }}
 */
export function removeDuplicateLines(text, options = {}) {
  const caseSensitive = options.caseSensitive ?? true;
  const keepLast = options.keepLast ?? false;
  const trimLines = options.trimLines ?? false;

  const lines = text.split("\n");
  const normalize = (line) => {
    const trimmed = trimLines ? line.trim() : line;
    return caseSensitive ? trimmed : trimmed.toLowerCase();
  };

  const seen = new Map(); // normalized line -> index to keep
  const workingLines = keepLast ? [...lines].reverse() : lines;

  workingLines.forEach((line, index) => {
    const key = normalize(line);
    if (!seen.has(key)) seen.set(key, index);
  });

  const keepIndices = new Set(seen.values());
  const kept = workingLines.filter((_, index) => keepIndices.has(index));
  const result = (keepLast ? kept.reverse() : kept).join("\n");

  return { result, removedCount: lines.length - kept.length };
}
