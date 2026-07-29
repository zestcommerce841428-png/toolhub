/**
 * RFC 4180-style CSV parsing and serialization, shared by
 * csv-to-json-converter and json-to-csv-converter (the "csv.js" module
 * anticipated in docs/ROADMAP.md's deferred-modules list, built now that
 * two real tools need it). A real state-machine parser, not a naive
 * text.split(","), so quoted fields containing commas, embedded quotes
 * ("" escaping), and embedded newlines all parse correctly.
 */

/**
 * Parses CSV text into an array of rows, each an array of field strings.
 * @param {string} text
 * @param {{ delimiter?: string }} [options]
 * @returns {string[][]}
 */
export function parseCsv(text, options = {}) {
  const delimiter = options.delimiter ?? ",";
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
      i++;
    } else if (char === "\r") {
      i++; // normalize CRLF/CR to LF by simply skipping the \r
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
    } else {
      field += char;
      i++;
    }
  }

  // Flush the final field/row unless the input was empty or ended cleanly
  // on a newline (in which case there's nothing left to flush).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Converts parsed rows into objects, using the first row as headers.
 * @param {string[][]} rows
 * @returns {Record<string, string>[]}
 */
export function rowsToObjects(rows) {
  if (rows.length === 0) return [];
  const [headers, ...dataRows] = rows;
  return dataRows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

/** Quotes a CSV field only when necessary (contains the delimiter, a quote, or a newline), escaping embedded quotes as "". */
function quoteField(value, delimiter) {
  const stringValue = String(value ?? "");
  if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes("\n") || stringValue.includes("\r")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * @param {string[][]} rows
 * @param {{ delimiter?: string }} [options]
 * @returns {string}
 */
export function serializeCsv(rows, options = {}) {
  const delimiter = options.delimiter ?? ",";
  return rows.map((row) => row.map((field) => quoteField(field, delimiter)).join(delimiter)).join("\r\n");
}

/**
 * Converts an array of objects into CSV rows: a header row made from the
 * union of every object's keys (so objects with differing shapes don't
 * silently lose columns), then one data row per object.
 * @param {Record<string, unknown>[]} objects
 * @returns {string[][]}
 */
export function objectsToRows(objects) {
  const headerSet = new Set();
  for (const obj of objects) {
    for (const key of Object.keys(obj)) headerSet.add(key);
  }
  const headers = [...headerSet];
  const rows = objects.map((obj) => headers.map((header) => (obj[header] === undefined || obj[header] === null ? "" : String(obj[header]))));
  return [headers, ...rows];
}
