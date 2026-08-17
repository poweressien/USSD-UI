import { useState } from "react";
import type { FormEvent } from "react";
import type { InputComponent, UserAction } from "../../../protocol/types";
import { validateAmount, validatePhoneNumber, validatePin, formatNaira } from "../../../lib/validation";
import { Button } from "../../ui/Button";

function validateForKind(component: InputComponent, raw: string) {
  switch (component.kind) {
    case "currency":
    case "numeric":
      return validateAmount(raw, { min: component.min ?? 0, max: component.max ?? Number.MAX_SAFE_INTEGER });
    case "phone-number":
      return validatePhoneNumber(raw);
    case "pin":
      return validatePin(raw);
    case "text":
    default:
      return raw.trim() === "" ? { valid: false, error: "This field is required." } : { valid: true };
  }
}

export function InputPart({
  component,
  onAction,
}: {
  component: InputComponent;
  onAction: (action: UserAction) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const isSecret = component.kind === "pin";
  const isNumericPad = component.kind === "currency" || component.kind === "numeric" || component.kind === "pin";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = validateForKind(component, value);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    setError(undefined);
    onAction({ type: "input", id: component.id, action: component.action, value: value.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-border bg-surface-raised p-4">
      <label htmlFor={component.id} className="block text-xs font-medium uppercase tracking-wide text-text-muted">
        {component.label}
      </label>
      <div className="flex items-center gap-2">
        {component.kind === "currency" && <span className="font-mono text-text-muted">₦</span>}
        <input
          id={component.id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type={isSecret ? "password" : "text"}
          inputMode={isNumericPad ? "numeric" : "text"}
          maxLength={component.kind === "pin" ? 4 : undefined}
          placeholder={component.placeholder}
          autoFocus
          className="w-full rounded-md border border-border-strong bg-bg px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent"
        />
      </div>
      {(component.min !== undefined || component.max !== undefined) && (
        <p className="text-xs text-text-faint">
          {component.min !== undefined && `Minimum: ${formatNaira(component.min)}`}
          {component.min !== undefined && component.max !== undefined && " · "}
          {component.max !== undefined && `Maximum: ${formatNaira(component.max)}`}
        </p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" variant="primary" className="w-full">
        Continue
      </Button>
    </form>
  );
}
