# Telco Integration Model

This proposal is a presentation and interoperability layer. It is deliberately not a replacement
for any part of an operator's existing business logic.

```
Existing Telco Systems
  Billing
  Products
  Balance
  Customer services
  Transactions
        |
        v
  USSD 2.0 Adapter
        |
        v
  Structured UI Message
        |
        v
  Device Presentation Layer
```

## Where the adapter sits

A production `TelcoAdapter` — the interface this prototype's `MockTelcoAdapter` implements, see
`src/services/telco/TelcoAdapter.ts` — would sit beside the operator's existing USSD application,
translating its existing prompts and menu logic into structured screen messages, not
reimplementing billing, product catalogs, or balance logic.

```ts
interface TelcoAdapter {
  startSession(carrier: string, simSlot: number): Promise<ScreenMessage>;
  handleAction(action: UserAction): Promise<ScreenMessage>;
  terminateSession(): Promise<void>;
}
```

## Integration surface

- **Inbound** — the existing service continues to decide session flow, pricing, and eligibility.
- **Outbound** — the adapter emits a `ScreenMessage` per prompt instead of (or alongside) plain
  text.
- **Return path** — a `UserAction` maps back onto whatever input the existing service already
  expects from a USSD reply.

## Practical implication

Adopting this would not mean rebuilding product, billing, or CRM systems. It would mean adding a
thin translation layer in front of USSD responses that are already being generated today — the
`MockTelcoAdapter` in this repository is a working illustration of that shape, built against
mock data instead of a real billing system, with the same interface a real adapter would
implement. The network-simulation path's `MockTelcoService` (`src/network/MockTelcoService.ts`)
is the same illustration under the name this document uses for it — it composes
`MockTelcoAdapter` rather than duplicating its logic, so there is exactly one tested
implementation of "what happens when you buy 6.5GB of data," not two that could drift apart.
