import { Badge, type BadgeVariant } from "../ui/Badge";
import type { ProjectStatus } from "../../types";

const VARIANTS: Record<ProjectStatus, BadgeVariant> = {
  Active: "project-active",
  Completed: "project-completed",
  Archived: "project-archived",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={VARIANTS[status]}>{status}</Badge>;
}
