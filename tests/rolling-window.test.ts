import { describe, expect, it } from "vitest";

import { addReading, summarize, type Windows } from "../lib/rolling-window";
import type { Reading } from "../lib/telemetry";

const environment = (temperature: number): Reading => ({
  id: 1,
  message: "environment",
  values: { temperature, humidity: 40 },
});

describe("rolling window", () => {
  it("keeps history per message and field, and summarizes it", () => {
    const empty: Windows = {};
    let windows = addReading(empty, environment(21.5), 1_000);
    windows = addReading(windows, environment(23), 2_000);
    windows = addReading(windows, environment(22), 3_000);
    windows = addReading(windows, { id: 2, message: "status", values: { led: 1 } }, 3_000);

    expect(empty).toEqual({}); // the input is never modified
    expect(Object.keys(windows)).toEqual(["environment", "status"]);
    expect(windows.environment.humidity).toHaveLength(3);
    expect(summarize(windows.environment.temperature)).toEqual({ latest: 22, min: 21.5, max: 23 });
    expect(summarize([])).toBeUndefined();
  });

  it("drops points older than the window and never keeps more than the cap", () => {
    const window = { maxAgeMs: 10_000, maxPoints: 3 };
    let windows: Windows = {};

    windows = addReading(windows, environment(1), 0, window);
    windows = addReading(windows, environment(2), 10_001, window); // the first point is now too old
    expect(windows.environment.temperature.map((point) => point.value)).toEqual([2]);

    for (let i = 3; i <= 6; i++) {
      windows = addReading(windows, environment(i), 10_001 + i, window);
    }
    expect(windows.environment.temperature.map((point) => point.value)).toEqual([4, 5, 6]);
  });
});
