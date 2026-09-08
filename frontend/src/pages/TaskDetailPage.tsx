import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import { projectsApi } from '../api/projects';
import type { Task, Project } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';

const STATUSES = ['Todo', 'InProgress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await tasksApi.getById(id!);
      setTask(data);
    } catch {
      setError('Task not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    projectsApi.getAll().then(setProjects).catch(() => {});
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!task) return;
    try {
      setStatusUpdating(true);
      const updated = await tasksApi.updateStatus(task.id, status);
      setTask(updated);
      showToast('Task status updated');
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await tasksApi.delete(id!);
      showToast('Task deleted');
      navigate('/tasks');
    } catch {
      setDeleting(false);
      setShowDelete(false);
      showToast('Failed to delete task', 'error');
    }
  };

  if (loading) return <Spinner text="Loading task..." />;
  if (error || !task) return <div className="p-6 text-red-600">{error || 'Task not found'}</div>;

  return (
    <div className="p-6 max-w-2xl">
      {/* Back */}
      <button onClick={() => navigate('/tasks')} className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to Tasks
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex-1">{task.title}</h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-sm">{task.description}</p>
        )}

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Project</p>
            <button
              onClick={() => navigate(`/projects/${task.project.id}`)}
              className="text-blue-600 hover:underline font-medium"
            >
              {task.project.name}
            </button>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Priority</p>
            <Badge type="priority" value={task.priority} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Due Date</p>
            <p className="text-gray-700">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Created</p>
            <p className="text-gray-700">{new Date(task.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Updated</p>
            <p className="text-gray-700">{new Date(task.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Labels */}
        {task.labels.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Labels</p>
            <div className="flex flex-wrap gap-2">
              {task.labels.map((label) => (
                <span key={label} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Status change */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                disabled={statusUpdating || task.status === s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  task.status === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                } disabled:opacity-50`}
              >
                {s === 'InProgress' ? 'In Progress' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditTaskForm
          task={task}
          projects={projects}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchTask(); showToast('Task updated successfully'); }}
        />
      )}

      {/* Delete Confirm */}
      {showDelete && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}

// Edit Task Form
function EditTaskForm({
  task,
  projects,
  onClose,
  onSaved,
}: {
  task: Task;
  projects: Project[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [projectId, setProjectId] = useState(task.projectId);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [description, setDescription] = useState(task.description ?? '');
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [labels, setLabels] = useState(task.labels.join(', '));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Task title is required'); return; }
    try {
      setSubmitting(true);
      setError('');
      await tasksApi.update(task.id, {
        title: title.trim(),
        projectId,
        status,
        priority,
        description: description.trim() || null,
        dueDate: dueDate || null,
        labels: labels ? labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Edit Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Todo">To Do</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
            <input value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="e.g. frontend, bug"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
