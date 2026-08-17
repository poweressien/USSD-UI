import type { SuccessComponent } from "../../../protocol/types";

export function SuccessPart({ component }: { component: SuccessComponent }) {
  return (
    <div className="space-y-4 rounded-lg border border-success/30 bg-success-soft p-4 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
        ✓
      </div>
      <p className="text-sm font-medium text-text">{component.heading}</p>
      {component.rows && component.rows.length > 0 && (
        <dl className="space-y-1 text-left">
          {component.rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <dt className="text-text-muted">{row.label}</dt>
              <dd className="font-medium text-text">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {component.reference && (
        <p className="font-mono text-xs text-text-faint">
          Reference <span className="text-text-muted">{component.reference}</span>
        </p>
      )}
      <p className="text-[11px] uppercase tracking-wide text-text-faint">Simulated transaction</p>
    </div>
  );
}
