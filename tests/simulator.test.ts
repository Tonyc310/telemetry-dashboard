import { describe, expect, it } from "vitest";

import { createSimulator, LIMITS } from "../lib/simulator";
import { parseReading } from "../lib/telemetry";

const take = (next: ReturnType<typeof createSimulator>, count: number) =>
  Array.from({ length: count }, () => next());

describe("createSimulator", () => {
  it("replays the same run for the same seed", () => {
    expect(take(createSimulator(7), 50)).toEqual(take(createSimulator(7), 50));
    expect(take(createSimulator(8), 50)).not.toEqual(take(createSimulator(7), 50));
  });

  it("stays in range, moves in small steps, and matches serial-decoder's format", () => {
    const readings = take(createSimulator(1), 10_000);
    let recharges = 0;

    readings.forEach((reading, i) => {
      const { temperature, humidity, battery } = reading.values;

      expect(parseReading(JSON.stringify(reading))).toEqual(reading);
      expect(temperature).toBeGreaterThanOrEqual(LIMITS.temperature.min);
      expect(temperature).toBeLessThanOrEqual(LIMITS.temperature.max);
      expect(humidity).toBeGreaterThanOrEqual(LIMITS.humidity.min);
      expect(humidity).toBeLessThanOrEqual(LIMITS.humidity.max);
      expect(battery).toBeGreaterThanOrEqual(LIMITS.battery.min);
      expect(battery).toBeLessThanOrEqual(LIMITS.battery.max);

      if (i > 0) {
        const previous = readings[i - 1].values;
        // Rounding can add a hair on top of the step size.
        expect(Math.abs(temperature - previous.temperature)).toBeLessThanOrEqual(
          LIMITS.temperature.step + 0.01,
        );
        if (battery > previous.battery) {
          recharges++;
        }
      }
    });
    expect(recharges).toBeGreaterThan(0);
  });
});
