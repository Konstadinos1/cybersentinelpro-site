/**
 * Web Audio cues (SPEC §6): off by default, and the AudioContext is created only inside a
 * click handler while the toggle is ON. No audio files are downloaded.
 */

const STORAGE_KEY = "csp_audio";
const DRONE_BASE_HZ = 55;
const DRONE_DETUNE_HZ = 0.6;
const DRONE_LOWPASS_HZ = 420;
const DRONE_GAIN = 0.035;
const DRONE_FADE_S = 1.2;
const CLICK_BANDPASS_HZ = 4200;
const CLICK_DURATION_S = 0.07;
const CLICK_GAIN = 0.12;

let context: AudioContext | null = null;
let droneGain: GainNode | null = null;
let enabled = false;

export function readStoredAudioPreference(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function storeAudioPreference(on: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Storage can be unavailable (private mode); the toggle still works for this visit.
  }
}

function startDrone(audio: AudioContext): GainNode {
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = DRONE_LOWPASS_HZ;
  gain.gain.value = 0;
  for (const frequency of [DRONE_BASE_HZ, DRONE_BASE_HZ + DRONE_DETUNE_HZ]) {
    const oscillator = audio.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(filter);
    oscillator.start();
  }
  filter.connect(gain).connect(audio.destination);
  return gain;
}

/** Must be called from a user gesture. */
function ensureContext(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  context ??= new AudioContext();
  droneGain ??= startDrone(context);
  return context;
}

function rampDrone(target: number): void {
  if (!context || !droneGain) return;
  droneGain.gain.cancelScheduledValues(context.currentTime);
  droneGain.gain.linearRampToValueAtTime(target, context.currentTime + DRONE_FADE_S);
}

export function setAudioEnabled(on: boolean): void {
  enabled = on;
  storeAudioPreference(on);
  if (on) {
    const audio = ensureContext();
    void audio?.resume();
    rampDrone(DRONE_GAIN);
  } else {
    rampDrone(0);
  }
}

/** Short filtered noise burst for confirmations. Silent unless the toggle is ON. */
export function playGlassClick(): void {
  if (!enabled) return;
  const audio = ensureContext();
  if (!audio) return;
  const length = Math.floor(audio.sampleRate * CLICK_DURATION_S);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / length);
  }
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  filter.type = "bandpass";
  filter.frequency.value = CLICK_BANDPASS_HZ;
  gain.gain.value = CLICK_GAIN;
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
}
