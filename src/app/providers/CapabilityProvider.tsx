import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SUPPORTED_DEVICE, UNSUPPORTED_DEVICE } from "../../data/devices/capabilityProfiles";
import type { DeviceCapability } from "../../data/devices/capabilityProfiles";
import { resolveRenderMode } from "../../services/simulator/capability";
import { CapabilityContext, type CapabilityContextValue } from "./capabilityContext";

/**
 * Capability lives above any single USSD session because it describes
 * the handset, not the dial session — a real device doesn't regain or
 * lose USSD-UI support between one `*123#` dial and the next.
 */
export function CapabilityProvider({ children }: { children: ReactNode }) {
  const [capability, setCapability] = useState<DeviceCapability>(SUPPORTED_DEVICE);

  const value = useMemo<CapabilityContextValue>(
    () => ({
      capability,
      renderMode: resolveRenderMode(capability),
      setSupported: (supported: boolean) => setCapability(supported ? SUPPORTED_DEVICE : UNSUPPORTED_DEVICE),
    }),
    [capability],
  );

  return <CapabilityContext.Provider value={value}>{children}</CapabilityContext.Provider>;
}
