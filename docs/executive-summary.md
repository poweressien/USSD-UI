# Executive Summary

USSD 2.0 is a working reference architecture and proof of concept for an **interactive
presentation layer** over Telco USSD services. It proposes that a service can send a structured
screen description instead of a bare numbered list, and that a compatible handset can render
that description as tappable controls — while a handset that doesn't support this falls back to
the classic numbered menu automatically, on the same service, in the same session, decided by a
real negotiated handshake rather than an assumption.

This document set and the accompanying repository are written for technical review, not as a
pitch. Claims are scoped deliberately; see `technical-limitations.md` before evaluating anything
else here. **USSD-UI v0.1 — Experimental Draft. Not an existing 3GPP, ETSI, or GSMA standard.**

## What is included

- A working prototype: interactive menus, custom-amount input, confirmation, processing,
  success/error, and retry — see `src/`.
- A draft wire protocol, **USSD-UI v0.1**, with a schema, a parser, a semantic validator, and a
  generic renderer that never hard-codes a screen — see `/specification/` and `src/protocol/`.
- A layered network-simulation reference architecture — `DeviceSimulator`,
  `NetworkSimulator`, `USSDGatewaySimulator`, `USSDUIAdapter`, `MockTelcoService` — implementing
  a real capability handshake, a sequenced protocol envelope, and a live network trace, on the
  `/network` page and in `src/network/`.
- A capability negotiation model at two levels of rigor: a simple client-side toggle for a fast
  live demo (`/simulate`, `/compare`), and a real negotiated request/response exchange
  (`/network`) — both fall back to rendering the *same* protocol message as classic numbered
  USSD.
- Architecture, protocol, security, and integration documentation aimed at engineers.
- An automated test suite — protocol parsing/validation, session and navigation state, input
  validation, capability resolution, transaction-state flows, and the full network-simulation
  layer (negotiation, envelopes, sequencing, trace) — see `tests/`.

## What is not included

- No connection to any real carrier, gateway, or subscriber data.
- No claim that any existing handset already renders this (`compatibility.md`).
- No claim that USSD-UI is an adopted or existing 3GPP/ETSI/GSMA standard (`protocol.md`).
- No claim that the envelope format is a real or proposed USSD wire encoding (`wire-transport.md`).
- No production security controls — authentication, message integrity, or real replay protection
  (`security.md`).

## How to review this

The fastest path is the in-app **Demo Mode** (`/demo` once running locally), a guided sequence
covering the whole system including the network architecture in five to ten minutes. See the
root `README.md` for exact setup and run commands, and the recommended demo sequence.

## Document map

| Document | Covers |
|---|---|
| `problem.md` | Why the numbered-menu interaction model is worth improving |
| `proposed-solution.md` | The presentation-layer proposal itself |
| `architecture.md` | The layered network architecture — both implementations in this repo |
| `protocol.md` | The USSD-UI wire format (`ScreenMessage`/`UserAction`) |
| `capability-negotiation.md` | The simple toggle model and the real negotiated handshake |
| `wire-transport.md` | The protocol envelope, explicitly labeled as hypothetical transport |
| `compatibility.md` | The backward-compatibility guarantee |
| `ussd-vs-cat-stk.md` | How this compares to existing USSD and SIM Toolkit approaches |
| `security.md` | Production security concerns this prototype does not implement |
| `telco-integration.md` | Where this sits relative to existing operator systems |
| `technical-limitations.md` | What this prototype deliberately does not do |
| `future-work.md` | What would need to happen next |
