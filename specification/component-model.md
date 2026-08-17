# Component Model

Every entry in `screen.components` has a `type` discriminant and an `id` unique within that
screen. This document lists every `type` defined at v0.1, its fields, and how a classic renderer
must represent it (see `/docs/compatibility.md` for why that mapping is mandatory, not optional).

## `text`

| Field | Type | Required |
|---|---|---|
| `value` | `string` | Yes |
| `emphasis` | `"normal" \| "muted" \| "strong"` | No |

Classic mapping: printed as a plain line, no numbering.

## `button`

| Field | Type | Required |
|---|---|---|
| `label` | `string` | Yes |
| `action` | `string` | Yes |
| `data` | `Record<string, unknown>` | No |

Classic mapping: one numbered line (`N. <label>`); selecting it sends a `button` `UserAction`
with the same `action`/`data`.

## `input`

| Field | Type | Required |
|---|---|---|
| `label` | `string` | Yes |
| `kind` | `"numeric" \| "currency" \| "phone-number" \| "text" \| "pin"` | Yes |
| `action` | `string` | Yes |
| `min` | `number` | No — numeric/currency only |
| `max` | `number` | No — numeric/currency only |
| `placeholder` | `string` | No |

Classic mapping: the screen's free-text reply is captured as this field's value. A screen must
not combine more than one un-numbered `input` with a set of numbered `button`s in a way that
makes the reply ambiguous — this prototype's flows always isolate a lone `input` on its own
screen for exactly this reason.

## `select`

| Field | Type | Required |
|---|---|---|
| `label` | `string` | Yes |
| `action` | `string` | Yes |
| `options` | `{ label: string; value: string }[]` | Yes, non-empty |

Classic mapping: each option becomes its own numbered line, identical to a set of `button`s.

## `confirm`

| Field | Type | Required |
|---|---|---|
| `rows` | `{ label: string; value: string }[]` | Yes, non-empty |
| `confirmAction` | `string` | Yes |
| `cancelAction` | `string` | No |

Classic mapping: rows are printed as plain lines, followed by numbered `Confirm` / `Cancel`
options.

## `processing`

| Field | Type | Required |
|---|---|---|
| `message` | `string` | Yes |

Classic mapping: printed as a plain line. Carries no navigation — a processing screen's
`navigation` object should have every flag `false`.

## `success`

| Field | Type | Required |
|---|---|---|
| `heading` | `string` | Yes |
| `rows` | `{ label: string; value: string }[]` | No |
| `reference` | `string` | No |

## `error`

| Field | Type | Required |
|---|---|---|
| `heading` | `string` | Yes |
| `reason` | `string` | No |

`success` and `error` carry no actions of their own — a screen using them pairs them with
ordinary `button` components (e.g. `Done`, `Retry`, `Home`) so the classic mapping stays uniform:
every actionable thing on a screen is still just a numbered `button`.

## Adding a new component type

1. Add the variant to `ScreenComponent` in `src/protocol/types/index.ts`.
2. Add the matching case to `ComponentSchema` in `src/protocol/schemas/screenMessage.schema.ts`.
3. Add a case to `ComponentRenderer` (`src/components/ussd/ComponentRenderer.tsx`) — the switch is
   exhaustively type-checked, so a missing case fails the build.
4. Add a classic-mode mapping in `ClassicUssdRenderer.tsx`.
5. Document the fields here.
