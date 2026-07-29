/** Pure area conversion, same shape as tools/length-converter/logic.js — every unit defined by its exact factor in square meters. */

export const AREA_UNITS = [
  { id: "mm2", label: "Square millimeters", m2PerUnit: 0.000001 },
  { id: "cm2", label: "Square centimeters", m2PerUnit: 0.0001 },
  { id: "m2", label: "Square meters", m2PerUnit: 1 },
  { id: "ha", label: "Hectares", m2PerUnit: 10000 },
  { id: "km2", label: "Square kilometers", m2PerUnit: 1000000 },
  { id: "in2", label: "Square inches", m2PerUnit: 0.00064516 },
  { id: "ft2", label: "Square feet", m2PerUnit: 0.09290304 },
  { id: "yd2", label: "Square yards", m2PerUnit: 0.83612736 },
  { id: "acre", label: "Acres", m2PerUnit: 4046.8564224 },
  { id: "mi2", label: "Square miles", m2PerUnit: 2589988.110336 },
];

const unitById = new Map(AREA_UNITS.map((unit) => [unit.id, unit]));

/** @param {number} value @param {string} fromUnitId @param {string} toUnitId @returns {number} */
export function convertArea(value, fromUnitId, toUnitId) {
  const from = unitById.get(fromUnitId);
  const to = unitById.get(toUnitId);
  if (!from || !to) throw new Error(`Unknown area unit: ${!from ? fromUnitId : toUnitId}`);
  if (!Number.isFinite(value)) return NaN;
  return (value * from.m2PerUnit) / to.m2PerUnit;
}

/** @param {number} value @param {string} fromUnitId @returns {Array<{id:string,label:string,value:number}>} */
export function convertToAllUnits(value, fromUnitId) {
  return AREA_UNITS.map((unit) => ({
    id: unit.id,
    label: unit.label,
    value: convertArea(value, fromUnitId, unit.id),
  }));
}

export function formatArea(value) {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  const decimals = magnitude === 0 ? 2 : magnitude < 0.01 ? 6 : magnitude < 1 ? 4 : magnitude < 1000 ? 2 : 0;
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
