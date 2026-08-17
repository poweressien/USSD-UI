import { USSD_UI_PROTOCOL, USSD_UI_VERSION } from "../protocol/types";
import type { ScreenMessage } from "../protocol/types";
import { buildCancelledScreen } from "../services/telco/screens/transactionFlow";
import type { MockTelcoService } from "./MockTelcoService";
import type { NetworkSimulator } from "./NetworkSimulator";
import type { TraceRecorder } from "./TraceRecorder";
import { negotiateCapability } from "./capability-negotiation";
import type { CapabilityResponsePayload, ErrorPayload } from "./types";
import {
  makeCapabilityResponseEnvelope,
  makeErrorEnvelope,
  makeScreenEnvelope,
  type AnyEnvelope,
  type CapabilityRequestEnvelope,
  type CapabilityResponseEnvelope,
  type ErrorEnvelope,
  type ScreenEnvelope,
  type SessionEndEnvelope,
  type UserActionEnvelope,
} from "./types";

/**
 * USSD-UI v0.1 — Experimental Draft.
 *
 * This is the layer this proposal actually adds. Everything upstream
 * (USSDGatewaySimulator, NetworkSimulator, the device) represents
 * infrastructure that already exists today and is untouched by this
 * proposal; everything downstream (MockTelcoService) represents the
 * operator's existing business logic, also untouched. The adapter's
 * job is narrow and specific: negotiate what a given handset can
 * render, translate the service's screen output into an enveloped
 * USSD-UI message when interactive rendering was negotiated, and
 * enforce basic message ordering. See /docs/architecture.md and
 * /docs/security.md — the handset is never the authority for price,
 * balance, eligibility, or transaction success; this adapter and the
 * service behind it are.
 */
export class USSDUIAdapter {
  private readonly service: MockTelcoService;
  private readonly network: NetworkSimulator;
  private readonly trace: TraceRecorder;
  private outgoingSequence = 0;
  private lastIncomingSequence = 0;
  private negotiation: CapabilityResponsePayload | null = null;

  constructor(service: MockTelcoService, network: NetworkSimulator, trace: TraceRecorder) {
    this.service = service;
    this.network = network;
    this.trace = trace;
  }

  isNegotiatedInteractive(): boolean {
    return this.negotiation?.accepted === true;
  }

  getNegotiation(): CapabilityResponsePayload | null {
    return this.negotiation;
  }

  async negotiateCapability(
    request: CapabilityRequestEnvelope,
  ): Promise<CapabilityResponseEnvelope | ErrorEnvelope> {
    await this.network.toNetwork(request, "Capability request");

    const sequenceError = this.checkIncomingSequence(request);
    if (sequenceError) {
      const errorEnvelope = makeErrorEnvelope(request.sessionId, this.nextOutgoing(), sequenceError);
      return this.network.toDevice(errorEnvelope, "Sequence error");
    }

    const result = negotiateCapability(request.payload);
    this.negotiation = result;
    this.trace.record(
      "USSD-UI ADAPTER",
      result.accepted
        ? `Negotiated USSD-UI v${result.version} (${result.features?.join(", ")})`
        : `Negotiation failed — ${result.reason}`,
    );

    const responseEnvelope = makeCapabilityResponseEnvelope(request.sessionId, this.nextOutgoing(), result);
    return this.network.toDevice(
      responseEnvelope,
      result.accepted ? "Capability accepted" : "Capability rejected — falling back to classic USSD",
    );
  }

  async deliverInitialScreen(sessionId: string, carrier: string, simSlot: number): Promise<ScreenEnvelope> {
    this.trace.record("TELCO SERVICE", "Generating home screen");
    const screenMessage = await this.service.startSession(carrier, simSlot);
    const envelope = makeScreenEnvelope(sessionId, this.nextOutgoing(), screenMessage);
    return this.network.toDevice(
      envelope,
      this.isNegotiatedInteractive() ? "USSD-UI screen" : "Classic USSD screen (fallback)",
    );
  }

  async handleAction(envelope: UserActionEnvelope): Promise<ScreenEnvelope | ErrorEnvelope> {
    await this.network.toNetwork(envelope, `User action: ${envelope.payload.action}`);

    const sequenceError = this.checkIncomingSequence(envelope);
    if (sequenceError) {
      const errorEnvelope = makeErrorEnvelope(envelope.sessionId, this.nextOutgoing(), sequenceError);
      return this.network.toDevice(errorEnvelope, "Sequence error");
    }

    this.trace.record("TELCO SERVICE", "Processing");
    const screenMessage = await this.service.handleAction(envelope.payload);
    const outEnvelope = makeScreenEnvelope(envelope.sessionId, this.nextOutgoing(), screenMessage);
    const label = labelForScreen(screenMessage, this.isNegotiatedInteractive());
    return this.network.toDevice(outEnvelope, label);
  }

  async endSession(envelope: SessionEndEnvelope): Promise<ScreenEnvelope | ErrorEnvelope> {
    await this.network.toNetwork(envelope, `Session end: ${envelope.payload.reason}`);

    const sequenceError = this.checkIncomingSequence(envelope);
    if (sequenceError) {
      const errorEnvelope = makeErrorEnvelope(envelope.sessionId, this.nextOutgoing(), sequenceError);
      return this.network.toDevice(errorEnvelope, "Sequence error");
    }

    await this.service.terminateSession();
    this.trace.record("TELCO SERVICE", "Session terminated");

    const screenMessage: ScreenMessage = {
      protocol: USSD_UI_PROTOCOL,
      version: USSD_UI_VERSION,
      type: "screen",
      sessionId: envelope.sessionId,
      screen: buildCancelledScreen(),
    };
    const outEnvelope = makeScreenEnvelope(envelope.sessionId, this.nextOutgoing(), screenMessage);
    return this.network.toDevice(outEnvelope, "Session ended");
  }

  private nextOutgoing(): number {
    this.outgoingSequence += 1;
    return this.outgoingSequence;
  }

  /**
   * Simplified ordering check: every envelope the device sends must
   * carry exactly the next sequence number. This is a basic ordering
   * guard, not production replay protection or message integrity — see
   * /docs/security.md for what a real deployment would still need.
   */
  private checkIncomingSequence(envelope: AnyEnvelope): ErrorPayload | null {
    const expected = this.lastIncomingSequence + 1;
    if (envelope.sequence !== expected) {
      return {
        code: "SEQUENCE_MISMATCH",
        message: `Expected sequence ${expected}, received ${envelope.sequence}`,
      };
    }
    this.lastIncomingSequence = envelope.sequence;
    return null;
  }
}

function labelForScreen(message: ScreenMessage, interactive: boolean): string {
  if (message.screen.id === "success") return "Success";
  if (message.screen.id === "error") return "Failure";
  return interactive ? "USSD-UI screen" : "Classic USSD screen (fallback)";
}
