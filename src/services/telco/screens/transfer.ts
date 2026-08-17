import type { ScreenDef } from "../../../protocol/types";

export function buildTransferRecipientScreen(): ScreenDef {
  return {
    id: "transfer-recipient",
    title: "Transfer Airtime",
    subtitle: "Step 1 of 3 — Recipient",
    components: [
      {
        type: "input",
        id: "transfer_recipient",
        label: "Recipient number",
        kind: "phone-number",
        action: "submit_transfer_recipient",
        placeholder: "0803 000 0000",
      },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}

export function buildTransferAmountScreen(recipient: string): ScreenDef {
  return {
    id: "transfer-amount",
    title: "Transfer Airtime",
    subtitle: `Step 2 of 3 — Sending to ${recipient}`,
    components: [
      {
        type: "input",
        id: "transfer_amount",
        label: "Enter amount",
        kind: "currency",
        action: "submit_transfer_amount",
        min: 50,
        max: 20_000,
        placeholder: "0",
      },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}

export function buildTransferPinScreen(): ScreenDef {
  return {
    id: "transfer-pin",
    title: "Transfer Airtime",
    subtitle: "Step 3 of 3 — Confirm with PIN",
    components: [
      {
        type: "input",
        id: "transfer_pin",
        label: "Enter your 4-digit PIN",
        kind: "pin",
        action: "submit_transfer_pin",
        placeholder: "••••",
      },
    ],
    navigation: { back: true, home: true, cancel: true },
  };
}
