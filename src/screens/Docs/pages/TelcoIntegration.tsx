import { DocPage } from "../DocPage";

const DIAGRAM = `Existing Telco Systems
  Billing
  Products
  Balance
  Customer services
  Transactions
        |
        v
  USSD 2.0 Adapter
        |
        v
  Structured UI Message
        |
        v
  Device Presentation Layer`;

export function TelcoIntegration() {
  return (
    <DocPage title="Telco Integration Model">
      <p>
        This proposal is a presentation and interoperability layer. It is deliberately not a replacement for any
        part of an operator's existing business logic.
      </p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-black/30 p-4 font-mono text-xs leading-relaxed text-text-muted">
        {DIAGRAM}
      </pre>
      <h2>Where the adapter sits</h2>
      <p>
        A production <code>TelcoAdapter</code> (the interface this prototype's <code>MockTelcoAdapter</code>{" "}
        implements, see <code>services/telco/TelcoAdapter.ts</code>) would sit beside the operator's existing USSD
        application, translating its existing prompts and menu logic into structured screen messages — not
        reimplementing billing, product catalogs, or balance logic.
      </p>
      <h2>Integration surface</h2>
      <ul>
        <li>Inbound: the existing service continues to decide session flow, pricing, and eligibility.</li>
        <li>Outbound: the adapter emits a <code>ScreenMessage</code> per prompt instead of (or alongside) plain text.</li>
        <li>Return path: a <code>UserAction</code> maps back onto whatever input the existing service already expects from a USSD reply.</li>
      </ul>
      <p>
        The practical implication for an operator evaluating this: adopting it would not mean rebuilding product,
        billing, or CRM systems — it would mean adding a thin translation layer in front of USSD responses that
        are already being generated today.
      </p>
    </DocPage>
  );
}
