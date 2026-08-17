import { useState } from "react";
import { PhoneFrame } from "../../components/ui/PhoneFrame";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ScreenRenderer } from "../../components/ussd/ScreenRenderer";
import { ClassicUssdRenderer } from "../../components/ussd/ClassicUssdRenderer";
import { NetworkTracePanel } from "../../components/protocol/NetworkTracePanel";
import { WireView } from "../../components/protocol/WireView";
import { ArchitecturePanel } from "../../components/protocol/ArchitecturePanel";
import { DemoBadge } from "../../components/simulator/DemoBadge";
import { useNetworkSession } from "../../app/providers/useNetworkSession";
import { CARRIERS } from "../../data/carriers/carriers";
import { SUPPORTED_DEVICE, UNSUPPORTED_DEVICE } from "../../data/devices/capabilityProfiles";
import type { ForceOutcome } from "../../app/providers/useUssdSession";
import { cn } from "../../lib/cn";

const ARCHITECTURE_STEPS = [
  "Device / Terminal",
  "Mobile Network",
  "Existing USSD Infrastructure",
  "USSD-UI Adapter / Gateway",
  "Telco Service",
];

const FORCE_OPTIONS: { value: ForceOutcome; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "success", label: "Always succeed" },
  { value: "failure", label: "Always fail" },
];

function ArchitectureStrip() {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface p-3 font-mono text-[11px] text-text-muted">
      {ARCHITECTURE_STEPS.map((step, i) => (
        <span key={step} className="flex items-center gap-1.5">
          <span className="rounded border border-border-strong bg-surface-raised px-2 py-1">{step}</span>
          {i < ARCHITECTURE_STEPS.length - 1 && <span className="text-text-faint">→</span>}
        </span>
      ))}
    </div>
  );
}

/** Small labeled toggle-row used for carrier / SIM / device pickers. */
function PickerRow<T extends string | number>({
  label,
  options,
  value,
  onChange,
  cols = 2,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  cols?: number;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-wide text-text-faint">{label}</p>
      <div className={cn("grid gap-1.5", cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md border px-2 py-1.5 text-xs font-medium",
              value === opt.value
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border-strong text-text-muted hover:text-text",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Network() {
  const net = useNetworkSession();

  // Lifted out of the setup step so a live device-mode switch (below) can
  // re-dial with the same carrier/SIM once a session is already running.
  const [carrierId, setCarrierId] = useState(CARRIERS[0].id);
  const [simSlot, setSimSlot] = useState<1 | 2>(1);
  const [deviceSupported, setDeviceSupported] = useState(true);

  const [showTrace, setShowTrace] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);

  function dial(supported: boolean) {
    setDeviceSupported(supported);
    net.start({ carrierId, simSlot, deviceCapability: supported ? SUPPORTED_DEVICE : UNSUPPORTED_DEVICE });
  }

  const sessionLive = net.phase === "negotiating" || net.phase === "ready";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Network Architecture</h1>
          <p className="text-sm text-text-muted">
            The full simulated path: gateway admission, a real capability handshake, enveloped and sequenced
            messages, then the Telco service.
          </p>
        </div>
        <Badge tone="info">USSD-UI v0.1 — Experimental Draft</Badge>
      </div>

      <p className="mb-6 max-w-3xl text-xs leading-relaxed text-text-faint">
        Proposal / proof of concept — not an existing 3GPP, ETSI, GSMA, or carrier standard, and not a claim that
        MTN, Airtel, Android, or existing USSD infrastructure already supports this. Every class here
        (DeviceSimulator, NetworkSimulator, USSDGatewaySimulator, USSDUIAdapter, MockTelcoService) runs locally in
        your browser — see <span className="text-text-muted">src/network/</span> — nothing contacts a real carrier.
      </p>

      <div className="mb-8">
        <ArchitectureStrip />
      </div>

      {!sessionLive && (
        <div className="space-y-4">
          {net.phase === "gateway_error" && net.gatewayError && (
            <p className="mx-auto max-w-lg rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-center text-xs text-danger">
              Gateway rejected the session: {net.gatewayError}
            </p>
          )}
          <div className="mx-auto max-w-lg space-y-6 rounded-lg border border-border bg-surface p-6">
            <PickerRow
              label="Demo Network"
              cols={4}
              value={carrierId}
              onChange={setCarrierId}
              options={CARRIERS.map((c) => ({ value: c.id, label: c.name }))}
            />
            <PickerRow
              label="SIM"
              value={simSlot}
              onChange={setSimSlot}
              options={[
                { value: 1, label: "SIM 1" },
                { value: 2, label: "SIM 2" },
              ]}
            />
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wide text-text-faint">Device</p>
              <div className="grid grid-cols-2 gap-1.5">
                <Button variant={deviceSupported ? "primary" : "secondary"} onClick={() => dial(true)}>
                  Interactive Device
                </Button>
                <Button variant={!deviceSupported ? "primary" : "secondary"} onClick={() => dial(false)}>
                  Legacy Device
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-text-faint">
                Either button dials and runs a full capability negotiation for that device — nothing is
                pre-decided.
              </p>
            </div>
          </div>
        </div>
      )}

      {sessionLive && (
        <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-4">
            <PhoneFrame label={net.renderMode === "classic" ? "Classic USSD (negotiated)" : "USSD 2.0 (negotiated)"}>
              {net.phase === "negotiating" || !net.currentMessage ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-text-faint">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
                  Negotiating capability…
                </div>
              ) : net.renderMode === "classic" ? (
                <ClassicUssdRenderer
                  screen={net.currentMessage.screen}
                  onAction={net.handleAction}
                  onNavigate={net.handleNavigate}
                />
              ) : (
                <ScreenRenderer
                  screen={net.currentMessage.screen}
                  onAction={net.handleAction}
                  onNavigate={net.handleNavigate}
                />
              )}
            </PhoneFrame>

            {net.negotiation && (
              <div className="w-full max-w-[300px] rounded-lg border border-border bg-surface p-3 text-xs">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-text-faint">
                  Negotiation result
                </p>
                {net.negotiation.accepted ? (
                  <>
                    <p className="text-success">Accepted — USSD-UI v{net.negotiation.version}</p>
                    <p className="mt-1 text-text-faint">Features: {net.negotiation.features?.join(", ")}</p>
                  </>
                ) : (
                  <>
                    <p className="text-danger">Rejected — classic fallback</p>
                    <p className="mt-1 text-text-faint">{net.negotiation.reason}</p>
                  </>
                )}
              </div>
            )}

            <DemoBadge label="Simulated network — nothing leaves your browser" />
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-faint">Demo Controls</p>

              <p className="mb-1.5 text-[11px] text-text-faint">
                Switch device — same carrier and SIM, a fresh negotiation each time
              </p>
              <div className="mb-3 grid grid-cols-2 gap-1.5">
                <Button
                  variant={deviceSupported ? "primary" : "secondary"}
                  className="text-xs"
                  onClick={() => dial(true)}
                >
                  Interactive Device
                </Button>
                <Button
                  variant={!deviceSupported ? "primary" : "secondary"}
                  className="text-xs"
                  onClick={() => dial(false)}
                >
                  Legacy Device
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Button variant="secondary" className="text-xs" onClick={net.reset}>
                  ↻ Reset Session
                </Button>
                <Button
                  variant={showTrace ? "primary" : "secondary"}
                  className="text-xs"
                  onClick={() => setShowTrace((v) => !v)}
                >
                  Network Trace
                </Button>
                <Button
                  variant={showInspector ? "primary" : "secondary"}
                  className="text-xs"
                  onClick={() => setShowInspector((v) => !v)}
                >
                  Protocol Inspector
                </Button>
                <Button
                  variant={showArchitecture ? "primary" : "secondary"}
                  className="text-xs"
                  onClick={() => setShowArchitecture((v) => !v)}
                >
                  Architecture
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-faint">
                Presenter Controls — transaction outcome
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FORCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => net.setForceOutcome(opt.value)}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-xs",
                      net.forceOutcome === opt.value
                        ? "border-accent bg-accent-soft text-accent-strong"
                        : "border-border-strong text-text-muted hover:text-text",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {showTrace && <NetworkTracePanel events={net.trace} />}
            {showInspector && <WireView envelope={net.lastEnvelope} />}
            {showArchitecture && <ArchitecturePanel />}
          </div>
        </div>
      )}
    </div>
  );
}
