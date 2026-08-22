import { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import {
  TASK_PRIORITIES,
  TASK_SORT_FIELDS,
  TASK_STATUSES,
  type ProjectRef,
  type SortOrder,
  type TaskSortField,
} from "../../types";

const SORT_LABELS: Record<TaskSortField, string> = {
  createdDate: "Created date",
  updatedDate: "Updated date",
  dueDate: "Due date",
  priority: "Priority",
};

interface TaskFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  projectId: string;
  onProjectChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  sortBy: TaskSortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: TaskSortField, sortOrder: SortOrder) => void;
  projects: ProjectRef[] | undefined;
}

export function TaskFiltersBar({
  search,
  onSearchChange,
  projectId,
  onProjectChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sortBy,
  sortOrder,
  onSortChange,
  projects,
}: TaskFiltersBarProps) {
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDraft !== search) onSearchChange(searchDraft);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <Input
        value={searchDraft}
        onChange={(e) => setSearchDraft(e.target.value)}
        placeholder="Search tasks by title…"
        className="md:max-w-xs"
        aria-label="Search tasks"
      />
      <Select
        value={projectId}
        onChange={(e) => onProjectChange(e.target.value)}
        className="md:w-auto"
        aria-label="Filter by project"
      >
        <option value="">All Projects</option>
        {projects?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="md:w-auto"
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="md:w-auto"
        aria-label="Filter by priority"
      >
        <option value="">All Priorities</option>
        {TASK_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </Select>
      <div className="flex items-center gap-2 md:ml-auto">
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as TaskSortField, sortOrder)}
          className="md:w-auto"
          aria-label="Sort by"
        >
          {TASK_SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              Sort: {SORT_LABELS[field]}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
          aria-label={sortOrder === "asc" ? "Sort ascending" : "Sort descending"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>
    </div>
  );
}
