"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { TASK_SORT_FIELDS, type TaskSortField, type SortOrder } from "@/types";

interface TaskSortProps {
  sortBy: TaskSortField;
  order: SortOrder;
  onSortByChange: (value: TaskSortField) => void;
  onOrderToggle: () => void;
}

const sortFieldLabels: Record<TaskSortField, string> = {
  createdAt: "Created Date",
  updatedAt: "Updated Date",
  dueDate: "Due Date",
  priority: "Priority",
};

export function TaskSort({
  sortBy,
  order,
  onSortByChange,
  onOrderToggle,
}: TaskSortProps) {
  return (
    <div className="flex items-center gap-1">
      <Select
        value={sortBy}
        onValueChange={(v) => onSortByChange(v as TaskSortField)}
      >
        <SelectTrigger className="w-[150px]" aria-label="Sort by">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TASK_SORT_FIELDS.map((f) => (
            <SelectItem key={f} value={f}>
              {sortFieldLabels[f]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={onOrderToggle}
        aria-label={`Sort order: ${order === "asc" ? "ascending" : "descending"}. Click to toggle.`}
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground">
        {order === "asc" ? "Asc" : "Desc"}
      </span>
    </div>
  );
}
