# Future Work

## Standards engagement

Share this proposal with relevant standards and industry bodies for feedback before treating any
part of the protocol as stable. Version `0.1` should be read as a discussion draft, not a
commitment.

## Handset and gateway pilots

- A minimal handset-side renderer (even a reference Android proof of concept) to test real
  parsing and rendering constraints against actual device fragmentation.
- A gateway-side pilot translating one low-risk existing USSD flow (e.g. balance check) into
  USSD-UI messages, alongside the existing plain-text path.

## Protocol hardening

- A formal, versioned schema — this prototype's Zod schema (`src/protocol/schemas/`) is a
  starting point for tooling, not a ratified spec.
- ~~An explicit capability-negotiation handshake~~ — implemented (`src/network/`,
  `envelope-model.md`). Still open: message integrity and authentication underneath that
  handshake, and a real byte-level transport encoding (`wire-transport.md`) — a JSON envelope is
  not a realistic wire format for USSD's constrained payload size as-is.
- A defined upgrade/downgrade path across protocol versions as the format evolves.
- A capability cache/registry so negotiation doesn't need to be re-established on every single
  dial — this prototype renegotiates fresh every session (`capability-model.md`).
- `messageId` is present on every envelope but not yet used for de-duplication — a production
  adapter would need to decide a retention window and dedupe policy.

## Accessibility and localization

Structured components open the door to screen-reader support, larger touch targets, and
per-market localization that a numeric menu can't offer — none of which this prototype has tested
with real assistive technology yet.

## Security review

An independent review against every concern listed in `security.md`, before any pilot carries
real value-moving transactions.

## Operator pilot scope

If pursued, the recommended first pilot is a single non-critical, read-only flow (balance or plan
browsing, not a funds-moving transaction), on one carrier, with capability negotiation defaulting
to classic USSD for every handset until explicitly allow-listed.
