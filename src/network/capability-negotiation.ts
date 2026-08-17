import { USSD_UI_VERSION } from "../protocol/types";
import type { DeviceCapability } from "../data/devices/capabilityProfiles";
import type { CapabilityRequestPayload, CapabilityResponsePayload } from "./types";

/**
 * The set of component/navigation features the adapter can negotiate.
 * This intentionally mirrors the component kinds in
 * src/protocol/schemas/screenMessage.schema.ts, but as a flat string
 * list — a real handshake negotiates capability tags, not TypeScript
 * types.
 */
export const NEGOTIABLE_FEATURES = ["button", "input", "select", "confirm", "navigation"] as const;
export type NegotiableFeature = (typeof NEGOTIABLE_FEATURES)[number];

export const ADAPTER_SUPPORTED_VERSIONS: readonly string[] = [USSD_UI_VERSION];
export const ADAPTER_SUPPORTED_FEATURES: readonly NegotiableFeature[] = NEGOTIABLE_FEATURES;

/**
 * Pure negotiation function: given what the device claims, decide what
 * (if anything) is mutually supported. This is the actual handshake
 * logic — see USSDUIAdapter for where it's wired into the traced,
 * enveloped exchange.
 */
export function negotiateCapability(request: CapabilityRequestPayload): CapabilityResponsePayload {
  const version = request.supportedVersions.find((v) => ADAPTER_SUPPORTED_VERSIONS.includes(v));

  if (!version) {
    return {
      accepted: false,
      protocol: "USSD-UI",
      reason:
        request.supportedVersions.length === 0
          ? "Device declared no supported USSD-UI protocol version"
          : `No overlapping protocol version (device offered: ${request.supportedVersions.join(", ")})`,
    };
  }

  const features = request.features.filter((f) => ADAPTER_SUPPORTED_FEATURES.includes(f as NegotiableFeature));
  if (features.length === 0) {
    return { accepted: false, protocol: "USSD-UI", reason: "No overlapping supported features" };
  }

  return { accepted: true, protocol: "USSD-UI", version, features };
}

/**
 * Bridges the existing (simpler) DeviceCapability profile — used by the
 * direct Simulate/Compare screens — into a real CapabilityRequestPayload
 * for the network-simulation path, so both paths describe the same two
 * demo device profiles rather than maintaining unrelated ones.
 *
 * An "unsupported" device still sends a request here (with empty
 * arrays) so the negotiation failure is visible in the trace. A real
 * legacy handset would not send this message at all — see
 * /docs/capability-negotiation.md.
 */
export function capabilityRequestFromDevice(capability: DeviceCapability): CapabilityRequestPayload {
  if (!capability.supportsUssdUi) {
    return { supportedVersions: [], features: [] };
  }

  const features: string[] = [];
  if (capability.features.buttons) features.push("button");
  if (capability.features.inputs) features.push("input", "select");
  if (capability.features.navigation) features.push("navigation");
  if (capability.features.confirmation) features.push("confirm");

  return { supportedVersions: [capability.protocolVersion], features };
}
