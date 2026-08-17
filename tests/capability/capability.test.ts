import { describe, expect, it } from "vitest";
import { SUPPORTED_DEVICE, UNSUPPORTED_DEVICE } from "../../src/data/devices/capabilityProfiles";
import { describeCapability, resolveRenderMode } from "../../src/services/simulator/capability";

describe("capability: supported device", () => {
  it("resolves to the interactive renderer", () => {
    expect(resolveRenderMode(SUPPORTED_DEVICE)).toBe("interactive");
  });

  it("describes itself with its protocol version", () => {
    expect(describeCapability(SUPPORTED_DEVICE)).toMatch(/0\.1/);
    expect(describeCapability(SUPPORTED_DEVICE)).toMatch(/supported/i);
  });
});

describe("capability: unsupported device", () => {
  it("resolves to the classic renderer", () => {
    expect(resolveRenderMode(UNSUPPORTED_DEVICE)).toBe("classic");
  });

  it("declares no individual feature support", () => {
    expect(Object.values(UNSUPPORTED_DEVICE.features).every((v) => v === false)).toBe(true);
  });

  it("describes itself as unsupported", () => {
    expect(describeCapability(UNSUPPORTED_DEVICE)).toMatch(/unsupported/i);
  });
});

describe("capability: fallback", () => {
  it("the same operation resolves to a different render mode purely based on capability", () => {
    const modes = [SUPPORTED_DEVICE, UNSUPPORTED_DEVICE].map(resolveRenderMode);
    expect(modes).toEqual(["interactive", "classic"]);
  });
});
