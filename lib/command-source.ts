import { spawn, type ChildProcess } from "node:child_process";
import { createInterface } from "node:readline";

export type LineListener = (line: string) => void;

export interface CommandSource {
  /** Starts sending lines to `listener`; returns a function that stops. */
  subscribe(listener: LineListener): () => void;
}

/**
 * Shares one running `command` between every listener, handing each of them every line it prints.
 * The command runs only while someone listens, which also frees a serial port when nobody does.
 */
export function createCommandSource(command: string, restartMs = 1_000): CommandSource {
  const listeners = new Set<LineListener>();
  let child: ChildProcess | undefined;
  let restart: ReturnType<typeof setTimeout> | undefined;

  function start() {
    // Through a shell, so the setting reads like an ordinary command line, and in its own process
    // group, so stopping it also stops whatever the shell started.
    const running = spawn(command, {
      shell: true,
      detached: true,
      stdio: ["ignore", "pipe", "inherit"],
    });
    child = running;

    createInterface({ input: running.stdout }).on("line", (line) => {
      for (const listener of listeners) {
        listener(line);
      }
    });
    running.on("exit", () => {
      if (child !== running) {
        return; // stopped on purpose
      }
      child = undefined;
      // The device or decoder may not be up yet, so keep trying while someone is watching.
      if (listeners.size > 0) {
        restart = setTimeout(start, restartMs);
      }
    });
  }

  function stop() {
    clearTimeout(restart);
    if (child?.pid !== undefined) {
      try {
        process.kill(-child.pid, "SIGTERM"); // a negative pid signals the whole process group
      } catch {
        // It already exited.
      }
    }
    child = undefined;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (!child) {
        start();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          stop();
        }
      };
    },
  };
}
