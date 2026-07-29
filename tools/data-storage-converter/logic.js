/**
 * Pure data-storage conversion, same shape as tools/length-converter/logic.js
 * — every unit defined by its exact factor in bytes. Deliberately lists
 * decimal (SI, base-1000: KB/MB/GB/TB) and binary (IEC, base-1024:
 * KiB/MiB/GiB/TiB) units as distinct entries rather than picking one
 * convention for "KB" — conflating the two is exactly why "GB" on a
 * storage label and "GB" reported by an OS never quite match, and this
 * tool's whole reason to exist is not repeating that mistake.
 */

export const DATA_UNITS = [
  { id: "bit", label: "Bits", bytesPerUnit: 0.125 },
  { id: "byte", label: "Bytes", bytesPerUnit: 1 },
  { id: "kb", label: "Kilobytes (KB, ×1000)", bytesPerUnit: 1000 },
  { id: "mb", label: "Megabytes (MB, ×1000²)", bytesPerUnit: 1000 ** 2 },
  { id: "gb", label: "Gigabytes (GB, ×1000³)", bytesPerUnit: 1000 ** 3 },
  { id: "tb", label: "Terabytes (TB, ×1000⁴)", bytesPerUnit: 1000 ** 4 },
  { id: "kib", label: "Kibibytes (KiB, ×1024)", bytesPerUnit: 1024 },
  { id: "mib", label: "Mebibytes (MiB, ×1024²)", bytesPerUnit: 1024 ** 2 },
  { id: "gib", label: "Gibibytes (GiB, ×1024³)", bytesPerUnit: 1024 ** 3 },
  { id: "tib", label: "Tebibytes (TiB, ×1024⁴)", bytesPerUnit: 1024 ** 4 },
];

const unitById = new Map(DATA_UNITS.map((unit) => [unit.id, unit]));

/** @param {number} value @param {string} fromUnitId @param {string} toUnitId @returns {number} */
export function convertDataSize(value, fromUnitId, toUnitId) {
  const from = unitById.get(fromUnitId);
  const to = unitById.get(toUnitId);
  if (!from || !to) throw new Error(`Unknown data unit: ${!from ? fromUnitId : toUnitId}`);
  if (!Number.isFinite(value)) return NaN;
  return (value * from.bytesPerUnit) / to.bytesPerUnit;
}

/** @param {number} value @param {string} fromUnitId @returns {Array<{id:string,label:string,value:number}>} */
export function convertToAllUnits(value, fromUnitId) {
  return DATA_UNITS.map((unit) => ({
    id: unit.id,
    label: unit.label,
    value: convertDataSize(value, fromUnitId, unit.id),
  }));
}

export function formatDataSize(value) {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  const decimals = magnitude === 0 ? 2 : magnitude < 0.01 ? 6 : magnitude < 1 ? 4 : magnitude < 1000 ? 3 : 0;
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
