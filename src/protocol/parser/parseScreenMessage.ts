import { ScreenMessageSchema } from "../schemas/screenMessage.schema";
import type { ScreenMessage } from "../types";

export interface ParseSuccess {
  ok: true;
  message: ScreenMessage;
}

export interface ParseFailure {
  ok: false;
  errors: string[];
}

export type ParseResult = ParseSuccess | ParseFailure;

/**
 * Structural parse of a wire message. This is what a handset renderer
 * would run on anything arriving from the network before trusting it —
 * malformed shapes and unsupported protocol versions are rejected here,
 * before the message ever reaches the renderer.
 */
export function parseScreenMessage(raw: unknown): ParseResult {
  const result = ScreenMessageSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${path}: ${issue.message}`;
    });
    return { ok: false, errors };
  }
  return { ok: true, message: result.data as ScreenMessage };
}

/** Convenience helper for call sites that already trust the source (e.g. the mock adapter). */
export function parseScreenMessageOrThrow(raw: unknown): ScreenMessage {
  const result = parseScreenMessage(raw);
  if (!result.ok) {
    throw new Error(`Invalid USSD-UI screen message: ${result.errors.join("; ")}`);
  }
  return result.message;
}
