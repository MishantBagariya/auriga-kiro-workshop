import { StatTile } from "./StatTile";
import type { DashboardStats } from "../../types";

export function StatTilesRow({ stats }: { stats: DashboardStats }) {
  const tiles: { label: string; value: number }[] = [
    { label: "Total Projects", value: stats.totalProjects },
    { label: "Active Projects", value: stats.activeProjects },
    { label: "Total Tasks", value: stats.totalTasks },
    { label: "To Do", value: stats.toDoTasks },
    { label: "In Progress", value: stats.inProgressTasks },
    { label: "Completed", value: stats.completedTasks },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((tile) => (
        <StatTile key={tile.label} label={tile.label} value={tile.value} />
      ))}
    </div>
  );
}
