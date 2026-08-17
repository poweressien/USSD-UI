import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "accent" | "success" | "danger" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-surface-raised text-text-muted border-border-strong",
  accent: "bg-accent-soft text-accent-strong border-accent/40",
  success: "bg-success-soft text-success border-success/40",
  danger: "bg-danger-soft text-danger border-danger/40",
  info: "bg-info-soft text-info border-info/40",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium font-mono tracking-tight",
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}
