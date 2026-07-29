/**
 * Temperature conversion deliberately does NOT use the
 * factor-per-unit/pass-through-a-base-unit pattern from the other
 * converters in this family (length, weight, volume, area, speed) —
 * Celsius/Fahrenheit/Kelvin differ by an *offset*, not just a
 * multiplicative factor, so "kelvinPerUnit" isn't a meaningful concept the
 * way "metersPerUnit" is. Every unit instead defines explicit toCelsius/
 * fromCelsius functions, with Celsius as the pivot.
 */

export const TEMPERATURE_UNITS = [
  { id: "c", label: "Celsius", symbol: "°C", toCelsius: (v) => v, fromCelsius: (c) => c },
  { id: "f", label: "Fahrenheit", symbol: "°F", toCelsius: (v) => ((v - 32) * 5) / 9, fromCelsius: (c) => (c * 9) / 5 + 32 },
  { id: "k", label: "Kelvin", symbol: "K", toCelsius: (v) => v - 273.15, fromCelsius: (c) => c + 273.15 },
  { id: "r", label: "Rankine", symbol: "°R", toCelsius: (v) => ((v - 491.67) * 5) / 9, fromCelsius: (c) => (c + 273.15) * 1.8 },
];

const unitById = new Map(TEMPERATURE_UNITS.map((unit) => [unit.id, unit]));

// Absolute zero, used to flag physically impossible inputs rather than
// silently returning e.g. a negative Kelvin value.
const ABSOLUTE_ZERO_CELSIUS = -273.15;

/**
 * @param {number} value
 * @param {string} fromUnitId
 * @param {string} toUnitId
 * @returns {{ ok: true, value: number } | { ok: false, error: string }}
 */
export function convertTemperature(value, fromUnitId, toUnitId) {
  const from = unitById.get(fromUnitId);
  const to = unitById.get(toUnitId);
  if (!from || !to) return { ok: false, error: `Unknown temperature unit: ${!from ? fromUnitId : toUnitId}` };
  if (!Number.isFinite(value)) return { ok: false, error: "Enter a number." };

  const celsius = from.toCelsius(value);
  if (celsius < ABSOLUTE_ZERO_CELSIUS - 1e-9) {
    return { ok: false, error: "That's below absolute zero — no physical temperature scale can represent it." };
  }
  return { ok: true, value: to.fromCelsius(celsius) };
}

/** @param {number} value @param {string} fromUnitId @returns {Array<{id:string,label:string,symbol:string,value:number}>} */
export function convertToAllUnits(value, fromUnitId) {
  return TEMPERATURE_UNITS.map((unit) => {
    const result = convertTemperature(value, fromUnitId, unit.id);
    return { id: unit.id, label: unit.label, symbol: unit.symbol, value: result.ok ? result.value : NaN };
  });
}

export function formatTemperature(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
