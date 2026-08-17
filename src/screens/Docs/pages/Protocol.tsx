import { DocPage } from "../DocPage";

const EXAMPLE = `{
  "protocol": "USSD-UI",
  "version": "0.1",
  "type": "screen",
  "sessionId": "demo-001",
  "screen": {
    "id": "data-plans",
    "title": "Data Plans",
    "components": [
      {
        "type": "button",
        "id": "plan_6500",
        "label": "6.5GB — ₦1,500",
        "action": "purchase_data",
        "data": { "plan": "6500MB", "amount": 1500 }
      }
    ],
    "navigation": { "back": true, "home": true, "cancel": true }
  }
}`;

export function ProtocolDoc() {
  return (
    <DocPage title="Protocol" badge="Draft reference protocol — not an existing telecom standard">
      <p>
        <strong>USSD-UI v0.1</strong> is this prototype's draft wire format. A Telco service sends a{" "}
        <code>ScreenMessage</code>; a handset renderer sends back a <code>UserAction</code> after the subscriber
        interacts with it. See <code>src/protocol/types</code> for the full TypeScript definitions and{" "}
        <code>/specification/</code> for the versioned spec documents.
      </p>
      <h2>ScreenMessage</h2>
      <pre className="overflow-x-auto rounded-lg border border-border bg-black/30 p-4 font-mono text-xs leading-relaxed text-accent-strong">
        {EXAMPLE}
      </pre>
      <h2>Component types</h2>
      <p>
        These are the building blocks a service composes into a screen instead of a block of text — the concrete
        "interactive components" idea behind the whole proposal: <code>text</code>, <code>button</code>,{" "}
        <code>input</code>, <code>select</code>, <code>confirm</code>, <code>processing</code>,{" "}
        <code>success</code>, <code>error</code>. The renderer switches on{" "}
        <code>component.type</code> alone — see <code>components/ussd/ComponentRenderer.tsx</code> — so a new
        component kind is additive, not a rewrite.
      </p>
      <h2>Input kinds</h2>
      <p>
        <code>numeric</code>, <code>currency</code>, <code>phone-number</code>, <code>text</code>, <code>pin</code>.
        Each carries its own client-side validation rule (see <code>lib/validation.ts</code>); a <code>pin</code>{" "}
        input is also masked on-screen.
      </p>
      <h2>Navigation</h2>
      <p>
        Every screen declares which of <code>back</code>, <code>home</code>, and <code>cancel</code> apply. An
        optional <code>retry</code> flag documents that a screen supports retrying its last action, independent
        of whether that screen also exposes an explicit Retry button in its component list.
      </p>
      <h2>Versioning</h2>
      <p>
        The parser rejects any <code>version</code> outside <code>SUPPORTED_PROTOCOL_VERSIONS</code>. This
        prototype supports only <code>0.1</code>; a real deployment would need an explicit negotiation step (see{" "}
        <code>specification/capability-model.md</code>) before assuming a handset understands a given version.
      </p>
    </DocPage>
  );
}
