import type { ScreenMessage, UserAction } from "../../protocol/types";

/**
 * The interface a real Telco-side USSD-UI integration would implement.
 * `MockTelcoAdapter` is the only implementation in this prototype — it
 * never talks to a network. A production adapter behind this interface
 * would sit next to (not replace) the operator's existing USSD gateway;
 * see docs/telco-integration.md.
 */
export interface TelcoAdapter {
  startSession(carrier: string, simSlot: number): Promise<ScreenMessage>;
  handleAction(action: UserAction): Promise<ScreenMessage>;
  terminateSession(): Promise<void>;
}
