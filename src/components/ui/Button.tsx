import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-[#1a1305] hover:bg-accent-strong border border-transparent",
  secondary: "bg-surface-raised text-text hover:bg-border border border-border-strong",
  ghost: "bg-transparent text-text-muted hover:text-text hover:bg-surface border border-transparent",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-[#1a1110] border border-danger/30",
};

export function Button({ variant = "primary", className, children, ...rest }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
        "transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
