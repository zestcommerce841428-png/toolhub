import { mkdirSync, writeFileSync, cpSync, existsSync } from "node:fs";
import path from "node:path";

/** Writes `content` to `filePath`, creating parent directories as needed. */
export function writeFile(filePath, content) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

/** Copies a file, creating the destination directory as needed. No-op if the source doesn't exist. */
export function copyFile(sourcePath, destPath) {
  if (!existsSync(sourcePath)) return;
  mkdirSync(path.dirname(destPath), { recursive: true });
  cpSync(sourcePath, destPath);
}

/** Recursively copies a directory if it exists; silently skips if it doesn't. */
export function copyDir(sourceDir, destDir) {
  if (!existsSync(sourceDir)) return;
  mkdirSync(destDir, { recursive: true });
  cpSync(sourceDir, destDir, { recursive: true });
}
