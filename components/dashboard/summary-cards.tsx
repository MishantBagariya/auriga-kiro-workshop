import {
  FolderKanban,
  ListTodo,
  Clock,
  CheckCircle2,
  CircleDot,
  Layers,
} from "lucide-react";
import type { DashboardSummary } from "@/types";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

const cards = [
  {
    key: "totalProjects",
    label: "Total Projects",
    icon: FolderKanban,
    color: "text-[#0c66e4]",
    bg: "bg-[#e9f2ff]",
  },
  {
    key: "activeProjects",
    label: "Active Projects",
    icon: Layers,
    color: "text-[#0c66e4]",
    bg: "bg-[#e9f2ff]",
  },
  {
    key: "totalTasks",
    label: "Total Tasks",
    icon: ListTodo,
    color: "text-[#44546f]",
    bg: "bg-[#f1f2f4]",
  },
  {
    key: "todoTasks",
    label: "To Do",
    icon: CircleDot,
    color: "text-[#626f86]",
    bg: "bg-[#f1f2f4]",
  },
  {
    key: "inProgressTasks",
    label: "In Progress",
    icon: Clock,
    color: "text-[#0c66e4]",
    bg: "bg-[#e9f2ff]",
  },
  {
    key: "completedTasks",
    label: "Completed",
    icon: CheckCircle2,
    color: "text-[#1f845a]",
    bg: "bg-[#dcfff1]",
  },
] as const;

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];
        return (
          <div
            key={card.key}
            className="rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className={`rounded-md p-1.5 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
