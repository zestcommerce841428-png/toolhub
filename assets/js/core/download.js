/**
 * Client-side file download helpers. Every tool's "Download" button routes
 * through here so the object-URL lifecycle (create, click, revoke) is only
 * implemented once.
 */

/**
 * Triggers a browser download of `content` as a file, with no network
 * request involved — the blob is constructed and released locally.
 * @param {string} filename
 * @param {string} content
 * @param {string} [mimeType]
 */
export function downloadText(filename, content, mimeType = "text/plain;charset=utf-8") {
  downloadBlob(filename, new Blob([content], { type: mimeType }));
}

/**
 * Triggers a browser download of an arbitrary Blob.
 * @param {string} filename
 * @param {Blob} blob
 */
export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke on a delay rather than immediately — some browsers cancel the
  // download if the object URL is revoked before the save dialog resolves.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Convenience wrapper for downloading a JSON-serializable value.
 * @param {string} filename
 * @param {unknown} data
 * @param {number} [indent]
 */
export function downloadJson(filename, data, indent = 2) {
  downloadText(filename, JSON.stringify(data, null, indent), "application/json;charset=utf-8");
}

/**
 * Reads a File/Blob the user selected (via <input type="file"> or drag-drop)
 * as text. Rejects if the read fails, so callers can show an error state.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsText(file);
  });
}
