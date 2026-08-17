import type { ProcessingComponent } from "../../../protocol/types";

export function ProcessingPart({ component }: { component: ProcessingComponent }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-border-strong border-t-accent"
        aria-hidden="true"
      />
      <p className="text-sm text-text-muted">{component.message}</p>
    </div>
  );
}
