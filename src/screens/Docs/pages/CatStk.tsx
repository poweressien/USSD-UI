import { DocPage } from "../DocPage";

export function CatStk() {
  return (
    <DocPage title="USSD vs CAT/STK vs USSD 2.0">
      <p>
        Two real, deployed technologies already touch this space. This proposal is closer to the first than the
        second, and doesn't attempt to replace either.
      </p>

      <h2>Traditional USSD</h2>
      <ul>
        <li>Network-driven: the service on the operator's side controls every screen.</li>
        <li>Session-oriented, with short server-defined timeouts.</li>
        <li>Interaction is plain text and numeric reply only.</li>
        <li>Universally supported — this is its core strength.</li>
      </ul>

      <h2>SIM Toolkit / CAT / USAT</h2>
      <ul>
        <li>UICC/SIM-driven: menus and logic live on the SIM itself, not the network session.</li>
        <li>Uses proactive commands the SIM issues to the handset (display menu, get input, and similar).</li>
        <li>Does support structured menus and input today, standardized through telecom and smart-card specifications.</li>
        <li>Requires SIM-side provisioning — changing the menu means reprovisioning SIM applications, not shipping a network-side update.</li>
      </ul>

      <h2>Proposed Interactive USSD Presentation Layer</h2>
      <ul>
        <li>Network/service-driven, like traditional USSD — no SIM application involved.</li>
        <li>Sends structured UI messages instead of (or alongside) plain text.</li>
        <li>Interactive controls: buttons, validated inputs, confirmations.</li>
        <li>Requires capability negotiation and a classic-USSD fallback for unsupported handsets.</li>
        <li>Proposed and experimental — not an existing, adopted mechanism.</li>
      </ul>

      <p>
        In short: this proposal keeps USSD's network-driven update model (change the service, not the SIM) while
        borrowing CAT/STK's idea that a session can present more than plain numbered text — without requiring
        SIM provisioning to do it.
      </p>
    </DocPage>
  );
}
