import { describe, expect, it } from "vitest";

import { createCommandSource } from "../lib/command-source";

async function until(condition: () => boolean, timeoutMs = 3_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) {
      throw new Error("timed out waiting");
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0); // signal 0 only checks that the process exists
    return true;
  } catch {
    return false;
  }
}

describe("createCommandSource", () => {
  it("runs one command for every listener and stops all of it when the last one leaves", async () => {
    // The background `sleep` stands in for a program the shell launched, like serial-decoder.
    const source = createCommandSource(
      'sleep 30 & echo "child $!"; while true; do echo tick; sleep 0.05; done',
    );
    const first: string[] = [];
    const second: string[] = [];

    const stopFirst = source.subscribe((line) => first.push(line));
    await until(() => first.includes("tick"));
    const stopSecond = source.subscribe((line) => second.push(line));
    await until(() => second.includes("tick"));

    // The second listener joined the running command instead of starting another one.
    expect(second.some((line) => line.startsWith("child"))).toBe(false);

    stopFirst();
    const ticks = second.length;
    await until(() => second.length > ticks + 2); // still running for the remaining listener

    const child = Number(first[0].split(" ")[1]);
    stopSecond();
    await until(() => !isRunning(child));
  });

  it("restarts the command if it exits while someone is listening", async () => {
    const source = createCommandSource("echo ready", 20);
    const lines: string[] = [];

    const stop = source.subscribe((line) => lines.push(line));
    await until(() => lines.length >= 2);
    stop();

    expect(lines.slice(0, 2)).toEqual(["ready", "ready"]);
  });
});
