import { Badge } from "../ui/Badge";

export function DemoBadge({ label = "Simulated environment" }: { label?: string }) {
  return <Badge tone="accent">◆ {label}</Badge>;
}
