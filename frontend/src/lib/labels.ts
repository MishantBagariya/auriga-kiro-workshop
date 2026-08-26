import type { TaskPriority, TaskStatus } from '../types/task';
import type { ProjectStatus } from '../types/project';

/**
 * Single source of display labels and badge colours for every enum
 * in the domain. Components read from here; nothing hardcodes a
 * display string, per product.md.
 */

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const taskStatusBadgeClass: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const taskPriorityBadgeClass: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};

export const projectStatusBadgeClass: Record<ProjectStatus, string> = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-700',
};
