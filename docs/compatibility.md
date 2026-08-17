# Compatibility

The proposal's one hard constraint: a subscriber on a handset that doesn't support the
interactive layer must see exactly what they see today, on the same service, in the same
session. Nothing about this proposal is allowed to degrade the existing experience.

## The guarantee

1. Every screen a service produces is a single `ScreenDef` (`protocol.md`).
2. Two renderers can consume that same `ScreenDef`: the interactive one and the classic one.
3. Which renderer runs is decided entirely by capability negotiation
   (`capability-negotiation.md`), never by the service having to author two versions of a menu.

Because both renderers read the same data, there is no second menu tree to keep in sync, and no
scenario where the interactive and classic experiences can silently drift apart from each other.

## What "classic" looks like for the same screen

```
USSD 2.0                              Classic USSD (identical ScreenDef)
---------                              --------------------------------
┌─────────────────────┐               MTN Services
│     MTN Services     │
│  [ 📦 Data Plans ]   │               1. Data Plans
│  [ 💳 Airtime ]      │               2. Airtime
│  [ 💰 Balance ]      │               3. Balance
│  [ 🎁 Gift Data ]    │               4. Gift Data
│  ← Back    ✕ Cancel  │
└─────────────────────┘               0 Back   00 Home
```

## What this prototype cannot verify

This repository can prove the concept renders and navigates correctly for two hypothetical
render targets. It cannot prove real handset compatibility, because no such handset exists yet —
see `technical-limitations.md`. The compatibility claim here is scoped to: *if* a handset
implements a USSD-UI renderer, *then* the same service, the same session, and the same fallback
guarantee hold, because the architecture keeps presentation and business logic separate
(`architecture.md`).

## Backward compatibility is the default, not a feature flag

If a capability signal is missing, ambiguous, or from an unrecognized source, the correct
behavior is always to fall back to classic USSD — never to guess in favor of the interactive
layer. This prototype's `resolveRenderMode` reflects that: it only returns `"interactive"` on an
explicit, positive capability declaration.
