import type { UserAction } from "../protocol/types";
import type { DeviceCapability } from "../data/devices/capabilityProfiles";
import { capabilityRequestFromDevice } from "./capability-negotiation";
import {
  makeCapabilityRequestEnvelope,
  makeSessionEndEnvelope,
  makeUserActionEnvelope,
  type CapabilityRequestEnvelope,
  type SessionEndEnvelope,
  type UserActionEnvelope,
} from "./types";

/**
 * The reference device/terminal — this prototype's browser tab stands
 * in for it, exactly as spec'd: "the browser should represent the
 * reference device/terminal." It knows only its own declared
 * capability and how to number its own outgoing messages; it has no
 * knowledge of negotiation outcomes, pricing, or the Telco's business
 * logic.
 */
export class DeviceSimulator {
  readonly capability: DeviceCapability;
  private outgoingSequence = 0;

  constructor(capability: DeviceCapability) {
    this.capability = capability;
  }

  private nextOutgoing(): number {
    this.outgoingSequence += 1;
    return this.outgoingSequence;
  }

  buildCapabilityRequest(sessionId: string): CapabilityRequestEnvelope {
    return makeCapabilityRequestEnvelope(sessionId, this.nextOutgoing(), capabilityRequestFromDevice(this.capability));
  }

  buildUserAction(sessionId: string, action: UserAction): UserActionEnvelope {
    return makeUserActionEnvelope(sessionId, this.nextOutgoing(), action);
  }

  buildSessionEnd(sessionId: string, reason: string): SessionEndEnvelope {
    return makeSessionEndEnvelope(sessionId, this.nextOutgoing(), { reason });
  }
}
