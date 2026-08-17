import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CARRIERS, findCarrierByDialCode } from "../../data/carriers/carriers";
import { PhoneFrame } from "../../components/ui/PhoneFrame";
import { DialPad, type DialStatus } from "../../components/simulator/DialPad";
import { DemoBadge } from "../../components/simulator/DemoBadge";
import { cn } from "../../lib/cn";

const DIAL_DELAY_MS = 500;

export function Welcome() {
  const navigate = useNavigate();
  const [simSlot, setSimSlot] = useState<1 | 2>(1);
  const [dialed, setDialed] = useState("");
  const [status, setStatus] = useState<DialStatus>("idle");

  function call() {
    const carrier = findCarrierByDialCode(dialed);
    if (!carrier) {
      setStatus("error");
      setDialed("");
      return;
    }
    setStatus("dialing");
    setTimeout(() => {
      navigate("/simulate", { state: { carrierId: carrier.id, simSlot } });
    }, DIAL_DELAY_MS);
  }

  function edit(next: string) {
    if (status === "error") setStatus("idle");
    setDialed(next);
  }

  return (
    <div className="schematic-grid">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-[1fr_340px] md:items-center">
        <div>
          <DemoBadge label="Proof of concept" />
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            USSD <span className="text-accent-strong">2.0</span>
          </h1>
          <p className="mt-3 max-w-md text-lg text-text-muted">
            An interactive presentation layer for Telco USSD services — the same session, the same protocol, a
            structured UI instead of a bare numbered list.
          </p>
          <p className="mt-4 max-w-md text-sm text-text-faint">
            Dial a demo network's USSD code on the right, just like a real handset, to start a session and walk
            through a real purchase flow rendered two ways: the proposed interactive layer, and the classic
            fallback every handset already supports.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-text-faint">
            <span className="rounded border border-border px-2 py-1 font-mono">TypeScript</span>
            <span className="rounded border border-border px-2 py-1 font-mono">React</span>
            <span className="rounded border border-border px-2 py-1 font-mono">USSD-UI v0.1 (draft)</span>
          </div>
        </div>

        <PhoneFrame>
          <div className="flex h-full flex-col justify-between overflow-y-auto p-4">
            <div>
              <p className="font-display text-base font-semibold">USSD 2.0</p>
              <p className="text-[11px] text-text-faint">Proof of Concept — dial to begin</p>

              <div className="mt-3">
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-text-faint">SIM</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[1, 2].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSimSlot(slot as 1 | 2)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-xs font-medium",
                        simSlot === slot
                          ? "border-accent bg-accent-soft text-accent-strong"
                          : "border-border-strong text-text-muted hover:text-text",
                      )}
                    >
                      SIM {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <DialPad
                  value={dialed}
                  onChange={edit}
                  onCall={call}
                  status={status}
                  errorMessage="Connection problem or invalid code"
                />
              </div>
            </div>

            <div className="mt-3 shrink-0">
              <p className="mb-1.5 text-center text-[10px] uppercase tracking-wide text-text-faint">
                Demo networks — tap to fill
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {CARRIERS.map((carrier) => (
                  <button
                    key={carrier.id}
                    type="button"
                    onClick={() => edit(carrier.dialCode)}
                    className="rounded-md border border-border-strong px-2 py-1 text-[11px] text-text-muted hover:border-accent/50 hover:text-text"
                  >
                    {carrier.name} <span className="font-mono text-text-faint">{carrier.dialCode}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}
