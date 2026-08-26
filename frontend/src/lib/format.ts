const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function formatDate(value?: string): string {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

export function isOverdue(dueDate: string | undefined, status: string): boolean {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}
