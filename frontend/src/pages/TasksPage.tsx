import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import { projectsApi } from '../api/projects';
import type { Task, Project, TaskFilters } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';

const STATUSES = ['', 'Todo', 'InProgress', 'Completed'] as const;
const PRIORITIES = ['', 'Low', 'Medium', 'High'] as const;
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

export default function TasksPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    projectId: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const cleaned: TaskFilters = {};
      if (filters.search) cleaned.search = filters.search;
      if (filters.projectId) cleaned.projectId = filters.projectId;
      if (filters.status) cleaned.status = filters.status;
      if (filters.priority) cleaned.priority = filters.priority;
      if (filters.sortBy) cleaned.sortBy = filters.sortBy;
      if (filters.order) cleaned.order = filters.order;
      const data = await tasksApi.getAll(cleaned);
      setTasks(data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    projectsApi.getAll().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => { fetchTasks(); }, [filters]);

  const updateFilter = (key: keyof TaskFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasFilters = filters.search || filters.projectId || filters.status || filters.priority;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search tasks..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters + Sort row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter label */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide pl-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
          </div>

          <select
            value={filters.projectId}
            onChange={(e) => updateFilter('projectId', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ paddingRight: '3rem' }}
          >
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ paddingRight: '3rem' }}
          >
            <option value="">All Statuses</option>
            <option value="Todo">To Do</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ paddingRight: '3rem' }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Sort label */}
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide pl-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ paddingRight: '3rem' }}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.order}
            onChange={(e) => updateFilter('order', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ paddingRight: '3rem' }}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => setFilters({ search: '', projectId: '', status: '', priority: '', sortBy: 'createdAt', order: 'desc' })}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <Spinner text="Loading tasks..." />}

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}

      {/* Empty states */}
      {!loading && !error && tasks.length === 0 && (
        <div className="text-center py-16">
          {hasFilters ? (
            <>
              <p className="text-gray-400 text-lg mb-2">No tasks match your filters</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-lg mb-2">No tasks yet</p>
              <p className="text-gray-400 text-sm mb-6">Create your first task to get started</p>
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                + New Task
              </button>
            </>
          )}
        </div>
      )}

      {/* Tasks list */}
      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{task.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">{task.project.name}</span>
                  {task.dueDate && (
                    <span className="text-xs text-gray-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Badge type="priority" value={task.priority} />
                <Badge type="status" value={task.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <CreateTaskForm
          projects={projects}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); fetchTasks(); showToast('Task created successfully'); }}
        />
      )}
    </div>
  );
}

// Create Task Form
function CreateTaskForm({
  projects,
  onClose,
  onSaved,
  defaultProjectId,
}: {
  projects: Project[];
  onClose: () => void;
  onSaved: () => void;
  defaultProjectId?: string;
}) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? (projects[0]?.id ?? ''));
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Task title is required'); return; }
    if (!projectId) { setError('Please select a project'); return; }
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
        labels: labels ? labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Todo">To Do</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
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
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export { CreateTaskForm };
