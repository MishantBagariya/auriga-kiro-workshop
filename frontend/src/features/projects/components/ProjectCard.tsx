import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import type { Project } from '../../../types/project';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{project.name}</h3>
          <ProjectStatusBadge status={project.status} />
        </div>
        {project.description && <p className="mb-3 line-clamp-2 text-sm text-gray-500">{project.description}</p>}
        <p className="text-sm text-gray-500">
          {project.completedTaskCount} / {project.taskCount} tasks completed
        </p>
      </Card>
    </Link>
  );
}
