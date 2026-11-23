"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.:#";
const FRAME_MS = 32;
/** Total reveal time; based on the clock, so a busy main thread cannot stretch it. */
const REVEAL_MS = 1200;

/**
 * Text-scramble reveal. It animates only `textContent` inside a fixed-width monospace box
 * (`ch` units), so layout never shifts (webgl-performance rules). Skipped under reduced motion.
 */
export function CipherText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const startedAt = performance.now();
    let frame = 0;
    const timer = window.setInterval(() => {
      const progress = (performance.now() - startedAt) / REVEAL_MS;
      if (progress >= 1) {
        node.textContent = text;
        return window.clearInterval(timer);
      }
      const revealed = Math.floor(progress * text.length);
      frame += 1;
      node.textContent = text
        .split("")
        .map((char, index) => (index < revealed || char === " " ? char : GLYPHS[(index * 7 + frame) % GLYPHS.length]))
        .join("");
    }, FRAME_MS);
    return () => window.clearInterval(timer);
  }, [text]);

  return (
    <span
      ref={ref}
      className={`inline-block whitespace-pre font-mono ${className}`}
      style={{ width: `${text.length}ch` }}
    >
      {text}
    </span>
  );
}
