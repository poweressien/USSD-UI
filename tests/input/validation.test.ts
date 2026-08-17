import { describe, expect, it } from "vitest";
import { validateAmount, validatePhoneNumber, validatePin } from "../../src/lib/validation";

const LIMITS = { min: 50, max: 100_000 };

describe("validateAmount", () => {
  it("accepts a valid amount within range", () => {
    expect(validateAmount("1500", LIMITS)).toEqual({ valid: true });
  });

  it("accepts a valid amount with up to two decimal places", () => {
    expect(validateAmount("199.99", LIMITS)).toEqual({ valid: true });
  });

  it("rejects empty input", () => {
    const result = validateAmount("", LIMITS);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/enter an amount/i);
  });

  it("rejects input made of whitespace only", () => {
    expect(validateAmount("   ", LIMITS).valid).toBe(false);
  });

  it("rejects letters", () => {
    const result = validateAmount("five hundred", LIMITS);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/numbers only/i);
  });

  it("rejects negative numbers", () => {
    const result = validateAmount("-500", LIMITS);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/negative/i);
  });

  it("rejects amounts below the minimum", () => {
    const result = validateAmount("10", LIMITS);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/minimum/i);
  });

  it("rejects amounts above the maximum", () => {
    const result = validateAmount("500000", LIMITS);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/maximum/i);
  });

  it("rejects amounts with more than two decimal places", () => {
    const result = validateAmount("100.999", LIMITS);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/decimal/i);
  });

  it("accepts a value exactly at the boundary", () => {
    expect(validateAmount("50", LIMITS).valid).toBe(true);
    expect(validateAmount("100000", LIMITS).valid).toBe(true);
  });
});

describe("validatePhoneNumber", () => {
  it("accepts an 11-digit number starting with 0", () => {
    expect(validatePhoneNumber("08031234567")).toEqual({ valid: true });
  });

  it("rejects a number that is the wrong length", () => {
    expect(validatePhoneNumber("0803123").valid).toBe(false);
  });

  it("rejects a number that doesn't start with 0", () => {
    expect(validatePhoneNumber("18031234567").valid).toBe(false);
  });

  it("rejects empty input", () => {
    expect(validatePhoneNumber("").valid).toBe(false);
  });
});

describe("validatePin", () => {
  it("accepts a 4-digit PIN", () => {
    expect(validatePin("1234")).toEqual({ valid: true });
  });

  it("rejects a PIN that isn't exactly 4 digits", () => {
    expect(validatePin("123").valid).toBe(false);
    expect(validatePin("123456").valid).toBe(false);
  });

  it("rejects a non-numeric PIN", () => {
    expect(validatePin("abcd").valid).toBe(false);
  });

  it("rejects an empty PIN", () => {
    expect(validatePin("").valid).toBe(false);
  });
});
