"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface TaskDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  loading: boolean;
  onConfirm: () => void;
}

export function TaskDeleteDialog({
  open,
  onOpenChange,
  taskTitle,
  loading,
  onConfirm,
}: TaskDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Task"
      description={`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
