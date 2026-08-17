export interface Carrier {
  id: string;
  name: string;
  dialCode: string;
  accent: string;
}

/**
 * Demo/simulated carrier profiles only. Names are used purely as
 * recognisable labels for the prototype's menus — the app never
 * contacts these networks (see docs/technical-limitations.md).
 */
export const CARRIERS: Carrier[] = [
  { id: "mtn", name: "MTN", dialCode: "*123#", accent: "#FFC800" },
  { id: "airtel", name: "Airtel", dialCode: "*121#", accent: "#E30613" },
  { id: "glo", name: "Glo", dialCode: "*127#", accent: "#3FA535" },
  { id: "9mobile", name: "9mobile", dialCode: "*200#", accent: "#00A79D" },
];

export function getCarrier(id: string): Carrier {
  return CARRIERS.find((c) => c.id === id) ?? CARRIERS[0];
}

/** Used by the dial pad: does a dialed string match a known carrier's USSD code, exactly? */
export function findCarrierByDialCode(dialed: string): Carrier | undefined {
  return CARRIERS.find((c) => c.dialCode === dialed);
}
