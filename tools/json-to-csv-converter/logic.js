import { objectsToRows, serializeCsv } from "../../assets/js/core/csv.js";

/**
 * @param {string} jsonText - must be a JSON array of flat objects
 * @param {{ delimiter?: string }} [options]
 * @returns {{ ok: true, csv: string } | { ok: false, error: string }}
 */
export function convertJsonToCsv(jsonText, options = {}) {
  if (!jsonText.trim()) return { ok: false, error: "Paste some JSON first." };

  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (error) {
    return { ok: false, error: `Invalid JSON: ${error.message}` };
  }

  if (!Array.isArray(data)) {
    return { ok: false, error: "The JSON must be an array of objects, e.g. [{\"name\": \"Alice\"}]." };
  }
  if (data.length === 0) return { ok: false, error: "The array is empty — nothing to convert." };
  if (!data.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
    return { ok: false, error: "Every array entry must be a flat object — nested arrays/objects aren't flattened automatically." };
  }

  const rows = objectsToRows(data);
  return { ok: true, csv: serializeCsv(rows, { delimiter: options.delimiter }) };
}
