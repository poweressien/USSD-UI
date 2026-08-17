import type { TraceEvent } from "../../network/TraceRecorder";

const HOP_TONE: Record<string, string> = {
  "DEVICE → NETWORK": "text-accent-strong",
  "NETWORK → DEVICE": "text-info",
  "USSD GATEWAY": "text-text-faint",
  "USSD-UI ADAPTER": "text-success",
  "TELCO SERVICE": "text-text-muted",
};

export function NetworkTracePanel({ events }: { events: TraceEvent[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-faint">Network Trace</p>
      {events.length === 0 ? (
        <p className="text-xs text-text-faint">No traffic yet.</p>
      ) : (
        <ol className="no-scrollbar max-h-72 space-y-2 overflow-y-auto font-mono text-[11px] leading-relaxed">
          {events.map((event) => (
            <li key={event.id} className="border-l-2 border-border-strong pl-2">
              <div className={HOP_TONE[event.hop] ?? "text-text-muted"}>{event.hop}</div>
              <div className="text-text">{event.label}</div>
              {event.meta && (
                <div className="truncate text-text-faint">{JSON.stringify(event.meta)}</div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
