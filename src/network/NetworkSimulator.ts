import type { AnyEnvelope } from "./types";
import type { TraceRecorder } from "./TraceRecorder";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Represents the mobile network transport between the device and the
 * existing USSD infrastructure. It does not interpret envelopes at
 * all — its only job is to carry them and record that a hop happened,
 * which is exactly what a transport layer should know. `latencyMs`
 * defaults to 0 so tests stay fast and deterministic; the UI wires in
 * a small delay purely for a readable, non-instant trace.
 */
export class NetworkSimulator {
  private readonly trace: TraceRecorder;
  private readonly latencyMs: number;

  constructor(trace: TraceRecorder, latencyMs = 0) {
    this.trace = trace;
    this.latencyMs = latencyMs;
  }

  async toNetwork<T extends AnyEnvelope>(envelope: T, label: string): Promise<T> {
    if (this.latencyMs > 0) await delay(this.latencyMs);
    this.trace.record("DEVICE → NETWORK", label, { messageType: envelope.messageType, sequence: envelope.sequence });
    return envelope;
  }

  async toDevice<T extends AnyEnvelope>(envelope: T, label: string): Promise<T> {
    if (this.latencyMs > 0) await delay(this.latencyMs);
    this.trace.record("NETWORK → DEVICE", label, { messageType: envelope.messageType, sequence: envelope.sequence });
    return envelope;
  }
}
