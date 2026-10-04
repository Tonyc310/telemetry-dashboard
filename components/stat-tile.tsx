import type { Summary } from "@/lib/rolling-window";

// A fixed locale, so the same number never renders differently on two machines.
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

/** One field's latest value, with its range over the window. */
export function StatTile({ label, summary }: { label: string; summary: Summary | undefined }) {
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
    </div>
  );
}
