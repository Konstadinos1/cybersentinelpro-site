"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  type Group,
} from "three";
import { firewallFragment, firewallVertex, nodeFragment, nodeVertex } from "./shaders/firewall.glsl";
import { approach, NARROW_VIEWPORT_PX, SCENE_COLORS, VISIBLE_EPSILON } from "./palette";
import { sceneState } from "./scene-bus";

const NODE_COUNT = 48;
const NODE_SIZE = 0.035;
const PLANE_SIZE: readonly [number, number] = [3.2, 3.6];
const APPROACH_S = 0.9;
const DEFLECT_END_S = 2.2;
const START_X = -4.2;
const IDLE_IMPACT_AGE = 10;

function buildNodes(mesh: InstancedMesh): void {
  const matrix = new Matrix4().makeScale(NODE_SIZE, NODE_SIZE, NODE_SIZE);
  const seeds = new Float32Array(NODE_COUNT);
  for (let index = 0; index < NODE_COUNT; index += 1) {
    mesh.setMatrixAt(index, matrix);
    seeds[index] = (index * 0.618034) % 1;
  }
  mesh.geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  mesh.instanceMatrix.needsUpdate = true;
}

/** Packet path: approach the plane, hit it, deflect up and back. Returns false when done. */
function placePacket(packet: Mesh, elapsed: number): boolean {
  if (elapsed < APPROACH_S) {
    packet.position.set(START_X + (-START_X - 0.1) * (elapsed / APPROACH_S), -0.2, 0);
  } else if (elapsed < DEFLECT_END_S) {
    const t = elapsed - APPROACH_S;
    packet.position.set(-0.1 - t * 2.4, -0.2 + t * 1.6, t * 0.6);
  } else {
    return false;
  }
  packet.rotation.x += 0.08;
  packet.rotation.y += 0.11;
  return true;
}

export function FirewallPlane() {
  const group = useRef<Group>(null);
  const packetRef = useRef<Mesh>(null);
  const nodesRef = useRef<InstancedMesh>(null);
  const fade = useRef(0);
  const replaySeen = useRef(sceneState.firewallReplay);
  const packetStart = useRef<number | null>(null);
  const impactAt = useRef(-IDLE_IMPACT_AGE);
  const narrow = useThree((state) => state.size.width < NARROW_VIEWPORT_PX);

  const planeGeometry = useMemo(() => new PlaneGeometry(PLANE_SIZE[0], PLANE_SIZE[1]), []);
  const nodeGeometry = useMemo(() => new OctahedronGeometry(1, 0), []);
  const packetGeometry = useMemo(() => new OctahedronGeometry(0.16, 0), []);
  const planeMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: firewallVertex,
        fragmentShader: firewallFragment,
        uniforms: { uTime: { value: 0 }, uImpactAge: { value: IDLE_IMPACT_AGE }, uImpactUv: { value: new Vector2(0.5, 0.45) }, uOpacity: { value: 0 }, uColor: { value: SCENE_COLORS.ice.clone() }, uHit: { value: SCENE_COLORS.frost.clone() } },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
      }),
    [],
  );
  const nodeMaterial = useMemo(
    () => new ShaderMaterial({ vertexShader: nodeVertex, fragmentShader: nodeFragment, uniforms: { uTime: { value: 0 }, uColor: { value: SCENE_COLORS.ice.clone() }, uOpacity: { value: 0 } }, transparent: true, depthWrite: false }),
    [],
  );
  const packetMaterial = useMemo(() => new MeshBasicMaterial({ color: SCENE_COLORS.breach, transparent: true, opacity: 0 }), []);

  useEffect(() => {
    if (nodesRef.current) buildNodes(nodesRef.current);
    return () => [planeGeometry, nodeGeometry, packetGeometry, planeMaterial, nodeMaterial, packetMaterial].forEach((item) => item.dispose());
  }, [planeGeometry, nodeGeometry, packetGeometry, planeMaterial, nodeMaterial, packetMaterial]);

  useFrame((state, delta) => {
    const node = group.current;
    const packet = packetRef.current;
    if (!node || !packet) return;
    const now = state.clock.elapsedTime;
    fade.current = approach(fade.current, sceneState.active === "firewall" ? 1 : 0, delta);
    node.visible = fade.current > VISIBLE_EPSILON;
    if (!node.visible) return;
    if (replaySeen.current !== sceneState.firewallReplay) {
      replaySeen.current = sceneState.firewallReplay;
      packetStart.current = now;
    }
    const elapsed = packetStart.current === null ? -1 : now - packetStart.current;
    if (elapsed >= APPROACH_S && impactAt.current < (packetStart.current ?? 0)) impactAt.current = now;
    packet.visible = elapsed >= 0 && placePacket(packet, elapsed);
    if (!packet.visible) packetStart.current = null;
    planeMaterial.uniforms.uTime!.value = now;
    planeMaterial.uniforms.uImpactAge!.value = now - impactAt.current;
    planeMaterial.uniforms.uOpacity!.value = fade.current;
    nodeMaterial.uniforms.uTime!.value = now;
    nodeMaterial.uniforms.uOpacity!.value = fade.current;
    packetMaterial.opacity = fade.current;
  });

  return (
    <group ref={group} position={narrow ? [0.9, 1.75, -2] : [2.3, 1.1, -0.6]} rotation={[0, -1.0, 0]} scale={narrow ? 0.5 : 0.52}>
      <mesh geometry={planeGeometry} material={planeMaterial} rotation={[0, Math.PI / 2, 0]} />
      <instancedMesh ref={nodesRef} args={[nodeGeometry, nodeMaterial, NODE_COUNT]} frustumCulled={false} />
      <mesh ref={packetRef} geometry={packetGeometry} material={packetMaterial} visible={false} />
    </group>
  );
}
