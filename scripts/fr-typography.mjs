/**
 * Applies French typography to string literals in the French dictionary (Bill 96 copy rules):
 * non-breaking space before : ; ? ! and inside « », and inside amounts and percentages.
 * Idempotent; run after editing fr.ts.
 */
import { readFileSync, writeFileSync } from "node:fs";

const NBSP = "\\u00a0";
const target = process.argv[2] ?? "src/i18n/dictionaries/fr.ts";

function fixLiteral(text) {
  return text
    .replace(/ ([:;?!»])/g, `${NBSP}$1`)
    .replace(/« /g, `«${NBSP}`)
    .replace(/(\d) (\d{3})/g, `$1${NBSP}$2`)
    .replace(/(\d) (\$|%|M\$)/g, `$1${NBSP}$2`)
    .replace(/n° (\d)/g, `n°${NBSP}$1`);
}

const source = readFileSync(target, "utf8");
const [header, ...rest] = source.split("export const fr");
const body = rest.join("export const fr").replace(/"((?:[^"\\]|\\.)*)"/g, (_m, inner) => `"${fixLiteral(inner)}"`);
writeFileSync(target, `${header}export const fr${body}`);
console.log(`French typography applied to ${target}`);
