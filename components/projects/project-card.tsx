import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectWithCounts } from "@/types";

const statusStyles: Record<string, string> = {
  active: "bg-[#1f845a] text-white",
  completed: "bg-[#0c66e4] text-white",
  archived: "bg-[#626f86] text-white",
};

interface ProjectCardProps {
  project: ProjectWithCounts;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#e9f2ff]">
              <FolderKanban className="h-4 w-4 text-[#0c66e4]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
              <p className="text-xs text-muted-foreground">Software project</p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase",
              statusStyles[project.status],
            )}
          >
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className="mt-2.5 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {project.completedTasks} of {project.totalTasks} tasks done
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#f1f2f4]">
            <div
              className="h-full rounded-full bg-[#0c66e4] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
