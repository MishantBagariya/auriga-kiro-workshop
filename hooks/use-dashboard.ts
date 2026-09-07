"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";
import type { DashboardData } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/api/dashboard"),
  });
}
