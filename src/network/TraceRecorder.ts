export interface TraceEvent {
  id: string;
  timestamp: string;
  /** Which hop produced this line, e.g. "DEVICE → NETWORK", "TELCO SERVICE". */
  hop: string;
  label: string;
  meta?: Record<string, unknown>;
}

let traceCounter = 0;
function generateTraceId(): string {
  traceCounter += 1;
  return `trace-${traceCounter.toString(36)}`;
}

/**
 * A plain, dependency-free event log. Every simulated layer
 * (NetworkSimulator, USSDGatewaySimulator, USSDUIAdapter, ...) is
 * handed the same TraceRecorder instance for one session and appends
 * to it — this is what the Network Trace panel renders, and what
 * tests assert against to prove a given exchange actually happened in
 * the order it claims to.
 */
export class TraceRecorder {
  private events: TraceEvent[] = [];

  record(hop: string, label: string, meta?: Record<string, unknown>): TraceEvent {
    const event: TraceEvent = { id: generateTraceId(), timestamp: new Date().toISOString(), hop, label, meta };
    this.events.push(event);
    return event;
  }

  getEvents(): TraceEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
