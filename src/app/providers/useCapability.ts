import { useContext } from "react";
import { CapabilityContext, type CapabilityContextValue } from "./capabilityContext";

export function useCapability(): CapabilityContextValue {
  const ctx = useContext(CapabilityContext);
  if (!ctx) throw new Error("useCapability must be used within a CapabilityProvider");
  return ctx;
}
