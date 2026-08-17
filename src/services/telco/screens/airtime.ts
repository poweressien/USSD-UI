import type { ScreenDef } from "../../../protocol/types";
import { AIRTIME_AMOUNTS, CUSTOM_AMOUNT_LIMITS } from "../../../data/plans/plans";

export function buildAirtimeScreen(): ScreenDef {
  return {
    id: "airtime",
    title: "Airtime",
    components: [
      ...AIRTIME_AMOUNTS.map((opt) => ({
        type: "button" as const,
        id: `airtime_${opt.id}`,
        label: opt.label,
        action: "purchase_airtime",
        data: { label: "Airtime", amount: opt.price },
      })),
      { type: "button", id: "custom_airtime", label: "Custom Amount", action: "open_custom_input_airtime" },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}

export function buildCustomAirtimeAmountScreen(): ScreenDef {
  return {
    id: "custom-amount-airtime",
    title: "Custom Amount",
    subtitle: "Airtime",
    components: [
      {
        type: "input",
        id: "custom_amount_airtime",
        label: "Enter amount",
        kind: "currency",
        action: "submit_custom_amount_airtime",
        min: CUSTOM_AMOUNT_LIMITS.airtime.min,
        max: CUSTOM_AMOUNT_LIMITS.airtime.max,
        placeholder: "0",
      },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}
