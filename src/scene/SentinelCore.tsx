"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { EdgesGeometry, IcosahedronGeometry, LineBasicMaterial, ShaderMaterial, type Group } from "three";
import { coreFragment, coreVertex } from "./shaders/core.glsl";
import { ParticleLattice } from "./ParticleLattice";
import { approach, clampUnit, NARROW_VIEWPORT_PX, SCENE_COLORS, VISIBLE_EPSILON } from "./palette";
import { PARTICLE_COUNTS, type QualityTier } from "./quality/capability";
import { sceneState } from "./scene-bus";

const CORE_RADIUS = 0.92;
const EDGE_RADIUS = 0.97;
const SHELL_SCALE = 1.22;
const SPIN_RATE = 0.12;
const VELOCITY_SCALE = 40;
const EDGE_OPACITY = 0.4;
const WIDE_POSITION: readonly [number, number, number] = [1.85, 0.05, 0];
const NARROW_POSITION: readonly [number, number, number] = [0.2, 1.55, -1.6];

export function SentinelCore({ tier, onFirstFrame }: { tier: QualityTier; onFirstFrame: () => void }) {
  const group = useRef<Group>(null);
  const fade = useRef(0);
  const reported = useRef(false);
  const narrow = useThree((state) => state.size.width < NARROW_VIEWPORT_PX);

  const coreGeometry = useMemo(() => new IcosahedronGeometry(CORE_RADIUS, 1), []);
  const edgeGeometry = useMemo(() => new EdgesGeometry(new IcosahedronGeometry(EDGE_RADIUS, 1)), []);
  const edgeMaterial = useMemo(() => new LineBasicMaterial({ color: SCENE_COLORS.ice, transparent: true, opacity: 0 }), []);
  const coreMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: coreVertex,
        fragmentShader: coreFragment,
        uniforms: {
          uTime: { value: 0 },
          uVelocity: { value: 0 },
          uOpacity: { value: 0 },
          uBase: { value: SCENE_COLORS.fleur.clone() },
          uRim: { value: SCENE_COLORS.ice.clone() },
        },
        transparent: true,
      }),
    [],
  );

  useEffect(
    () => () => {
      coreGeometry.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      coreMaterial.dispose();
    },
    [coreGeometry, edgeGeometry, edgeMaterial, coreMaterial],
  );

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    fade.current = approach(fade.current, sceneState.active === "core" ? 1 : 0, delta);
    node.visible = fade.current > VISIBLE_EPSILON;
    if (!node.visible) return;
    coreMaterial.uniforms.uTime!.value = state.clock.elapsedTime;
    coreMaterial.uniforms.uVelocity!.value = clampUnit(sceneState.velocity / VELOCITY_SCALE);
    coreMaterial.uniforms.uOpacity!.value = fade.current;
    edgeMaterial.opacity = EDGE_OPACITY * fade.current;
    node.rotation.y += delta * SPIN_RATE;
    node.rotation.x = approach(node.rotation.x, 0.22 + sceneState.pointerY * 0.12, delta);
    node.scale.setScalar((narrow ? 0.72 : 1) * (0.85 + 0.15 * fade.current));
    if (!reported.current && fade.current > 0.5) {
      reported.current = true;
      onFirstFrame();
    }
  });

  const position = narrow ? NARROW_POSITION : WIDE_POSITION;
  return (
    <group ref={group} position={[position[0], position[1], position[2]]}>
      <mesh geometry={coreGeometry} material={coreMaterial} />
      <lineSegments geometry={edgeGeometry} material={edgeMaterial} />
      {tier === "high" ? (
        <mesh scale={SHELL_SCALE}>
          <icosahedronGeometry args={[1, 0]} />
          {/* No per-pixel jitter (chromaticAberration/anisotropy 0): the post pass adds colour split cleanly. */}
          <MeshTransmissionMaterial samples={6} resolution={768} thickness={0.25} roughness={0} chromaticAberration={0} anisotropicBlur={0} distortion={0} ior={1.25} transmission={1} flatShading color={SCENE_COLORS.frost} backside={false} />
        </mesh>
      ) : null}
      <ParticleLattice count={PARTICLE_COUNTS[tier]} fade={fade} />
    </group>
  );
}
