import { USSD_UI_VERSION } from "../protocol/types";
import type { ScreenMessage, UserAction } from "../protocol/types";

/**
 * USSD-UI v0.1 — Experimental Draft. This envelope is what the network
 * simulation layer (src/network/) passes between DeviceSimulator and
 * USSDUIAdapter. It does NOT replace ScreenMessage/UserAction — those
 * are unchanged (see src/protocol/) and travel as the envelope's
 * `payload`. The direct Simulate/Compare screens still talk to
 * MockTelcoAdapter without an envelope at all; this wrapper only exists
 * on the new, more rigorous network-simulation path (see /network).
 *
 * IMPORTANT: this envelope is a hypothetical transport representation
 * for this proof of concept. Real USSD does not carry JSON — see
 * /docs/wire-transport.md.
 */
export type MessageType =
  | "capability_request"
  | "capability_response"
  | "screen"
  | "user_action"
  | "error"
  | "session_end";

interface EnvelopeBase {
  protocol: "USSD-UI";
  version: string;
  messageId: string;
  sessionId: string;
  sequence: number;
}

export interface CapabilityRequestPayload {
  supportedVersions: string[];
  features: string[];
}

export interface CapabilityResponsePayload {
  accepted: boolean;
  protocol: "USSD-UI";
  version?: string;
  features?: string[];
  reason?: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

export interface SessionEndPayload {
  reason: string;
}

export interface CapabilityRequestEnvelope extends EnvelopeBase {
  messageType: "capability_request";
  payload: CapabilityRequestPayload;
}
export interface CapabilityResponseEnvelope extends EnvelopeBase {
  messageType: "capability_response";
  payload: CapabilityResponsePayload;
}
export interface ScreenEnvelope extends EnvelopeBase {
  messageType: "screen";
  payload: ScreenMessage;
}
export interface UserActionEnvelope extends EnvelopeBase {
  messageType: "user_action";
  payload: UserAction;
}
export interface ErrorEnvelope extends EnvelopeBase {
  messageType: "error";
  payload: ErrorPayload;
}
export interface SessionEndEnvelope extends EnvelopeBase {
  messageType: "session_end";
  payload: SessionEndPayload;
}

export type AnyEnvelope =
  | CapabilityRequestEnvelope
  | CapabilityResponseEnvelope
  | ScreenEnvelope
  | UserActionEnvelope
  | ErrorEnvelope
  | SessionEndEnvelope;

let messageCounter = 0;
export function generateMessageId(): string {
  messageCounter += 1;
  return `msg-${Math.random().toString(36).slice(2, 8)}${messageCounter.toString(36)}`;
}

function base(sessionId: string, sequence: number): EnvelopeBase {
  return { protocol: "USSD-UI", version: USSD_UI_VERSION, messageId: generateMessageId(), sessionId, sequence };
}

export function makeCapabilityRequestEnvelope(
  sessionId: string,
  sequence: number,
  payload: CapabilityRequestPayload,
): CapabilityRequestEnvelope {
  return { ...base(sessionId, sequence), messageType: "capability_request", payload };
}

export function makeCapabilityResponseEnvelope(
  sessionId: string,
  sequence: number,
  payload: CapabilityResponsePayload,
): CapabilityResponseEnvelope {
  return { ...base(sessionId, sequence), messageType: "capability_response", payload };
}

export function makeScreenEnvelope(sessionId: string, sequence: number, payload: ScreenMessage): ScreenEnvelope {
  return { ...base(sessionId, sequence), messageType: "screen", payload };
}

export function makeUserActionEnvelope(
  sessionId: string,
  sequence: number,
  payload: UserAction,
): UserActionEnvelope {
  return { ...base(sessionId, sequence), messageType: "user_action", payload };
}

export function makeErrorEnvelope(sessionId: string, sequence: number, payload: ErrorPayload): ErrorEnvelope {
  return { ...base(sessionId, sequence), messageType: "error", payload };
}

export function makeSessionEndEnvelope(
  sessionId: string,
  sequence: number,
  payload: SessionEndPayload,
): SessionEndEnvelope {
  return { ...base(sessionId, sequence), messageType: "session_end", payload };
}
