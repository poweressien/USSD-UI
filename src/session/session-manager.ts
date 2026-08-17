import {
  canGoBack,
  currentScreen,
  popScreen,
  pushScreen,
  resetStack,
  type NavigationStack,
} from "./navigation-stack";

export type SessionStatus = "active" | "expired" | "cancelled" | "completed";

export interface Session {
  id: string;
  carrier: string;
  simSlot: number;
  currentScreen: string;
  history: string[];
  status: SessionStatus;
  startedAt: string;
  expiresAt: string;
}

/** Real USSD sessions time out fast — typically well under 3 minutes of inactivity. */
export const SESSION_TTL_MS = 3 * 60 * 1000;

let counter = 0;
function generateSessionId(): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `demo-${random}${counter.toString(36)}`;
}

function fromStack(session: Session, stack: NavigationStack): Session {
  return {
    ...session,
    currentScreen: currentScreen(stack) ?? session.currentScreen,
    history: [...stack],
  };
}

export function createSession(params: {
  carrier: string;
  simSlot: number;
  rootScreenId: string;
  now?: Date;
}): Session {
  const now = params.now ?? new Date();
  const stack = resetStack(params.rootScreenId);
  return {
    id: generateSessionId(),
    carrier: params.carrier,
    simSlot: params.simSlot,
    currentScreen: params.rootScreenId,
    history: [...stack],
    status: "active",
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  };
}

function assertActive(session: Session): void {
  if (session.status !== "active") {
    throw new Error(`Cannot navigate a ${session.status} session`);
  }
}

/** Move forward to a new screen, pushing it onto the history stack. */
export function navigate(session: Session, screenId: string): Session {
  assertActive(session);
  const stack = pushScreen(session.history, screenId);
  return fromStack(session, stack);
}

/** Step back one screen. A no-op at the root screen — Back stops at Home. */
export function goBack(session: Session): Session {
  assertActive(session);
  const stack = popScreen(session.history);
  return fromStack(session, stack);
}

export function canGoBackInSession(session: Session): boolean {
  return canGoBack(session.history);
}

/** Jump straight back to the root screen, collapsing the whole stack. */
export function goHome(session: Session, rootScreenId: string): Session {
  assertActive(session);
  const stack = resetStack(rootScreenId);
  return fromStack(session, stack);
}

export function cancelSession(session: Session): Session {
  if (session.status !== "active") return session;
  return { ...session, status: "cancelled" };
}

export function completeSession(session: Session): Session {
  if (session.status !== "active") return session;
  return { ...session, status: "completed" };
}

export function expireSession(session: Session): Session {
  if (session.status !== "active") return session;
  return { ...session, status: "expired" };
}

export function isExpired(session: Session, now: Date = new Date()): boolean {
  return now.getTime() > new Date(session.expiresAt).getTime();
}

/** Applies TTL expiry as a pure check — call this on a timer/effect, not automatically. */
export function expireSessionIfNeeded(session: Session, now: Date = new Date()): Session {
  if (session.status === "active" && isExpired(session, now)) {
    return expireSession(session);
  }
  return session;
}
