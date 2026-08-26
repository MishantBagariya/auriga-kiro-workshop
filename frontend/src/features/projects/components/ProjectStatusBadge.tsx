import { Badge } from '../../../components/ui/Badge';
import { projectStatusBadgeClass, projectStatusLabels } from '../../../lib/labels';
import type { ProjectStatus } from '../../../types/project';

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge className={projectStatusBadgeClass[status]}>{projectStatusLabels[status]}</Badge>;
}
