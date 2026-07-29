/** Secure dice rolling, with running statistics across a session's rolls. */
import { secureRandomInt } from "../../assets/js/core/random.js";

/**
 * @param {number} diceCount
 * @param {number} sides
 * @returns {{ ok: true, rolls: number[], total: number } | { ok: false, error: string }}
 */
export function rollDice(diceCount, sides) {
  if (!Number.isInteger(diceCount) || diceCount < 1 || diceCount > 100) {
    return { ok: false, error: "Number of dice must be a whole number from 1 to 100." };
  }
  if (!Number.isInteger(sides) || sides < 2) {
    return { ok: false, error: "Sides must be a whole number of at least 2." };
  }

  const rolls = Array.from({ length: diceCount }, () => secureRandomInt(1, sides));
  return { ok: true, rolls, total: rolls.reduce((sum, roll) => sum + roll, 0) };
}

/**
 * Running statistics across a session's worth of rolls (kept by the
 * caller, not this module — this is pure aggregation over whatever
 * history is passed in).
 * @param {number[]} allRolls - every individual die result rolled so far
 * @returns {{ count: number, min: number, max: number, average: number }}
 */
export function summarizeRolls(allRolls) {
  if (allRolls.length === 0) return { count: 0, min: 0, max: 0, average: 0 };
  const sum = allRolls.reduce((total, roll) => total + roll, 0);
  return {
    count: allRolls.length,
    min: Math.min(...allRolls),
    max: Math.max(...allRolls),
    average: sum / allRolls.length,
  };
}
