import type { ScreenDef } from "../../../protocol/types";

export function buildHomeScreen(carrierName: string): ScreenDef {
  return {
    id: "home",
    title: `${carrierName} Services`,
    components: [
      { type: "button", id: "menu_data", label: "📦 Data Plans", action: "open_data_plans" },
      { type: "button", id: "menu_airtime", label: "💳 Airtime", action: "open_airtime" },
      { type: "button", id: "menu_voice", label: "📞 Voice Offers", action: "open_voice_offers" },
      { type: "button", id: "menu_gift", label: "🎁 Gift Data", action: "open_gift_data" },
      { type: "button", id: "menu_balance", label: "💰 Check Balance", action: "open_balance" },
      { type: "button", id: "menu_transfer", label: "💸 Transfer", action: "open_transfer" },
    ],
    navigation: { back: false, home: false, cancel: true },
  };
}
