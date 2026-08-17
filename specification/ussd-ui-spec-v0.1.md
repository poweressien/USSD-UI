# USSD-UI Specification — v0.1 (Draft)

> This is a proposed experimental interface model and not an existing 3GPP/ETSI/GSMA standard.
> It has not been submitted to or reviewed by any standards body.

## 1. Scope

USSD-UI describes a structured screen a Telco service can send in place of, or alongside, a
plain-text USSD prompt, and the structured reply a compatible handset sends back. It does not
define transport (how bytes reach the handset), authentication, or billing — those remain the
concern of the existing USSD session and the operator's own systems (see
`/docs/telco-integration.md`).

## 2. Terms

| Term | Meaning |
|---|---|
| Service | The Telco-side application logic that decides session flow, pricing, and content |
| Presentation layer | The translation step that turns a service prompt into a `ScreenMessage` |
| Renderer | Handset-side software that turns a `ScreenMessage` into an on-screen UI |
| Subscriber | The person using the handset |

## 3. Documents in this specification

- `message-format.md` — the `ScreenMessage` and `UserAction` payload shapes, and version negotiation.
- `envelope-model.md` — the sequenced transport envelope wrapping those payloads on the
  network-simulation path (`/network`) only; the direct path (`/simulate`, `/compare`) uses the
  payloads above with no envelope at all.
- `component-model.md` — every `ScreenComponent` variant and its required/optional fields.
- `session-model.md` — the session record a renderer or service is expected to track.
- `navigation-model.md` — the meaning of `back`, `home`, `cancel`, and `retry`.
- `capability-model.md` — how a renderer's support is described and negotiated, including the
  real `CAPABILITY_REQUEST`/`CAPABILITY_RESPONSE` handshake.

## 4. Design constraints

1. **Backward compatible by construction.** Every `ScreenMessage` must be representable as a
   classic numbered USSD menu. Functional intent can be preserved through numeric fallback,
   while presentation-specific features may be degraded — icons, emphasis, and inline validation
   have no classic-USSD equivalent and are dropped, not approximated. See `component-model.md`
   for how each component maps to a numbered line.
2. **Renderer-agnostic.** Nothing in the format assumes a specific handset OS, screen size, or
   input method beyond "can display text" and "can send a short reply."
3. **Additive evolution.** New component or input kinds must be safely ignorable — a renderer
   that doesn't recognize a kind should degrade to its `text`/`numeric` equivalent rather than
   fail closed, once such a fallback rule is specified (not yet defined at `0.1` — see
   `/docs/future-work.md`).
4. **No implicit state.** Everything a renderer needs to draw a screen is in that screen's
   message; nothing is assumed to be cached from a previous screen except the session id.

## 5. Reference implementation

This specification is accompanied by a reference implementation in `/src`:

- Parser and schema: `src/protocol/parser/`, `src/protocol/schemas/`
- Semantic validator: `src/protocol/validator/`
- Interactive renderer: `src/components/ussd/ScreenRenderer.tsx`
- Classic fallback renderer: `src/components/ussd/ClassicUssdRenderer.tsx`
- Simulated service implementing the service side of the contract: `src/services/telco/MockTelcoAdapter.ts`
- Layered network-simulation reference architecture (envelope, negotiation, sequencing, trace):
  `src/network/`

Where this document and the code disagree, treat it as a bug to fix in one of the two — file
which one you believe is correct.

## 6. Non-goals for v0.1

- Transport security and authentication (`/docs/security.md`).
- A real byte-level transport encoding — the network-simulation path's envelope is explicitly a
  hypothetical illustration, not a proposed encoding (`/docs/wire-transport.md`).
- Internationalization/localization of component labels beyond plain UTF-8 text.

`capability-model.md` originally listed a formal negotiation handshake as a non-goal; it is now
implemented (`envelope-model.md`, `src/network/`) and has moved out of this section.
