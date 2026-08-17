import type { TextComponent } from "../../../protocol/types";
import { cn } from "../../../lib/cn";

export function TextPart({ component }: { component: TextComponent }) {
  return (
    <p
      className={cn(
        "text-sm leading-relaxed",
        component.emphasis === "strong" && "text-base font-semibold text-text",
        component.emphasis === "muted" && "text-text-muted",
        (!component.emphasis || component.emphasis === "normal") && "text-text",
      )}
    >
      {component.value}
    </p>
  );
}
