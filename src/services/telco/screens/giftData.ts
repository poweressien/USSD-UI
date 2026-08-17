import type { ScreenDef } from "../../../protocol/types";
import { DATA_PLANS } from "../../../data/plans/plans";
import { formatNaira } from "../../../lib/validation";

export function buildGiftRecipientScreen(): ScreenDef {
  return {
    id: "gift-data-recipient",
    title: "Gift Data",
    subtitle: "Step 1 of 2 — Recipient",
    components: [
      {
        type: "input",
        id: "gift_recipient",
        label: "Recipient number",
        kind: "phone-number",
        action: "submit_gift_recipient",
        placeholder: "0803 000 0000",
      },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}

export function buildGiftPlanScreen(recipient: string): ScreenDef {
  return {
    id: "gift-data-plan",
    title: "Gift Data",
    subtitle: `Step 2 of 2 — Sending to ${recipient}`,
    components: DATA_PLANS.map((plan) => ({
      type: "button" as const,
      id: `gift_${plan.id}`,
      label: `${plan.size}    ${formatNaira(plan.price)}`,
      action: "purchase_gift_data",
      data: { plan: plan.id, label: plan.size, amount: plan.price },
    })),
    navigation: { back: true, home: true, cancel: true },
  };
}
