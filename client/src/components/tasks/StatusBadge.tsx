import { Badge, type BadgeVariant } from "../ui/Badge";
import type { TaskStatus } from "../../types";

const VARIANTS: Record<TaskStatus, BadgeVariant> = {
  "To Do": "status-todo",
  "In Progress": "status-inprogress",
  Completed: "status-completed",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={VARIANTS[status]}>{status}</Badge>;
}
