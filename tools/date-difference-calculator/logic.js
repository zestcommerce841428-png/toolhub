/**
 * Calendar-aware difference between any two dates — the same
 * years/months/days breakdown approach as tools/age-calculator/logic.js,
 * generalized to work regardless of which date is earlier (age-calculator
 * always measures from a fixed birth date to "today or later").
 */

function parseDateOnly(dateStr) {
  // Appending a local-midnight time avoids the classic bug where parsing
  // "YYYY-MM-DD" alone is treated as UTC midnight, which then prints as
  // the *previous* day in any timezone behind UTC.
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * @param {string} dateAStr - "YYYY-MM-DD"
 * @param {string} dateBStr - "YYYY-MM-DD"
 * @returns {{ ok: true, years: number, months: number, days: number, totalDays: number, totalWeeks: number, earlier: string, later: string, isSameDay: boolean }
 *         | { ok: false, error: string }}
 */
export function calculateDateDifference(dateAStr, dateBStr) {
  const dateA = parseDateOnly(dateAStr);
  const dateB = parseDateOnly(dateBStr);

  if (!dateA) return { ok: false, error: "Enter a valid first date." };
  if (!dateB) return { ok: false, error: "Enter a valid second date." };

  const [earlier, later] = dateA <= dateB ? [dateA, dateB] : [dateB, dateA];

  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPreviousMonth = new Date(later.getFullYear(), later.getMonth(), 0).getDate();
    days += daysInPreviousMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.round((later.getTime() - earlier.getTime()) / 86_400_000);

  return {
    ok: true,
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    earlier: dateA <= dateB ? dateAStr : dateBStr,
    later: dateA <= dateB ? dateBStr : dateAStr,
    isSameDay: totalDays === 0,
  };
}
