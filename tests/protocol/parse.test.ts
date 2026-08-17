import { describe, expect, it } from "vitest";
import { parseScreenMessage } from "../../src/protocol/parser/parseScreenMessage";

const VALID_MESSAGE = {
  protocol: "USSD-UI",
  version: "0.1",
  type: "screen",
  sessionId: "demo-001",
  screen: {
    id: "home",
    title: "MTN Services",
    components: [{ type: "button", id: "menu_data", label: "Data Plans", action: "open_data_plans" }],
    navigation: { back: false, home: false, cancel: true },
  },
};

describe("parseScreenMessage", () => {
  it("parses a valid screen message", () => {
    const result = parseScreenMessage(VALID_MESSAGE);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.message.screen.id).toBe("home");
      expect(result.message.screen.components).toHaveLength(1);
    }
  });

  it("rejects a malformed message (missing required fields)", () => {
    const malformed = { protocol: "USSD-UI", version: "0.1", type: "screen" };
    const result = parseScreenMessage(malformed);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("rejects a message with an invalid component shape", () => {
    const bad = {
      ...VALID_MESSAGE,
      screen: { ...VALID_MESSAGE.screen, components: [{ type: "button", id: "x" }] }, // missing label/action
    };
    const result = parseScreenMessage(bad);
    expect(result.ok).toBe(false);
  });

  it("rejects an unsupported protocol version", () => {
    const bad = { ...VALID_MESSAGE, version: "9.9" };
    const result = parseScreenMessage(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join(" ")).toMatch(/version/i);
    }
  });

  it("rejects a message from a different protocol namespace", () => {
    const bad = { ...VALID_MESSAGE, protocol: "SOME-OTHER-PROTOCOL" };
    const result = parseScreenMessage(bad);
    expect(result.ok).toBe(false);
  });

  it("rejects a completely malformed payload", () => {
    const result = parseScreenMessage("not even an object");
    expect(result.ok).toBe(false);
  });
});
