import { Chip } from "@mui/material";
import type { TaskPriority } from "../../types";

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: "success" | "warning" | "error" }
> = {
  low: { label: "Low", color: "success" },
  medium: { label: "Medium", color: "warning" },
  high: { label: "High", color: "error" },
};

interface PriorityChipProps {
  priority: TaskPriority;
  size?: "small" | "medium";
}

export const PriorityChip = ({
  priority,
  size = "small",
}: PriorityChipProps) => {
  const config = priorityConfig[priority];
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
    />
  );
};
