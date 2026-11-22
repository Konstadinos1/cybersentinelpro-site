"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/track-event";

type CtaTarget = "diagnostic" | "sandbox" | "partners" | "book";

/** Anchor that records a consent-gated CTA event; navigation stays a plain link. */
export function TrackedLink({ href, target, className, children }: { href: string; target: CtaTarget; className?: string; children: ReactNode }) {
  return (
    <a href={href} className={className} data-cta={target} onClick={() => trackEvent("cta_click", { target })}>
      {children}
    </a>
  );
}
