import { DocPage } from "../DocPage";

export function FutureWork() {
  return (
    <DocPage title="Future Work">
      <h2>Standards engagement</h2>
      <p>
        Share this proposal with relevant standards and industry bodies for feedback before treating any part of
        the protocol as stable. Version <code>0.1</code> should be read as a discussion draft.
      </p>
      <h2>Handset and gateway pilots</h2>
      <ul>
        <li>A minimal handset-side renderer (even a reference Android proof of concept) to test real parsing and rendering constraints.</li>
        <li>A gateway-side pilot translating one low-risk existing USSD flow (e.g. balance check) into USSD-UI messages.</li>
      </ul>
      <h2>Protocol hardening</h2>
      <ul>
        <li>A formal, versioned schema (this prototype's Zod schema is a starting point, not a spec).</li>
        <li>Capability negotiation is now implemented (see Network) — still open: message integrity and authentication underneath it, and a real byte-level transport encoding (a JSON envelope isn't realistic for USSD's constrained payload size as-is).</li>
        <li>A defined upgrade/downgrade path across protocol versions.</li>
        <li>A capability cache/registry so negotiation doesn't need to be re-established on every single dial.</li>
      </ul>
      <h2>Accessibility and localization</h2>
      <p>
        Structured components open the door to screen-reader support, larger touch targets, and per-market
        localization that a numeric menu can't offer — none of which this prototype has tested with real assistive
        technology yet.
      </p>
      <h2>Security review</h2>
      <p>
        An independent review against the concerns listed in <code>Security Model</code> before any pilot carries
        real value-moving transactions.
      </p>
    </DocPage>
  );
}
