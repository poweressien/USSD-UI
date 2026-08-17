export interface DataPlan {
  id: string;
  size: string;
  price: number;
}

export interface AmountOption {
  id: string;
  label: string;
  price: number;
}

/** Mock catalog — a real deployment would source this from the operator's product API. */
export const DATA_PLANS: DataPlan[] = [
  { id: "1gb", size: "1GB", price: 500 },
  { id: "2.5gb", size: "2.5GB", price: 1000 },
  { id: "6.5gb", size: "6.5GB", price: 1500 },
  { id: "17gb", size: "17GB", price: 4000 },
];

export const AIRTIME_AMOUNTS: AmountOption[] = [
  { id: "100", label: "₦100", price: 100 },
  { id: "200", label: "₦200", price: 200 },
  { id: "500", label: "₦500", price: 500 },
  { id: "1000", label: "₦1,000", price: 1000 },
  { id: "2000", label: "₦2,000", price: 2000 },
];

export const VOICE_BUNDLES: AmountOption[] = [
  { id: "voice-100", label: "100 mins — All networks", price: 750 },
  { id: "voice-250", label: "250 mins — All networks", price: 1600 },
  { id: "voice-600", label: "600 mins — All networks", price: 3200 },
];

export const CUSTOM_AMOUNT_LIMITS = {
  data: { min: 50, max: 100_000 },
  airtime: { min: 50, max: 50_000 },
} as const;
