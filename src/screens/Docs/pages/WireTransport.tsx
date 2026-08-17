import { DocPage } from "../DocPage";

export function WireTransport() {
  return (
    <DocPage title="Wire / Transport View" badge="Hypothetical transport representation — not an existing USSD encoding">
      <p>
        USSD today carries plain text over signaling channels defined by existing telecom
        standards. This prototype's <code>Envelope&lt;T&gt;</code> (<code>src/network/types.ts</code>)
        is this proof of concept's own illustrative structure for reasoning about a{" "}
        <em>possible</em> future encoding — it is not a claim about how any real USSD gateway,
        SS7 stack, or handset modem actually carries bytes.
      </p>

      <h2>What actually flows, in this simulation</h2>
      <pre className="overflow-x-auto rounded-lg border border-border bg-black/30 p-4 font-mono text-xs leading-relaxed text-text-muted">
{`TELCO SERVICE
  |
  v
USSD-UI ADAPTER   wraps the ScreenMessage/UserAction in an Envelope
  |
  v
NETWORK           carries the envelope, adds no content of its own
  |
  v
DEVICE`}
      </pre>
      <p>
        See the live <strong>Protocol Inspector</strong> panel on the Network page for the exact envelope
        behind whatever is currently on screen.
      </p>

      <h2>What a real encoding would have to answer, and doesn't here</h2>
      <ul>
        <li>How this maps onto existing USSD's constrained payload size and character set — a verbose JSON envelope is not a realistic wire format as-is.</li>
        <li>Whether encoding happens in the gateway, a new signaling extension, or a different bearer entirely.</li>
        <li>Compression, binary encoding, or a more compact schema than illustrative JSON.</li>
      </ul>
      <p>
        None of this is designed here. The envelope's job in this prototype is to make the
        architecture — negotiation, sequencing, message typing — concrete and testable, not to
        propose a byte-level encoding.
      </p>
    </DocPage>
  );
}
