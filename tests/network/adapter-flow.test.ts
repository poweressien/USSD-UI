import { describe, expect, it } from "vitest";
import { DeviceSimulator } from "../../src/network/DeviceSimulator";
import { NetworkSimulator } from "../../src/network/NetworkSimulator";
import { USSDGatewayError, USSDGatewaySimulator } from "../../src/network/USSDGatewaySimulator";
import { MockTelcoService } from "../../src/network/MockTelcoService";
import { USSDUIAdapter } from "../../src/network/USSDUIAdapter";
import { TraceRecorder } from "../../src/network/TraceRecorder";
import { makeUserActionEnvelope, makeSessionEndEnvelope } from "../../src/network/types";
import { SUPPORTED_DEVICE, UNSUPPORTED_DEVICE } from "../../src/data/devices/capabilityProfiles";
import { getCarrier } from "../../src/data/carriers/carriers";
import type { CapabilityResponseEnvelope, ErrorEnvelope, ScreenEnvelope } from "../../src/network/types";

/** Narrows a handleAction/negotiateCapability result, failing loudly if it isn't the expected type. */
function expectScreen(envelope: ScreenEnvelope | ErrorEnvelope): ScreenEnvelope {
  if (envelope.messageType !== "screen") {
    throw new Error(`Expected a screen envelope, got "${envelope.messageType}": ${JSON.stringify(envelope.payload)}`);
  }
  return envelope;
}

function expectCapabilityResponse(envelope: CapabilityResponseEnvelope | ErrorEnvelope): CapabilityResponseEnvelope {
  if (envelope.messageType !== "capability_response") {
    throw new Error(`Expected a capability_response envelope, got "${envelope.messageType}"`);
  }
  return envelope;
}

function setup(sessionId: string, deviceCapability = SUPPORTED_DEVICE) {
  const trace = new TraceRecorder();
  const device = new DeviceSimulator(deviceCapability);
  const network = new NetworkSimulator(trace); // 0ms latency — deterministic tests
  const gateway = new USSDGatewaySimulator(trace);
  const service = new MockTelcoService(sessionId);
  const adapter = new USSDUIAdapter(service, network, trace);
  return { trace, device, network, gateway, service, adapter };
}

describe("network simulation: capability request/response over the wire", () => {
  it("carries a real request/response pair, not a bare boolean", async () => {
    const { device, adapter } = setup("demo-001");
    const request = device.buildCapabilityRequest("demo-001");
    expect(request.messageType).toBe("capability_request");

    const response = await adapter.negotiateCapability(request);
    expect(response.messageType).toBe("capability_response");
    if (response.messageType === "capability_response") {
      expect(response.payload.accepted).toBe(true);
      expect(response.payload.version).toBe("0.1");
    }
  });
});

describe("network simulation: successful negotiation", () => {
  it("negotiates interactive rendering for a fully-capable device", async () => {
    const { device, adapter } = setup("demo-002", SUPPORTED_DEVICE);
    const response = await adapter.negotiateCapability(device.buildCapabilityRequest("demo-002"));
    expect(response.messageType).toBe("capability_response");
    expect(adapter.isNegotiatedInteractive()).toBe(true);
    expect(adapter.getNegotiation()?.accepted).toBe(true);
  });
});

describe("network simulation: failed negotiation and fallback", () => {
  it("rejects negotiation for an unsupported device and reports why", async () => {
    const { device, adapter } = setup("demo-003", UNSUPPORTED_DEVICE);
    const response = await adapter.negotiateCapability(device.buildCapabilityRequest("demo-003"));
    expect(response.messageType).toBe("capability_response");
    if (response.messageType === "capability_response") {
      expect(response.payload.accepted).toBe(false);
      expect(response.payload.reason).toBeTruthy();
    }
    expect(adapter.isNegotiatedInteractive()).toBe(false);
  });

  it("the same MockTelcoService call produces the identical ScreenMessage regardless of negotiation outcome", async () => {
    const supported = setup("demo-004a", SUPPORTED_DEVICE);
    await supported.adapter.negotiateCapability(supported.device.buildCapabilityRequest("demo-004a"));
    const screenA = await supported.adapter.deliverInitialScreen("demo-004a", "MTN", 1);

    const unsupported = setup("demo-004b", UNSUPPORTED_DEVICE);
    await unsupported.adapter.negotiateCapability(unsupported.device.buildCapabilityRequest("demo-004b"));
    const screenB = await unsupported.adapter.deliverInitialScreen("demo-004b", "MTN", 1);

    // Same screen id, title, and components either way — only the negotiated
    // outcome (checked separately by the client) determines how it's drawn.
    expect(screenA.payload.screen.id).toBe(screenB.payload.screen.id);
    expect(screenA.payload.screen.components).toEqual(screenB.payload.screen.components);
  });
});

describe("network simulation: protocol envelope", () => {
  it("wraps every message with protocol/version/messageId/sessionId/sequence/messageType", async () => {
    const { device, adapter } = setup("demo-005");
    const response = await adapter.negotiateCapability(device.buildCapabilityRequest("demo-005"));
    for (const key of ["protocol", "version", "messageId", "sessionId", "sequence", "messageType", "payload"]) {
      expect(response).toHaveProperty(key);
    }
    expect(response.protocol).toBe("USSD-UI");
    expect(response.sessionId).toBe("demo-005");
  });
});

describe("network simulation: sequence numbers", () => {
  it("increases monotonically across a full exchange", async () => {
    const { device, adapter } = setup("demo-006");
    const request = device.buildCapabilityRequest("demo-006");
    expect(request.sequence).toBe(1);

    const response = await adapter.negotiateCapability(request);
    expect(response.sequence).toBe(1); // adapter's own outgoing counter, independent of the device's

    const action = device.buildUserAction("demo-006", { type: "button", id: "menu_data", action: "open_data_plans" });
    expect(action.sequence).toBe(2);

    const screenReply = await adapter.handleAction(action);
    expect(screenReply.sequence).toBe(2);
  });

  it("rejects an out-of-order (replayed) envelope with a SEQUENCE_MISMATCH error", async () => {
    const { device, adapter } = setup("demo-007");
    await adapter.negotiateCapability(device.buildCapabilityRequest("demo-007"));

    // Device's next real sequence would be 2 — hand-craft a stale/replayed 1 instead.
    const replayed = makeUserActionEnvelope("demo-007", 1, {
      type: "button",
      id: "menu_data",
      action: "open_data_plans",
    });
    const result = await adapter.handleAction(replayed);
    expect(result.messageType).toBe("error");
    if (result.messageType === "error") {
      expect(result.payload.code).toBe("SEQUENCE_MISMATCH");
    }
  });

  it("recovers once the device sends the correctly-numbered envelope", async () => {
    const { device, adapter } = setup("demo-008");
    await adapter.negotiateCapability(device.buildCapabilityRequest("demo-008"));
    await adapter.handleAction(makeUserActionEnvelope("demo-008", 99, { type: "button", id: "x", action: "open_data_plans" })); // rejected
    const correct = device.buildUserAction("demo-008", { type: "button", id: "menu_data", action: "open_data_plans" });
    expect(correct.sequence).toBe(2);
    const result = await adapter.handleAction(correct);
    expect(result.messageType).toBe("screen");
  });
});

describe("network simulation: session handling end to end", () => {
  it("walks gateway admission -> negotiation -> home screen -> purchase -> success", async () => {
    const sessionId = "demo-009";
    const { device, adapter, gateway } = setup(sessionId, SUPPORTED_DEVICE);
    const carrier = getCarrier("mtn");

    gateway.openSession(carrier.dialCode, carrier.id);

    const negotiation = expectCapabilityResponse(await adapter.negotiateCapability(device.buildCapabilityRequest(sessionId)));
    expect(negotiation.payload.accepted).toBe(true);

    const home = await adapter.deliverInitialScreen(sessionId, carrier.name, 1);
    expect(home.payload.screen.id).toBe("home");

    const plans = expectScreen(
      await adapter.handleAction(
        device.buildUserAction(sessionId, { type: "button", id: "menu_data", action: "open_data_plans" }),
      ),
    );
    expect(plans.payload.screen.id).toBe("data-plans");

    const confirmation = expectScreen(
      await adapter.handleAction(
        device.buildUserAction(sessionId, {
          type: "button",
          id: "plan_1gb",
          action: "purchase_data",
          data: { plan: "1gb", label: "1GB", amount: 500 },
        }),
      ),
    );
    expect(confirmation.payload.screen.id).toBe("confirmation");

    const processing = expectScreen(
      await adapter.handleAction(
        device.buildUserAction(sessionId, { type: "button", id: "confirm", action: "confirm_purchase" }),
      ),
    );
    expect(processing.payload.screen.id).toBe("processing");

    const success = expectScreen(
      await adapter.handleAction(
        device.buildUserAction(sessionId, {
          type: "navigation",
          id: "auto",
          action: "resolve_transaction",
          data: { forceOutcome: "success" },
        }),
      ),
    );
    expect(success.payload.screen.id).toBe("success");
  });

  it("rejects gateway admission for an unrecognised dial code", () => {
    const { gateway } = setup("demo-010");
    expect(() => gateway.openSession("*999#", "mtn")).toThrow(USSDGatewayError);
  });

  it("ends a session cleanly via session_end and returns a cancelled screen", async () => {
    const sessionId = "demo-011";
    const { device, adapter } = setup(sessionId);
    await adapter.negotiateCapability(device.buildCapabilityRequest(sessionId));
    await adapter.deliverInitialScreen(sessionId, "MTN", 1);
    const ended = expectScreen(await adapter.endSession(device.buildSessionEnd(sessionId, "user_cancelled")));
    expect(ended.payload.screen.id).toBe("cancelled");
  });

  it("validates sequence on session_end just as it does on ordinary actions", async () => {
    const sessionId = "demo-011b";
    const { device, adapter } = setup(sessionId);
    await adapter.negotiateCapability(device.buildCapabilityRequest(sessionId));
    const stale = makeSessionEndEnvelope(sessionId, 99, { reason: "user_cancelled" });
    const result = await adapter.endSession(stale);
    expect(result.messageType).toBe("error");
  });
});

describe("network simulation: network trace", () => {
  it("records a coherent, ordered trace across a full exchange", async () => {
    const sessionId = "demo-012";
    const { device, adapter, gateway, trace } = setup(sessionId, SUPPORTED_DEVICE);
    const carrier = getCarrier("mtn");

    gateway.openSession(carrier.dialCode, carrier.id);
    await adapter.negotiateCapability(device.buildCapabilityRequest(sessionId));
    await adapter.deliverInitialScreen(sessionId, carrier.name, 1);
    await adapter.handleAction(
      device.buildUserAction(sessionId, { type: "button", id: "menu_data", action: "open_data_plans" }),
    );

    const hops = trace.getEvents().map((e) => e.hop);
    expect(hops).toEqual([
      "USSD GATEWAY",
      "DEVICE → NETWORK", // capability request
      "USSD-UI ADAPTER",
      "NETWORK → DEVICE", // capability response
      "TELCO SERVICE", // home screen generated
      "NETWORK → DEVICE", // home screen delivered
      "DEVICE → NETWORK", // user action
      "TELCO SERVICE", // processing
      "NETWORK → DEVICE", // data-plans screen delivered
    ]);
  });

  it("shows the classic-fallback label in the trace when negotiation fails", async () => {
    const sessionId = "demo-013";
    const { device, adapter, trace } = setup(sessionId, UNSUPPORTED_DEVICE);
    await adapter.negotiateCapability(device.buildCapabilityRequest(sessionId));
    await adapter.deliverInitialScreen(sessionId, "MTN", 1);

    const labels = trace.getEvents().map((e) => e.label);
    expect(labels.some((l) => /rejected|fallback/i.test(l))).toBe(true);
    expect(labels.some((l) => l === "Classic USSD screen (fallback)")).toBe(true);
  });
});

describe("network simulation: user actions", () => {
  it("carries the action's semantic name and data through the envelope", async () => {
    const sessionId = "demo-014";
    const { device, adapter } = setup(sessionId);
    await adapter.negotiateCapability(device.buildCapabilityRequest(sessionId));
    await adapter.deliverInitialScreen(sessionId, "MTN", 1);

    const action = device.buildUserAction(sessionId, {
      type: "button",
      id: "plan_1gb",
      action: "purchase_data",
      data: { plan: "1gb", amount: 500 },
    });
    expect(action.payload.action).toBe("purchase_data");
    expect(action.payload.data).toEqual({ plan: "1gb", amount: 500 });

    const reply = await adapter.handleAction(action);
    expect(reply.messageType).toBe("screen");
  });
});
