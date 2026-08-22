import { useDashboardQuery } from "../hooks/useDashboard";
import { StatTilesRow } from "../components/dashboard/StatTilesRow";
import { RecentTasksList } from "../components/dashboard/RecentTasksList";
import { UpcomingTasksList } from "../components/dashboard/UpcomingTasksList";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">An overview of all your projects and tasks.</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load dashboard data.{" "}
          <Button size="sm" variant="secondary" className="ml-2" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {data && (
        <>
          <StatTilesRow stats={data.stats} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent Tasks</h2>
              <RecentTasksList tasks={data.recentTasks} />
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Upcoming Tasks</h2>
              <UpcomingTasksList tasks={data.upcomingTasks} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
