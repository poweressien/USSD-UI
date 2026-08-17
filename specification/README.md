# USSD-UI Specification (Draft)

> This is a proposed experimental interface model and not an existing 3GPP/ETSI/GSMA standard.

This folder is the versioned specification for the USSD-UI protocol used by the prototype in
`/src`. Where `/docs` explains and argues for the proposal, this folder defines it precisely
enough to implement a second, independent renderer from.

| Document | Defines |
|---|---|
| `ussd-ui-spec-v0.1.md` | Scope, status, and how the other documents fit together |
| `message-format.md` | The `ScreenMessage` / `UserAction` payload shapes and versioning rules |
| `envelope-model.md` | The sequenced transport envelope used by the network-simulation path only |
| `component-model.md` | Every component type and its fields |
| `session-model.md` | The session record and its status lifecycle |
| `navigation-model.md` | Back / Home / Cancel / Retry semantics |
| `capability-model.md` | The device capability profile and the negotiation contract, including the real handshake |
| `examples/` | Real, valid example payloads for each message and component kind |

## Status

Draft, version `0.1`. Nothing in this folder is stable. Field names, required-ness, and the
overall envelope may change without a migration path while the protocol is at `0.x`.

## Conformance

A renderer is conformant with `0.1` if it:

1. Rejects any `ScreenMessage` whose `version` is not in the supported set (see
   `message-format.md`), rather than guessing.
2. Renders every component type in `component-model.md` or explicitly reports it cannot.
3. Never mutates or reorders `screen.components` — presentation choices (styling, iconography)
   are the renderer's own, but structure and order are the service's.
4. Falls back to a non-interactive presentation if capability negotiation
   (`capability-model.md`) has not established support.

This prototype's own renderer (`src/components/ussd/ScreenRenderer.tsx`) is the reference
implementation of points 1–3; its classic counterpart
(`src/components/ussd/ClassicUssdRenderer.tsx`) is the reference implementation of point 4.
