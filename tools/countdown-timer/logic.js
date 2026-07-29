/**
 * Countdown math. Takes an explicit `nowMs` parameter rather than
 * defaulting to Date.now() internally, so the function stays pure and
 * deterministic for testing — tool.js supplies the live clock.
 */

/**
 * @param {string} targetIso - a datetime-local input value ("YYYY-MM-DDTHH:MM"), interpreted as local time
 * @param {number} nowMs - Date.now()-style epoch milliseconds
 * @returns {{ ok: true, isPast: boolean, days: number, hours: number, minutes: number, seconds: number, totalMs: number } | { ok: false, error: string }}
 */
export function computeRemaining(targetIso, nowMs) {
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) return { ok: false, error: "Enter a valid date and time." };

  const diffMs = targetMs - nowMs;
  const isPast = diffMs <= 0;
  const absMs = Math.abs(diffMs);

  const days = Math.floor(absMs / 86_400_000);
  const hours = Math.floor((absMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((absMs % 3_600_000) / 60_000);
  const seconds = Math.floor((absMs % 60_000) / 1000);

  return { ok: true, isPast, days, hours, minutes, seconds, totalMs: absMs };
}

/** Zero-pads to 2 digits for a clock-style display (e.g. "05" not "5"). */
export function pad2(value) {
  return String(value).padStart(2, "0");
}
