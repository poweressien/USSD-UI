import { DocPage } from "../DocPage";
import { Link } from "react-router-dom";

export function ProposedSolution() {
  return (
    <DocPage title="Proposed Solution">
      <p>
        Introduce an <strong>Interactive USSD Presentation Layer</strong> between the Telco's existing USSD service
        logic and the subscriber's handset. The service keeps deciding what happens — products, pricing, billing,
        eligibility — and additionally describes each screen as a small structured message instead of (or in
        addition to) a plain-text menu string.
      </p>
      <h2>What changes</h2>
      <ul>
        <li>The USSD payload gains an optional structured screen description (see <Link className="underline" to="/docs/protocol">Protocol</Link>).</li>
        <li>A capable handset renders that description as buttons, inputs, and confirmations.</li>
        <li>Every screen still maps to the same session, the same billing event, and the same fallback text a legacy phone would see.</li>
      </ul>
      <h2>What doesn't change</h2>
      <ul>
        <li>The dial code, the session model, and the operator's backend systems are untouched.</li>
        <li>A subscriber on an unsupported handset sees exactly what they see today — see <Link className="underline" to="/docs/compatibility">Compatibility</Link>.</li>
      </ul>
      <h2>Why a presentation layer, not a new channel</h2>
      <p>
        Building a new app-based channel already exists (USSD apps, banking apps) and it fragments reach back down
        to smartphone owners with data. Traditional USSD remains available on legacy terminals; USSD-UI requires
        terminal support, and a terminal without it simply continues using the session it already has today (see{" "}
        <Link className="underline" to="/docs/compatibility">Compatibility</Link>). The value of this proposal is
        that the underlying session never narrows to only capable handsets — only the presentation does. See{" "}
        <Link className="underline" to="/docs/telco-integration">Telco Integration</Link> for
        where this sits relative to a carrier's existing systems.
      </p>
    </DocPage>
  );
}
