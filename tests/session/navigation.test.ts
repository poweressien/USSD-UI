import { describe, expect, it } from "vitest";
import { canGoBack, currentScreen, popScreen, pushScreen, resetStack } from "../../src/session/navigation-stack";
import { cancelSession, createSession, navigate } from "../../src/session/session-manager";
import { MockTelcoAdapter } from "../../src/services/telco/MockTelcoAdapter";

describe("navigation: Back", () => {
  it("pops the most recent screen off the stack", () => {
    let stack = resetStack("home");
    stack = pushScreen(stack, "data-plans");
    stack = pushScreen(stack, "confirmation");
    stack = popScreen(stack);
    expect(currentScreen(stack)).toBe("data-plans");
  });

  it("cannot go back past the root screen", () => {
    const stack = resetStack("home");
    expect(canGoBack(stack)).toBe(false);
    expect(currentScreen(popScreen(stack))).toBe("home");
  });
});

describe("navigation: Home", () => {
  it("collapses any depth of navigation back to the root screen", () => {
    let stack = resetStack("home");
    stack = pushScreen(stack, "airtime");
    stack = pushScreen(stack, "custom-amount-airtime");
    stack = resetStack("home");
    expect(currentScreen(stack)).toBe("home");
    expect(stack).toEqual(["home"]);
  });
});

describe("navigation: Cancel", () => {
  it("ending a session via cancel blocks any further navigation", () => {
    let session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    session = navigate(session, "data-plans");
    session = cancelSession(session);
    expect(session.status).toBe("cancelled");
    expect(() => navigate(session, "confirmation")).toThrow();
  });
});

describe("navigation: Retry", () => {
  it("retrying after a failed transaction re-enters processing against the same pending purchase", async () => {
    const adapter = new MockTelcoAdapter("demo-retry");
    await adapter.startSession("MTN", 1);
    await adapter.handleAction({ type: "button", id: "menu_data", action: "open_data_plans" });
    await adapter.handleAction({
      type: "button",
      id: "plan_1gb",
      action: "purchase_data",
      data: { plan: "1gb", label: "1GB", amount: 500 },
    });
    await adapter.handleAction({ type: "button", id: "confirm", action: "confirm_purchase" });
    const failed = await adapter.handleAction({
      type: "navigation",
      id: "auto",
      action: "resolve_transaction",
      data: { forceOutcome: "failure" },
    });
    expect(failed.screen.id).toBe("error");
    expect(failed.screen.navigation.retry).toBe(true);

    const retried = await adapter.handleAction({ type: "navigation", id: "retry_btn", action: "retry" });
    expect(retried.screen.id).toBe("processing");
  });
});
