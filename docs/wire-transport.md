# Wire / Transport View

> Hypothetical transport representation — not an existing USSD encoding. Real USSD does not
> currently transport JSON, and nothing in this repository claims otherwise.

USSD today carries plain text over signaling channels defined by existing telecom standards. This
prototype's `Envelope<T>` (`src/network/types.ts`) is this proof of concept's own illustrative
structure for reasoning about a *possible* future encoding — it is not a claim about how any real
USSD gateway, SS7 stack, or handset modem actually carries bytes.

## What actually flows, in this simulation

```
TELCO SERVICE
  |
  v
USSD-UI ADAPTER      wraps the ScreenMessage/UserAction in an Envelope
  |
  v
NETWORK              carries the envelope, adds no content of its own
  |
  v
DEVICE
```

An envelope, as generated live by this prototype (see the **Protocol Inspector** panel on `/network`):

```json
{
  "protocol": "USSD-UI",
  "version": "0.1",
  "messageId": "msg-a1b2c3",
  "sessionId": "demo-042",
  "sequence": 3,
  "messageType": "screen",
  "payload": {
    "protocol": "USSD-UI",
    "version": "0.1",
    "type": "screen",
    "sessionId": "demo-042",
    "screen": { "id": "data-plans", "title": "Data Plans", "components": [], "navigation": {} }
  }
}
```

## What a real encoding would have to answer, and doesn't here

- How this maps onto existing USSD's constrained payload size and character set (USSD messages
  are small; a verbose JSON envelope is not a realistic wire format as-is).
- Whether encoding happens in the gateway, in a new signaling extension, or via an entirely
  different bearer alongside USSD.
- Compression, binary encoding, or a more compact schema than illustrative JSON.

None of this is designed in this prototype. The envelope's job here is to make the *architecture*
(negotiation, sequencing, message typing) concrete and testable — not to propose a byte-level
encoding. See `/docs/future-work.md`.
