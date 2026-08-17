# Navigation Model

Every `ScreenDef.navigation` object declares which of four controls apply to that screen:

| Flag | Meaning |
|---|---|
| `back` | Return to the previously visited screen in this session. |
| `home` | Jump directly to the session's root screen, discarding intermediate history. |
| `cancel` | End the session. |
| `retry` *(optional)* | This screen supports re-attempting its last action. |

## Back

Implemented as a pop against the session's `history` stack (`session-model.md`). Popping at the
root screen is a no-op — Back never exits a session on its own; that's what Cancel is for. A
client is expected to keep the actual prior `ScreenMessage` around locally so Back can redraw it
without a round trip to the service, since nothing in the protocol requires the service to
regenerate identical content on request.

## Home

Implemented as a stack reset to a single root entry. Distinct from Back in that it discards the
entire path, not just the last step — pressing Home from three screens deep returns to the root
in one action, matching subscriber expectations for a "start over" control.

## Cancel

Ends the session (`cancelSession` in `session-model.md`) and terminates the service-side adapter.
Cancel is available both as a footer control (when `navigation.cancel` is `true`) and, on a
`confirm` component, as its own numbered/labelled option via `cancelAction` — both routes are
expected to converge on the same session-ending behavior, not two different ones.

## Retry

Retry is scoped narrowly at v0.1: it exists only on screens produced after a failed transaction,
and it means "re-attempt the pending purchase," not "redo the last arbitrary action." A screen
that sets `navigation.retry: true` is expected to also expose an explicit `button` component
wired to the same `retry` action — the flag documents the *capability*, the button is the
*affordance*. See `component-model.md#button` and `src/services/telco/MockTelcoAdapter.ts`
(`case "retry"`) for the reference behavior: retry re-enters the `processing` screen against the
same cart, rather than silently repeating a business action with no visible feedback.

## Why these four and not raw keypad codes

Real USSD conventions often overload digits like `0` and `00` for Back/Home. This prototype's
classic renderer honors that convention for compatibility (`0` = Back, `00` = Home, see
`ClassicUssdRenderer.tsx`), but the protocol itself models navigation as named, structured
intents rather than reserved digits — so a future renderer isn't forced to burn numbered options
1–9 on tasks that aren't part of the service's actual menu.
