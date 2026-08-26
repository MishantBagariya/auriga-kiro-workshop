import { Badge } from '../../../components/ui/Badge';
import { taskStatusBadgeClass, taskStatusLabels } from '../../../lib/labels';
import type { TaskStatus } from '../../../types/task';

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={taskStatusBadgeClass[status]}>{taskStatusLabels[status]}</Badge>;
}
