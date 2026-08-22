import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import type { Project } from "../../types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-slate-900">{project.name}</h3>
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="line-clamp-2 flex-1 text-sm text-slate-500">
          {project.description || "No description"}
        </p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            {project.completedTaskCount} / {project.taskCount} tasks completed
          </span>
        </div>
      </Card>
    </Link>
  );
}
