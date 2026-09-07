import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  label?: string;
}

export function LoadingSpinner({
  className,
  size = 24,
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2 py-8", className)}
      role="status"
      aria-label={label}
    >
      <Loader2 className="animate-spin text-muted-foreground" size={size} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
