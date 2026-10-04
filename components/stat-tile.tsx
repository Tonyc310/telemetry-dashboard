import { TelemetryChart } from "@/components/telemetry-chart";
import { summarize, type Point } from "@/lib/rolling-window";

// A fixed locale, so the same number never renders differently on two machines.
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

/** One field's latest value, its range over the window, and a chart of its recent history. */
export function StatTile({ label, points }: { label: string; points: Point[] }) {
  const summary = summarize(points);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">
        {summary ? number.format(summary.latest) : "–"}
      </div>
      {summary && (
        <div className="mt-1 text-xs text-gray-500 tabular-nums">
          min {number.format(summary.min)} · max {number.format(summary.max)}
        </div>
      )}
      <TelemetryChart points={points} />
    </div>
  );
}
