import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import type { ProjectDetail } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';

const STATUS_OPTIONS = ['Active', 'Completed', 'Archived'];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectsApi.getById(id!);
      setProject(data);
    } catch {
      setError('Project not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await projectsApi.delete(id!);
      showToast('Project deleted');
      navigate('/projects');
    } catch {
      setDeleting(false);
      setShowDelete(false);
      showToast('Failed to delete project', 'error');
    }
  };

  if (loading) return <Spinner text="Loading project..." />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!project) return null;

  const completedTasks = project.tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/projects')} className="text-sm text-blue-600 hover:underline mb-2 block">← Back to Projects</button>
          <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
          {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge type="status" value={project.status} />
          <button onClick={() => setShowEdit(true)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Edit</button>
          <button onClick={() => setShowDelete(true)} className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6">
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{project.tasks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 text-center">
          <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Tasks</h3>
          <button
            onClick={() => setShowCreateTask(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            + Add Task
          </button>
        </div>

        {project.tasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-3">No tasks in this project yet</p>
            <button onClick={() => setShowCreateTask(true)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              + Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-gray-400 mt-0.5">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <Badge type="priority" value={task.priority} />
                  <Badge type="status" value={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditProjectForm
          project={project}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchProject(); showToast('Project updated successfully'); }}
        />
      )}

      {/* Delete Confirm */}
      {showDelete && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${project.name}"? This will also delete all ${project.tasks.length} associated task(s). This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskForm
          projectId={project.id}
          onClose={() => setShowCreateTask(false)}
          onSaved={() => { setShowCreateTask(false); fetchProject(); showToast('Task created successfully'); }}
        />
      )}
    </div>
  );
}

// Edit Project Form
function EditProjectForm({
  project,
  onClose,
  onSaved,
}: {
  project: ProjectDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [status, setStatus] = useState(project.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }
    try {
      setSubmitting(true);
      setError('');
      await projectsApi.update(project.id, { name: name.trim(), description: description.trim() || undefined, status });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Edit Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
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

// Create Task Form (quick add from project detail)
const TASK_STATUSES = ['Todo', 'InProgress', 'Completed'];
const TASK_PRIORITIES = ['Low', 'Medium', 'High'];

function CreateTaskForm({
  projectId,
  onClose,
  onSaved,
}: {
  projectId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Task title is required'); return; }
    try {
      setSubmitting(true);
      setError('');
      await tasksApi.create({
        title: title.trim(),
        projectId,
        status,
        priority,
        description: description.trim() || undefined,
        dueDate: dueDate || null,
      });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{s === 'InProgress' ? 'In Progress' : s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TASK_PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
