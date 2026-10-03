import type { Reading } from "./telemetry";

const ENVIRONMENT_ID = 0x01; // same ID as the environment message in serial-decoder's README

export const LIMITS = {
  temperature: { min: 18, max: 28, step: 0.15 }, // °C
  humidity: { min: 30, max: 60, step: 0.5 }, // %
  battery: { min: 3.3, max: 4.2, drain: 0.002 }, // V per reading
} as const;

/* mulberry32: a tiny seedable generator, so a seed replays the same run in tests and demos. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number, places: number): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

/** A fake environment sensor; each call returns its next reading, drifting smoothly. */
export function createSimulator(seed: number): () => Reading {
  const random = mulberry32(seed);
  const drift = (value: number, limits: { min: number; max: number; step: number }) =>
    Math.min(limits.max, Math.max(limits.min, value + (random() * 2 - 1) * limits.step));

  let temperature = 22;
  let humidity = 45;
  let battery: number = LIMITS.battery.max;

  return () => {
    temperature = drift(temperature, LIMITS.temperature);
    humidity = drift(humidity, LIMITS.humidity);
    // Drains steadily, then jumps back to full as if put on a charger, giving a sawtooth.
    battery -= LIMITS.battery.drain * (0.5 + random());
    if (battery < LIMITS.battery.min) {
      battery = LIMITS.battery.max;
    }
    return {
      id: ENVIRONMENT_ID,
      message: "environment",
      values: {
        temperature: round(temperature, 2),
        humidity: round(humidity, 2),
        battery: round(battery, 3),
      },
    };
  };
}
