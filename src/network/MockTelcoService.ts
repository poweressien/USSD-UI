import type { ScreenMessage, UserAction } from "../protocol/types";
import type { TelcoAdapter } from "../services/telco/TelcoAdapter";
import { MockTelcoAdapter } from "../services/telco/MockTelcoAdapter";

/**
 * The business-logic layer in the network architecture story: products,
 * pricing, and transaction outcomes. It has no idea whether the
 * subscriber's handset can render an interactive screen or only
 * classic numbered USSD — same service, either representation, per
 * /docs/architecture.md.
 *
 * This class does not reimplement that logic. It composes the existing,
 * already-tested MockTelcoAdapter — the same class the direct
 * Simulate/Compare screens use — so both paths through this prototype
 * share one real implementation and one test suite for "what happens
 * when you buy 6.5GB of data" instead of two that could drift apart.
 */
export class MockTelcoService implements TelcoAdapter {
  private readonly adapter: MockTelcoAdapter;

  constructor(sessionId: string) {
    this.adapter = new MockTelcoAdapter(sessionId);
  }

  async startSession(carrier: string, simSlot: number): Promise<ScreenMessage> {
    return this.adapter.startSession(carrier, simSlot);
  }

  async handleAction(action: UserAction): Promise<ScreenMessage> {
    return this.adapter.handleAction(action);
  }

  async terminateSession(): Promise<void> {
    return this.adapter.terminateSession();
  }
}
