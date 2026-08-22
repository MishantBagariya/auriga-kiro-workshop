import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BadgeVariant =
  | "status-todo"
  | "status-inprogress"
  | "status-completed"
  | "priority-low"
  | "priority-medium"
  | "priority-high"
  | "project-active"
  | "project-completed"
  | "project-archived"
  | "neutral";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  "status-todo": "bg-slate-100 text-slate-700",
  "status-inprogress": "bg-blue-100 text-blue-700",
  "status-completed": "bg-green-100 text-green-700",
  "priority-low": "bg-slate-100 text-slate-600",
  "priority-medium": "bg-amber-100 text-amber-800",
  "priority-high": "bg-red-100 text-red-700",
  "project-active": "bg-blue-100 text-blue-700",
  "project-completed": "bg-green-100 text-green-700",
  "project-archived": "bg-slate-100 text-slate-500",
  neutral: "bg-slate-100 text-slate-600",
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        VARIANT_CLASSES[variant]
      )}
    >
      {children}
    </span>
  );
}
