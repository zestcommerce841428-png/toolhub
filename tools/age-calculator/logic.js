/**
 * Calendar-aware age calculation. Takes plain "YYYY-MM-DD" date strings
 * (what <input type="date"> produces) rather than Date objects or a
 * default of "today," so the function stays pure and deterministic for
 * testing — the caller (tool.js) is responsible for supplying today's
 * date when that's what's wanted.
 */

function parseDateOnly(dateStr) {
  // Appending a local-midnight time avoids the classic bug where parsing
  // "YYYY-MM-DD" alone is treated as UTC midnight, which then prints as
  // the *previous* day in any timezone behind UTC.
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a Date's *local* year/month/day as "YYYY-MM-DD" — deliberately
 * not `.toISOString().slice(0, 10)`, which converts to UTC first and so
 * silently shifts the date backward by one day for any local-midnight
 * Date in a timezone ahead of UTC (caught by this file's own tests).
 */
function toDateOnlyString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * @param {string} birthDateStr - "YYYY-MM-DD"
 * @param {string} asOfDateStr - "YYYY-MM-DD"
 * @returns {{ ok: true, years: number, months: number, days: number, totalDays: number, nextBirthday: { daysUntil: number, date: string } } | { ok: false, error: string }}
 */
export function calculateAge(birthDateStr, asOfDateStr) {
  const birthDate = parseDateOnly(birthDateStr);
  const asOfDate = parseDateOnly(asOfDateStr);

  if (!birthDate) return { ok: false, error: "Enter a valid birth date." };
  if (!asOfDate) return { ok: false, error: "Enter a valid \"as of\" date." };
  if (birthDate > asOfDate) return { ok: false, error: "Birth date can't be after the \"as of\" date." };

  let years = asOfDate.getFullYear() - birthDate.getFullYear();
  let months = asOfDate.getMonth() - birthDate.getMonth();
  let days = asOfDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPreviousMonth = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 0).getDate();
    days += daysInPreviousMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.round((asOfDate.getTime() - birthDate.getTime()) / 86_400_000);

  let nextBirthdayDate = new Date(asOfDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthdayDate < asOfDate) {
    nextBirthdayDate = new Date(asOfDate.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  }
  const daysUntilBirthday = Math.round((nextBirthdayDate.getTime() - asOfDate.getTime()) / 86_400_000);

  return {
    ok: true,
    years,
    months,
    days,
    totalDays,
    nextBirthday: {
      daysUntil: daysUntilBirthday,
      date: toDateOnlyString(nextBirthdayDate),
    },
  };
}
