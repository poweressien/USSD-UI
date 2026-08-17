import { Link } from "react-router-dom";
import { DocPage } from "../DocPage";

export function CapabilityNegotiation() {
  return (
    <DocPage title="Capability Negotiation">
      <p>
        This repository models capability negotiation two ways, at different levels of rigor —
        both remain available and both are real, tested code.
      </p>

      <h2>The simple model — Simulate, Compare</h2>
      <p>
        A boolean-driven <code>DeviceCapability</code> resolved by one pure function,{" "}
        <code>resolveRenderMode()</code>. Deliberately simple and freely toggleable for a fast
        live demo — flip the device switch in the header on{" "}
        <Link className="underline" to="/simulate">Simulate</Link> and the same session
        immediately re-renders through the classic path. It does not model an actual
        request/response exchange.
      </p>

      <h2>The real handshake — Network</h2>
      <p>
        <code>src/network/</code> replaces the boolean with an actual negotiated exchange:
      </p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-black/30 p-4 font-mono text-xs leading-relaxed text-text-muted">
{`DEVICE → NETWORK: CAPABILITY_REQUEST   { supportedVersions, features }
NETWORK → DEVICE: CAPABILITY_RESPONSE  { accepted, version?, features?, reason? }`}
      </pre>
      <p>
        <code>negotiateCapability()</code> intersects what the device claims against what the
        adapter supports, and can accept, accept a reduced feature set, or reject with a stated
        reason. Unlike the simple model, each negotiation is a full, real exchange, not a flipped
        boolean — the "Interactive Device" / "Legacy Device" buttons on{" "}
        <Link className="underline" to="/network">Network</Link> each dial fresh and run a new
        handshake, rather than instantly toggling a result you're locked into. Try it: choose
        "Legacy Device" and watch the rejection get traced in real time.
      </p>

      <h2>Fallback is not a degraded mode</h2>
      <p>
        The classic renderer consumes the identical <code>ScreenDef</code> the interactive
        renderer receives, on both paths — a rejected negotiation on Network receives the exact
        same <code>ScreenMessage</code> an accepted one does, proven directly in{" "}
        <code>tests/network/adapter-flow.test.ts</code>.
      </p>
    </DocPage>
  );
}
