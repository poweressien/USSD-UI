import { describe, expect, it } from "vitest";
import { simulateTransaction } from "../../src/services/transactions/transactionSimulator";

describe("simulateTransaction", () => {
  it("forces a success outcome on request", () => {
    const result = simulateTransaction({ forceOutcome: "success" });
    expect(result.outcome).toBe("success");
    expect(result.reason).toBeUndefined();
  });

  it("forces a failure outcome on request, with a reason", () => {
    const result = simulateTransaction({ forceOutcome: "failure" });
    expect(result.outcome).toBe("failure");
    expect(result.reason).toBeTruthy();
  });

  it("always succeeds when failureRate is 0", () => {
    for (let i = 0; i < 20; i++) {
      expect(simulateTransaction({ failureRate: 0 }).outcome).toBe("success");
    }
  });

  it("always fails when failureRate is 1", () => {
    for (let i = 0; i < 20; i++) {
      expect(simulateTransaction({ failureRate: 1 }).outcome).toBe("failure");
    }
  });

  it("generates a reference number in the expected shape", () => {
    const result = simulateTransaction({ forceOutcome: "success", now: 1_760_000_000_000 });
    expect(result.reference).toMatch(/^USSD\d{9}$/);
  });
});
