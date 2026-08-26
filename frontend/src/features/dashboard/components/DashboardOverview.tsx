import { Spinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from './StatCard';
import { RecentTasks } from './RecentTasks';
import { UpcomingTasks } from './UpcomingTasks';

export function DashboardOverview() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) return <Spinner label="Loading dashboard" />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const { stats, recentTasks, upcomingTasks } = data;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Projects" value={stats.totalProjects} />
        <StatCard label="Active Projects" value={stats.activeProjects} />
        <StatCard label="Total Tasks" value={stats.totalTasks} />
        <StatCard label="To Do" value={stats.todoTasks} />
        <StatCard label="In Progress" value={stats.inProgressTasks} />
        <StatCard label="Completed" value={stats.completedTasks} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTasks tasks={recentTasks} />
        <UpcomingTasks tasks={upcomingTasks} />
      </div>
    </div>
  );
}
