import { Chip } from "@mui/material";
import type { TaskStatus, ProjectStatus } from "../../types";

const statusConfig: Record<
  string,
  {
    label: string;
    color: "default" | "warning" | "info" | "success" | "secondary";
  }
> = {
  todo: { label: "To Do", color: "default" },
  "in-progress": { label: "In Progress", color: "info" },
  completed: { label: "Completed", color: "success" },
  active: { label: "Active", color: "info" },
  archived: { label: "Archived", color: "secondary" },
};

interface StatusChipProps {
  status: TaskStatus | ProjectStatus;
  size?: "small" | "medium";
}

export const StatusChip = ({ status, size = "small" }: StatusChipProps) => {
  const config = statusConfig[status] || {
    label: status,
    color: "default" as const,
  };
  return <Chip label={config.label} color={config.color} size={size} />;
};
