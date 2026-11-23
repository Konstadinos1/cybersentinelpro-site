/**
 * V4 (SPEC §15): zero forbidden credential strings and zero dead `href` in src/, app/, public/.
 * Exits 1 with a list of offending files.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { findForbidden } from "./forbidden-terms.mjs";

const ROOTS = ["src", "app", "public"];
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json", ".svg", ".txt", ".html", ".md", ".xml"]);

function* walk(directory) {
  let entries = [];
  try {
    entries = readdirSync(directory);
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (TEXT_EXTENSIONS.has(extname(path))) yield path;
  }
}

const findings = [];
let scanned = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned += 1;
    const hits = findForbidden(readFileSync(file, "utf8"));
    if (hits.length > 0) findings.push(`${file}: ${hits.join(", ")}`);
  }
}

if (findings.length > 0) {
  console.error(`guard-scan: ${findings.length} file(s) failed\n${findings.join("\n")}`);
  process.exit(1);
}
console.log(`guard-scan: ${scanned} files clean`);
