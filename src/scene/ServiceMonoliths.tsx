"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BoxGeometry, EdgesGeometry, LineBasicMaterial, ShaderMaterial, Vector3, type Group } from "three";
import { chamberFragment, chamberVertex } from "./shaders/chamber.glsl";
import { approach, NARROW_VIEWPORT_PX, SCENE_COLORS, VISIBLE_EPSILON } from "./palette";
import { sceneState } from "./scene-bus";

export const MONOLITH_SPACING = 3.4;
const MONOLITH_COUNT = 3;
const CHAMBER_SIZE = new Vector3(1.05, 3.1, 1.05);
const WIDE_OFFSET_X = 2.3;
const NARROW_OFFSET: readonly [number, number] = [0, 1.6];

function useChamberMaterials() {
  return useMemo(
    () =>
      Array.from({ length: MONOLITH_COUNT }, () => ({
        body: new ShaderMaterial({
          vertexShader: chamberVertex,
          fragmentShader: chamberFragment,
          uniforms: { uTime: { value: 0 }, uFocus: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: SCENE_COLORS.ice.clone() }, uSize: { value: CHAMBER_SIZE.clone() } },
          transparent: true,
          depthWrite: false,
        }),
        edges: new LineBasicMaterial({ color: SCENE_COLORS.ice, transparent: true, opacity: 0 }),
      })),
    [],
  );
}

/** Three translucent chambers, one per offer tier; the camera rig scrubs between them. */
export function ServiceMonoliths() {
  const group = useRef<Group>(null);
  const fade = useRef(0);
  const narrow = useThree((state) => state.size.width < NARROW_VIEWPORT_PX);
  const geometry = useMemo(() => new BoxGeometry(CHAMBER_SIZE.x, CHAMBER_SIZE.y, CHAMBER_SIZE.z), []);
  const edgeGeometry = useMemo(() => new EdgesGeometry(geometry), [geometry]);
  const materials = useChamberMaterials();

  useEffect(
    () => () => {
      geometry.dispose();
      edgeGeometry.dispose();
      materials.forEach(({ body, edges }) => (body.dispose(), edges.dispose()));
    },
    [geometry, edgeGeometry, materials],
  );

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    fade.current = approach(fade.current, sceneState.active === "monoliths" ? 1 : 0, delta);
    node.visible = fade.current > VISIBLE_EPSILON;
    if (!node.visible) return;
    const focusIndex = sceneState.monolithProgress * (MONOLITH_COUNT - 1);
    materials.forEach(({ body, edges }, index) => {
      const focus = Math.max(0, 1 - Math.abs(focusIndex - index));
      body.uniforms.uTime!.value = state.clock.elapsedTime + index;
      body.uniforms.uFocus!.value = approach(body.uniforms.uFocus!.value as number, focus, delta, 6);
      body.uniforms.uOpacity!.value = fade.current;
      edges.opacity = fade.current * (0.25 + 0.6 * focus);
    });
    node.rotation.y = approach(node.rotation.y, -0.35 + sceneState.pointerX * 0.08, delta);
  });

  const [offsetX, offsetY] = narrow ? NARROW_OFFSET : [WIDE_OFFSET_X, 0];
  return (
    <group ref={group} position={[offsetX, offsetY, 0]}>
      {materials.map(({ body, edges }, index) => (
        <group key={index} position={[index * MONOLITH_SPACING, 0, 0]}>
          <mesh geometry={geometry} material={body} />
          <lineSegments geometry={edgeGeometry} material={edges} />
        </group>
      ))}
    </group>
  );
}
