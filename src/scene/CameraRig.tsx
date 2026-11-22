"use client";

import { useFrame } from "@react-three/fiber";
import { approach } from "./palette";
import { sceneState } from "./scene-bus";
import { MONOLITH_SPACING } from "./ServiceMonoliths";

const CAMERA_Z = 6;
const MONOLITH_STEPS = 2;
const PARALLAX = 0.18;

/** Scrubs the camera between the monoliths; elsewhere it rests at the origin with light parallax. */
export function CameraRig() {
  useFrame((state, delta) => {
    const scrubX = sceneState.active === "monoliths" ? sceneState.monolithProgress * MONOLITH_STEPS * MONOLITH_SPACING : 0;
    const camera = state.camera;
    camera.position.x = approach(camera.position.x, scrubX + sceneState.pointerX * PARALLAX, delta, 4);
    camera.position.y = approach(camera.position.y, sceneState.pointerY * PARALLAX, delta, 4);
    camera.position.z = CAMERA_Z;
  });
  return null;
}
