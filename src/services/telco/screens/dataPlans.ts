import type { ScreenDef } from "../../../protocol/types";
import { DATA_PLANS, CUSTOM_AMOUNT_LIMITS } from "../../../data/plans/plans";
import { formatNaira } from "../../../lib/validation";

export function buildDataPlansScreen(): ScreenDef {
  return {
    id: "data-plans",
    title: "Data Plans",
    components: [
      ...DATA_PLANS.map((plan) => ({
        type: "button" as const,
        id: `plan_${plan.id}`,
        label: `${plan.size}    ${formatNaira(plan.price)}`,
        action: "purchase_data",
        data: { plan: plan.id, label: plan.size, amount: plan.price },
      })),
      { type: "button", id: "custom_data", label: "Custom Amount", action: "open_custom_input_data" },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}

export function buildCustomDataAmountScreen(): ScreenDef {
  return {
    id: "custom-amount-data",
    title: "Custom Amount",
    subtitle: "Data",
    components: [
      {
        type: "input",
        id: "custom_amount_data",
        label: "Enter amount",
        kind: "currency",
        action: "submit_custom_amount_data",
        min: CUSTOM_AMOUNT_LIMITS.data.min,
        max: CUSTOM_AMOUNT_LIMITS.data.max,
        placeholder: "0",
      },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}
