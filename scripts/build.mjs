import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const distDir = resolve(rootDir, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const entry of ["index.html", "styles.css", "script.js", "src"]) {
  await cp(resolve(rootDir, entry), resolve(distDir, entry), { recursive: true });
}

console.log("Build output generated in dist/");
