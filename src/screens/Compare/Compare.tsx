import { useLocation } from "react-router-dom";
import { PhoneFrame } from "../../components/ui/PhoneFrame";
import { Button } from "../../components/ui/Button";
import { ScreenRenderer } from "../../components/ussd/ScreenRenderer";
import { ClassicUssdRenderer } from "../../components/ussd/ClassicUssdRenderer";
import { DemoBadge } from "../../components/simulator/DemoBadge";
import { useUssdSession } from "../../app/providers/useUssdSession";
import { getCarrier } from "../../data/carriers/carriers";

interface LocationState {
  carrierId?: string;
  simSlot?: 1 | 2;
}

export function Compare() {
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const carrier = getCarrier(state.carrierId ?? "mtn");
  const simSlot = state.simSlot ?? 1;

  const session = useUssdSession(carrier.name, simSlot);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Classic USSD vs USSD 2.0</h1>
          <p className="text-sm text-text-muted">
            One protocol message, two renderers. Tap either phone — both stay in sync because it's the same
            underlying session.
          </p>
        </div>
        <DemoBadge label={`${carrier.name} · SIM ${simSlot}`} />
      </div>

      <div className="mt-8 grid gap-10 sm:grid-cols-2">
        <PhoneFrame label="Classic USSD">
          {session.currentMessage ? (
            <ClassicUssdRenderer
              screen={session.currentMessage.screen}
              onAction={session.handleAction}
              onNavigate={session.handleNavigate}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-text-faint">Dialing…</div>
          )}
        </PhoneFrame>

        <PhoneFrame label="USSD 2.0">
          {session.currentMessage ? (
            <ScreenRenderer
              screen={session.currentMessage.screen}
              onAction={session.handleAction}
              onNavigate={session.handleNavigate}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-text-faint">Dialing…</div>
          )}
        </PhoneFrame>
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="secondary" onClick={session.restart}>
          ↻ Restart Both
        </Button>
      </div>
    </div>
  );
}
