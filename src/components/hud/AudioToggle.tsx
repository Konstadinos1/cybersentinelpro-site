"use client";

import { useEffect, useState } from "react";
import { readStoredAudioPreference, setAudioEnabled } from "@/lib/audio";
import { trackEvent } from "@/lib/track-event";

/** Off by default. A stored ON preference is shown, but sound starts only on a click. */
export function AudioToggle({ onLabel, offLabel, label }: { onLabel: string; offLabel: string; label: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!readStoredAudioPreference()) return;
    setOn(true);
    // Browsers require a gesture: the stored ON preference resumes on the first click.
    const resume = () => setAudioEnabled(true);
    document.addEventListener("pointerdown", resume, { once: true });
    return () => document.removeEventListener("pointerdown", resume);
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    setAudioEnabled(next);
    trackEvent("audio_toggle", { on: next });
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={toggle}
      className="hud-text min-h-8 text-mist hover:text-frost"
    >
      {on ? onLabel : offLabel}
    </button>
  );
}
