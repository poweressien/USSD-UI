import { describe, expect, it } from "vitest";
import { TraceRecorder } from "../../src/network/TraceRecorder";

describe("TraceRecorder", () => {
  it("records events in the order they occur", () => {
    const trace = new TraceRecorder();
    trace.record("DEVICE → NETWORK", "Capability request");
    trace.record("NETWORK → DEVICE", "Capability accepted");
    const events = trace.getEvents();
    expect(events.map((e) => e.label)).toEqual(["Capability request", "Capability accepted"]);
  });

  it("gives every event a unique id and a timestamp", () => {
    const trace = new TraceRecorder();
    trace.record("TELCO SERVICE", "Generated screen");
    trace.record("TELCO SERVICE", "Processing");
    const [a, b] = trace.getEvents();
    expect(a.id).not.toBe(b.id);
    expect(typeof a.timestamp).toBe("string");
  });

  it("attaches optional structured metadata to an event", () => {
    const trace = new TraceRecorder();
    trace.record("USSD-UI ADAPTER", "Negotiated USSD-UI v0.1", { version: "0.1", features: ["button"] });
    expect(trace.getEvents()[0].meta).toEqual({ version: "0.1", features: ["button"] });
  });

  it("returns a snapshot copy, not a live reference to internal state", () => {
    const trace = new TraceRecorder();
    trace.record("TELCO SERVICE", "First");
    const snapshot = trace.getEvents();
    trace.record("TELCO SERVICE", "Second");
    expect(snapshot).toHaveLength(1);
    expect(trace.getEvents()).toHaveLength(2);
  });

  it("clear() empties the log", () => {
    const trace = new TraceRecorder();
    trace.record("TELCO SERVICE", "First");
    trace.clear();
    expect(trace.getEvents()).toHaveLength(0);
  });
});
