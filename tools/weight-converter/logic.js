/**
 * Pure weight/mass conversion, same shape as tools/length-converter/logic.js:
 * every unit is defined by its exact factor in kilograms, so A -> B always
 * goes through kilograms internally.
 */

export const WEIGHT_UNITS = [
  { id: "mg", label: "Milligrams", kgPerUnit: 0.000001 },
  { id: "g", label: "Grams", kgPerUnit: 0.001 },
  { id: "kg", label: "Kilograms", kgPerUnit: 1 },
  { id: "t", label: "Metric tons", kgPerUnit: 1000 },
  { id: "oz", label: "Ounces", kgPerUnit: 0.028349523125 },
  { id: "lb", label: "Pounds", kgPerUnit: 0.45359237 },
  { id: "st", label: "Stone", kgPerUnit: 6.35029318 },
  { id: "ust", label: "US tons (short)", kgPerUnit: 907.18474 },
];

const unitById = new Map(WEIGHT_UNITS.map((unit) => [unit.id, unit]));

/** @param {number} value @param {string} fromUnitId @param {string} toUnitId @returns {number} */
export function convertWeight(value, fromUnitId, toUnitId) {
  const from = unitById.get(fromUnitId);
  const to = unitById.get(toUnitId);
  if (!from || !to) throw new Error(`Unknown weight unit: ${!from ? fromUnitId : toUnitId}`);
  if (!Number.isFinite(value)) return NaN;
  return (value * from.kgPerUnit) / to.kgPerUnit;
}

/** @param {number} value @param {string} fromUnitId @returns {Array<{id:string,label:string,value:number}>} */
export function convertToAllUnits(value, fromUnitId) {
  return WEIGHT_UNITS.map((unit) => ({
    id: unit.id,
    label: unit.label,
    value: convertWeight(value, fromUnitId, unit.id),
  }));
}

export function formatWeight(value) {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  const decimals = magnitude === 0 ? 2 : magnitude < 0.01 ? 6 : magnitude < 1 ? 4 : magnitude < 1000 ? 2 : 0;
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
