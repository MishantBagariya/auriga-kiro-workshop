"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { useProjects } from "@/hooks/use-projects";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { TaskStatusChart } from "@/components/dashboard/task-status-chart";
import { ProjectProgressChart } from "@/components/dashboard/project-progress-chart";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const { data: projects } = useProjects();

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <h1 className="text-xl font-semibold text-foreground">Your work</h1>
        <LoadingSpinner className="mt-8" label="Loading dashboard" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 p-6">
        <h1 className="text-xl font-semibold text-foreground">Your work</h1>
        <ErrorMessage
          className="mt-8"
          message="Failed to load dashboard data."
          retry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-xl font-semibold text-foreground">Your work</h1>

      {/* Summary cards */}
      <SummaryCards summary={data.summary} />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Task Distribution
          </h2>
          <TaskStatusChart summary={data.summary} />
        </section>

        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Project Progress
          </h2>
          <ProjectProgressChart projects={projects ?? []} />
        </section>
      </div>

      {/* Recent + Upcoming */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Recent tasks
          </h2>
          <RecentTasks tasks={data.recentTasks} />
        </section>

        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Upcoming tasks
          </h2>
          <UpcomingTasks tasks={data.upcomingTasks} />
        </section>
      </div>
    </div>
  );
}
