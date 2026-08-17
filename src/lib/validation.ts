export interface AmountLimits {
  min: number;
  max: number;
}

export interface ValidationOutcome {
  valid: boolean;
  error?: string;
}

const NUMERIC_PATTERN = /^\d+(\.\d+)?$/;

/**
 * Validates a raw amount string against the rules in spec section 10:
 * empty input, letters, negative numbers, below/above limits, and
 * decimal values with more precision than currency allows.
 */
export function validateAmount(raw: string, limits: AmountLimits): ValidationOutcome {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return { valid: false, error: "Enter an amount." };
  }
  if (trimmed.startsWith("-")) {
    return { valid: false, error: "Amount cannot be negative." };
  }
  if (!NUMERIC_PATTERN.test(trimmed)) {
    return { valid: false, error: "Numbers only, please." };
  }

  const decimalPart = trimmed.split(".")[1];
  if (decimalPart && decimalPart.length > 2) {
    return { valid: false, error: "Use at most 2 decimal places." };
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { valid: false, error: "Enter a valid amount." };
  }
  if (value < limits.min) {
    return { valid: false, error: `Minimum is ${formatNaira(limits.min)}.` };
  }
  if (value > limits.max) {
    return { valid: false, error: `Maximum is ${formatNaira(limits.max)}.` };
  }

  return { valid: true };
}

export function validatePhoneNumber(raw: string): ValidationOutcome {
  const trimmed = raw.trim();
  if (trimmed === "") return { valid: false, error: "Enter a phone number." };
  if (!/^0\d{10}$/.test(trimmed)) {
    return { valid: false, error: "Enter an 11-digit number starting with 0." };
  }
  return { valid: true };
}

export function validatePin(raw: string): ValidationOutcome {
  if (raw === "") return { valid: false, error: "Enter your 4-digit PIN." };
  if (!/^\d{4}$/.test(raw)) return { valid: false, error: "PIN must be exactly 4 digits." };
  return { valid: true };
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}
