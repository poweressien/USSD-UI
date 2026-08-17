import type { ScreenDef } from "../../../protocol/types";
import { VOICE_BUNDLES } from "../../../data/plans/plans";
import { formatNaira } from "../../../lib/validation";

export function buildVoiceOffersScreen(): ScreenDef {
  return {
    id: "voice-offers",
    title: "Voice Offers",
    components: VOICE_BUNDLES.map((bundle) => ({
      type: "button" as const,
      id: `voice_${bundle.id}`,
      label: `${bundle.label}    ${formatNaira(bundle.price)}`,
      action: "purchase_voice",
      data: { label: bundle.label, amount: bundle.price },
    })),
    navigation: { back: true, home: true, cancel: true },
  };
}

/** Mock balance figures — a real adapter would read these from the operator's billing system. */
export function buildBalanceScreen(carrierName: string): ScreenDef {
  return {
    id: "balance",
    title: "Check Balance",
    components: [
      { type: "text", id: "balance_network", value: carrierName, emphasis: "muted" },
      { type: "text", id: "balance_main", value: `Main balance: ${formatNaira(1284.5)}`, emphasis: "strong" },
      { type: "text", id: "balance_data", value: "Data balance: 2.1GB (expires in 6 days)" },
      { type: "button", id: "balance_buy_data", label: "📦 Buy More Data", action: "open_data_plans" },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}
