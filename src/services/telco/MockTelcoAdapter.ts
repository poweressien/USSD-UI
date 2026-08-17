import type { ScreenMessage, ScreenDef, UserAction } from "../../protocol/types";
import { USSD_UI_PROTOCOL, USSD_UI_VERSION } from "../../protocol/types";
import type { TelcoAdapter } from "./TelcoAdapter";
import type { CartItem } from "./cart";
import { buildHomeScreen } from "./screens/home";
import { buildDataPlansScreen, buildCustomDataAmountScreen } from "./screens/dataPlans";
import { buildAirtimeScreen, buildCustomAirtimeAmountScreen } from "./screens/airtime";
import { buildVoiceOffersScreen, buildBalanceScreen } from "./screens/voiceAndBalance";
import { buildGiftRecipientScreen, buildGiftPlanScreen } from "./screens/giftData";
import { buildTransferRecipientScreen, buildTransferAmountScreen, buildTransferPinScreen } from "./screens/transfer";
import { buildConfirmationScreen, buildProcessingScreen, buildSuccessScreen, buildErrorScreen } from "./screens/transactionFlow";
import { simulateTransaction } from "../transactions/transactionSimulator";
import { validatePin } from "../../lib/validation";

/**
 * Simulated operator backend. Every method here is local, synchronous
 * logic wrapped in a resolved Promise — there is no network call and
 * no real carrier anywhere in this class. See docs/technical-limitations.md.
 */
export class MockTelcoAdapter implements TelcoAdapter {
  private readonly sessionId: string;
  private carrierName = "MTN";
  private simSlot = 1;
  private cart: CartItem = { kind: "data", label: "", amount: 0 };

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async startSession(carrierName: string, simSlot: number): Promise<ScreenMessage> {
    this.carrierName = carrierName;
    this.simSlot = simSlot;
    this.cart = { kind: "data", label: "", amount: 0 };
    return this.wrap(buildHomeScreen(this.carrierName));
  }

  async handleAction(action: UserAction): Promise<ScreenMessage> {
    return this.wrap(await this.resolve(action));
  }

  async terminateSession(): Promise<void> {
    this.cart = { kind: "data", label: "", amount: 0 };
  }

  private async resolve(action: UserAction): Promise<ScreenDef> {
    switch (action.action) {
      case "open_data_plans":
        return buildDataPlansScreen();
      case "open_airtime":
        return buildAirtimeScreen();
      case "open_voice_offers":
        return buildVoiceOffersScreen();
      case "open_gift_data":
        return buildGiftRecipientScreen();
      case "open_balance":
        return buildBalanceScreen(this.carrierName);
      case "open_transfer":
        return buildTransferRecipientScreen();

      case "open_custom_input_data":
        return buildCustomDataAmountScreen();
      case "open_custom_input_airtime":
        return buildCustomAirtimeAmountScreen();

      case "purchase_data":
        this.cart = {
          kind: "data",
          label: String(action.data?.label ?? ""),
          amount: Number(action.data?.amount ?? 0),
        };
        return buildConfirmationScreen(this.carrierName, this.simSlot, this.cart);

      case "purchase_airtime":
        this.cart = { kind: "airtime", label: "Airtime", amount: Number(action.data?.amount ?? 0) };
        return buildConfirmationScreen(this.carrierName, this.simSlot, this.cart);

      case "purchase_voice":
        this.cart = {
          kind: "voice",
          label: String(action.data?.label ?? "Voice bundle"),
          amount: Number(action.data?.amount ?? 0),
        };
        return buildConfirmationScreen(this.carrierName, this.simSlot, this.cart);

      case "purchase_gift_data":
        this.cart = {
          kind: "gift-data",
          label: String(action.data?.label ?? ""),
          amount: Number(action.data?.amount ?? 0),
          recipient: this.cart.recipient,
        };
        return buildConfirmationScreen(this.carrierName, this.simSlot, this.cart);

      case "submit_custom_amount_data": {
        const amount = Number(action.value);
        if (!Number.isFinite(amount)) return buildErrorScreen({ reason: "Invalid amount received." });
        this.cart = { kind: "data", label: `Custom Data (₦${amount.toLocaleString()})`, amount };
        return buildConfirmationScreen(this.carrierName, this.simSlot, this.cart);
      }

      case "submit_custom_amount_airtime": {
        const amount = Number(action.value);
        if (!Number.isFinite(amount)) return buildErrorScreen({ reason: "Invalid amount received." });
        this.cart = { kind: "airtime", label: "Custom Airtime", amount };
        return buildConfirmationScreen(this.carrierName, this.simSlot, this.cart);
      }

      case "submit_gift_recipient": {
        const recipient = String(action.value ?? "");
        this.cart = { ...this.cart, kind: "gift-data", recipient };
        return buildGiftPlanScreen(recipient);
      }

      case "submit_transfer_recipient": {
        const recipient = String(action.value ?? "");
        this.cart = { kind: "transfer", label: "Airtime Transfer", amount: 0, recipient };
        return buildTransferAmountScreen(recipient);
      }

      case "submit_transfer_amount": {
        const amount = Number(action.value);
        if (!Number.isFinite(amount)) return buildErrorScreen({ reason: "Invalid amount received." });
        this.cart = { ...this.cart, kind: "transfer", label: "Airtime Transfer", amount };
        return buildTransferPinScreen();
      }

      case "submit_transfer_pin": {
        const pinCheck = validatePin(String(action.value ?? ""));
        if (!pinCheck.valid) return buildErrorScreen({ reason: pinCheck.error });
        return buildConfirmationScreen(this.carrierName, this.simSlot, this.cart);
      }

      case "confirm_purchase":
        return buildProcessingScreen();

      case "resolve_transaction": {
        const forceOutcome = action.data?.forceOutcome as "success" | "failure" | undefined;
        const result = simulateTransaction({ forceOutcome });
        if (result.outcome === "success") {
          return buildSuccessScreen(this.cart, result);
        }
        return buildErrorScreen({ reason: result.reason });
      }

      case "retry":
        // The only screen that exposes retry is the error screen, and the
        // cart that produced it is still held above — re-enter processing
        // and let it resolve against the same pending purchase.
        return buildProcessingScreen();

      case "go_home":
        this.cart = { kind: "data", label: "", amount: 0 };
        return buildHomeScreen(this.carrierName);

      default:
        return buildErrorScreen({ reason: `Unrecognised action: "${action.action}"` });
    }
  }

  private wrap(screen: ScreenDef): ScreenMessage {
    return {
      protocol: USSD_UI_PROTOCOL,
      version: USSD_UI_VERSION,
      type: "screen",
      sessionId: this.sessionId,
      screen,
    };
  }
}
