import { parseCsv, rowsToObjects } from "../../assets/js/core/csv.js";

/**
 * @param {string} csvText
 * @param {{ delimiter?: string, hasHeader?: boolean, indent?: number }} [options]
 * @returns {{ ok: true, json: string } | { ok: false, error: string }}
 */
export function convertCsvToJson(csvText, options = {}) {
  const hasHeader = options.hasHeader ?? true;
  const indent = options.indent ?? 2;

  if (!csvText.trim()) return { ok: false, error: "Paste some CSV first." };

  const rows = parseCsv(csvText, { delimiter: options.delimiter });
  if (rows.length === 0) return { ok: false, error: "Paste some CSV first." };

  const data = hasHeader ? rowsToObjects(rows) : rows;
  return { ok: true, json: JSON.stringify(data, null, indent) };
}
