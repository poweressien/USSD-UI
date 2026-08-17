import type { AnyEnvelope } from "../../network/types";
import { Badge } from "../ui/Badge";

export function WireView({ envelope }: { envelope: AnyEnvelope | null }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-widest text-text-faint">Wire / Transport View</p>
        {envelope && <Badge tone="neutral">{envelope.messageType}</Badge>}
      </div>
      <p className="mb-2 text-[11px] leading-relaxed text-text-faint">
        Proposed / hypothetical transport representation — not an existing USSD encoding. Real USSD does not
        currently transport this JSON representation; it exists only to make this proof of concept's protocol
        concrete and testable.
      </p>
      {envelope ? (
        <pre className="no-scrollbar max-h-64 overflow-auto rounded-md bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-accent-strong">
          {JSON.stringify(envelope, null, 2)}
        </pre>
      ) : (
        <p className="text-xs text-text-faint">No message on the wire yet.</p>
      )}
    </div>
  );
}
