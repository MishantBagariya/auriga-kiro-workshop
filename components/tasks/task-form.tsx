"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations/task";
import { TASK_STATUSES, TASK_PRIORITIES, type ProjectWithCounts } from "@/types";
import { ApiClientError } from "@/lib/fetcher";

// Form-level type keeps dueDate as a string (what the date input holds).
// Labels is also a string (comma-separated in the input).
// Conversion to the Zod-validated CreateTaskInput happens on submit.
interface TaskFormValues {
  title: string;
  description: string;
  projectId: string;
  status: string;
  priority: string;
  dueDate: string;
  labels: string;
}

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectWithCounts[];
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  title: string;
  submitLabel: string;
}

export function TaskForm({
  open,
  onOpenChange,
  projects,
  defaultValues,
  onSubmit,
  title,
  submitLabel,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      labels: "",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(formData: TaskFormValues) {
    // Parse labels from comma-separated string to array
    const labelsArray = formData.labels
      ? formData.labels.split(",").map((l) => l.trim()).filter(Boolean)
      : [];

    // Validate through Zod (transforms dueDate string -> Date | null, applies defaults).
    const parsed = createTaskSchema.safeParse({
      ...formData,
      labels: labelsArray,
      dueDate: formData.dueDate || undefined,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof TaskFormValues | undefined;
        if (field) {
          setError(field, { message: issue.message });
        }
      }
      return;
    }
    try {
      await onSubmit(parsed.data);
      reset();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        for (const [field, messages] of Object.entries(err.details)) {
          setError(field as keyof TaskFormValues, {
            message: messages[0],
          });
        }
      }
    }
  }

  const statusLabels: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const priorityLabels: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              placeholder="Task title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Optional description"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="task-project">Project *</Label>
            <Select
              defaultValue={defaultValues?.projectId ?? ""}
              onValueChange={(value) => {
                if (value) setValue("projectId", value);
              }}
            >
              <SelectTrigger id="task-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-sm text-destructive">
                {errors.projectId.message}
              </p>
            )}
          </div>

          {/* Status + Priority row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status *</Label>
              <Select
                defaultValue={defaultValues?.status ?? "todo"}
                onValueChange={(value) =>
                  setValue("status", value as TaskFormValues["status"])
                }
              >
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority *</Label>
              <Select
                defaultValue={defaultValues?.priority ?? "medium"}
                onValueChange={(value) =>
                  setValue("priority", value as TaskFormValues["priority"])
                }
              >
                <SelectTrigger id="task-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="task-due-date">Due Date</Label>
            <Input
              id="task-due-date"
              type="date"
              {...register("dueDate")}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label htmlFor="task-labels">Labels</Label>
            <Input
              id="task-labels"
              placeholder="Comma-separated labels (e.g. bug, urgent)"
              {...register("labels")}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple labels with commas
            </p>
            {errors.labels && (
              <p className="text-sm text-destructive">
                {errors.labels.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
