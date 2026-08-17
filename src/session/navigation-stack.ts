/**
 * A navigation stack is just the ordered list of screen ids the
 * subscriber has moved through in the current session, root first.
 * It is intentionally a plain string array with pure functions rather
 * than a class — that keeps it trivial to unit test and trivial to
 * fold into `Session.history` (see session-manager.ts).
 */
export type NavigationStack = readonly string[];

export function resetStack(rootScreenId: string): NavigationStack {
  return [rootScreenId];
}

export function pushScreen(stack: NavigationStack, screenId: string): NavigationStack {
  return [...stack, screenId];
}

/** Pops the top of the stack. The root screen is never popped — Back stops at Home. */
export function popScreen(stack: NavigationStack): NavigationStack {
  if (stack.length <= 1) return stack;
  return stack.slice(0, -1);
}

export function currentScreen(stack: NavigationStack): string | undefined {
  return stack[stack.length - 1];
}

export function canGoBack(stack: NavigationStack): boolean {
  return stack.length > 1;
}
