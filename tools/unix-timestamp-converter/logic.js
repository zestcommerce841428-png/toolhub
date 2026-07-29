/** Converts between Unix timestamps and human-readable dates, in both directions. */

/**
 * @param {number} value
 * @param {"seconds"|"milliseconds"} unit
 * @returns {{ ok: true, iso: string, utc: string, local: string, unixSeconds: number, unixMilliseconds: number } | { ok: false, error: string }}
 */
export function timestampToDate(value, unit) {
  if (!Number.isFinite(value)) return { ok: false, error: "Enter a numeric timestamp." };
  const ms = unit === "seconds" ? value * 1000 : value;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "That timestamp is out of range." };

  return {
    ok: true,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: formatLocal(date),
    unixSeconds: Math.floor(ms / 1000),
    unixMilliseconds: Math.round(ms),
  };
}

/**
 * @param {string} datetimeLocalValue - a datetime-local input value ("YYYY-MM-DDTHH:MM[:SS]"), interpreted as local time
 * @returns {{ ok: true, unixSeconds: number, unixMilliseconds: number } | { ok: false, error: string }}
 */
export function dateToTimestamp(datetimeLocalValue) {
  const date = new Date(datetimeLocalValue);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Enter a valid date and time." };
  return { ok: true, unixSeconds: Math.floor(date.getTime() / 1000), unixMilliseconds: date.getTime() };
}

/** "YYYY-MM-DD HH:MM:SS" in the browser's local timezone (not UTC). */
function formatLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
