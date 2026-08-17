# USSD 2.0 — Interactive USSD Presentation Layer

**Technical reference architecture and proof of concept.** USSD-UI v0.1 — Experimental Draft.
A structured, interactive alternative to numbered-reply USSD menus, with a real negotiated
capability handshake, a sequenced protocol envelope, and automatic fallback to classic USSD for
handsets that don't support it.

> This is a simulated, local-only prototype. It does not connect to any real carrier, gateway, or
> subscriber data, and does not claim any existing handset already supports this, or that USSD-UI
> is an existing 3GPP, ETSI, or GSMA standard. See
> [`docs/technical-limitations.md`](docs/technical-limitations.md) before evaluating anything
> else here.

```
Traditional USSD                    Proposed USSD 2.0
-----------------                    -----------------
MTN Services                         ┌─────────────────────┐
                                      │     MTN Services     │
1. Data Plans                        │  [ 📦 Data Plans ]   │
2. Airtime                           │  [ 💳 Airtime ]      │
3. Balance                           │  [ 💰 Balance ]      │
4. Gift Data                         │  [ 🎁 Gift Data ]    │
                                      │  ← Back    ✕ Cancel  │
Reply:                                └─────────────────────┘
```

---

## 1. Setup

Requires Node.js 20+ and npm.

```bash
git clone <this-repository-url> ussd-2.0
cd ussd-2.0
npm install
```

## 2. Run

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Everything runs client-side —
there is no backend to start, and nothing contacts a real network.

Other commands:

```bash
npm run build        # type-check + production build → dist/
npm run preview      # serve the production build locally
npm test             # run the automated test suite once
npm run test:watch   # run tests in watch mode
npm run typecheck    # type-check src/ and tests/ together
npm run lint         # oxlint
```

---

## 3. Project structure

```
ussd-2.0/
├── README.md
├── package.json / tsconfig*.json / vite.config.ts
│
├── src/
│   ├── app/
│   │   ├── router/            AppRouter (route table) + Layout (header/nav/footer shell)
│   │   └── providers/         CapabilityProvider, useUssdSession (direct path),
│   │                          useNetworkSession (network-simulation path)
│   │
│   ├── components/
│   │   ├── ui/                Button, Badge, PhoneFrame (device chrome)
│   │   ├── ussd/               ScreenRenderer (interactive), ClassicUssdRenderer (legacy),
│   │   │   └── parts/          shared by BOTH the direct and network-simulation paths
│   │   ├── simulator/          DemoBadge
│   │   └── protocol/           ProtocolInspector, SessionInspector, NetworkTracePanel, WireView
│   │
│   ├── screens/                Welcome, Simulate, Compare, Network, Demo, Docs (13 pages), NotFound
│   │
│   ├── protocol/                ScreenMessage/UserAction types, schema, parser, validator —
│   │                            used directly by Simulate/Compare, and as the envelope payload
│   │                            on the Network path
│   │
│   ├── network/                 NEW: the layered network-simulation reference architecture —
│   │                            DeviceSimulator, NetworkSimulator, USSDGatewaySimulator,
│   │                            USSDUIAdapter, MockTelcoService, envelope types, capability
│   │                            negotiation, TraceRecorder
│   │
│   ├── session/                 session-manager.ts, navigation-stack.ts (pure functions)
│   │
│   ├── services/
│   │   ├── telco/                TelcoAdapter interface, MockTelcoAdapter (the shared business
│   │   │   └── screens/           logic both paths ultimately run), cart.ts, screen builders
│   │   ├── transactions/          transactionSimulator.ts
│   │   └── simulator/             capability.ts (the simple boolean render-mode resolution)
│   │
│   ├── data/                    carriers, data/airtime/voice catalogs, device capability profiles
│   └── lib/                     validation.ts, text.ts, cn.ts
│
├── specification/                Versioned USSD-UI v0.1 protocol spec + JSON examples
├── docs/                         Executive summary through future work (13 documents)
├── tests/                        108 tests across 13 files, including tests/network/
└── public/
```

## 4. Two implementations, one architecture

This repository contains two working paths, at different levels of rigor — both remain available:

| | Direct path | Network-simulation path |
|---|---|---|
| Entry point | `/simulate`, `/compare` | `/network` |
| Core code | `src/services/telco/` | `src/network/` |
| Capability | A client-side toggle, free to flip mid-session | A real negotiated handshake, decided once at session start |
| Messages | Plain `ScreenMessage`/`UserAction` | The same types, wrapped in a sequenced `Envelope` |
| Purpose | Fast, simple interactive demo | The architecturally complete reference implementation |

Both share one business-logic implementation — `MockTelcoService` composes `MockTelcoAdapter`
rather than duplicating it, so "what happens when you buy 6.5GB of data" is one tested code path
either way. Full detail: [`docs/architecture.md`](docs/architecture.md).

## 5. Architecture summary

```
USER → PHONE/TERMINAL → MOBILE NETWORK → EXISTING USSD INFRASTRUCTURE
  → USSD-UI ADAPTER (negotiates capability with the device) → TELCO SERVICE
  → STRUCTURED UI MESSAGE → DEVICE RENDERER → [ negotiation outcome ] → INTERACTIVE UI | CLASSIC USSD
```

The network-simulation path implements this as five distinct classes in `src/network/`:
`DeviceSimulator`, `NetworkSimulator`, `USSDGatewaySimulator`, `USSDUIAdapter`,
`MockTelcoService` — each with its own responsibility and its own line in the live **Network
Trace** panel. The handset is never the authority for price, balance, eligibility, or
transaction success in either path — see [`docs/security.md`](docs/security.md).

## 6. Protocol summary

**USSD-UI v0.1 — Experimental Draft.** Not an existing 3GPP, ETSI, or GSMA standard. A service
sends a `ScreenMessage`:

```json
{
  "protocol": "USSD-UI", "version": "0.1", "type": "screen", "sessionId": "demo-001",
  "screen": {
    "id": "data-plans", "title": "Data Plans",
    "components": [
      { "type": "button", "id": "plan_6500", "label": "6.5GB — ₦1,500",
        "action": "purchase_data", "data": { "plan": "6500MB", "amount": 1500 } }
    ],
    "navigation": { "back": true, "home": true, "cancel": true }
  }
}
```

...and receives back a `UserAction`. Eight component types, five input kinds; the renderer
dispatches on `component.type` alone and never hard-codes a screen. **On the network-simulation
path only**, this same message travels wrapped in a sequenced envelope
(`{ protocol, version, messageId, sessionId, sequence, messageType, payload }`) — see
[`specification/envelope-model.md`](specification/envelope-model.md) and, for the explicit
"this is not a real USSD encoding" disclaimer, [`docs/wire-transport.md`](docs/wire-transport.md).
Full protocol definition: [`specification/`](specification/).

## 7. Main prototype flow

```
Welcome (dial a demo network's USSD code, choose SIM)
  → Home
    → Data Plans → [ pick a plan | Custom Amount → validated input ]
      → Confirmation → Processing → Success
                                   → Error → Retry → Processing → Success/Error
  → Back / Home / Cancel available throughout
```

The same pattern also drives Airtime, Voice Offers, Gift Data, Transfer, and Balance. On
`/network`, the same flow runs behind a real capability handshake decided at dial time — choose
"Legacy Device" and the same screens render as classic numbered USSD instead, with every step
traced.

## 8. Testing

```bash
npm test
```

Current results: **108 tests passing across 13 files**, covering:

- **Protocol** — valid parse, malformed rejection, unsupported-version rejection, component
  validation, and a conformance suite running every `specification/examples/*.json` through the
  real parser and validator.
- **Navigation** — Back, Home, Cancel, Retry. **Sessions** — create, navigate, expire, cancel,
  complete.
- **Input** — valid/invalid amounts, min/max, empty input, phone number and PIN validation.
- **Capability** — supported/unsupported device, fallback resolution (simple model).
- **Transaction states** — processing, success, failure, retry, full adapter flows.
- **Network simulation** (`tests/network/`) — capability request/response, successful and failed
  negotiation, fallback, protocol envelope shape, monotonic sequence numbers, rejection of an
  out-of-order/replayed envelope, full session handling end to end (gateway admission through
  purchase to success), ordered network trace assertions, and user-action envelopes.

`npm run typecheck` and `npm run lint` both pass with zero errors/warnings as of this writing.

## 9. Known limitations

- No connection to any real carrier, USSD gateway, or subscriber data.
- No claim that any shipping handset renders USSD-UI today — capability is simulated locally.
- The protocol is an experimental draft, not a reviewed or adopted standard.
- The network-simulation classes (`src/network/`) model a conceptual architecture only — no real
  network protocol, SS7 signaling, or USSD gateway behavior is implemented.
- The envelope format is an illustrative structure, not a proposed real-world USSD encoding.
- No production security controls (auth, message integrity, transport security, real replay
  protection) are implemented — the sequence check is a basic ordering guard only.
- All balances, references, and transaction outcomes are generated locally and are not real.

Full list: [`docs/technical-limitations.md`](docs/technical-limitations.md).

## 10. Recommended demo sequence (~5 minutes)

1. **Network** — dial as "Legacy Device", watch negotiation get rejected and the session fall
   back live in the trace; dial again as "Interactive Device" and watch it succeed.
2. Open **Protocol Inspector** to show the sequenced envelope, with the hypothetical-transport
   disclaimer.
3. **Simulate** — Home → Data Plans → pick 6.5GB → Confirm → watch Processing resolve.
4. Set **Presenter Controls → Always fail**, buy another plan, and use **Retry** — the service
   stays authoritative throughout.
5. Open **Compare** to show one shared session rendered two ways at once.
6. Point to **Docs → Security Model** and **Technical Limitations** to close on scope honestly.

For the fuller walkthrough (sixteen steps, roughly ten minutes, including the full network
architecture, protocol inspectors, and every documentation page), use the in-app **Demo Mode**
(`/demo`) — it links directly into the relevant screen or doc for each step.

---

## Documentation index

- [`docs/executive-summary.md`](docs/executive-summary.md) — start here
- [`docs/problem.md`](docs/problem.md) · [`docs/proposed-solution.md`](docs/proposed-solution.md)
- [`docs/architecture.md`](docs/architecture.md) · [`docs/protocol.md`](docs/protocol.md)
- [`docs/capability-negotiation.md`](docs/capability-negotiation.md) ·
  [`docs/wire-transport.md`](docs/wire-transport.md)
- [`docs/compatibility.md`](docs/compatibility.md) ·
  [`docs/ussd-vs-cat-stk.md`](docs/ussd-vs-cat-stk.md)
- [`docs/security.md`](docs/security.md) ·
  [`docs/telco-integration.md`](docs/telco-integration.md)
- [`docs/technical-limitations.md`](docs/technical-limitations.md) ·
  [`docs/future-work.md`](docs/future-work.md)
- [`specification/`](specification/) — the versioned USSD-UI v0.1 protocol definition, including
  [`envelope-model.md`](specification/envelope-model.md)

All of the above is also browsable inside the running app under **Docs**.

---

*Not affiliated with, endorsed by, or connected to MTN, Airtel, Glo, 9mobile, or any telecom
operator. Carrier names are used solely as recognisable labels for this prototype's demo menus.*
