# Protocol

> Draft reference protocol — not an existing telecom standard. See
> `/specification/ussd-ui-spec-v0.1.md` for the versioned specification this document summarizes.

**USSD-UI v0.1** is this prototype's draft wire format. A Telco service sends a `ScreenMessage`;
a handset renderer sends back a `UserAction` after the subscriber interacts with it.

## ScreenMessage

```json
{
  "protocol": "USSD-UI",
  "version": "0.1",
  "type": "screen",
  "sessionId": "demo-001",
  "screen": {
    "id": "data-plans",
    "title": "Data Plans",
    "components": [
      {
        "type": "button",
        "id": "plan_6500",
        "label": "6.5GB — ₦1,500",
        "action": "purchase_data",
        "data": { "plan": "6500MB", "amount": 1500 }
      }
    ],
    "navigation": { "back": true, "home": true, "cancel": true }
  }
}
```

## Component types

These are the building blocks a service can compose into a screen instead of a single block of
text — this is the concrete "interactive components" idea behind the whole proposal.
`text`, `button`, `input`, `select`, `confirm`, `processing`, `success`, `error`. The renderer
switches on `component.type` alone (`src/components/ussd/ComponentRenderer.tsx`), so adding a new
component kind is additive to the type union and the renderer, not a rewrite of any screen.

## Input kinds

`numeric`, `currency`, `phone-number`, `text`, `pin`. Each carries its own client-side validation
rule (`src/lib/validation.ts`); a `pin` input is also masked on-screen.

## Navigation

Every screen declares which of `back`, `home`, and `cancel` apply. An optional `retry` flag
documents that a screen supports retrying its last action, independent of whether that screen
also exposes an explicit Retry button in its component list — the flag is protocol metadata, the
button is the actual affordance.

## UserAction

```json
{
  "type": "button",
  "id": "plan_6500",
  "action": "purchase_data",
  "data": { "plan": "6500MB", "amount": 1500 }
}
```

`type` records what kind of component produced the action (`button`, `input`, `select`, or
`navigation` for Back/Home/Cancel/Retry). `action` is the semantic instruction the service should
act on; `data` or `value` carries whatever the component collected.

## Versioning

The parser rejects any `version` outside `SUPPORTED_PROTOCOL_VERSIONS`
(`src/protocol/schemas/screenMessage.schema.ts`). This prototype supports only `0.1`. A real
deployment needs an explicit negotiation step — see `capability-negotiation.md` — before assuming
a handset understands a given protocol version at all.

## Parsing vs. validation

The protocol layer deliberately separates two concerns:

- **Parsing** (`src/protocol/parser/`) — structural, schema-driven. Is this valid JSON in the
  right shape, with a supported protocol version? Implemented with Zod.
- **Validation** (`src/protocol/validator/`) — semantic. Are component ids unique on this screen?
  Does a `select` have at least one option? Does a `confirm` have at least one row?

A message can be well-formed and still fail validation — that distinction is one real protocol
implementations need too, and this prototype's test suite (`tests/protocol/`) exercises both
paths independently.

## The envelope (network-simulation path only)

`ScreenMessage` and `UserAction`, as defined above, are unchanged and are exactly what
`/simulate` and `/compare` send and receive directly — no envelope, no negotiation round trip.
The `/network` path wraps the same types in a sequenced envelope instead of replacing them:

```json
{
  "protocol": "USSD-UI",
  "version": "0.1",
  "messageId": "msg-a1b2c3",
  "sessionId": "demo-042",
  "sequence": 3,
  "messageType": "screen",
  "payload": { "...": "the same ScreenMessage shown above" }
}
```

`messageType` is one of `capability_request`, `capability_response`, `screen`, `user_action`,
`error`, or `session_end`. Full definition: `specification/envelope-model.md`. This is a
hypothetical transport representation, explicitly labeled as such wherever it appears — see
`wire-transport.md`.
