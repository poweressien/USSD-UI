import { describe, expect, it } from "vitest";
import {
  makeCapabilityRequestEnvelope,
  makeCapabilityResponseEnvelope,
  makeErrorEnvelope,
  makeScreenEnvelope,
  makeSessionEndEnvelope,
  makeUserActionEnvelope,
} from "../../src/network/types";

describe("envelope construction", () => {
  it("stamps every envelope with the USSD-UI protocol and current version", () => {
    const envelope = makeCapabilityRequestEnvelope("demo-001", 1, { supportedVersions: ["0.1"], features: [] });
    expect(envelope.protocol).toBe("USSD-UI");
    expect(envelope.version).toBe("0.1");
  });

  it("carries the session id and sequence number through untouched", () => {
    const envelope = makeUserActionEnvelope("demo-042", 7, { type: "button", id: "x", action: "open_data_plans" });
    expect(envelope.sessionId).toBe("demo-042");
    expect(envelope.sequence).toBe(7);
  });

  it("tags each envelope with the correct discriminated messageType", () => {
    expect(makeCapabilityRequestEnvelope("s", 1, { supportedVersions: [], features: [] }).messageType).toBe(
      "capability_request",
    );
    expect(
      makeCapabilityResponseEnvelope("s", 1, { accepted: true, protocol: "USSD-UI" }).messageType,
    ).toBe("capability_response");
    expect(makeErrorEnvelope("s", 1, { code: "X", message: "x" }).messageType).toBe("error");
    expect(makeSessionEndEnvelope("s", 1, { reason: "user_cancelled" }).messageType).toBe("session_end");
  });

  it("wraps an existing ScreenMessage payload without altering it", () => {
    const screenMessage = {
      protocol: "USSD-UI" as const,
      version: "0.1",
      type: "screen" as const,
      sessionId: "demo-001",
      screen: {
        id: "home",
        title: "MTN Services",
        components: [],
        navigation: { back: false, home: false, cancel: true },
      },
    };
    const envelope = makeScreenEnvelope("demo-001", 3, screenMessage);
    expect(envelope.payload).toEqual(screenMessage);
  });

  it("generates a unique messageId per envelope", () => {
    const ids = new Set(
      Array.from(
        { length: 50 },
        () => makeUserActionEnvelope("s", 1, { type: "button", id: "x", action: "a" }).messageId,
      ),
    );
    expect(ids.size).toBe(50);
  });
});
