import { describe, expect, it } from "vitest";
import { MockTelcoAdapter } from "../../src/services/telco/MockTelcoAdapter";

describe("MockTelcoAdapter: transaction states", () => {
  it("walks Home -> Data Plans -> Confirm -> Processing -> Success", async () => {
    const adapter = new MockTelcoAdapter("demo-success");
    const home = await adapter.startSession("MTN", 1);
    expect(home.screen.id).toBe("home");

    const plans = await adapter.handleAction({ type: "button", id: "menu_data", action: "open_data_plans" });
    expect(plans.screen.id).toBe("data-plans");

    const confirmation = await adapter.handleAction({
      type: "button",
      id: "plan_6.5gb",
      action: "purchase_data",
      data: { plan: "6.5gb", label: "6.5GB", amount: 1500 },
    });
    expect(confirmation.screen.id).toBe("confirmation");

    const processing = await adapter.handleAction({ type: "button", id: "confirm", action: "confirm_purchase" });
    expect(processing.screen.id).toBe("processing");

    const success = await adapter.handleAction({
      type: "navigation",
      id: "auto",
      action: "resolve_transaction",
      data: { forceOutcome: "success" },
    });
    expect(success.screen.id).toBe("success");
  });

  it("walks Processing -> Failure -> Retry -> Processing -> Success", async () => {
    const adapter = new MockTelcoAdapter("demo-retry-flow");
    await adapter.startSession("MTN", 1);
    await adapter.handleAction({ type: "button", id: "menu_airtime", action: "open_airtime" });
    await adapter.handleAction({
      type: "button",
      id: "airtime_500",
      action: "purchase_airtime",
      data: { label: "Airtime", amount: 500 },
    });
    await adapter.handleAction({ type: "button", id: "confirm", action: "confirm_purchase" });

    const failure = await adapter.handleAction({
      type: "navigation",
      id: "auto",
      action: "resolve_transaction",
      data: { forceOutcome: "failure" },
    });
    expect(failure.screen.id).toBe("error");

    const retried = await adapter.handleAction({ type: "navigation", id: "retry", action: "retry" });
    expect(retried.screen.id).toBe("processing");

    const success = await adapter.handleAction({
      type: "navigation",
      id: "auto",
      action: "resolve_transaction",
      data: { forceOutcome: "success" },
    });
    expect(success.screen.id).toBe("success");
  });

  it("validates a custom data amount end to end and rejects a non-numeric value defensively", async () => {
    const adapter = new MockTelcoAdapter("demo-custom");
    await adapter.startSession("MTN", 1);
    await adapter.handleAction({ type: "button", id: "menu_data", action: "open_data_plans" });
    const customScreen = await adapter.handleAction({
      type: "button",
      id: "custom_data",
      action: "open_custom_input_data",
    });
    expect(customScreen.screen.id).toBe("custom-amount-data");

    const confirmation = await adapter.handleAction({
      type: "input",
      id: "custom_amount_data",
      action: "submit_custom_amount_data",
      value: "2500",
    });
    expect(confirmation.screen.id).toBe("confirmation");

    const rejected = await adapter.handleAction({
      type: "input",
      id: "custom_amount_data",
      action: "submit_custom_amount_data",
      value: "not-a-number",
    });
    expect(rejected.screen.id).toBe("error");
  });

  it("walks the multi-step Gift Data flow, carrying the recipient through to confirmation", async () => {
    const adapter = new MockTelcoAdapter("demo-gift");
    await adapter.startSession("MTN", 1);
    await adapter.handleAction({ type: "button", id: "menu_gift", action: "open_gift_data" });
    const planScreen = await adapter.handleAction({
      type: "input",
      id: "gift_recipient",
      action: "submit_gift_recipient",
      value: "08031234567",
    });
    expect(planScreen.screen.id).toBe("gift-data-plan");

    const confirmation = await adapter.handleAction({
      type: "button",
      id: "gift_1gb",
      action: "purchase_gift_data",
      data: { plan: "1gb", label: "1GB", amount: 500 },
    });
    expect(confirmation.screen.id).toBe("confirmation");
    const recipientRow = confirmation.screen.components.find((c) => c.type === "confirm");
    expect(recipientRow && recipientRow.type === "confirm" ? recipientRow.rows : []).toEqual(
      expect.arrayContaining([{ label: "Recipient", value: "08031234567" }]),
    );
  });

  it("go_home clears any pending cart and returns to the home screen", async () => {
    const adapter = new MockTelcoAdapter("demo-home");
    await adapter.startSession("MTN", 1);
    await adapter.handleAction({ type: "button", id: "menu_data", action: "open_data_plans" });
    const home = await adapter.handleAction({ type: "navigation", id: "home", action: "go_home" });
    expect(home.screen.id).toBe("home");
  });

  it("returns an error screen for an unrecognised action instead of throwing", async () => {
    const adapter = new MockTelcoAdapter("demo-unknown");
    await adapter.startSession("MTN", 1);
    const result = await adapter.handleAction({ type: "button", id: "x", action: "totally_unknown_action" });
    expect(result.screen.id).toBe("error");
  });
});
