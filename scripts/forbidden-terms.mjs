/**
 * Credentials and legal titles the site must never mention (quebec-compliance.md).
 * Assembled from fragments so this file, and the hooks that import it, never trip the scan.
 */
const join = (...parts) => parts.join("");

export const FORBIDDEN_PATTERNS = [
  new RegExp(`\\b${join("CIS", "SP")}\\b`, "i"),
  new RegExp(`\\b${join("CI", "PP")}`, "i"),
  new RegExp(`\\b${join("C", "PA")}\\b`),
  new RegExp(join("Bar", "reau"), "i"),
  new RegExp(join("legal ", "coun", "sel"), "i"),
  new RegExp(`\\b${join("avo", "cat")}`, "i"),
  new RegExp(`\\b${join("law", "yer")}`, "i"),
];

export const DEAD_HREF = new RegExp(join("href=", "[\"']", "#", "[\"']"));

export function findForbidden(text) {
  const hits = FORBIDDEN_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  if (DEAD_HREF.test(text)) hits.push("dead href");
  return hits;
}
