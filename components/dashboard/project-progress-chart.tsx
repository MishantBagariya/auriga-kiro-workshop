"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProjectWithCounts } from "@/types";

interface ProjectProgressChartProps {
  projects: ProjectWithCounts[];
}

export function ProjectProgressChart({ projects }: ProjectProgressChartProps) {
  if (projects.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No projects to display
      </div>
    );
  }

  const data = projects.slice(0, 5).map((project) => ({
    name: project.name.length > 15 ? project.name.slice(0, 15) + "…" : project.name,
    completed: project.completedTasks,
    remaining: project.totalTasks - project.completedTasks,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(223,225,230,0.5)" />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#6b778c" }} />
        <YAxis
          dataKey="name"
          type="category"
          width={110}
          tick={{ fontSize: 11, fill: "#172b4d" }}
        />
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e1e4e8",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar dataKey="completed" stackId="a" fill="#00875a" radius={[0, 0, 0, 0]} name="Completed" />
        <Bar dataKey="remaining" stackId="a" fill="#dfe1e6" radius={[0, 4, 4, 0]} name="Remaining" />
      </BarChart>
    </ResponsiveContainer>
  );
}
