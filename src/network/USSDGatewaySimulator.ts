import { CARRIERS } from "../data/carriers/carriers";
import type { TraceRecorder } from "./TraceRecorder";

export class USSDGatewayError extends Error {}

/**
 * Represents the USSD gateway/infrastructure a Telco already runs
 * today. This is the layer this proposal deliberately does NOT change
 * — see /docs/telco-integration.md — so it stays deliberately dumb: it
 * only knows how to admit a session for a real dial code against a
 * known carrier. It has no notion of USSD-UI, capability, or
 * structured screens at all.
 */
export class USSDGatewaySimulator {
  private readonly trace: TraceRecorder;

  constructor(trace: TraceRecorder) {
    this.trace = trace;
  }

  openSession(dialCode: string, carrierId: string): void {
    const carrier = CARRIERS.find((c) => c.id === carrierId);
    if (!carrier) {
      throw new USSDGatewayError(`Unknown carrier: "${carrierId}"`);
    }
    if (carrier.dialCode !== dialCode) {
      throw new USSDGatewayError(`"${dialCode}" is not a recognised dial code for ${carrier.name}`);
    }
    this.trace.record("USSD GATEWAY", `Session admitted (${dialCode}, ${carrier.name})`);
  }
}
