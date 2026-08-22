import { useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { useProjectsQuery } from "../../hooks/useProjects";
import { Spinner } from "../ui/Spinner";
import {
  ApiError,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type CreateTaskInput,
  type Task,
} from "../../types";

interface TaskFormProps {
  initialValues?: Task;
  lockedProjectId?: string;
  loading?: boolean;
  onSubmit: (input: CreateTaskInput) => Promise<unknown>;
  onCancel: () => void;
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function TaskForm({ initialValues, lockedProjectId, loading, onSubmit, onCancel }: TaskFormProps) {
  const { data: projects, isLoading: projectsLoading } = useProjectsQuery();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [projectId, setProjectId] = useState(
    initialValues?.projectId ?? lockedProjectId ?? ""
  );
  const [status, setStatus] = useState(initialValues?.status ?? "To Do");
  const [priority, setPriority] = useState(initialValues?.priority ?? "Medium");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [dueDate, setDueDate] = useState(toDateInputValue(initialValues?.dueDate));
  const [labels, setLabels] = useState((initialValues?.labels ?? []).join(", "));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!projectId) nextErrors.projectId = "Project is required";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    try {
      await onSubmit({
        title: title.trim(),
        projectId,
        status,
        priority,
        description: description.trim() || undefined,
        dueDate: dueDate || null,
        labels: labels
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setErrors(err.fields);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="e.g. Write onboarding copy"
          autoFocus
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Project <span className="text-red-500">*</span>
        </label>
        {projectsLoading ? (
          <Spinner size="sm" />
        ) : (
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            error={errors.projectId}
            disabled={!!lockedProjectId}
          >
            <option value="">Select a project…</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        )}
        {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Add more detail…"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Labels</label>
        <Input
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          placeholder="comma, separated, labels"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialValues ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
