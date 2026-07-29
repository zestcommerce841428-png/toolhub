/**
 * Generic, reusable validation predicates. These check *shape*, not
 * business rules — a tool's own logic decides what to do with an invalid
 * value (show a field-error, disable a button, etc.).
 */

export function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

export function isValidJson(text) {
  if (typeof text !== "string" || text.trim() === "") return false;
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

/** Parses JSON, returning { ok, value } or { ok, error } instead of throwing. */
export function tryParseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

const HEX_COLOR_RE = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
export function isValidHexColor(value) {
  return typeof value === "string" && HEX_COLOR_RE.test(value.trim());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(value) {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

export function isValidUrl(value) {
  if (typeof value !== "string" || value.trim() === "") return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isNumeric(value) {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string" || value.trim() === "") return false;
  return Number.isFinite(Number(value));
}

/** Checks a numeric value falls within [min, max], inclusive on both ends unless overridden. */
export function isInRange(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return false;
  return number >= min && number <= max;
}
