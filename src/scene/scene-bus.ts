/**
 * Tiny shared state between the page and the WebGL scene. It never imports three, so
 * sections can write to it without pulling the 3D chunk into the initial bundle.
 * The scene reads it inside useFrame through refs; writing never triggers a React render.
 */
export type SceneId = "core" | "monoliths" | "firewall" | "none";

export const sceneState = {
  active: "core" as SceneId,
  /** 0..1 scrub through the three offer tiers. */
  monolithProgress: 0,
  /** Scroll velocity in px/s, used for the chromatic shift. */
  velocity: 0,
  /** Incremented when a sandbox preset runs; the firewall scene replays on change. */
  firewallReplay: 0,
  pointerX: 0,
  pointerY: 0,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function setActiveScene(scene: SceneId): void {
  if (sceneState.active === scene) return;
  sceneState.active = scene;
  listeners.forEach((listener) => listener());
}

export function onActiveSceneChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function replayFirewall(): void {
  sceneState.firewallReplay += 1;
  listeners.forEach((listener) => listener());
}
