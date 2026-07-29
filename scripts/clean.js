import { rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(rootDir, "public");

rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });

console.log("Cleaned public/");
