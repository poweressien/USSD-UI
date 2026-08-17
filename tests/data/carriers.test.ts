import { describe, expect, it } from "vitest";
import { findCarrierByDialCode, getCarrier, CARRIERS } from "../../src/data/carriers/carriers";

describe("findCarrierByDialCode", () => {
  it("matches each known carrier's exact dial code", () => {
    for (const carrier of CARRIERS) {
      expect(findCarrierByDialCode(carrier.dialCode)).toEqual(carrier);
    }
  });

  it("does not match a partial or malformed code", () => {
    expect(findCarrierByDialCode("*123")).toBeUndefined(); // missing trailing #
    expect(findCarrierByDialCode("123#")).toBeUndefined(); // missing leading *
    expect(findCarrierByDialCode("1234")).toBeUndefined(); // not a code at all
  });

  it("does not match an empty string", () => {
    expect(findCarrierByDialCode("")).toBeUndefined();
  });

  it("is case-for-case exact — no fuzzy matching", () => {
    expect(findCarrierByDialCode(" *123#")).toBeUndefined();
    expect(findCarrierByDialCode("*123# ")).toBeUndefined();
  });
});

describe("getCarrier", () => {
  it("falls back to the first carrier for an unknown id", () => {
    expect(getCarrier("does-not-exist")).toEqual(CARRIERS[0]);
  });
});
