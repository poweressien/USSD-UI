import type { ButtonComponent, UserAction } from "../../../protocol/types";

export function ButtonPart({
  component,
  onAction,
}: {
  component: ButtonComponent;
  onAction: (action: UserAction) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onAction({ type: "button", id: component.id, action: component.action, data: component.data })
      }
      className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-raised px-4 py-3 text-left text-sm text-text transition-colors hover:border-accent/50 hover:bg-accent-soft active:scale-[0.99]"
    >
      <span>{component.label}</span>
      <span className="text-text-faint" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
