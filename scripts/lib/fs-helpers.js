import { mkdirSync, writeFileSync, cpSync, existsSync, readdirSync, readFileSync } from "node:fs";
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

/**
 * Recursively copies a directory, running every `.js` file through
 * `transformJs` first (the production minifier) and copying everything
 * else byte-for-byte. Used for assets/js/** so the deploy artifact ships
 * minified JS without a separate bundler step.
 * @param {string} sourceDir
 * @param {string} destDir
 * @param {(code: string, context: string) => Promise<string>} transformJs
 */
export async function copyDirWithJsTransform(sourceDir, destDir, transformJs) {
  if (!existsSync(sourceDir)) return;
  mkdirSync(destDir, { recursive: true });

  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirWithJsTransform(srcPath, destPath, transformJs);
    } else if (entry.name.endsWith(".js")) {
      const source = readFileSync(srcPath, "utf8");
      const transformed = await transformJs(source, path.relative(process.cwd(), srcPath));
      writeFile(destPath, transformed);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}
