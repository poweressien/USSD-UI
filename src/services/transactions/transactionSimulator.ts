export type TransactionOutcome = "success" | "failure";

export interface TransactionResult {
  outcome: TransactionOutcome;
  reference: string;
  reason?: string;
}

const FAILURE_REASONS = [
  "Network unavailable.",
  "Insufficient balance.",
  "Service temporarily unavailable.",
  "Session timed out before confirmation.",
];

function generateReference(now: number): string {
  return `USSD${now.toString().slice(-9)}`;
}

/**
 * Simulates the Telco's transaction outcome. `forceOutcome` lets the
 * Simulate screen's presenter controls make this deterministic for a
 * live demo (see docs — "07 — Error recovery"); with no override it
 * fails at `failureRate` so the happy path is still the common case.
 */
export function simulateTransaction(opts?: {
  forceOutcome?: TransactionOutcome;
  failureRate?: number;
  now?: number;
}): TransactionResult {
  const now = opts?.now ?? Date.now();
  const failureRate = opts?.failureRate ?? 0.25;
  const outcome: TransactionOutcome = opts?.forceOutcome ?? (Math.random() < failureRate ? "failure" : "success");
  const reference = generateReference(now);

  if (outcome === "failure") {
    const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
    return { outcome, reference, reason };
  }
  return { outcome, reference };
}
