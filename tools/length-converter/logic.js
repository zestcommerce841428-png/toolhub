/**
 * Pure length conversion. Every unit is defined by its exact factor in
 * meters, so converting A -> B always goes through meters internally
 * (A -> meters -> B) rather than needing a conversion factor for every
 * unit pair — that's what keeps adding a new unit a one-line change.
 */

export const LENGTH_UNITS = [
  { id: "mm", label: "Millimeters", metersPerUnit: 0.001 },
  { id: "cm", label: "Centimeters", metersPerUnit: 0.01 },
  { id: "m", label: "Meters", metersPerUnit: 1 },
  { id: "km", label: "Kilometers", metersPerUnit: 1000 },
  { id: "in", label: "Inches", metersPerUnit: 0.0254 },
  { id: "ft", label: "Feet", metersPerUnit: 0.3048 },
  { id: "yd", label: "Yards", metersPerUnit: 0.9144 },
  { id: "mi", label: "Miles", metersPerUnit: 1609.344 },
];

const unitById = new Map(LENGTH_UNITS.map((unit) => [unit.id, unit]));

/**
 * @param {number} value
 * @param {string} fromUnitId
 * @param {string} toUnitId
 * @returns {number}
 */
export function convertLength(value, fromUnitId, toUnitId) {
  const from = unitById.get(fromUnitId);
  const to = unitById.get(toUnitId);
  if (!from || !to) throw new Error(`Unknown length unit: ${!from ? fromUnitId : toUnitId}`);
  if (!Number.isFinite(value)) return NaN;
  const meters = value * from.metersPerUnit;
  return meters / to.metersPerUnit;
}

/**
 * Converts `value` (in `fromUnitId`) into every supported unit at once.
 * @param {number} value
 * @param {string} fromUnitId
 * @returns {Array<{ id: string, label: string, value: number }>}
 */
export function convertToAllUnits(value, fromUnitId) {
  return LENGTH_UNITS.map((unit) => ({
    id: unit.id,
    label: unit.label,
    value: convertLength(value, fromUnitId, unit.id),
  }));
}

/** Formats a converted length for display: fewer decimals for large numbers, more for small ones. */
export function formatLength(value) {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  const decimals = magnitude === 0 ? 2 : magnitude < 0.01 ? 6 : magnitude < 1 ? 4 : magnitude < 1000 ? 2 : 0;
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
