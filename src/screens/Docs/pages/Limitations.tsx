import { DocPage } from "../DocPage";

const LIMITATIONS = [
  "Does not control, hook, or intercept any real phone dialer.",
  "Does not intercept real USSD sessions on any network.",
  "Does not modify Android, iOS, or any handset OS or firmware.",
  "Does not communicate with MTN, Airtel, Glo, 9mobile, or any other operator's network.",
  "The USSD-UI protocol is experimental and has not been reviewed or adopted by any standards body.",
  "Handset-side rendering support is entirely hypothetical — no shipping handset implements this today.",
  "A production deployment would require cooperation across operators, USSD gateway vendors, and handset/OS vendors.",
  "Standards and regulatory review would be a prerequisite for any real deployment, not an afterthought.",
  "All balances, transaction outcomes, and reference numbers in this prototype are generated locally and are not real.",
  "No production security controls are implemented — the network-simulation path's sequence check is a basic ordering guard, not message integrity, authentication, or replay protection.",
  "NetworkSimulator, USSDGatewaySimulator, and USSDUIAdapter (src/network/) model a conceptual architecture only — they do not implement any real network protocol, SS7 signaling, or USSD gateway behavior.",
];

export function Limitations() {
  return (
    <DocPage title="Technical Limitations" badge="Read this before evaluating anything else in this repository">
      <p>
        Stated plainly, because accuracy matters more than making the demo look further along than it is:
      </p>
      <ul>
        {LIMITATIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>What this prototype does prove</h2>
      <p>
        That the concept — structured screens over a USSD-style session, rendered generically, with capability
        negotiation and a live legacy fallback — can be modeled, rendered, navigated, and demonstrated end to end
        as a coherent client-side system. It is evidence that the idea is buildable and reviewable, not evidence
        that the industry has adopted it.
      </p>
    </DocPage>
  );
}
