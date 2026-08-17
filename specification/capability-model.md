# Capability Model

## DeviceCapability

| Field | Type | Notes |
|---|---|---|
| `supportsUssdUi` | `boolean` | Whether this handset can render USSD-UI at all. |
| `protocolVersion` | `string` | Highest protocol version this handset understands. |
| `features.buttons` | `boolean` | |
| `features.inputs` | `boolean` | |
| `features.navigation` | `boolean` | |
| `features.confirmation` | `boolean` | |

Reference implementation: `src/data/devices/capabilityProfiles.ts`.

The per-feature flags are intentionally present even though this prototype's own resolution logic
(`resolveRenderMode`) only reads `supportsUssdUi` today. They exist so a future renderer can
declare *partial* support (e.g. buttons and navigation, but not yet validated inputs) without the
model needing to change shape — the resolution function is free to get more granular; the data
shape shouldn't have to.

## Resolution

```ts
function resolveRenderMode(capability: DeviceCapability): "interactive" | "classic" {
  return capability.supportsUssdUi ? "interactive" : "classic";
}
```

Deliberately a pure function of the capability alone — see `src/services/simulator/capability.ts`.
Nothing about session state, screen content, or carrier should ever influence which renderer a
given handset gets; capability negotiation and business logic are separate concerns by design
(`/docs/architecture.md`).

## What this model does not define — updated

Everything below this line described a gap. As of the network-simulation path
(`src/network/`), the first two items are now specified and implemented; the model above remains
the data shape both paths share.

1. ~~A signal the USSD gateway can read per session~~ — now modeled as an explicit
   `CAPABILITY_REQUEST`/`CAPABILITY_RESPONSE` exchange. See `envelope-model.md` for the wire
   shape and `/docs/capability-negotiation.md` for the narrative walkthrough.
2. ~~A rule for what happens when that signal is missing or unrecognized~~ — now implemented:
   `negotiateCapability()` (`src/network/capability-negotiation.ts`) returns `accepted: false`
   for any non-overlapping version or feature set, which is the correct default-to-classic
   direction to fail in.
3. **Still open**: a cache or registry so capability doesn't need to be re-established on every
   single dial — this prototype renegotiates fresh on every simulated session, with no
   persistence across dials. Listed in `/docs/future-work.md`.

The simple `DeviceCapability` → `resolveRenderMode()` model above is still exactly what
`/simulate` and `/compare` use, unchanged — it remains a deliberately simpler, freely-toggleable
model for a fast live demo, not a negotiation protocol. `/network` is where the negotiation
protocol implied by this document actually lives.

## Testing note

Because resolution is a pure function, `resolveRenderMode` has no dependency on rendering,
sessions, or the adapter — see `tests/capability/capability.test.ts` for the full input/output
matrix this specification implies (supported → interactive, unsupported → classic, and that the
same screen resolves differently based purely on capability).
