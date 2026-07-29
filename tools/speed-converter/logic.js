/** Pure speed conversion, same shape as tools/length-converter/logic.js — every unit defined by its exact factor in meters per second. */

export const SPEED_UNITS = [
  { id: "mps", label: "Meters per second", mpsPerUnit: 1 },
  { id: "kph", label: "Kilometers per hour", mpsPerUnit: 1000 / 3600 },
  { id: "mph", label: "Miles per hour", mpsPerUnit: 0.44704 },
  { id: "knot", label: "Knots", mpsPerUnit: 0.514444444 },
  { id: "fps", label: "Feet per second", mpsPerUnit: 0.3048 },
];

const unitById = new Map(SPEED_UNITS.map((unit) => [unit.id, unit]));

/** @param {number} value @param {string} fromUnitId @param {string} toUnitId @returns {number} */
export function convertSpeed(value, fromUnitId, toUnitId) {
  const from = unitById.get(fromUnitId);
  const to = unitById.get(toUnitId);
  if (!from || !to) throw new Error(`Unknown speed unit: ${!from ? fromUnitId : toUnitId}`);
  if (!Number.isFinite(value)) return NaN;
  return (value * from.mpsPerUnit) / to.mpsPerUnit;
}

/** @param {number} value @param {string} fromUnitId @returns {Array<{id:string,label:string,value:number}>} */
export function convertToAllUnits(value, fromUnitId) {
  return SPEED_UNITS.map((unit) => ({
    id: unit.id,
    label: unit.label,
    value: convertSpeed(value, fromUnitId, unit.id),
  }));
}

export function formatSpeed(value) {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  const decimals = magnitude === 0 ? 2 : magnitude < 1 ? 4 : magnitude < 1000 ? 2 : 0;
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
