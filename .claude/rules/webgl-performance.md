---
paths: ["src/scene/**", "src/lib/audio.ts", "app/**/page.tsx"]
---
# WebGL performance rules

- The canvas is never the LCP element. The hero shell (CSS + inline SVG) renders on the server and stays visible until the scene reports its first frame.
- Load the scene with `next/dynamic({ ssr: false })` after `requestIdleCallback`. Nothing from `three` may enter the initial route bundle.
- `dpr={[1, 1.75]}` on every `<Canvas>`. One canvas for the whole page; scenes are switched by scroll, not by mounting new canvases.
- Budgets (SPEC §6): < 60 draw calls, particles 6 000 / 2 500 / 0 by tier, 3D chunk < 350 KB gzip, no textures over 64 KB, no `.glb`.
- Use `PerformanceMonitor`: below 45 FPS for 2 s drops a tier (high -> mid -> static). Never climb back up within a session.
- Choose `static` up front for `prefers-reduced-motion: reduce`, `saveData`, touch devices with `deviceMemory <= 4`, or no WebGL2. `static` renders no `<canvas>`.
- Pause `useFrame` work when the canvas is off screen (`IntersectionObserver`) or the tab is hidden.
- Dispose geometries, materials and render targets on unmount.
- Allocate no objects inside `useFrame`; reuse vectors held in refs.
- Uniforms only change through refs, never through React state, so a frame never triggers a re-render.
- Postprocessing (bloom, chromatic aberration) runs only on `high`, and stays subtle: bloom intensity <= 0.6, CA offset <= 0.0015.
- GSAP ScrollTrigger and Lenis are created in effects and killed on cleanup; under reduced motion neither starts.
- Cipher text-scramble animates only `textContent` inside a fixed-width box (`ch` units, monospace) so layout never shifts.
- Audio context is created only after a user click and only when the toggle is ON.
