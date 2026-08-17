import { createContext } from "react";
import type { DeviceCapability } from "../../data/devices/capabilityProfiles";
import type { RenderMode } from "../../services/simulator/capability";

export interface CapabilityContextValue {
  capability: DeviceCapability;
  renderMode: RenderMode;
  setSupported: (supported: boolean) => void;
}

export const CapabilityContext = createContext<CapabilityContextValue | null>(null);
