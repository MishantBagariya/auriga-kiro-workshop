"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations/project";
import { PROJECT_STATUSES } from "@/types";
import { ApiClientError } from "@/lib/fetcher";

// The form uses the Zod *output* type (after defaults applied).
type FormValues = CreateProjectInput;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  title: string;
  submitLabel: string;
}

export function ProjectForm({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  title,
  submitLabel,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createProjectSchema) as never,
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(data: FormValues) {
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        for (const [field, messages] of Object.entries(err.details)) {
          if (field in data) {
            setError(field as keyof FormValues, {
              message: messages[0],
            });
          }
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="project-name">Name *</Label>
            <Input
              id="project-name"
              placeholder="Project name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
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

          <div className="space-y-2">
            <Label htmlFor="project-status">Status</Label>
            <Select
              defaultValue={defaultValues?.status ?? "active"}
              onValueChange={(value) =>
                setValue("status", value as FormValues["status"])
              }
            >
              <SelectTrigger id="project-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
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
