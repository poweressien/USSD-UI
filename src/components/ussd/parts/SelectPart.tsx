import type { SelectComponent, UserAction } from "../../../protocol/types";

export function SelectPart({
  component,
  onAction,
}: {
  component: SelectComponent;
  onAction: (action: UserAction) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface-raised p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{component.label}</p>
      <div className="space-y-1.5">
        {component.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onAction({ type: "select", id: component.id, action: component.action, value: option.value })}
            className="block w-full rounded-md border border-border-strong px-3 py-2 text-left text-sm text-text hover:border-accent/50 hover:bg-accent-soft"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
