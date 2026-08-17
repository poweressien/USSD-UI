import type { ScreenDef, UserAction } from "../../protocol/types";
import { ComponentRenderer } from "./ComponentRenderer";
import { NavBar, type NavigateKind } from "./NavBar";

export function ScreenRenderer({
  screen,
  onAction,
  onNavigate,
}: {
  screen: ScreenDef;
  onAction: (action: UserAction) => void;
  onNavigate: (kind: NavigateKind) => void;
}) {
  return (
    <div className="flex h-full flex-col bg-surface font-sans">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-text">{screen.title}</h2>
        {screen.subtitle && <p className="text-xs text-text-muted">{screen.subtitle}</p>}
      </header>
      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {screen.components.map((component) => (
          <ComponentRenderer key={component.id} component={component} onAction={onAction} />
        ))}
      </div>
      <NavBar nav={screen.navigation} onNavigate={onNavigate} />
    </div>
  );
}
