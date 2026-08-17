import { DocPage } from "../DocPage";

const CONCERNS: { title: string; body: string }[] = [
  { title: "Authentication", body: "Confirming the subscriber is who the SIM/session claims, at the level the operator already relies on for USSD today." },
  { title: "Authorization", body: "Confirming the authenticated subscriber may perform the requested action on the requested account or line." },
  { title: "Message integrity", body: "Confirming an envelope wasn't altered in transit — this prototype's sequence check guards ordering only, not tampering." },
  { title: "Session binding", body: "Tying a structured UI session to the exact same underlying USSD session — a rendered screen must not be replayable into a different session." },
  { title: "Secure transport", body: "Protocol messages carry the same sensitivity as the USSD payloads they augment and need equivalent transport protection." },
  { title: "Replay protection", body: "A captured UserAction (especially a confirm or PIN submission) must not be replayable to repeat a transaction." },
  { title: "Transaction confirmation", body: "Every value-moving action stops at an explicit confirmation screen before the service executes it — modeled in this prototype's Confirm component." },
  { title: "Timeout", body: "Structured sessions should not outlive the timeout behavior subscribers and gateways already expect from USSD." },
  { title: "Fraud prevention", body: "Structured input doesn't remove the operator's existing fraud controls — it should feed them better data (typed actions instead of parsed free text), not bypass them." },
  { title: "Input validation", body: "Client-side validation is a UX convenience only; a production service must revalidate every field server-side, as this prototype's service layer does defensively for custom amounts." },
  { title: "Privacy", body: "PIN-kind inputs should never appear in logs, protocol inspectors, or crash reports in a production build — this prototype's own inspector and trace panels are review tools, not a shape a real deployment should expose to end users." },
];

export function Security() {
  return (
    <DocPage title="Security Model" badge="Documented concerns — not a security implementation">
      <p>
        This is a UI and architecture proof of concept. It does not implement production security controls, and
        nothing below should be read as a claim that it does. No production cryptography is implemented or faked
        anywhere in this repository.
      </p>

      <h2>The handset is never the authority</h2>
      <p>
        This holds on both the direct simulator path and the network-simulation path: the handset is never the
        authority for <strong>price</strong>, <strong>balance</strong>, <strong>eligibility</strong>, or{" "}
        <strong>transaction success</strong>. All four are decided by the Telco/service layer and never trusted
        from client input — a device can display a number the service sent it, but nothing lets a device assert
        one back and have it believed.
      </p>

      {CONCERNS.map((c) => (
        <div key={c.title}>
          <h2>{c.title}</h2>
          <p>{c.body}</p>
        </div>
      ))}

      <h2>What the network-simulation layer adds — and doesn't</h2>
      <p>
        The <code>USSDUIAdapter</code> tracks an expected sequence number and rejects an out-of-order envelope.
        That's a basic ordering guard illustrating the shape of the problem — it is not message integrity
        (nothing is signed), not authentication, and not production-grade replay protection.
      </p>
    </DocPage>
  );
}
