import { Link } from "react-router-dom";
import { DocPage } from "../DocPage";

const DIAGRAM = `USER
 |
 v
PHONE / TERMINAL
 |
 | dials *123#
 v
MOBILE NETWORK
 |
 v
EXISTING USSD INFRASTRUCTURE
 |
 v
USSD-UI ADAPTER / GATEWAY  --- negotiates capability with the device ---
 |
 v
TELCO SERVICE
 |
 v
STRUCTURED UI MESSAGE
 |
 v
DEVICE RENDERER
 |
 +--------------+
 v              v
SUPPORTED      LEGACY
 v              v
INTERACTIVE    CLASSIC
UI             USSD`;

export function Architecture() {
  return (
    <DocPage title="System Architecture" badge="Conceptual production architecture — proof of concept only">
      <p>
        USSD-UI v0.1 — Experimental Draft. Not an existing 3GPP, ETSI, or GSMA standard. This is the end-to-end
        path a production deployment would need, not a claim about what exists today.
      </p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-black/30 p-4 font-mono text-xs leading-relaxed text-text-muted">
        {DIAGRAM}
      </pre>

      <h2>Two implementations of this diagram, both in this repository</h2>
      <p>
        <Link className="underline" to="/simulate">Simulate</Link>/<Link className="underline" to="/compare">Compare</Link>{" "}
        implement everything from "Telco Service" downward with a client-side capability toggle
        (<code>src/services/telco/</code>). <Link className="underline" to="/network">Network</Link> implements the
        full diagram above: a real negotiated handshake, sequenced and enveloped messages, and separate classes for
        each layer (<code>src/network/</code>) — <code>DeviceSimulator</code>, <code>NetworkSimulator</code>,{" "}
        <code>USSDGatewaySimulator</code>, <code>USSDUIAdapter</code>, <code>MockTelcoService</code>. Both paths
        share one business-logic implementation: <code>MockTelcoService</code> composes the same{" "}
        <code>MockTelcoAdapter</code> the direct path uses, rather than duplicating it.
      </p>

      <h2>Layer responsibilities</h2>
      <ul>
        <li><strong>Device / Terminal</strong> — the subscriber's handset; this prototype's browser tab stands in for it.</li>
        <li><strong>Mobile Network</strong> — transport only; carries envelopes and records each hop.</li>
        <li><strong>Existing USSD Infrastructure</strong> — session admission against a real dial code, unaware of USSD-UI.</li>
        <li><strong>USSD-UI Adapter</strong> — negotiates capability, builds/validates envelopes, routes to the service.</li>
        <li><strong>Telco Service</strong> — existing operator business logic: products, pricing, eligibility, billing.</li>
        <li><strong>Device renderer</strong> — receives the message and either renders it natively or reports no support.</li>
      </ul>

      <h2>Why the split matters</h2>
      <p>
        Keeping "what to do" (the service) separate from "how to show it" (the presentation layer) is what makes
        the classic fallback free instead of a second implementation: both renderers consume the identical message
        produced by the identical service call — a rejected negotiation on <code>/network</code> receives the{" "}
        <em>exact same</em> <code>ScreenMessage</code> an accepted one does, proven directly in the test suite.
      </p>
    </DocPage>
  );
}
