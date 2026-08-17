import { cn } from "../../lib/cn";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export type DialStatus = "idle" | "dialing" | "error";

interface DialPadProps {
  value: string;
  onChange: (value: string) => void;
  onCall: () => void;
  status?: DialStatus;
  errorMessage?: string;
}

/**
 * A phone dial pad — nothing here is USSD-specific. It just builds a
 * string and calls onCall() when the subscriber presses dial, exactly
 * like a real handset's dialer. What happens with that string (does it
 * match a real service, does the session start) is entirely the
 * caller's decision, not this component's.
 */
export function DialPad({ value, onChange, onCall, status = "idle", errorMessage }: DialPadProps) {
  const dialing = status === "dialing";
  const hasError = status === "error";

  function press(key: string) {
    if (dialing) return;
    onChange(value + key);
  }

  function backspace() {
    if (dialing) return;
    onChange(value.slice(0, -1));
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-11 w-full items-center justify-center rounded-lg border border-border-strong bg-black/30 px-3">
        {hasError ? (
          <span className="text-center text-xs text-danger">{errorMessage}</span>
        ) : (
          <span className={cn("font-mono text-lg tracking-wider", value ? "text-text" : "text-text-faint")}>
            {dialing ? "Dialing…" : value || "Enter a code"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            disabled={dialing}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-surface-raised font-mono text-base text-text transition-colors hover:border-accent/50 hover:bg-accent-soft disabled:opacity-40"
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={backspace}
          disabled={dialing || !value}
          aria-label="Backspace"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-faint hover:text-text disabled:opacity-30"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={onCall}
          disabled={dialing || !value}
          aria-label="Dial"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-lg text-[#0d1f14] shadow-lg shadow-success/30 transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          📞
        </button>
        <span className="w-9" aria-hidden="true" />
      </div>
    </div>
  );
}
