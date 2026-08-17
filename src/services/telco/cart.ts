export type CartKind = "data" | "airtime" | "voice" | "gift-data" | "transfer";

export interface CartItem {
  kind: CartKind;
  label: string;
  amount: number;
  recipient?: string;
}

export const SERVICE_LABEL: Record<CartKind, string> = {
  data: "Data",
  airtime: "Airtime",
  voice: "Voice",
  "gift-data": "Gift Data",
  transfer: "Transfer",
};

export const EMPTY_CART: CartItem = { kind: "data", label: "", amount: 0 };
