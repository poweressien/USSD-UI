# USSD vs SIM Toolkit (CAT/USAT) vs USSD 2.0

Two real, deployed technologies already touch this space. This proposal is closer to the first
than the second, and doesn't attempt to replace either.

## Traditional USSD

- Network-driven: the service on the operator's side controls every screen.
- Session-oriented, with short server-defined timeouts.
- Interaction is plain text and numeric reply only.
- Universally supported — this is its core strength, and the reason it remains in use.

## SIM Toolkit / CAT / USAT

- UICC/SIM-driven: menus and logic live on the SIM itself, not the network session.
- Uses proactive commands the SIM issues to the handset (display menu, get input, and similar).
- Already supports structured menus and input today, standardized through telecom and
  smart-card specifications.
- Requires SIM-side provisioning — changing the menu means reprovisioning SIM applications, not
  shipping a network-side update.

## Proposed Interactive USSD Presentation Layer

- Network/service-driven, like traditional USSD — no SIM application involved.
- Sends structured UI messages instead of (or alongside) plain text.
- Interactive controls: buttons, validated inputs, confirmations.
- Requires capability negotiation and a classic-USSD fallback for unsupported handsets
  (`capability-negotiation.md`).
- Proposed and experimental — not an existing, adopted mechanism.

## Summary

| | Traditional USSD | SIM Toolkit (CAT/USAT) | Proposed USSD 2.0 |
|---|---|---|---|
| Driven by | Network/service | SIM/UICC | Network/service |
| Update mechanism | Server-side, instant | SIM (re)provisioning | Server-side, instant |
| Interaction | Text + numeric reply | Structured menus, native | Structured, interactive |
| Support today | Universal | Where SIM app is provisioned | None — proposed |
| Standardized | Yes | Yes | No — draft only |

In short: this proposal keeps USSD's network-driven update model (change the service, not the
SIM) while borrowing CAT/STK's idea that a session can present more than plain numbered text —
without requiring SIM provisioning to do it.
