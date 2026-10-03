import { describe, expect, it } from "vitest";

import { parseReading } from "../lib/telemetry";

describe("parseReading", () => {
  it("parses serial-decoder's JSON Lines output", () => {
    // Copied from serial-decoder's README, decoding stm32-uart-driver's telemetry.
    const status = '{"id": 1, "message": "status", "values": {"uptime": 1000, "led": 0}}';
    const stats =
      '{"id": 2, "message": "console_stats", "values": {"rx_bytes": 0, "tx_bytes": 34, "rx_dropped": 0}}';

    expect(parseReading(status)).toEqual({
      id: 1,
      message: "status",
      values: { uptime: 1000, led: 0 },
    });
    expect(parseReading(stats)?.values.tx_bytes).toBe(34);
  });

  it.each([
    ["not JSON", "status uptime=1000"],
    ["no values", '{"id": 1, "message": "status"}'],
    ["a non-numeric value", '{"id": 1, "message": "status", "values": {"led": "on"}}'],
    ["an ID beyond one byte", '{"id": 256, "message": "status", "values": {}}'],
  ])("rejects %s", (_, line) => {
    expect(parseReading(line)).toBeNull();
  });
});
