import { useCallback, useEffect, useRef, useState } from "react";
import type { ScreenMessage, UserAction } from "../../protocol/types";
import { USSD_UI_PROTOCOL, USSD_UI_VERSION } from "../../protocol/types";
import { MockTelcoAdapter } from "../../services/telco/MockTelcoAdapter";
import { buildCancelledScreen } from "../../services/telco/screens/transactionFlow";
import type { TransactionOutcome } from "../../services/transactions/transactionSimulator";
import type { Session } from "../../session/session-manager";
import { cancelSession, createSession, goBack, goHome, navigate } from "../../session/session-manager";
import type { NavigateKind } from "../../components/ussd/NavBar";

const PROCESSING_DELAY_MS = 1100;

export type ForceOutcome = "random" | TransactionOutcome;

export interface UssdSessionHandle {
  session: Session | null;
  currentMessage: ScreenMessage | null;
  screenStack: ScreenMessage[];
  lastUserAction: UserAction | null;
  canGoBack: boolean;
  handleAction: (action: UserAction) => void;
  handleNavigate: (kind: NavigateKind) => void;
  forceOutcome: ForceOutcome;
  setForceOutcome: (value: ForceOutcome) => void;
  restart: () => void;
}

/**
 * Owns one simulated `*123#` dial: creates a fresh MockTelcoAdapter and
 * Session, wires user interaction to adapter calls, and keeps a stack
 * of every ScreenMessage seen so "Back" can redisplay prior state
 * without asking the adapter to regenerate it.
 */
export function useUssdSession(carrierName: string, simSlot: number): UssdSessionHandle {
  const adapterRef = useRef<MockTelcoAdapter | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [screenStack, setScreenStack] = useState<ScreenMessage[]>([]);
  const [lastUserAction, setLastUserAction] = useState<UserAction | null>(null);
  const [forceOutcome, setForceOutcome] = useState<ForceOutcome>("random");
  const [generation, setGeneration] = useState(0);

  const start = useCallback(() => {
    const freshSession = createSession({ carrier: carrierName, simSlot, rootScreenId: "home" });
    const adapter = new MockTelcoAdapter(freshSession.id);
    adapterRef.current = adapter;
    setLastUserAction(null);
    adapter.startSession(carrierName, simSlot).then((msg) => {
      setSession(freshSession);
      setScreenStack([msg]);
    });
  }, [carrierName, simSlot]);

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrierName, simSlot, generation]);

  const cancelNow = useCallback(() => {
    const adapter = adapterRef.current;
    if (adapter) void adapter.terminateSession();
    setSession((s) => (s ? cancelSession(s) : s));
    setScreenStack((stack) => {
      const sessionId = stack[0]?.sessionId ?? "cancelled";
      const cancelledMessage: ScreenMessage = {
        protocol: USSD_UI_PROTOCOL,
        version: USSD_UI_VERSION,
        type: "screen",
        sessionId,
        screen: buildCancelledScreen(),
      };
      return [...stack, cancelledMessage];
    });
  }, []);

  const handleAction = useCallback(
    (action: UserAction) => {
      setLastUserAction(action);
      if (action.action === "cancel") {
        cancelNow();
        return;
      }
      const adapter = adapterRef.current;
      if (!adapter) return;
      adapter.handleAction(action).then((msg) => {
        setScreenStack((stack) => [...stack, msg]);
        setSession((s) => (s ? navigate(s, msg.screen.id) : s));
      });
    },
    [cancelNow],
  );

  const handleNavigate = useCallback(
    (kind: NavigateKind) => {
      if (kind === "cancel") {
        cancelNow();
        return;
      }
      if (kind === "back") {
        setScreenStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
        setSession((s) => (s ? goBack(s) : s));
        return;
      }
      // home
      const adapter = adapterRef.current;
      if (!adapter) return;
      adapter.handleAction({ type: "navigation", id: "home_nav", action: "go_home" }).then((msg) => {
        setScreenStack([msg]);
        setSession((s) => (s ? goHome(s, "home") : s));
      });
    },
    [cancelNow],
  );

  const restart = useCallback(() => setGeneration((g) => g + 1), []);

  const currentMessage = screenStack[screenStack.length - 1] ?? null;

  // Processing screens auto-resolve after a short simulated delay, honoring
  // the presenter's forced outcome when one is set (see Simulate screen).
  useEffect(() => {
    if (currentMessage?.screen.id !== "processing") return;
    const timer = setTimeout(() => {
      handleAction({
        type: "navigation",
        id: "auto_resolve",
        action: "resolve_transaction",
        data: forceOutcome === "random" ? undefined : { forceOutcome },
      });
    }, PROCESSING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [currentMessage, forceOutcome, handleAction]);

  return {
    session,
    currentMessage,
    screenStack,
    lastUserAction,
    canGoBack: screenStack.length > 1,
    handleAction,
    handleNavigate,
    forceOutcome,
    setForceOutcome,
    restart,
  };
}
