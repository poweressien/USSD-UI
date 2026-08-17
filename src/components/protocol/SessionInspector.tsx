import type { Session } from "../../session/session-manager";

const STATUS_TONE: Record<Session["status"], string> = {
  active: "text-success",
  cancelled: "text-danger",
  completed: "text-accent-strong",
  expired: "text-text-faint",
};

export function SessionInspector({ session }: { session: Session | null }) {
  if (!session) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-text-faint">Session Inspector</p>
        <p className="mt-2 text-xs text-text-faint">No session yet.</p>
      </div>
    );
  }

  const rows: [string, string][] = [
    ["ID", session.id],
    ["Carrier", session.carrier],
    ["SIM", `SIM ${session.simSlot}`],
    ["Current Screen", session.currentScreen],
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-3 font-mono text-xs">
      <p className="uppercase tracking-widest text-text-faint">Session Inspector</p>
      <dl className="space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="text-text-faint">{label}</dt>
            <dd className="truncate text-text">{value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="mb-1 text-text-faint">History</p>
        <ol className="space-y-0.5 text-text-muted">
          {session.history.map((screenId, i) => (
            <li key={`${screenId}-${i}`}>
              {i + 1}. {screenId}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-text-faint">Status</span>
        <span className={STATUS_TONE[session.status]}>{session.status}</span>
      </div>
    </div>
  );
}
