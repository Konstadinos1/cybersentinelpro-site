"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.:#";
const FRAME_MS = 32;
const FRAMES_PER_CHAR = 2;

/**
 * Text-scramble reveal. It animates only `textContent` inside a fixed-width monospace box
 * (`ch` units), so layout never shifts (webgl-performance rules). Skipped under reduced motion.
 */
export function CipherText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const total = text.length * FRAMES_PER_CHAR;
    const timer = window.setInterval(() => {
      const revealed = Math.floor(frame / FRAMES_PER_CHAR);
      node.textContent = text
        .split("")
        .map((char, index) =>
          index < revealed || char === " " ? char : GLYPHS[(index * 7 + frame) % GLYPHS.length],
        )
        .join("");
      frame += 1;
      if (frame > total) {
        node.textContent = text;
        window.clearInterval(timer);
      }
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
