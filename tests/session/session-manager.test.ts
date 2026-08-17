import { describe, expect, it } from "vitest";
import {
  createSession,
  navigate,
  goBack,
  goHome,
  cancelSession,
  completeSession,
  expireSession,
  isExpired,
  expireSessionIfNeeded,
} from "../../src/session/session-manager";

describe("session-manager: create", () => {
  it("creates an active session rooted at the given screen", () => {
    const session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    expect(session.status).toBe("active");
    expect(session.carrier).toBe("MTN");
    expect(session.simSlot).toBe(1);
    expect(session.currentScreen).toBe("home");
    expect(session.history).toEqual(["home"]);
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(new Date(session.startedAt).getTime());
  });

  it("gives each session a distinct id", () => {
    const a = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    const b = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    expect(a.id).not.toBe(b.id);
  });
});

describe("session-manager: navigate", () => {
  it("pushes a new current screen and appends to history", () => {
    const session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    const next = navigate(session, "data-plans");
    expect(next.currentScreen).toBe("data-plans");
    expect(next.history).toEqual(["home", "data-plans"]);
  });

  it("goBack pops one level and stops at the root", () => {
    let session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    session = navigate(session, "data-plans");
    session = navigate(session, "confirmation");
    session = goBack(session);
    expect(session.currentScreen).toBe("data-plans");
    session = goBack(session);
    expect(session.currentScreen).toBe("home");
    session = goBack(session); // already at root — stays put
    expect(session.currentScreen).toBe("home");
    expect(session.history).toEqual(["home"]);
  });

  it("goHome collapses the whole stack back to the root screen", () => {
    let session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    session = navigate(session, "data-plans");
    session = navigate(session, "custom-amount-data");
    session = goHome(session, "home");
    expect(session.currentScreen).toBe("home");
    expect(session.history).toEqual(["home"]);
  });

  it("throws when navigating a session that is no longer active", () => {
    let session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    session = cancelSession(session);
    expect(() => navigate(session, "data-plans")).toThrow();
  });
});

describe("session-manager: cancel / complete / expire", () => {
  it("cancelSession marks the session cancelled", () => {
    const session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    const cancelled = cancelSession(session);
    expect(cancelled.status).toBe("cancelled");
  });

  it("completeSession marks the session completed", () => {
    const session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    const completed = completeSession(session);
    expect(completed.status).toBe("completed");
  });

  it("is a no-op to cancel/complete a session that is already inactive", () => {
    let session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    session = completeSession(session);
    const stillCompleted = cancelSession(session);
    expect(stillCompleted.status).toBe("completed");
  });

  it("expireSession marks the session expired", () => {
    const session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home" });
    expect(expireSession(session).status).toBe("expired");
  });

  it("isExpired reflects the TTL relative to a given time", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home", now });
    expect(isExpired(session, now)).toBe(false);
    const wayLater = new Date(now.getTime() + 10 * 60 * 1000);
    expect(isExpired(session, wayLater)).toBe(true);
  });

  it("expireSessionIfNeeded only flips status when the TTL has actually elapsed", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const session = createSession({ carrier: "MTN", simSlot: 1, rootScreenId: "home", now });
    expect(expireSessionIfNeeded(session, now).status).toBe("active");
    const wayLater = new Date(now.getTime() + 10 * 60 * 1000);
    expect(expireSessionIfNeeded(session, wayLater).status).toBe("expired");
  });
});
