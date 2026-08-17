import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PhoneFrame } from "../../components/ui/PhoneFrame";
import { Button } from "../../components/ui/Button";
import { ScreenRenderer } from "../../components/ussd/ScreenRenderer";
import { ClassicUssdRenderer } from "../../components/ussd/ClassicUssdRenderer";
import { ProtocolInspector } from "../../components/protocol/ProtocolInspector";
import { SessionInspector } from "../../components/protocol/SessionInspector";
import { DemoBadge } from "../../components/simulator/DemoBadge";
import { useUssdSession, type ForceOutcome } from "../../app/providers/useUssdSession";
import { useCapability } from "../../app/providers/useCapability";
import { getCarrier } from "../../data/carriers/carriers";
import { cn } from "../../lib/cn";

interface LocationState {
  carrierId?: string;
  simSlot?: 1 | 2;
}

const FORCE_OPTIONS: { value: ForceOutcome; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "success", label: "Always succeed" },
  { value: "failure", label: "Always fail" },
];

export function Simulate() {
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const carrier = getCarrier(state.carrierId ?? "mtn");
  const simSlot = state.simSlot ?? 1;

  const { renderMode, setSupported } = useCapability();
  const session = useUssdSession(carrier.name, simSlot);
  const [showProtocol, setShowProtocol] = useState(false);
  const [showSession, setShowSession] = useState(false);

  // Every fresh visit to Simulate starts from the "supported" baseline,
  // regardless of what an earlier visit left the toggle set to — so a
  // presenter jumping in from Demo Mode always sees the interactive
  // renderer first, and still has the toggle available to demonstrate
  // fallback from there.
  useEffect(() => {
    setSupported(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Simulate</h1>
          <p className="text-sm text-text-muted">
            Demo Network: <span className="text-text">{carrier.name}</span> · SIM {simSlot}
          </p>
        </div>
        <DemoBadge label={`Rendering: ${renderMode === "interactive" ? "USSD 2.0" : "Classic USSD"}`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-4">
          <PhoneFrame label={renderMode === "interactive" ? "USSD 2.0" : "Classic USSD"}>
            {session.currentMessage ? (
              renderMode === "interactive" ? (
                <ScreenRenderer
                  screen={session.currentMessage.screen}
                  onAction={session.handleAction}
                  onNavigate={session.handleNavigate}
                />
              ) : (
                <ClassicUssdRenderer
                  screen={session.currentMessage.screen}
                  onAction={session.handleAction}
                  onNavigate={session.handleNavigate}
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-text-faint">Dialing…</div>
            )}
          </PhoneFrame>

          <Button variant="secondary" onClick={session.restart}>
            ↻ Restart Session
          </Button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-faint">
              Presenter Controls
            </p>
            <p className="mb-2 text-xs text-text-muted">
              Force the next transaction outcome — useful for reliably demonstrating error recovery.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FORCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => session.setForceOutcome(opt.value)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs",
                    session.forceOutcome === opt.value
                      ? "border-accent bg-accent-soft text-accent-strong"
                      : "border-border-strong text-text-muted hover:text-text",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowProtocol((v) => !v)}>
              {showProtocol ? "Hide" : "Inspect"} Protocol
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowSession((v) => !v)}>
              {showSession ? "Hide" : "Inspect"} Session
            </Button>
          </div>

          {showProtocol && (
            <ProtocolInspector message={session.currentMessage} lastAction={session.lastUserAction} />
          )}
          {showSession && <SessionInspector session={session.session} />}
        </div>
      </div>
    </div>
  );
}
