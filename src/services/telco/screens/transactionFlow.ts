import type { ScreenDef, ConfirmRow } from "../../../protocol/types";
import type { CartItem } from "../cart";
import { SERVICE_LABEL } from "../cart";
import type { TransactionResult } from "../../transactions/transactionSimulator";
import { formatNaira } from "../../../lib/validation";

export function buildConfirmationScreen(carrierName: string, simSlot: number, cart: CartItem): ScreenDef {
  const rows: ConfirmRow[] = [
    { label: "Network", value: carrierName },
    { label: "Service", value: SERVICE_LABEL[cart.kind] },
  ];
  if (cart.recipient) {
    rows.push({ label: "Recipient", value: cart.recipient });
  }
  rows.push({ label: cart.kind === "data" || cart.kind === "gift-data" ? "Plan" : "Type", value: cart.label });
  rows.push({ label: "Amount", value: formatNaira(cart.amount) });
  rows.push({ label: "SIM", value: `SIM ${simSlot}` });

  return {
    id: "confirmation",
    title: "Confirm Purchase",
    components: [
      { type: "confirm", id: "confirm_purchase", rows, confirmAction: "confirm_purchase", cancelAction: "cancel" },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}

export function buildProcessingScreen(): ScreenDef {
  return {
    id: "processing",
    title: "Processing…",
    components: [{ type: "processing", id: "processing", message: "Please wait." }],
    navigation: { back: false, home: false, cancel: false },
  };
}

export function buildSuccessScreen(cart: CartItem, result: TransactionResult): ScreenDef {
  const heading = cart.kind === "data" || cart.kind === "gift-data" ? `${cart.label} activated` : `${SERVICE_LABEL[cart.kind]} successful`;
  return {
    id: "success",
    title: "Transaction Successful ✓",
    components: [
      {
        type: "success",
        id: "success",
        heading,
        rows: [{ label: "Amount", value: formatNaira(cart.amount) }],
        reference: result.reference,
      },
      { type: "button", id: "done", label: "Done", action: "go_home" },
      { type: "button", id: "return_home", label: "Return Home", action: "go_home" },
    ],
    navigation: { back: false, home: true, cancel: false },
  };
}

export function buildErrorScreen(result: Pick<TransactionResult, "reason">): ScreenDef {
  return {
    id: "error",
    title: "Transaction Failed",
    components: [
      {
        type: "error",
        id: "error",
        heading: "We could not complete this request.",
        reason: result.reason ?? "Unknown error.",
      },
      { type: "button", id: "retry_btn", label: "Retry", action: "retry" },
      { type: "button", id: "home_btn", label: "Home", action: "go_home" },
    ],
    navigation: { back: false, home: true, cancel: false, retry: true },
  };
}

export function buildCancelledScreen(): ScreenDef {
  return {
    id: "cancelled",
    title: "Session Cancelled",
    components: [
      { type: "text", id: "cancelled_message", value: "You ended this USSD session.", emphasis: "muted" },
      { type: "button", id: "restart", label: "Start New Session", action: "go_home" },
    ],
    navigation: { back: false, home: false, cancel: false },
  };
}
