import { createCommandSource } from "@/lib/command-source";
import { createSimulator } from "@/lib/simulator";

const INTERVAL_MS = 1_000;
const HEARTBEAT_MS = 15_000;

// A command that prints serial-decoder's JSON Lines, e.g. `serial-decoder --json --port ...`.
const command = process.env.TELEMETRY_COMMAND;
const shared = command ? createCommandSource(command) : undefined;

type Send = (event: string) => void;

function simulate(send: Send): () => void {
  // Each client gets its own simulator, seeded when it connects.
  const nextReading = createSimulator(Date.now());
  const timer = setInterval(() => send(`data: ${JSON.stringify(nextReading())}\n\n`), INTERVAL_MS);
  return () => clearInterval(timer);
}

/** Streams readings as Server-Sent Events, from TELEMETRY_COMMAND if set, else a simulator. */
export function GET(request: Request): Response {
  const encoder = new TextEncoder();
  let stop = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send: Send = (event) => controller.enqueue(encoder.encode(event));
      const stopReadings = shared
        ? shared.subscribe((line) => send(`data: ${line}\n\n`))
        : simulate(send);
      // A comment line keeps proxies and browsers from dropping the stream while a device is quiet.
      const heartbeat = setInterval(() => send(": heartbeat\n\n"), HEARTBEAT_MS);

      stop = () => {
        stopReadings();
        clearInterval(heartbeat);
      };
      // Without this, every visitor who ever opened the page would leave timers running.
      request.signal.addEventListener("abort", () => {
        stop();
        controller.close();
      });
    },
    cancel() {
      stop();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform", // stops proxies from buffering the stream
    },
  });
}
