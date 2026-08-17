import type { ErrorComponent } from "../../../protocol/types";

export function ErrorPart({ component }: { component: ErrorComponent }) {
  return (
    <div className="space-y-3 rounded-lg border border-danger/30 bg-danger-soft p-4 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-danger/20 text-danger">
        ✕
      </div>
      <p className="text-sm font-medium text-text">{component.heading}</p>
      {component.reason && (
        <p className="text-xs text-text-muted">
          Reason: <span className="text-danger">{component.reason}</span>
        </p>
      )}
    </div>
  );
}
