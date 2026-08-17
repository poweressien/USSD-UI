import type { DeviceCapability } from "../../data/devices/capabilityProfiles";

export type RenderMode = "interactive" | "classic";

/**
 * The whole point of capability negotiation: one Telco service, one
 * protocol message — the handset alone decides how it gets rendered.
 * A device that can't (or won't) render the interactive layer always
 * falls back to classic numbered USSD for the exact same operation.
 */
export function resolveRenderMode(capability: DeviceCapability): RenderMode {
  return capability.supportsUssdUi ? "interactive" : "classic";
}

export function describeCapability(capability: DeviceCapability): string {
  return capability.supportsUssdUi
    ? `USSD-UI v${capability.protocolVersion} supported`
    : "USSD-UI unsupported — classic USSD only";
}
