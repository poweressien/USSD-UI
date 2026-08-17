# Envelope Model (Network-Simulation Path)

> Applies only to the `/network` path (`src/network/`). The direct `/simulate` and `/compare`
> paths send `ScreenMessage`/`UserAction` exactly as defined in `message-format.md`, with no
> envelope. This document does not change that format — it defines an additional wrapper around
> it. Hypothetical transport representation — not an existing USSD encoding; see
> `/docs/wire-transport.md`.

## Envelope

| Field | Type | Notes |
|---|---|---|
| `protocol` | `"USSD-UI"` | Same namespace tag as `message-format.md`. |
| `version` | `string` | Same versioning rules as `message-format.md`. |
| `messageId` | `string` | Unique per envelope. Not currently reused for de-duplication — see Future Work. |
| `sessionId` | `string` | Opaque session identifier. |
| `sequence` | `number` | Per-sender monotonic counter — see Sequencing below. |
| `messageType` | `MessageType` | Discriminates `payload`'s shape. See below. |
| `payload` | *(depends on `messageType`)* | |

## Message types

| `messageType` | `payload` shape | Direction |
|---|---|---|
| `capability_request` | `{ supportedVersions: string[]; features: string[] }` | Device → Adapter |
| `capability_response` | `{ accepted: boolean; protocol: "USSD-UI"; version?: string; features?: string[]; reason?: string }` | Adapter → Device |
| `screen` | `ScreenMessage` (unchanged — `message-format.md`) | Adapter → Device |
| `user_action` | `UserAction` (unchanged — `message-format.md`) | Device → Adapter |
| `error` | `{ code: string; message: string }` | Adapter → Device |
| `session_end` | `{ reason: string }` | Device → Adapter |

Reference implementation: `src/network/types.ts` (the discriminated `AnyEnvelope` union and one
`makeXEnvelope()` builder per type), `src/network/USSDUIAdapter.ts` (the only class that
constructs adapter→device envelopes).

## Sequencing

Each side of the exchange maintains its own outgoing counter, starting at 1. The adapter
independently tracks the last sequence number it accepted from the device and requires the next
incoming envelope to be exactly one greater — see `USSDUIAdapter.checkIncomingSequence`. An
envelope that doesn't match is rejected with an `error` envelope (`code: "SEQUENCE_MISMATCH"`)
and does not reach the Telco service. This is explicitly a basic ordering guard, not message
integrity or production replay protection — see `/docs/security.md`.

## Capability negotiation payloads

```json
// capability_request
{ "supportedVersions": ["0.1"], "features": ["button", "input", "select", "navigation", "confirm"] }

// capability_response (accepted)
{ "accepted": true, "protocol": "USSD-UI", "version": "0.1", "features": ["button", "input", "select", "navigation", "confirm"] }

// capability_response (rejected)
{ "accepted": false, "protocol": "USSD-UI", "reason": "No overlapping protocol version (device offered: )" }
```

`features` values are drawn from `NEGOTIABLE_FEATURES` in
`src/network/capability-negotiation.ts`: `button`, `input`, `select`, `confirm`, `navigation`.
Negotiation is a set intersection — see `capability-model.md` for the higher-level negotiation
contract this payload implements, and `/docs/capability-negotiation.md` for the narrative
explanation.

## What this model does not define

- Any actual bytes-on-the-wire encoding (`/docs/wire-transport.md`).
- Message integrity or signing.
- De-duplication using `messageId` (present in every envelope, but not yet checked by anything).
- Multi-message batching or flow control.
