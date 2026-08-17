import { DocPage } from "../DocPage";
import { Link } from "react-router-dom";

export function ExecutiveSummary() {
  return (
    <DocPage title="Executive Summary" badge="For technical review">
      <p>
        USSD 2.0 is a working proof of concept for an interactive presentation layer over Telco USSD services. It
        proposes that a service can send a structured screen description instead of a bare numbered list, and that
        a compatible handset can render that description as tappable controls — while a handset that doesn't
        support this falls back to the classic numbered menu automatically, on the same service, in the same
        session.
      </p>
      <h2>What is included</h2>
      <ul>
        <li>A working prototype: interactive menus, custom-amount input, confirmation, processing, success/error, and retry.</li>
        <li>A draft wire protocol (<strong>USSD-UI v0.1 — Experimental Draft</strong>) with a parser, a semantic validator, and a generic renderer that never hard-codes a screen.</li>
        <li>A layered network-simulation reference architecture on <Link className="underline" to="/network">Network</Link> — a real capability handshake, a sequenced protocol envelope, and a live network trace, in <code>src/network/</code>.</li>
        <li>Capability negotiation at two levels of rigor: a simple toggle for a fast demo, and a real negotiated exchange — both fall back to rendering the same protocol message as classic USSD.</li>
        <li>Architecture, protocol, security, and integration documentation aimed at engineers, not a pitch deck.</li>
      </ul>
      <h2>What is not included</h2>
      <ul>
        <li>No connection to any real carrier, gateway, or subscriber data.</li>
        <li>No claim that any existing handset already renders this — see <Link className="underline" to="/docs/compatibility">Compatibility</Link>.</li>
        <li>No claim that this is an adopted or existing 3GPP/ETSI/GSMA standard — see <Link className="underline" to="/docs/protocol">Protocol</Link>.</li>
        <li>No claim that the protocol envelope is a real or proposed USSD wire encoding — see <Link className="underline" to="/docs/wire-transport">Wire / Transport</Link>.</li>
      </ul>
      <h2>How to review this</h2>
      <p>
        The fastest path is <Link className="underline" to="/demo">Demo Mode</Link>, a guided sequence covering
        the whole system — including the network architecture — in five to ten minutes. For a hands-on look,
        start a session directly in <Link className="underline" to="/simulate">Simulate</Link>, or see the full
        negotiated handshake in <Link className="underline" to="/network">Network</Link>.
      </p>
    </DocPage>
  );
}

export function Problem() {
  return (
    <DocPage title="Problem">
      <p>
        USSD remains the most reliable channel a Telco has: it needs no data connection, no app install, and works
        on the cheapest handset in circulation. That reach is exactly why its interaction model matters — and it
        hasn't changed materially in over two decades.
      </p>
      <h2>What the numbered-menu model costs</h2>
      <ul>
        <li><strong>No visual hierarchy.</strong> Every option is an equally-weighted digit; nothing signals what's common, risky, or destructive.</li>
        <li><strong>High mis-entry rate.</strong> A single mistyped digit on a nested menu means restarting the session from `*123#`.</li>
        <li><strong>No input protection.</strong> PINs and amounts are typed as plain digits in the same reply box as menu choices, with no masking.</li>
        <li><strong>Poor discoverability.</strong> Deep flows (data bundles, transfers, gifting) are hard to browse; users memorize sequences instead of exploring options.</li>
        <li><strong>No localization signal beyond text.</strong> Icons, grouping, and emphasis — tools that help low-literacy and low-vision users — aren't available.</li>
        <li><strong>Session timeouts compound all of the above</strong>, since most gateways allow well under a minute of think time per screen.</li>
      </ul>
      <p>
        None of this is a criticism of USSD as infrastructure — it is a strength of USSD as infrastructure that
        exposes a weakness in USSD as an interface. The two are separable, which is the premise the rest of this
        proposal builds on.
      </p>
    </DocPage>
  );
}
