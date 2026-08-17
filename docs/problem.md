# Problem

USSD remains the most reliable channel a Telco has: it needs no data connection, no app install,
and works on the cheapest handset in circulation. That reach is exactly why its interaction model
matters — and it hasn't changed materially in over two decades.

## What the numbered-menu model costs

- **No visual hierarchy.** Every option is an equally-weighted digit; nothing signals what's
  common, risky, or destructive.
- **High mis-entry rate.** A single mistyped digit on a nested menu often means restarting the
  session from `*123#`.
- **No input protection.** PINs and amounts are typed as plain digits in the same reply box as
  menu choices, with no masking.
- **Poor discoverability.** Deep flows (data bundles, transfers, gifting) are hard to browse;
  subscribers memorize sequences instead of exploring options.
- **No localization signal beyond text.** Icons, grouping, and emphasis — tools that help
  low-literacy and low-vision users — aren't available in a plain-text reply menu.
- **Session timeouts compound all of the above**, since most gateways allow well under a minute
  of think time per screen.

## Illustrative example

Traditional USSD, five options deep into a real menu tree:

```
MTN Services

1. Data Plans
2. Airtime
3. Balance
4. Gift Data

Reply:
```

There is no way to tell, from the text alone, which option is a purchase, which is informational,
or which plan is the best value — the subscriber has to already know, or guess.

## What this is not a criticism of

None of this is a criticism of USSD as infrastructure — it is a strength of USSD as
infrastructure that exposes a weakness in USSD as an interface. The two are separable, which is
the premise `proposed-solution.md` builds on.
