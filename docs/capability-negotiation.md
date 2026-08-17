# Capability Negotiation

Before rendering a structured screen, the handset side needs to declare whether it supports
USSD-UI, and at what protocol version. Without this, a service that assumes support would break
every legacy handset the moment it sent a structured message instead of plain text.

This repository models capability negotiation two ways, at different levels of rigor — both
remain available and both are real, tested code.

## The simple model — `/simulate`, `/compare`

A device capability profile:

```ts
interface DeviceCapability {
  supportsUssdUi: boolean;
  protocolVersion: string;
  features: { buttons: boolean; inputs: boolean; navigation: boolean; confirmation: boolean };
}
```

resolved to a render mode with one pure function:

```ts
function resolveRenderMode(capability: DeviceCapability): "interactive" | "classic" {
  return capability.supportsUssdUi ? "interactive" : "classic";
}
```

See `src/data/devices/capabilityProfiles.ts` and `src/services/simulator/capability.ts`. This is
deliberately a boolean-driven simplification for a fast, freely-toggleable live demo — flip the
device switch in the app header while in **Simulate** and the same session immediately re-renders
through the classic path. It does not model an actual request/response exchange.

## The real handshake — `/network`

`src/network/` replaces the boolean with an actual negotiated exchange:

```
DEVICE → NETWORK: CAPABILITY_REQUEST   { supportedVersions, features }
NETWORK → DEVICE: CAPABILITY_RESPONSE  { accepted, version?, features?, reason? }
```

`negotiateCapability()` (`src/network/capability-negotiation.ts`) is a pure function that
intersects what the device claims against what the adapter supports — it can accept, accept a
reduced feature set, or reject outright with a stated reason (no overlapping version, or no
overlapping feature). `capabilityRequestFromDevice()` bridges the same `SUPPORTED_DEVICE`/
`UNSUPPORTED_DEVICE` profiles used by the simple model into a real request payload, so both
models describe the same two demo devices rather than unrelated ones.

Unlike the simple model, each negotiation is a full, real exchange, not a flipped boolean: a
device declares itself, the adapter decides, and that decision is fresh every time — the
"Interactive Device" / "Legacy Device" controls on `/network` each dial anew and run a real
handshake, rather than instantly toggling a result you're locked into. Try it live: choose
"Legacy Device" on `/network` and watch the negotiation get traced and rejected in real time.

An "unsupported" device in this simulation still sends a `CAPABILITY_REQUEST` (with empty
arrays), purely so the rejection is visible in the trace. A real legacy handset would not send
this message at all — the gateway would simply route it through the existing USSD path,
unmodified, exactly as `USSDGatewaySimulator` (which has no notion of USSD-UI) demonstrates for
every session regardless of outcome.

## What real-world negotiation would still require

- Handset OS or firmware support for parsing and rendering the message format at all — no
  amount of protocol design substitutes for this.
- A real transport for the request/response pair — this prototype's `NetworkSimulator` only
  logs and (optionally) delays; see `wire-transport.md` for why its envelope is explicitly not a
  proposed wire encoding.
- Message integrity and authentication underneath the negotiation itself — a spoofed
  `CAPABILITY_RESPONSE` is not something this prototype defends against; see `security.md`.
- A default-to-classic behavior on any doubt, ambiguity, or unrecognized capability signal —
  this prototype's adapter already defaults to `accepted: false` on any non-overlapping input,
  which is the correct direction to fail in.

## Fallback is not a degraded mode

The classic renderer (`src/components/ussd/ClassicUssdRenderer.tsx`) consumes the identical
`ScreenDef` the interactive renderer receives, on both paths — it is a second view of the same
data, not a separately maintained menu tree that can drift out of sync. `tests/network/adapter-flow.test.ts`
proves this directly: negotiating as an unsupported device and an accepted device against the
same carrier and action sequence yields byte-identical `ScreenMessage` payloads. See
`compatibility.md` for the broader guarantee this is meant to uphold.
