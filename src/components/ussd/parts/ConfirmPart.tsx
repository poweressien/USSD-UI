import type { ConfirmComponent, UserAction } from "../../../protocol/types";
import { Button } from "../../ui/Button";

export function ConfirmPart({
  component,
  onAction,
}: {
  component: ConfirmComponent;
  onAction: (action: UserAction) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-raised p-4">
      <dl className="divide-y divide-border">
        {component.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 text-sm">
            <dt className="text-text-muted">{row.label}</dt>
            <dd className="font-medium text-text">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => onAction({ type: "button", id: `${component.id}_confirm`, action: component.confirmAction })}
        >
          Confirm
        </Button>
        {component.cancelAction && (
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() =>
              onAction({ type: "button", id: `${component.id}_cancel`, action: component.cancelAction as string })
            }
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
