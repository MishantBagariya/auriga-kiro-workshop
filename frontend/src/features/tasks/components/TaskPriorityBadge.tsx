import { Badge } from '../../../components/ui/Badge';
import { taskPriorityBadgeClass, taskPriorityLabels } from '../../../lib/labels';
import type { TaskPriority } from '../../../types/task';

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={taskPriorityBadgeClass[priority]}>{taskPriorityLabels[priority]}</Badge>;
}
