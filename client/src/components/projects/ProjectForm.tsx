import { useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { PROJECT_STATUSES, type CreateProjectInput, type Project } from "../../types";
import { ApiError } from "../../types";

interface ProjectFormProps {
  initialValues?: Project;
  loading?: boolean;
  onSubmit: (input: CreateProjectInput) => Promise<unknown>;
  onCancel: () => void;
}

export function ProjectForm({ initialValues, loading, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [status, setStatus] = useState(initialValues?.status ?? "Active");
  const [nameError, setNameError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!name.trim()) {
      setNameError("Project name is required");
      return;
    }
    setNameError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, status });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError ?? fieldErrors.name}
          placeholder="e.g. Website Redesign"
          autoFocus
        />
        {(nameError || fieldErrors.name) && (
          <p className="mt-1 text-xs text-red-600">{nameError ?? fieldErrors.name}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What's this project about?"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialValues ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
