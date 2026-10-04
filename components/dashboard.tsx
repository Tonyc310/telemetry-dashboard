"use client";

import { useEffect, useState } from "react";

import { ConnectionStatus, type Connection } from "@/components/connection-status";
import { StatTile } from "@/components/stat-tile";
import { addReading, type Windows } from "@/lib/rolling-window";
import { parseReading } from "@/lib/telemetry";

/** Subscribes to the telemetry stream and shows each field's value and history, by message. */
export function Dashboard() {
  const [windows, setWindows] = useState<Windows>({});
  const [connection, setConnection] = useState<Connection>("connecting");
  const [rejected, setRejected] = useState(0);

  useEffect(() => {
    const source = new EventSource("/api/telemetry");

    source.onopen = () => setConnection("live");
    // EventSource reconnects on its own after an error; this only reports it.
    source.onerror = () => setConnection("reconnecting");
    source.onmessage = (event: MessageEvent<string>) => {
      const reading = parseReading(event.data);
      if (reading) {
        setWindows((current) => addReading(current, reading, Date.now()));
      } else {
        setRejected((count) => count + 1);
      }
    };
    return () => source.close();
  }, []);

  return (
    <>
      <ConnectionStatus connection={connection} rejected={rejected} />
      {Object.entries(windows).map(([message, fields]) => (
        <section key={message} className="mt-6">
          <h2 className="text-sm font-medium tracking-wide text-gray-500 uppercase">{message}</h2>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.entries(fields).map(([field, points]) => (
              <StatTile key={field} label={field} points={points} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
