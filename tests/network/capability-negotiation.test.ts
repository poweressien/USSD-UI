import { describe, expect, it } from "vitest";
import { capabilityRequestFromDevice, negotiateCapability } from "../../src/network/capability-negotiation";
import { SUPPORTED_DEVICE, UNSUPPORTED_DEVICE } from "../../src/data/devices/capabilityProfiles";

describe("negotiateCapability", () => {
  it("accepts a request offering a supported version and overlapping features", () => {
    const result = negotiateCapability({ supportedVersions: ["0.1"], features: ["button", "input", "confirm"] });
    expect(result.accepted).toBe(true);
    expect(result.version).toBe("0.1");
    expect(result.features).toEqual(["button", "input", "confirm"]);
  });

  it("rejects when there is no overlapping protocol version", () => {
    const result = negotiateCapability({ supportedVersions: ["9.9"], features: ["button"] });
    expect(result.accepted).toBe(false);
    expect(result.reason).toMatch(/version/i);
  });

  it("rejects when the device declares no supported version at all", () => {
    const result = negotiateCapability({ supportedVersions: [], features: [] });
    expect(result.accepted).toBe(false);
    expect(result.reason).toMatch(/no supported/i);
  });

  it("rejects when the version matches but no feature overlaps", () => {
    const result = negotiateCapability({ supportedVersions: ["0.1"], features: ["some_future_feature"] });
    expect(result.accepted).toBe(false);
    expect(result.reason).toMatch(/feature/i);
  });

  it("negotiates only the intersection of features, dropping unsupported ones", () => {
    const result = negotiateCapability({ supportedVersions: ["0.1"], features: ["button", "holographic_projection"] });
    expect(result.accepted).toBe(true);
    expect(result.features).toEqual(["button"]);
  });
});

describe("capabilityRequestFromDevice", () => {
  it("builds a full feature request from the supported demo device profile", () => {
    const request = capabilityRequestFromDevice(SUPPORTED_DEVICE);
    expect(request.supportedVersions).toEqual(["0.1"]);
    expect(request.features).toEqual(expect.arrayContaining(["button", "input", "select", "navigation", "confirm"]));
  });

  it("builds an empty request from the unsupported demo device profile", () => {
    const request = capabilityRequestFromDevice(UNSUPPORTED_DEVICE);
    expect(request.supportedVersions).toEqual([]);
    expect(request.features).toEqual([]);
  });

  it("round-trips the supported profile through negotiation successfully", () => {
    const result = negotiateCapability(capabilityRequestFromDevice(SUPPORTED_DEVICE));
    expect(result.accepted).toBe(true);
  });

  it("round-trips the unsupported profile through negotiation as a rejection", () => {
    const result = negotiateCapability(capabilityRequestFromDevice(UNSUPPORTED_DEVICE));
    expect(result.accepted).toBe(false);
  });
});
