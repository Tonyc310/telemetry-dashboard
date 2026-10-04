import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../app/api/telemetry/route";
import { parseReading } from "../lib/telemetry";

describe("GET /api/telemetry", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("streams a reading a second as Server-Sent Events until the client disconnects", async () => {
    vi.useFakeTimers();
    const client = new AbortController();
    const response = GET(new Request("http://localhost/api/telemetry", { signal: client.signal }));
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) {
      throw new Error("the response has no body to stream");
    }

    expect(response.headers.get("content-type")).toBe("text/event-stream");

    vi.advanceTimersByTime(3_000);
    for (let i = 0; i < 3; i++) {
      const { value } = await reader.read();
      const event = decoder.decode(value);

      expect(event).toMatch(/^data: .*\n\n$/);
      expect(parseReading(event.slice("data: ".length))?.message).toBe("environment");
    }

    client.abort();
    expect((await reader.read()).done).toBe(true);
    expect(vi.getTimerCount()).toBe(0); // the interval was cleared, not left running
  });
});
