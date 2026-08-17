import type { ReactNode } from "react";
import { Badge } from "../../components/ui/Badge";

export function DocPage({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {badge && (
        <div className="mb-3">
          <Badge tone="info">{badge}</Badge>
        </div>
      )}
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <div className="prose-doc mt-4 space-y-4 text-sm leading-relaxed text-text-muted [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text [&_h3]:font-medium [&_h3]:text-text [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-text">
        {children}
      </div>
    </div>
  );
}
