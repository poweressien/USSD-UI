# Security Model

> This is a UI and architecture proof of concept. It does not implement production security
> controls, and nothing below should be read as a claim that it does. It documents what a
> production implementation would need to address before this proposal could carry real
> transactions. No production cryptography is implemented or faked anywhere in this repository.

## The handset is never the authority

This is the single most important property of the design, and it holds regardless of which path
(`src/services/telco/` or `src/network/`) is driving a session: the handset is not, and must
never become, the authority for:

- **Price** — what something costs.
- **Balance** — what the subscriber has.
- **Eligibility** — whether the subscriber may perform an action.
- **Transaction success** — whether a purchase actually happened.

All four remain decided by the Telco/service layer (`MockTelcoAdapter` /
`MockTelcoService` in this prototype) and are never trusted from client input. A `ScreenMessage`
can *display* a price or balance the service already decided; nothing in this protocol lets a
device assert one back and have it believed. Concretely: `submit_custom_amount_data` sends a
number the subscriber typed, and the service defensively re-checks it — the device's own
client-side validation (`src/lib/validation.ts`) is a UX convenience, not a trust boundary.

## Concerns a production deployment must address

| Concern | What it means here |
|---|---|
| Authentication | Confirming the subscriber is who the SIM/session claims, at the level the operator already relies on for USSD today. |
| Authorization | Confirming the authenticated subscriber may perform the requested action on the requested account or line. |
| Message integrity | Confirming an envelope wasn't altered in transit — this prototype's sequence check (below) guards ordering only, not tampering. |
| Session binding | Tying a structured UI session to the exact same underlying USSD session — a rendered screen must not be replayable into a different session. |
| Secure transport | Protocol messages carry the same sensitivity as the USSD payloads they augment and need equivalent transport protection. |
| Replay protection | A captured `UserAction` (especially a confirm or PIN submission) must not be replayable to repeat a transaction. |
| Transaction confirmation | Every value-moving action stops at an explicit confirmation screen before the service executes it — modeled here by the `confirm` component. |
| Timeout | Structured sessions should not outlive the timeout behavior subscribers and gateways already expect from USSD. |
| Fraud prevention | Structured input doesn't remove existing fraud controls — it should feed them better data (typed actions instead of parsed free text), not bypass them. |
| Input validation | Client-side validation is a UX convenience only; a production service must revalidate every field server-side, as `MockTelcoService`/`MockTelcoAdapter` do defensively for custom amounts. |
| Privacy | `pin`-kind inputs should never appear in logs, protocol inspectors, or crash reports in a production build. |

## What the network-simulation layer adds — and doesn't

`src/network/USSDUIAdapter.ts` tracks an expected sequence number per session and rejects an
incoming envelope that doesn't match it with a `SEQUENCE_MISMATCH` error. This is a **basic
ordering guard**, illustrating the shape of the problem: it is not message integrity (nothing is
signed or hashed), not authentication, and not production-grade replay protection (a determined
attacker who can observe and re-derive sequence numbers isn't meaningfully slowed by this). Real
replay protection needs message integrity and authentication underneath it, neither of which
exists here — see the table above for what's still missing.

## A specific note on this prototype's own tooling

The in-app **Protocol Inspector**, **Session Inspector**, and **Network Trace**
panels are deliberately built for this review, and they print raw protocol traffic to the screen.
That is correct for a demo aimed at engineers and would be wrong to ship to end subscribers — a
production client must not expose a raw wire-format viewer to the person using it, particularly
once PIN and financial fields are real.

## Explicitly out of scope for this repository

No authentication, no message integrity, no real session binding, no transport security, and no
production-grade replay protection are implemented anywhere in this repository, on either the
direct (`services/telco/`) or network-simulation (`network/`) path. This remains a client-side
rendering, state-management, and architecture demonstration — not a security reference
implementation.
