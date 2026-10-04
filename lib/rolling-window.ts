import type { Reading } from "./telemetry";

export interface Point {
  time: number; // ms since the epoch
  value: number;
}

/** Recent points by message, then field: `windows.environment.temperature`. */
export type Windows = Record<string, Record<string, Point[]>>;

export interface Summary {
  latest: number;
  min: number;
  max: number;
}

/* The point cap bounds memory even if a source sends far faster than once a second. */
export const WINDOW = { maxAgeMs: 5 * 60_000, maxPoints: 1_000 } as const;

/** Adds each value in `reading` to its field history and drops points older than the window. */
export function addReading(
  windows: Windows,
  reading: Reading,
  time: number,
  window: { maxAgeMs: number; maxPoints: number } = WINDOW,
): Windows {
  // Copies rather than edits, so React sees a new object whenever data arrives.
  const fields = { ...windows[reading.message] };

  for (const [field, value] of Object.entries(reading.values)) {
    const recent = (fields[field] ?? []).filter((point) => point.time > time - window.maxAgeMs);
    recent.push({ time, value });
    fields[field] = recent.slice(-window.maxPoints);
  }
  return { ...windows, [reading.message]: fields };
}

/** Latest, lowest, and highest value in `points`, or undefined if there are none. */
export function summarize(points: readonly Point[]): Summary | undefined {
  if (points.length === 0) {
    return undefined;
  }
  const values = points.map((point) => point.value);
  return { latest: values[values.length - 1], min: Math.min(...values), max: Math.max(...values) };
}
