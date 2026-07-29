import { secureRandomInt } from "../../assets/js/core/random.js";

/**
 * @param {{ min: number, max: number, count: number, allowDuplicates: boolean }} options
 * @returns {{ ok: true, values: number[] } | { ok: false, error: string }}
 */
export function generateRandomInts({ min, max, count, allowDuplicates }) {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return { ok: false, error: "Min and max must be whole numbers." };
  }
  if (min > max) {
    return { ok: false, error: "Min must be less than or equal to max." };
  }
  if (!Number.isInteger(count) || count < 1) {
    return { ok: false, error: "Enter how many numbers to generate (at least 1)." };
  }

  const rangeSize = max - min + 1;
  if (!allowDuplicates && count > rangeSize) {
    return {
      ok: false,
      error: `Can't generate ${count} unique numbers from a range of only ${rangeSize} — increase the range, reduce the count, or allow duplicates.`,
    };
  }

  if (!allowDuplicates) {
    // Reservoir-free approach: draw from a shrinking pool of remaining
    // candidates so every draw is still uniform and never repeats.
    const remaining = Array.from({ length: rangeSize }, (_, i) => min + i);
    const values = [];
    for (let i = 0; i < count; i++) {
      const index = secureRandomInt(0, remaining.length - 1);
      values.push(remaining[index]);
      remaining.splice(index, 1);
    }
    return { ok: true, values };
  }

  const values = Array.from({ length: count }, () => secureRandomInt(min, max));
  return { ok: true, values };
}
