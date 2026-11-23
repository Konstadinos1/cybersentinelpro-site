/**
 * Picks the starting quality tier before any 3D code loads (SPEC §6). No three import here.
 * `static` renders no canvas at all; tiers only ever go down within a session.
 */
export type QualityTier = "high" | "mid" | "static";

const LOW_MEMORY_GB = 4;

export const PARTICLE_COUNTS: Record<QualityTier, number> = { high: 6000, mid: 2500, static: 0 };

interface NavigatorHints {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

/**
 * QA override: `?quality=high|mid` pins the tier and disables automatic drops, so the
 * scenes can be reviewed on machines without a GPU. It never forces a canvas without WebGL2.
 */
export function readPinnedTier(): QualityTier | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("quality");
  return (value === "high" || value === "mid") && supportsWebGL2() ? value : null;
}

export function detectInitialTier(): QualityTier {
  if (typeof window === "undefined") return "static";
  const hints = navigator as Navigator & NavigatorHints;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const lowMemoryTouch = touch && typeof hints.deviceMemory === "number" && hints.deviceMemory <= LOW_MEMORY_GB;
  if (reducedMotion || hints.connection?.saveData === true || lowMemoryTouch || !supportsWebGL2()) return "static";
  return touch ? "mid" : "high";
}

export function lowerTier(tier: QualityTier): QualityTier {
  return tier === "high" ? "mid" : "static";
}
