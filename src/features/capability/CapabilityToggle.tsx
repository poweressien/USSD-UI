import { useCapability } from "../../app/providers/useCapability";
import { describeCapability } from "../../services/simulator/capability";

export function CapabilityToggle() {
  const { capability, setSupported } = useCapability();

  return (
    <button
      type="button"
      onClick={() => setSupported(!capability.supportsUssdUi)}
      title="Simulate a handset without USSD-UI support"
      className="flex items-center gap-2 rounded-full border border-border-strong bg-surface-raised px-3 py-1.5 text-xs text-text-muted hover:border-accent/50 hover:text-text"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${capability.supportsUssdUi ? "bg-success" : "bg-text-faint"}`}
        aria-hidden="true"
      />
      <span className="font-mono">{describeCapability(capability)}</span>
    </button>
  );
}
