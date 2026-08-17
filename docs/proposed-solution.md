# Proposed Solution

Introduce an **Interactive USSD Presentation Layer** between the Telco's existing USSD service
logic and the subscriber's handset. The service keeps deciding what happens — products, pricing,
billing, eligibility — and additionally describes each screen as a small structured message
instead of (or alongside) a plain-text menu string.

## What changes

- The USSD payload gains an optional structured screen description (`protocol.md`).
- A capable handset renders that description as buttons, inputs, and confirmations.
- Every screen still maps to the same session, the same billing event, and the same fallback
  text a legacy phone would see.

## What doesn't change

- The dial code, the session model, and the operator's backend systems are untouched.
- A subscriber on an unsupported handset sees exactly what they see today
  (`compatibility.md`).

## Before / after

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

## Why a presentation layer, not a new channel

A new app-based channel already exists in the market (USSD apps, banking apps), and it
fragments reach back down to smartphone owners with data. Traditional USSD remains available on
legacy terminals; USSD-UI requires terminal support, and a terminal without it simply continues
using the session it already has today (`compatibility.md`). The value of this proposal is that
the underlying session never narrows to only capable handsets — only the presentation does — so
adopting it doesn't cost an operator any of the reach classic USSD already has. See
`telco-integration.md` for where this sits relative to a carrier's existing systems.

## What this repository demonstrates

The prototype in this repository implements the presentation layer, a mock Telco backend, both
renderers (interactive and classic), and capability negotiation between them, all running
locally with no network dependency. See `architecture.md` for the full conceptual picture and
which parts of it this codebase actually implements.
