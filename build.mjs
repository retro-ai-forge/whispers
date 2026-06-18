import { rmSync, mkdirSync, readdirSync, cpSync } from "node:fs";

// Copy the static site (workspace root) into dist/ for the .dot deploy runner,
// excluding the scaffold, npm artifacts, and dot-directories.
const SKIP = new Set(["package.json","package-lock.json","server.mjs","build.mjs","node_modules","dist"]);

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
for (const name of readdirSync(".")) {
  if (SKIP.has(name) || name.startsWith(".")) continue;
  cpSync(name, "dist/" + name, { recursive: true });
}
console.log("Copied static site to ./dist");
