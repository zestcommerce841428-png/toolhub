/**
 * Pure JSON formatting/validation logic. Deliberately thin — JSON.parse and
 * JSON.stringify already do the real work correctly and fast; this module's
 * job is turning their errors into something a human can act on.
 */

/**
 * Converts a raw JSON.parse SyntaxError message into a { line, column }
 * location when the message contains a character position (as V8 does,
 * e.g. "Unexpected token } in JSON at position 42"). Returns null when no
 * position can be determined (some engines phrase errors differently).
 * @param {string} text - the original source that failed to parse
 * @param {string} message - error.message from the caught SyntaxError
 */
export function locateJsonError(text, message) {
  const match = message.match(/position (\d+)/);
  if (!match) return null;

  const position = Number(match[1]);
  const before = text.slice(0, position);
  const line = before.split("\n").length;
  const column = position - before.lastIndexOf("\n");
  return { line, column, position };
}

/**
 * Parses and re-serializes JSON with indentation.
 * @param {string} text
 * @param {number} [indent]
 * @returns {{ ok: true, value: string } | { ok: false, message: string, location: {line:number,column:number}|null }}
 */
export function formatJson(text, indent = 2) {
  try {
    const parsed = JSON.parse(text);
    return { ok: true, value: JSON.stringify(parsed, null, indent) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return { ok: false, message, location: locateJsonError(text, message) };
  }
}

/**
 * Parses and re-serializes JSON with no whitespace.
 * @param {string} text
 * @returns {{ ok: true, value: string } | { ok: false, message: string, location: {line:number,column:number}|null }}
 */
export function minifyJson(text) {
  try {
    const parsed = JSON.parse(text);
    return { ok: true, value: JSON.stringify(parsed) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return { ok: false, message, location: locateJsonError(text, message) };
  }
}
