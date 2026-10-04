import { createSimulator } from "@/lib/simulator";

const INTERVAL_MS = 1_000;

/** Streams one simulated reading per second as Server-Sent Events, until the client leaves. */
export function GET(request: Request): Response {
  const encoder = new TextEncoder();
  // Each client gets its own simulator, seeded when it connects.
  const nextReading = createSimulator(Date.now());
  let timer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      timer = setInterval(() => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(nextReading())}\n\n`));
      }, INTERVAL_MS);
      // Without this, every visitor who ever opened the page would leave a timer running.
      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        controller.close();
      });
    },
    cancel() {
      clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform", // stops proxies from buffering the stream
    },
  });
}
