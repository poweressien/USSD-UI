import { useCallback, useEffect, useRef, useState } from "react";
import type { ScreenMessage, UserAction } from "../../protocol/types";
import { DeviceSimulator } from "../../network/DeviceSimulator";
import { NetworkSimulator } from "../../network/NetworkSimulator";
import { USSDGatewaySimulator, USSDGatewayError } from "../../network/USSDGatewaySimulator";
import { MockTelcoService } from "../../network/MockTelcoService";
import { USSDUIAdapter } from "../../network/USSDUIAdapter";
import { TraceRecorder, type TraceEvent } from "../../network/TraceRecorder";
import type { AnyEnvelope, CapabilityResponsePayload } from "../../network/types";
import type { DeviceCapability } from "../../data/devices/capabilityProfiles";
import { getCarrier } from "../../data/carriers/carriers";
import { createSession, goBack as sessionGoBack, goHome as sessionGoHome, navigate as sessionNavigate, cancelSession } from "../../session/session-manager";
import type { Session } from "../../session/session-manager";
import type { NavigateKind } from "../../components/ussd/NavBar";
import type { ForceOutcome } from "./useUssdSession";

/** Simulated one-way network latency, purely so the trace panel reads as a real exchange, not an instant blur. */
const SIMULATED_LATENCY_MS = 150;
const PROCESSING_DELAY_MS = 1100;

export type NetworkPhase = "idle" | "negotiating" | "ready" | "gateway_error";

export interface NetworkSessionHandle {
  phase: NetworkPhase;
  session: Session | null;
  negotiation: CapabilityResponsePayload | null;
  renderMode: "interactive" | "classic" | null;
  currentMessage: ScreenMessage | null;
  screenStack: ScreenMessage[];
  trace: TraceEvent[];
  lastEnvelope: AnyEnvelope | null;
  gatewayError: string | null;
  canGoBack: boolean;
  start: (params: { carrierId: string; simSlot: 1 | 2; deviceCapability: DeviceCapability }) => void;
  reset: () => void;
  handleAction: (action: UserAction) => void;
  handleNavigate: (kind: NavigateKind) => void;
  forceOutcome: ForceOutcome;
  setForceOutcome: (value: ForceOutcome) => void;
}

/**
 * Drives one simulated dial through every layer described in
 * /docs/architecture.md: USSDGatewaySimulator admits the session,
 * DeviceSimulator and USSDUIAdapter negotiate capability over
 * NetworkSimulator, and MockTelcoService produces each screen. Unlike
 * useUssdSession (the direct path the Simulate/Compare screens use),
 * every step here is enveloped, sequenced, and traced.
 */
export function useNetworkSession(): NetworkSessionHandle {
  const deviceRef = useRef<DeviceSimulator | null>(null);
  const adapterRef = useRef<USSDUIAdapter | null>(null);
  const traceRef = useRef<TraceRecorder>(new TraceRecorder());
  const sessionIdRef = useRef<string>("");
  // Bumped on every start() call. An in-flight negotiation checks this before
  // touching state, so clicking a new device mode mid-negotiation can never
  // let the OLDER call's response land after the newer one's.
  const generationRef = useRef(0);

  const [phase, setPhase] = useState<NetworkPhase>("idle");
  const [session, setSession] = useState<Session | null>(null);
  const [negotiation, setNegotiation] = useState<CapabilityResponsePayload | null>(null);
  const [screenStack, setScreenStack] = useState<ScreenMessage[]>([]);
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [lastEnvelope, setLastEnvelope] = useState<AnyEnvelope | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [forceOutcome, setForceOutcome] = useState<ForceOutcome>("random");

  const syncTrace = useCallback(() => setTrace(traceRef.current.getEvents()), []);

  const start = useCallback(
    (params: { carrierId: string; simSlot: 1 | 2; deviceCapability: DeviceCapability }) => {
      const generation = ++generationRef.current;
      const carrier = getCarrier(params.carrierId);
      const freshSession = createSession({ carrier: carrier.name, simSlot: params.simSlot, rootScreenId: "home" });

      traceRef.current = new TraceRecorder();
      sessionIdRef.current = freshSession.id;
      setGatewayError(null);
      setPhase("negotiating");
      setSession(freshSession);
      setScreenStack([]);
      setNegotiation(null);

      const device = new DeviceSimulator(params.deviceCapability);
      const network = new NetworkSimulator(traceRef.current, SIMULATED_LATENCY_MS);
      const gateway = new USSDGatewaySimulator(traceRef.current);
      const service = new MockTelcoService(freshSession.id);
      const adapter = new USSDUIAdapter(service, network, traceRef.current);
      deviceRef.current = device;
      adapterRef.current = adapter;

      const stillCurrent = () => generationRef.current === generation;

      void (async () => {
        try {
          gateway.openSession(carrier.dialCode, carrier.id);
          if (!stillCurrent()) return;
          syncTrace();

          const negotiationEnvelope = await adapter.negotiateCapability(device.buildCapabilityRequest(freshSession.id));
          if (!stillCurrent()) return;
          setLastEnvelope(negotiationEnvelope);
          syncTrace();
          if (negotiationEnvelope.messageType === "capability_response") {
            setNegotiation(negotiationEnvelope.payload);
          }

          const homeEnvelope = await adapter.deliverInitialScreen(freshSession.id, carrier.name, params.simSlot);
          if (!stillCurrent()) return;
          setLastEnvelope(homeEnvelope);
          syncTrace();
          setScreenStack([homeEnvelope.payload]);
          setPhase("ready");
        } catch (error) {
          if (!stillCurrent()) return;
          const message = error instanceof USSDGatewayError ? error.message : "Unexpected network simulation error";
          setGatewayError(message);
          setPhase("gateway_error");
          syncTrace();
        }
      })();
    },
    [syncTrace],
  );

  const handleAction = useCallback(
    (action: UserAction) => {
      const device = deviceRef.current;
      const adapter = adapterRef.current;
      if (!device || !adapter) return;
      const generation = generationRef.current;

      void (async () => {
        const envelope = device.buildUserAction(sessionIdRef.current, action);
        const reply = await adapter.handleAction(envelope);
        if (generationRef.current !== generation) return; // a newer session started while this was in flight
        setLastEnvelope(reply);
        syncTrace();

        if (reply.messageType === "screen") {
          setScreenStack((stack) => [...stack, reply.payload]);
          setSession((s) => (s ? sessionNavigate(s, reply.payload.screen.id) : s));
        }
        // An "error" envelope (e.g. SEQUENCE_MISMATCH) is left visible only in
        // the trace/wire view — the on-screen USSD session intentionally
        // doesn't change, since a real handset wouldn't redraw on a transport
        // error it can silently retry.
      })();
    },
    [syncTrace],
  );

  const handleNavigate = useCallback(
    (kind: NavigateKind) => {
      const device = deviceRef.current;
      const adapter = adapterRef.current;
      if (!device || !adapter) return;
      const generation = generationRef.current;

      if (kind === "back") {
        setScreenStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
        setSession((s) => (s ? sessionGoBack(s) : s));
        return;
      }

      if (kind === "home") {
        void (async () => {
          const envelope = device.buildUserAction(sessionIdRef.current, {
            type: "navigation",
            id: "home_nav",
            action: "go_home",
          });
          const reply = await adapter.handleAction(envelope);
          if (generationRef.current !== generation) return;
          setLastEnvelope(reply);
          syncTrace();
          if (reply.messageType === "screen") {
            setScreenStack([reply.payload]);
            setSession((s) => (s ? sessionGoHome(s, "home") : s));
          }
        })();
        return;
      }

      // cancel
      void (async () => {
        const envelope = device.buildSessionEnd(sessionIdRef.current, "user_cancelled");
        const reply = await adapter.endSession(envelope);
        if (generationRef.current !== generation) return;
        setLastEnvelope(reply);
        syncTrace();
        if (reply.messageType === "screen") {
          setScreenStack((stack) => [...stack, reply.payload]);
          setSession((s) => (s ? cancelSession(s) : s));
        }
      })();
    },
    [syncTrace],
  );

  const currentMessage = screenStack[screenStack.length - 1] ?? null;
  const renderMode: "interactive" | "classic" | null = negotiation ? (negotiation.accepted ? "interactive" : "classic") : null;

  const reset = useCallback(() => {
    generationRef.current += 1; // invalidate any in-flight start() so it can't land after this
    deviceRef.current = null;
    adapterRef.current = null;
    traceRef.current = new TraceRecorder();
    sessionIdRef.current = "";
    setPhase("idle");
    setSession(null);
    setNegotiation(null);
    setScreenStack([]);
    setTrace([]);
    setLastEnvelope(null);
    setGatewayError(null);
  }, []);

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
    phase,
    session,
    negotiation,
    renderMode,
    currentMessage,
    screenStack,
    trace,
    lastEnvelope,
    gatewayError,
    canGoBack: screenStack.length > 1,
    start,
    reset,
    handleAction,
    handleNavigate,
    forceOutcome,
    setForceOutcome,
  };
}
