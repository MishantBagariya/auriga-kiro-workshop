interface BadgeProps {
  type: 'status' | 'priority';
  value: string;
}

const statusStyles: Record<string, string> = {
  Todo: 'bg-gray-100 text-gray-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Completed: 'bg-indigo-100 text-indigo-700',
  Active: 'bg-emerald-100 text-emerald-700',
  Archived: 'bg-yellow-100 text-yellow-700',
};

const priorityStyles: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  Todo: 'To Do',
  InProgress: 'In Progress',
  Completed: 'Completed',
};

export default function Badge({ type, value }: BadgeProps) {
  const styles = type === 'status' ? statusStyles : priorityStyles;
  const label = type === 'status' ? (statusLabels[value] ?? value) : value;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}
