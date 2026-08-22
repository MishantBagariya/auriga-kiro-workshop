import { Badge, type BadgeVariant } from "../ui/Badge";
import type { TaskPriority } from "../../types";

const VARIANTS: Record<TaskPriority, BadgeVariant> = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge variant={VARIANTS[priority]}>{priority}</Badge>;
}
