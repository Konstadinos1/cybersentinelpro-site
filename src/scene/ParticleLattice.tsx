"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  OctahedronGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { particleFragment, particleVertex } from "./shaders/particles.glsl";
import { SCENE_COLORS } from "./palette";
import { sceneState } from "./scene-bus";

const MAX_PARTICLES = 6000;
const INNER_RADIUS = 1.7;
const OUTER_RADIUS = 3.0;
const PARTICLE_SIZE = 0.013;
const MAX_OPACITY = 0.7;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Fibonacci-sphere shells: an even lattice with no clumping, computed once. */
function buildLattice(mesh: InstancedMesh): void {
  const matrix = new Matrix4();
  const point = new Vector3();
  const seeds = new Float32Array(MAX_PARTICLES);
  for (let index = 0; index < MAX_PARTICLES; index += 1) {
    const y = 1 - (index / (MAX_PARTICLES - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * index;
    const radius = INNER_RADIUS + ((index * 0.618) % 1) * (OUTER_RADIUS - INNER_RADIUS);
    point.set(Math.cos(theta) * ring, y * 0.72, Math.sin(theta) * ring).multiplyScalar(radius);
    matrix.makeScale(PARTICLE_SIZE, PARTICLE_SIZE, PARTICLE_SIZE).setPosition(point);
    mesh.setMatrixAt(index, matrix);
    seeds[index] = (index * 0.754877) % 1;
  }
  mesh.geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  mesh.instanceMatrix.needsUpdate = true;
}

export function ParticleLattice({ count, fade }: { count: number; fade: { current: number } }) {
  const meshRef = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new OctahedronGeometry(1, 0), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        uniforms: { uTime: { value: 0 }, uPointer: { value: new Vector2(9, 9) }, uColor: { value: SCENE_COLORS.ice.clone() }, uOpacity: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(() => {
    if (meshRef.current) buildLattice(meshRef.current);
  }, []);

  useEffect(() => {
    if (meshRef.current) meshRef.current.count = Math.min(count, MAX_PARTICLES);
  }, [count]);

  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material]);

  useFrame((state) => {
    material.uniforms.uTime!.value = state.clock.elapsedTime;
    (material.uniforms.uPointer!.value as Vector2).set(sceneState.pointerX, sceneState.pointerY);
    material.uniforms.uOpacity!.value = fade.current * MAX_OPACITY;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, MAX_PARTICLES]} frustumCulled={false} />;
}
