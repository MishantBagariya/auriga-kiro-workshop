import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import type { Task, TaskStatus } from '../types';
import Badge from '../components/Badge';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'Todo', label: 'To Do', color: 'bg-gray-100 border-gray-300' },
  { status: 'InProgress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { status: 'Completed', label: 'Completed', color: 'bg-green-50 border-green-200' },
];

export default function KanbanPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setUpdatingId(taskId);
      const updated = await tasksApi.updateStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showToast('Task status updated');
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  if (loading) return <Spinner text="Loading board..." />;
  if (error) return <div className="p-6"><div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div></div>;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Board</h2>
        <p className="text-gray-500 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} across all projects</p>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.status);
          return (
            <div
              key={col.status}
              className="flex flex-col min-w-0"
            >
              {/* Column header */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border ${col.color}`}>
                <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                <span className="text-xs font-medium text-gray-500 bg-white rounded-full px-2 py-0.5 border border-gray-200">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 bg-gray-50 rounded-b-xl border border-t-0 border-gray-200 p-2 space-y-2 min-h-32">
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20">
                    <p className="text-xs text-gray-400">No tasks</p>
                  </div>
                )}
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isUpdating={updatingId === task.id}
                    onStatusChange={handleStatusChange}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Task card component
function TaskCard({
  task,
  isUpdating,
  onStatusChange,
  onClick,
}: {
  task: Task;
  isUpdating: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onClick: () => void;
}) {
  const otherStatuses = (['Todo', 'InProgress', 'Completed'] as TaskStatus[]).filter(
    (s) => s !== task.status
  );

  const statusLabel: Record<TaskStatus, string> = {
    Todo: 'To Do',
    InProgress: 'In Progress',
    Completed: 'Completed',
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow ${isUpdating ? 'opacity-50' : ''}`}
    >
      {/* Title — clickable to detail */}
      <p
        onClick={onClick}
        className="text-sm font-medium text-gray-900 mb-2 cursor-pointer hover:text-blue-600 line-clamp-2"
      >
        {task.title}
      </p>

      {/* Project */}
      <p className="text-xs text-gray-400 mb-3 truncate">{task.project.name}</p>

      {/* Due date */}
      {task.dueDate && (
        <p className="text-xs text-gray-400 mb-3">
          📅 {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}

      {/* Priority badge */}
      <div className="mb-3">
        <Badge type="priority" value={task.priority} />
      </div>

      {/* Move to buttons */}
      <div className="flex flex-wrap gap-1 border-t border-gray-100 pt-2">
        <span className="text-xs text-gray-400 mr-1 self-center">Move to:</span>
        {otherStatuses.map((s) => (
          <button
            key={s}
            disabled={isUpdating}
            onClick={() => onStatusChange(task.id, s)}
            className="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
