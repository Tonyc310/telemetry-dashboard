export type Connection = "connecting" | "live" | "reconnecting";

const LOOK: Record<Connection, { dot: string; text: string }> = {
  connecting: { dot: "bg-gray-400", text: "Connecting…" },
  live: { dot: "bg-green-500", text: "Live" },
  reconnecting: { dot: "bg-amber-500", text: "Reconnecting…" },
};

/** The stream's state, plus how many invalid events have been ignored. */
export function ConnectionStatus({
  connection,
  rejected,
}: {
  connection: Connection;
  rejected: number;
}) {
  const { dot, text } = LOOK[connection];

  return (
    <p className="mt-2 flex items-center gap-2 text-sm text-gray-600" role="status">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      {text}
      {rejected > 0 && <span>· {rejected} invalid events ignored</span>}
    </p>
  );
}
