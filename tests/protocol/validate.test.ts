import { describe, expect, it } from "vitest";
import { validateScreenMessage } from "../../src/protocol/validator/validateScreenMessage";
import type { ScreenMessage } from "../../src/protocol/types";

function messageWith(screen: ScreenMessage["screen"]): ScreenMessage {
  return { protocol: "USSD-UI", version: "0.1", type: "screen", sessionId: "demo-001", screen };
}

describe("validateScreenMessage", () => {
  it("accepts a well-formed screen with valid components", () => {
    const result = validateScreenMessage(
      messageWith({
        id: "home",
        title: "MTN Services",
        components: [{ type: "button", id: "menu_data", label: "Data Plans", action: "open_data_plans" }],
        navigation: { back: false, home: false, cancel: true },
      }),
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("flags duplicate component ids on the same screen", () => {
    const result = validateScreenMessage(
      messageWith({
        id: "home",
        title: "MTN Services",
        components: [
          { type: "button", id: "dup", label: "One", action: "a" },
          { type: "button", id: "dup", label: "Two", action: "b" },
        ],
        navigation: { back: false, home: false, cancel: true },
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /duplicate/i.test(e))).toBe(true);
  });

  it("flags a select component with no options", () => {
    const result = validateScreenMessage(
      messageWith({
        id: "picker",
        title: "Choose one",
        components: [{ type: "select", id: "s", label: "Pick", action: "pick", options: [] }],
        navigation: { back: true, home: true, cancel: true },
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /options/i.test(e))).toBe(true);
  });

  it("flags a confirm component with no rows", () => {
    const result = validateScreenMessage(
      messageWith({
        id: "confirmation",
        title: "Confirm",
        components: [{ type: "confirm", id: "c", rows: [], confirmAction: "confirm_purchase" }],
        navigation: { back: true, home: true, cancel: true },
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /rows/i.test(e))).toBe(true);
  });

  it("flags a screen with no components at all", () => {
    const result = validateScreenMessage(
      messageWith({ id: "empty", title: "Empty", components: [], navigation: { back: true, home: true, cancel: true } }),
    );
    expect(result.valid).toBe(false);
  });

  it("flags an input component whose min exceeds its max", () => {
    const result = validateScreenMessage(
      messageWith({
        id: "custom-amount",
        title: "Custom Amount",
        components: [
          { type: "input", id: "amt", label: "Enter amount", kind: "currency", action: "submit", min: 1000, max: 100 },
        ],
        navigation: { back: true, home: true, cancel: true },
      }),
    );
    expect(result.valid).toBe(false);
  });
});
