"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { detectInitialTier, lowerTier, readPinnedTier, type QualityTier } from "./quality/capability";

/** The only path into the 3D chunk: never server-rendered, never in the initial bundle. */
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

const IDLE_TIMEOUT_MS = 1500;

function whenIdle(callback: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const handle = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, IDLE_TIMEOUT_MS);
  return () => clearTimeout(handle);
}

export function SceneLoader() {
  const [tier, setTier] = useState<QualityTier | null>(null);
  const [pinned, setPinned] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pin = readPinnedTier();
    setPinned(pin !== null);
    const initial = pin ?? detectInitialTier();
    document.documentElement.dataset.quality = initial;
    setTier(initial);
    if (initial === "static") return;
    return whenIdle(() => setReady(true));
  }, []);

  const degrade = useCallback(() => {
    setTier((current) => {
      const next = current ? lowerTier(current) : "static";
      document.documentElement.dataset.quality = next;
      if (next === "static") delete document.documentElement.dataset.sceneReady;
      return next;
    });
  }, []);

  if (!ready || tier === null || tier === "static") return null;
  return <SceneCanvas tier={tier} onDegrade={pinned ? undefined : degrade} />;
}
