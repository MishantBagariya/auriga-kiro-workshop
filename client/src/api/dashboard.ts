import { apiGet } from "./client";
import type { DashboardData } from "../types";

export function getDashboard(): Promise<DashboardData> {
  return apiGet<DashboardData>("/dashboard");
}
