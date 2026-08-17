# Message Format

## ScreenMessage (service → handset)

| Field | Type | Required | Notes |
|---|---|---|---|
| `protocol` | `"USSD-UI"` | Yes | Literal namespace tag. Any other value is rejected. |
| `version` | `string` | Yes | Must be one of `SUPPORTED_PROTOCOL_VERSIONS` (currently `["0.1"]`). |
| `type` | `"screen"` | Yes | Reserved for future message types (see Future Work). |
| `sessionId` | `string` | Yes | Opaque session identifier, non-empty. |
| `screen` | `ScreenDef` | Yes | See below. |

### ScreenDef

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | Yes | Stable identifier for this screen, non-empty. |
| `title` | `string` | Yes | Primary heading. |
| `subtitle` | `string` | No | Secondary line, e.g. step indicator. |
| `components` | `ScreenComponent[]` | Yes | Rendered top to bottom, in array order. See `component-model.md`. |
| `navigation` | `ScreenNavigation` | Yes | See `navigation-model.md`. |

## UserAction (handset → service)

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"button" \| "input" \| "select" \| "navigation"` | Yes | What kind of component produced this action. |
| `id` | `string` | Yes | The id of the component (or nav control) that produced it. |
| `action` | `string` | Yes | The semantic action string the service should handle. |
| `data` | `Record<string, unknown>` | No | Structured payload, typically echoed from the originating `button`'s own `data`. |
| `value` | `string` | No | Free-form value, used by `input`/`select` responses. |

## Example exchange

Request (service → handset):

```json
{
  "protocol": "USSD-UI",
  "version": "0.1",
  "type": "screen",
  "sessionId": "demo-001",
  "screen": {
    "id": "custom-amount-data",
    "title": "Custom Amount",
    "components": [
      {
        "type": "input",
        "id": "custom_amount_data",
        "label": "Enter amount",
        "kind": "currency",
        "action": "submit_custom_amount_data",
        "min": 50,
        "max": 100000
      }
    ],
    "navigation": { "back": true, "home": true, "cancel": true }
  }
}
```

Response (handset → service):

```json
{
  "type": "input",
  "id": "custom_amount_data",
  "action": "submit_custom_amount_data",
  "value": "2500"
}
```

## Versioning rules

1. A handset declares the highest version it supports during capability negotiation
   (`capability-model.md`).
2. A service must not send a `version` the handset hasn't declared support for.
3. A renderer receiving an unrecognized `version` must reject the message and fall back to the
   classic path, not attempt best-effort rendering — see `parseScreenMessage` in
   `src/protocol/parser/parseScreenMessage.ts` for the reference behavior.
4. There is no compatibility guarantee across major-feeling jumps (e.g. a hypothetical `1.0`)
   until this specification defines one explicitly.
