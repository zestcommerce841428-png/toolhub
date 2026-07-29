/** Random selection from a list — either a shuffled draw of N unique items, or grouping the whole list into N random teams. */
import { secureShuffle } from "../../assets/js/core/random.js";

/** @param {string} rawText @returns {string[]} non-empty, trimmed lines */
export function parseItems(rawText) {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Picks `count` unique items at random, in random order (a "draw winners" operation — each item can only be picked once).
 * @param {string[]} items
 * @param {number} count
 * @returns {{ ok: true, picked: string[] } | { ok: false, error: string }}
 */
export function pickRandom(items, count) {
  if (items.length === 0) return { ok: false, error: "Add at least one item." };
  if (!Number.isInteger(count) || count < 1) return { ok: false, error: "Enter a positive whole number to pick." };
  if (count > items.length) return { ok: false, error: `Can't pick ${count} unique items from a list of ${items.length}.` };

  return { ok: true, picked: secureShuffle(items).slice(0, count) };
}

/**
 * Splits the whole list into `teamCount` random groups, as evenly sized as possible.
 * @param {string[]} items
 * @param {number} teamCount
 * @returns {{ ok: true, teams: string[][] } | { ok: false, error: string }}
 */
export function splitIntoTeams(items, teamCount) {
  if (items.length === 0) return { ok: false, error: "Add at least one item." };
  if (!Number.isInteger(teamCount) || teamCount < 1) return { ok: false, error: "Enter a positive whole number of teams." };
  if (teamCount > items.length) return { ok: false, error: `Can't split ${items.length} items into ${teamCount} non-empty teams.` };

  const shuffled = secureShuffle(items);
  const teams = Array.from({ length: teamCount }, () => []);
  shuffled.forEach((item, index) => {
    teams[index % teamCount].push(item);
  });
  return { ok: true, teams };
}
