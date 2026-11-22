import { sceneState, setActiveScene, type SceneId } from "@/scene/scene-bus";

/**
 * Lenis smooth scroll + GSAP ScrollTrigger, loaded with the 3D chunk and never under
 * reduced motion. Sections declare their scene with `data-scene-section`.
 */
const HEADER_OFFSET_PX = -88;
const SECTION_START = "top 60%";
const SECTION_END = "bottom 40%";

export async function startScrollEngine(): Promise<() => void> {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => undefined;
  const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
    import("lenis"),
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ anchors: { offset: HEADER_OFFSET_PX } });
  lenis.on("scroll", (instance: { velocity: number }) => {
    sceneState.velocity = instance.velocity;
    ScrollTrigger.update();
  });
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const sectionTriggers = createSectionTriggers(ScrollTrigger);
  const triggers = [...sectionTriggers, createMonolithScrub(ScrollTrigger)].filter(
    (trigger): trigger is NonNullable<typeof trigger> => trigger !== null,
  );
  syncSceneWithScroll(ScrollTrigger, sectionTriggers);
  return () => {
    triggers.forEach((trigger) => trigger.kill());
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}

type ScrollTriggerStatic = typeof import("gsap/ScrollTrigger").ScrollTrigger;

function createSectionTriggers(ScrollTrigger: ScrollTriggerStatic) {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene-section]"));
  return sections.map((section) => {
    const scene = section.dataset.sceneSection as SceneId;
    return ScrollTrigger.create({
      trigger: section,
      start: SECTION_START,
      end: SECTION_END,
      onToggle: (self) => {
        if (self.isActive) setActiveScene(scene);
        else if (sceneState.active === scene) setActiveScene("none");
      },
    });
  });
}

/**
 * onToggle fires only on changes, so a visitor who lands mid-page (a #partners link) would
 * keep the hero scene rendering behind opaque sections. Resolve the starting scene once.
 */
function syncSceneWithScroll(ScrollTrigger: ScrollTriggerStatic, triggers: ReturnType<ScrollTriggerStatic["create"]>[]) {
  ScrollTrigger.refresh();
  const active = triggers.find((trigger) => trigger.isActive);
  const scene = (active?.trigger as HTMLElement | undefined)?.dataset.sceneSection as SceneId | undefined;
  setActiveScene(scene ?? "none");
}

function centredScrollTop(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2;
}

/** Keeps the three tier panels and the camera scrub in step. */
function createMonolithScrub(ScrollTrigger: ScrollTriggerStatic) {
  const list = document.querySelector<HTMLElement>("#solutions ol");
  if (!list) return null;
  const panels = Array.from(list.querySelectorAll<HTMLElement>("[data-tier-panel] article"));
  const first = panels[0];
  const last = panels[panels.length - 1];
  if (!first || !last) return null;
  // Progress 0 and 1 land exactly when the first and last cards sit at the viewport centre,
  // so the camera faces the monolith of the card being read.
  return ScrollTrigger.create({
    trigger: list,
    start: () => centredScrollTop(first),
    end: () => centredScrollTop(last),
    invalidateOnRefresh: true,
    scrub: true,
    onUpdate: (self) => {
      sceneState.monolithProgress = self.progress;
      const activeIndex = Math.round(self.progress * (panels.length - 1));
      panels.forEach((panel, index) => panel.setAttribute("data-active", String(index === activeIndex)));
    },
  });
}
