"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { startScrollEngine } from "@/lib/scroll-engine";
import { CameraRig } from "./CameraRig";
import { Effects } from "./Effects";
import { FirewallPlane } from "./FirewallPlane";
import { SCENE_COLORS } from "./palette";
import type { QualityTier } from "./quality/capability";
import { onActiveSceneChange, sceneState } from "./scene-bus";
import { SentinelCore } from "./SentinelCore";
import { ServiceMonoliths } from "./ServiceMonoliths";

/** PerformanceMonitor: 10 samples of 200 ms = 2 s below 45 FPS drops one tier, never back up. */
const MONITOR_SAMPLE_MS = 200;
const MONITOR_SAMPLES = 10;
const MIN_FPS = 45;
const TARGET_FPS = 60;
const PAUSE_AFTER_FADE_MS = 1200;

/** Renders only while a scene is on screen and the tab is visible. */
function useFrameloop(): "always" | "never" {
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const evaluate = () => {
      clearTimeout(timer);
      if (document.hidden) return setFrameloop("never");
      if (sceneState.active !== "none") return setFrameloop("always");
      timer = setTimeout(() => setFrameloop("never"), PAUSE_AFTER_FADE_MS);
    };
    const unsubscribe = onActiveSceneChange(evaluate);
    document.addEventListener("visibilitychange", evaluate);
    return () => {
      clearTimeout(timer);
      unsubscribe();
      document.removeEventListener("visibilitychange", evaluate);
    };
  }, []);
  return frameloop;
}

function usePointerAndScroll(): void {
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      sceneState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    let stop: (() => void) | undefined;
    let cancelled = false;
    startScrollEngine()
      .then((cleanup) => (cancelled ? cleanup() : (stop = cleanup)))
      .catch((error: unknown) => console.error("scroll engine failed to start:", error));
    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", onPointer);
      stop?.();
    };
  }, []);
}

/** Keeps the canvas tag in sync after a tier drop, so tests and QA can read the live tier. */
function TierTag({ tier }: { tier: QualityTier }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    gl.domElement.dataset.tier = tier;
  }, [gl, tier]);
  return null;
}

export default function SceneCanvas({ tier, onDegrade }: { tier: QualityTier; onDegrade: () => void }) {
  const frameloop = useFrameloop();
  usePointerAndScroll();
  const markReady = useCallback(() => {
    document.documentElement.dataset.sceneReady = "true";
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={frameloop}
        camera={{ position: [0, 0, 6], fov: 42, near: 0.1, far: 60 }}
        gl={{ antialias: tier === "high", powerPreference: "high-performance", alpha: false }}
        onCreated={({ gl }) => {
          gl.domElement.dataset.scene = "sentinel";
          gl.domElement.dataset.tier = tier;
          gl.setClearColor(SCENE_COLORS.night, 1);
        }}
      >
        <PerformanceMonitor ms={MONITOR_SAMPLE_MS} iterations={MONITOR_SAMPLES} threshold={0.75} bounds={() => [MIN_FPS, TARGET_FPS]} onDecline={onDegrade} />
        <TierTag tier={tier} />
        <CameraRig />
        <SentinelCore tier={tier} onFirstFrame={markReady} />
        <ServiceMonoliths />
        <FirewallPlane />
        {tier === "high" ? <Effects /> : null}
      </Canvas>
    </div>
  );
}
