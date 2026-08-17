# System Architecture

> Conceptual production architecture — proof of concept only. USSD-UI v0.1 — Experimental Draft.
> Not an existing 3GPP, ETSI, or GSMA standard. This document describes the end-to-end path a
> production deployment would need; the tables below mark exactly how much of it this repository
> actually implements, and where.

```
USER
  |
  v
PHONE / TERMINAL
  |
  | dials *123#
  v
MOBILE NETWORK
  |
  v
EXISTING USSD INFRASTRUCTURE
  |
  v
USSD-UI ADAPTER / GATEWAY  ---- negotiates capability with the device ----
  |
  v
TELCO SERVICE
  |
  v
STRUCTURED UI MESSAGE
  |
  v
DEVICE RENDERER
  |
  +---------+-----------+
  v                     v
Supported            Unsupported
  v                     v
Interactive USSD UI   Classic numbered USSD
```

## Two implementations of this diagram in this repository

This prototype contains **two** working paths through the diagram above, at different levels of
architectural rigor, and both remain intentionally available:

| | Direct path | Network-simulation path |
|---|---|---|
| Entry point | `/simulate`, `/compare` | `/network` |
| Core code | `src/services/telco/` | `src/network/` |
| Capability | A client-side toggle (`CapabilityProvider`) | A real negotiated handshake (`USSDUIAdapter.negotiateCapability`) |
| Messages | Plain `ScreenMessage`/`UserAction` | The same types, wrapped in a sequenced `Envelope` |
| Gateway/network layers | Not modeled — assumed | Modeled as distinct classes with their own trace output |
| Purpose | Fast, simple interactive demo | The architecturally complete reference implementation |

Both share the exact same business logic — `MockTelcoService` (network path) composes
`MockTelcoAdapter` (direct path) rather than reimplementing it, so "what happens when you buy
6.5GB of data" is one tested implementation either way. See `/docs/telco-integration.md`.

## Layer responsibilities (network-simulation path)

| Layer | Responsibility | Implemented as |
|---|---|---|
| Device / Terminal | The subscriber's handset — this prototype's browser tab stands in for it | `src/network/DeviceSimulator.ts` |
| Mobile Network | Transport only; carries envelopes, records each hop | `src/network/NetworkSimulator.ts` |
| Existing USSD Infrastructure | Session admission against a real dial code — unaware of USSD-UI | `src/network/USSDGatewaySimulator.ts` |
| USSD-UI Adapter | Capability negotiation, envelope construction, sequence validation, routing | `src/network/USSDUIAdapter.ts` |
| Telco Service | Products, pricing, transaction outcomes | `src/network/MockTelcoService.ts` → `MockTelcoAdapter` |
| Structured UI message | The wire format, both with (`network/`) and without (`protocol/`) an envelope | `src/protocol/`, `src/network/types.ts` |
| Device renderer | Renders or falls back, based on the negotiation outcome | `ScreenRenderer.tsx` / `ClassicUssdRenderer.tsx` (shared by both paths, unmodified) |

Everything in this table runs locally in the browser. No row here talks to a real carrier,
gateway, or handset — see `/docs/technical-limitations.md`.

## Why the split matters

Keeping "what to do" (the service) separate from "how to show it" (the presentation layer) is
what makes the classic fallback free instead of a second implementation: both renderers consume
the identical `ScreenMessage` produced by the identical service call, on both paths. The
prototype's `/compare` screen demonstrates this for the direct path; the Network page's
negotiation-result panel demonstrates it for the network path — a rejected negotiation still
receives the exact same `ScreenMessage` the accepted case does (see the test "the same
MockTelcoService call produces the identical ScreenMessage regardless of negotiation outcome" in
`tests/network/adapter-flow.test.ts`).

## Example transaction flow (network-simulation path, concrete walkthrough)

A subscriber dials MTN on SIM 1 and buys 1GB of data, on a device that supports USSD-UI:

1. **Admission** — `USSDGatewaySimulator.openSession("*123#", "mtn")` checks the dial code against
   the carrier and admits the session. An unrecognised code or carrier throws here, before
   anything USSD-UI–specific happens.
2. **Capability request** — the device sends `{ supportedVersions: ["0.1"], features: ["button",
   "input", "select", "navigation", "confirm"] }`.
3. **Negotiation** — `negotiateCapability()` finds `"0.1"` supported and every feature
   recognised, and returns `{ accepted: true, version: "0.1", features: [...] }`.
4. **Home screen** — `MockTelcoService.startSession("MTN", 1)` returns the same `ScreenMessage`
   it always would; the adapter wraps it as a `screen` envelope and the negotiated result
   (accepted) tells the device to use the interactive renderer.
5. **Menu navigation** — the subscriber taps "📦 Data Plans"; a `user_action` envelope carrying
   `{ action: "open_data_plans" }` goes back to the adapter, which asks the service for the next
   screen.
6. **Selection** — the subscriber taps "1GB — ₦500"; the action carries `{ plan: "1gb", label:
   "1GB", amount: 500 }` and the service returns a `confirm` screen showing Network, Service,
   Plan, Amount, and SIM — nothing has been charged yet.
7. **Confirmation** — the subscriber taps Confirm; the service transitions to a `processing`
   screen.
8. **Resolution** — after a short simulated delay, the service resolves the transaction and
   returns either a `success` screen (with a reference number) or an `error` screen (with a
   retry option) — see `services/transactions/transactionSimulator.ts`.

Every arrow in this list is a real, traced envelope exchange in this prototype — watch it happen
live on the **Network** page with the Network Trace panel open.

## Session flow through the layers (network-simulation path, structural summary)

```
Network page (carrier + SIM + declared device capability)
  -> USSDGatewaySimulator.openSession()      admits the dial, or throws on a bad code
  -> DeviceSimulator.buildCapabilityRequest() builds a CAPABILITY_REQUEST envelope
  -> USSDUIAdapter.negotiateCapability()      negotiates version + features, traces the outcome
  -> USSDUIAdapter.deliverInitialScreen()     asks MockTelcoService for the home screen
  -> ScreenRenderer or ClassicUssdRenderer renders it, chosen by the negotiated outcome
  -> user interaction -> DeviceSimulator.buildUserAction() -> USSDUIAdapter.handleAction()
  -> every step appends to a shared TraceRecorder, visible live in the Network Trace panel
  -> repeat until success, cancellation (session_end), or a sequence error
```

## Session flow through the layers (direct path, as implemented, unchanged)

```
Welcome (carrier + SIM picker)
  -> useUssdSession() creates a Session + a MockTelcoAdapter
  -> adapter.startSession() returns the first ScreenMessage
  -> ScreenRenderer or ClassicUssdRenderer renders it, chosen by capability.renderMode
  -> user interaction produces a UserAction
  -> adapter.handleAction(action) returns the next ScreenMessage
  -> session-manager.navigate() records the transition
  -> repeat until success, cancellation, or expiry
```
