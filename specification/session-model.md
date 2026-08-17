# Session Model

## Session record

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Opaque, unique per dial. |
| `carrier` | `string` | Demo carrier name for this session. |
| `simSlot` | `number` | Which simulated SIM slot originated the session. |
| `currentScreen` | `string` | The `id` of the screen currently on top of history. |
| `history` | `string[]` | Root-first stack of screen ids visited this session. |
| `status` | `"active" \| "expired" \| "cancelled" \| "completed"` | See lifecycle below. |
| `startedAt` | ISO 8601 string | |
| `expiresAt` | ISO 8601 string | `startedAt` + TTL. |

Reference implementation: `src/session/session-manager.ts`.

## Lifecycle

```
        create()
           |
           v
        active ------cancelSession()-----> cancelled
           |
           |------completeSession()------> completed
           |
           |------(TTL elapsed)----------> expired
```

`active` is the only status from which `navigate`, `goBack`, or `goHome` are permitted; the
reference implementation throws if called against a session in any other status, rather than
silently no-op-ing, so a caller can't accidentally act on a dead session.

## TTL

`SESSION_TTL_MS` is 3 minutes in this prototype, matching typical real USSD gateway timeouts.
`isExpired(session, now)` is a pure comparison against `expiresAt`; `expireSessionIfNeeded` is the
convenience wrapper a host application calls on a timer or on next interaction.

## History as a stack, not a log

`history` is the *current* navigation stack, not an audit trail — `goBack` truncates it and
`goHome` collapses it to a single root entry. A full interaction log, if a production deployment
wants one, is a separate concern layered on top of (not stored inside) the session record.

## Relationship to the protocol layer

The session record is deliberately independent of `ScreenMessage`/`ScreenDef`
(`message-format.md`). A `Session` tracks *which* screen id is current; it does not cache the
screen's own content. This is why `Session.currentScreen` is just a string id — the actual
`ScreenMessage` for "what to redraw on Back" is the host application's responsibility to retain
(see the message stack kept by `src/app/providers/useUssdSession.ts`), not the session model's.
