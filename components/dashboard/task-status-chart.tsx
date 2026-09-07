"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { DashboardSummary } from "@/types";

interface TaskStatusChartProps {
  summary: DashboardSummary;
}

const COLORS = [
  { name: "To Do", color: "#6b778c" },
  { name: "In Progress", color: "#0052cc" },
  { name: "Completed", color: "#00875a" },
];

export function TaskStatusChart({ summary }: TaskStatusChartProps) {
  const data = [
    { name: "To Do", value: summary.todoTasks },
    { name: "In Progress", value: summary.inProgressTasks },
    { name: "Completed", value: summary.completedTasks },
  ];

  const total = summary.totalTasks;

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No tasks to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={COLORS[index].name} fill={COLORS[index].color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e1e4e8",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          formatter={(value) => (
            <span className="text-sm text-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
