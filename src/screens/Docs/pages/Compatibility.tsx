import { DocPage } from "../DocPage";
import { Link } from "react-router-dom";

export function Compatibility() {
  return (
    <DocPage title="Compatibility">
      <p>
        The proposal's one hard constraint: a subscriber on a handset that doesn't support the interactive layer
        must see exactly what they see today, on the same service, in the same session. Nothing about this
        proposal is allowed to degrade the existing experience.
      </p>
      <h2>Capability negotiation</h2>
      <p>
        Before rendering a structured screen, the handset side declares whether it supports USSD-UI and at what
        protocol version. This prototype models that as a per-device capability profile (
        <code>data/devices/capabilityProfiles.ts</code>) resolved to a render mode (
        <code>services/simulator/capability.ts</code>). Try it live: toggle the device switch in the header while
        in <Link className="underline" to="/simulate">Simulate</Link>.
      </p>
      <h2>What real-world negotiation would require</h2>
      <ul>
        <li>Handset OS or firmware support for parsing and rendering the message format.</li>
        <li>A signal the gateway can read per-session — device model, a UA-style capability header, or a SIM/UICC flag.</li>
        <li>An agreed protocol version list, since handsets will lag behind whatever version a service targets.</li>
        <li>A default-to-classic behavior on any doubt, ambiguity, or unrecognized capability signal.</li>
      </ul>
      <h2>Fallback is not a degraded mode</h2>
      <p>
        The classic renderer in this prototype (<code>components/ussd/ClassicUssdRenderer.tsx</code>) consumes
        the identical <code>ScreenDef</code> the interactive renderer receives — it is a second view of the same
        data, not a separately-maintained menu tree that can drift out of sync.
      </p>
    </DocPage>
  );
}
