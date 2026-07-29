/** Business-day math: skips Saturdays/Sundays and an optional list of holiday dates. */

function parseDateOnly(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnlyString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** @param {Date} date @returns {boolean} */
export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Adds (or subtracts, for a negative count) business days to a start
 * date, skipping weekends and any date in `holidays`.
 * @param {string} startDateStr - "YYYY-MM-DD"
 * @param {number} count - positive to move forward, negative to move backward
 * @param {string[]} [holidays] - "YYYY-MM-DD" strings
 * @returns {{ ok: true, date: string } | { ok: false, error: string }}
 */
export function addBusinessDays(startDateStr, count, holidays = []) {
  const start = parseDateOnly(startDateStr);
  if (!start) return { ok: false, error: "Enter a valid start date." };
  if (!Number.isInteger(count)) return { ok: false, error: "Enter a whole number of business days." };

  const holidaySet = new Set(holidays);
  const direction = count >= 0 ? 1 : -1;
  let remaining = Math.abs(count);
  let current = new Date(start);

  while (remaining > 0) {
    current = new Date(current.getTime() + direction * 86_400_000);
    if (!isWeekend(current) && !holidaySet.has(toDateOnlyString(current))) {
      remaining--;
    }
  }

  return { ok: true, date: toDateOnlyString(current) };
}

/**
 * Counts business days strictly between two dates (inclusive of both
 * endpoints if they're themselves business days).
 * @param {string} startDateStr
 * @param {string} endDateStr
 * @param {string[]} [holidays]
 * @returns {{ ok: true, businessDays: number, totalDays: number } | { ok: false, error: string }}
 */
export function countBusinessDaysBetween(startDateStr, endDateStr, holidays = []) {
  const start = parseDateOnly(startDateStr);
  const end = parseDateOnly(endDateStr);
  if (!start) return { ok: false, error: "Enter a valid start date." };
  if (!end) return { ok: false, error: "Enter a valid end date." };

  const [earlier, later] = start <= end ? [start, end] : [end, start];
  const holidaySet = new Set(holidays);

  let businessDays = 0;
  let current = new Date(earlier);
  while (current <= later) {
    if (!isWeekend(current) && !holidaySet.has(toDateOnlyString(current))) businessDays++;
    current = new Date(current.getTime() + 86_400_000);
  }

  const totalDays = Math.round((later.getTime() - earlier.getTime()) / 86_400_000) + 1;
  return { ok: true, businessDays, totalDays };
}
