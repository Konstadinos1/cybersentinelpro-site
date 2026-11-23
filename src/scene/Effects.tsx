"use client";

import { Bloom, ChromaticAberration, EffectComposer } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector2 } from "three";
import type { ChromaticAberrationEffect } from "postprocessing";
import { sceneState } from "./scene-bus";

/** High tier only, kept subtle: bloom <= 0.6, chromatic offset <= 0.0015 (webgl rules). */
const BLOOM_INTENSITY = 0.5;
const BLOOM_THRESHOLD = 0.55;
const MAX_CA_OFFSET = 0.0015;
const VELOCITY_SCALE = 40;

export function Effects() {
  const aberration = useRef<ChromaticAberrationEffect>(null);
  const initialOffset = useMemo(() => new Vector2(0, 0), []);

  useFrame(() => {
    const strength = Math.min(1, Math.abs(sceneState.velocity) / VELOCITY_SCALE);
    aberration.current?.offset.set(MAX_CA_OFFSET * strength, MAX_CA_OFFSET * strength * 0.6);
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={BLOOM_INTENSITY} luminanceThreshold={BLOOM_THRESHOLD} mipmapBlur />
      <ChromaticAberration ref={aberration} offset={initialOffset} radialModulation={false} modulationOffset={0} />
    </EffectComposer>
  );
}
