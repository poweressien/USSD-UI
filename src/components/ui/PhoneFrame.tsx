import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  children: ReactNode;
  label?: string;
  dim?: boolean;
}

/**
 * A simplified handset bezel. The small gold notch mark in the corner
 * is a deliberate, recurring nod to a SIM card's contact pad — this
 * whole prototype exists because of what that chip talks to.
 */
export function PhoneFrame({ children, label, dim = false }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      {label && <div className="font-mono text-xs uppercase tracking-widest text-text-faint">{label}</div>}
      <div
        className={cn(
          "relative w-full max-w-[300px] rounded-[2.25rem] border-[6px] border-surface-raised bg-black p-2 shadow-2xl shadow-black/50",
          dim && "opacity-50 grayscale",
        )}
      >
        {/* SIM-contact corner mark */}
        <div className="absolute -right-1 -top-1 h-3 w-4 rounded-sm bg-accent/80" aria-hidden="true" />
        {/* speaker slit */}
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-surface-raised" aria-hidden="true" />
        <div className="h-[560px] overflow-hidden rounded-[1.5rem] bg-surface">{children}</div>
        {/* home indicator */}
        <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-surface-raised" aria-hidden="true" />
      </div>
    </div>
  );
}
