import type { ScreenMessage, UserAction } from "../../protocol/types";

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="no-scrollbar max-h-56 overflow-auto rounded-md bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-accent-strong">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function ProtocolInspector({
  message,
  lastAction,
}: {
  message: ScreenMessage | null;
  lastAction: UserAction | null;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-text-faint">Protocol Inspector</p>

      <div>
        <p className="mb-1 text-[11px] font-medium text-text-muted">Screen message</p>
        {message ? <JsonBlock value={message} /> : <p className="text-xs text-text-faint">No message yet.</p>}
      </div>

      <div>
        <p className="mb-1 text-[11px] font-medium text-text-muted">User action</p>
        {lastAction ? (
          <JsonBlock value={lastAction} />
        ) : (
          <p className="text-xs text-text-faint">No interaction yet.</p>
        )}
      </div>
    </div>
  );
}
