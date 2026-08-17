import type { ScreenNavigation } from "../../protocol/types";

export type NavigateKind = "back" | "home" | "cancel";

export function NavBar({ nav, onNavigate }: { nav: ScreenNavigation; onNavigate: (kind: NavigateKind) => void }) {
  if (!nav.back && !nav.home && !nav.cancel) return null;

  return (
    <div className="flex items-center justify-between border-t border-border bg-surface px-3 py-2 text-xs">
      <button
        type="button"
        disabled={!nav.back}
        onClick={() => onNavigate("back")}
        className="flex items-center gap-1 rounded px-2 py-1 text-text-muted enabled:hover:text-accent disabled:opacity-25"
      >
        ← Back
      </button>
      <button
        type="button"
        disabled={!nav.home}
        onClick={() => onNavigate("home")}
        className="flex items-center gap-1 rounded px-2 py-1 text-text-muted enabled:hover:text-accent disabled:opacity-25"
      >
        ⌂ Home
      </button>
      <button
        type="button"
        disabled={!nav.cancel}
        onClick={() => onNavigate("cancel")}
        className="flex items-center gap-1 rounded px-2 py-1 text-text-muted enabled:hover:text-danger disabled:opacity-25"
      >
        ✕ Cancel
      </button>
    </div>
  );
}
