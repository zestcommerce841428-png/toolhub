/** Pure volume conversion, same shape as tools/length-converter/logic.js — every unit defined by its exact factor in liters. */

export const VOLUME_UNITS = [
  { id: "ml", label: "Milliliters", litersPerUnit: 0.001 },
  { id: "l", label: "Liters", litersPerUnit: 1 },
  { id: "m3", label: "Cubic meters", litersPerUnit: 1000 },
  { id: "tsp", label: "Teaspoons (US)", litersPerUnit: 0.00492892159375 },
  { id: "tbsp", label: "Tablespoons (US)", litersPerUnit: 0.01478676478125 },
  { id: "flOzUs", label: "Fluid ounces (US)", litersPerUnit: 0.0295735295625 },
  { id: "cupUs", label: "Cups (US)", litersPerUnit: 0.2365882365 },
  { id: "pintUs", label: "Pints (US)", litersPerUnit: 0.473176473 },
  { id: "quartUs", label: "Quarts (US)", litersPerUnit: 0.946352946 },
  { id: "galUs", label: "Gallons (US)", litersPerUnit: 3.785411784 },
  { id: "galImp", label: "Gallons (imperial)", litersPerUnit: 4.54609 },
  { id: "ft3", label: "Cubic feet", litersPerUnit: 28.316846592 },
];

const unitById = new Map(VOLUME_UNITS.map((unit) => [unit.id, unit]));

/** @param {number} value @param {string} fromUnitId @param {string} toUnitId @returns {number} */
export function convertVolume(value, fromUnitId, toUnitId) {
  const from = unitById.get(fromUnitId);
  const to = unitById.get(toUnitId);
  if (!from || !to) throw new Error(`Unknown volume unit: ${!from ? fromUnitId : toUnitId}`);
  if (!Number.isFinite(value)) return NaN;
  return (value * from.litersPerUnit) / to.litersPerUnit;
}

/** @param {number} value @param {string} fromUnitId @returns {Array<{id:string,label:string,value:number}>} */
export function convertToAllUnits(value, fromUnitId) {
  return VOLUME_UNITS.map((unit) => ({
    id: unit.id,
    label: unit.label,
    value: convertVolume(value, fromUnitId, unit.id),
  }));
}

export function formatVolume(value) {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  const decimals = magnitude === 0 ? 2 : magnitude < 0.01 ? 6 : magnitude < 1 ? 4 : magnitude < 1000 ? 2 : 0;
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
