"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface ProjectDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  loading: boolean;
  onConfirm: () => void;
}

export function ProjectDeleteDialog({
  open,
  onOpenChange,
  projectName,
  loading,
  onConfirm,
}: ProjectDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Project"
      description={`Are you sure you want to delete "${projectName}"? This will permanently delete the project and all its tasks. This action cannot be undone.`}
      confirmLabel="Delete"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
