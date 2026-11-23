import { Color } from "three";

/** Scene colours mirror the CSS tokens in app/globals.css. */
export const SCENE_COLORS = {
  night: new Color("#07111f"),
  deep: new Color("#10223b"),
  fleur: new Color("#1f55e0"),
  ice: new Color("#8ec5ff"),
  frost: new Color("#e7eef8"),
  breach: new Color("#ff6a5f"),
} as const;

/** Breakpoint below which scenes are re-centred behind the copy (matches Tailwind `lg`). */
export const NARROW_VIEWPORT_PX = 1024;
const FADE_RATE = 3.2;
export const VISIBLE_EPSILON = 0.01;

/** Frame-rate independent exponential approach. */
export function approach(current: number, target: number, delta: number, rate: number = FADE_RATE): number {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}

export function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
