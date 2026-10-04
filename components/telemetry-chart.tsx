import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Point } from "@/lib/rolling-window";

const time = new Intl.DateTimeFormat("en-US", { timeStyle: "medium" });

/** A field's values over the window, oldest on the left. */
export function TelemetryChart({ points }: { points: Point[] }) {
  return (
    <div className="mt-3 h-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} hide />
          <YAxis domain={["auto", "auto"]} hide />
          <Tooltip labelFormatter={(label) => time.format(Number(label))} />
          {/* A new point every second would otherwise restart the draw-in animation each time. */}
          <Line
            dataKey="value"
            type="monotone"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
