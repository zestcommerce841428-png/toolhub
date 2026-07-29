/**
 * Zero-dependency static file server for previewing public/ locally.
 * Not meant for production (see docs/ARCHITECTURE.md — public/ is deployed
 * to any real static host), just for `npm run serve` during development.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(rootDir, "public");
const port = Number(process.env.PORT ?? 4173);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  let candidate = path.join(publicDir, decoded);

  // Prevent path traversal outside public/.
  if (!candidate.startsWith(publicDir)) return null;

  try {
    const stats = await stat(candidate);
    if (stats.isDirectory()) candidate = path.join(candidate, "index.html");
  } catch {
    // Not a real path (yet) — might still resolve as a pretty URL below.
  }

  try {
    await stat(candidate);
    return candidate;
  } catch {
    // Pretty URL with no trailing slash, e.g. /tools/word-counter
    const withIndex = path.join(candidate, "index.html");
    try {
      await stat(withIndex);
      return withIndex;
    } catch {
      return null;
    }
  }
}

const server = createServer(async (req, res) => {
  const filePath = await resolveFile(req.url ?? "/");

  if (!filePath) {
    const notFoundPath = path.join(publicDir, "offline.html");
    try {
      const body = await readFile(notFoundPath);
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
    return;
  }

  const ext = path.extname(filePath);
  const body = await readFile(filePath);
  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" });
  res.end(body);
});

server.listen(port, () => {
  console.log(`[serve] http://localhost:${port}/`);
});
