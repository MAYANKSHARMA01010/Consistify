import { apiFetch } from "./client";
import { DashboardStats, Mood, DailySummary, DailyTaskStatusSnapshot, WeeklyReport } from "@/types/dashboard";

export const summaryApi = {
    getTodaySummary: () => apiFetch<DashboardStats>("/api/summary/today"),
    getWeeklyReport: () => apiFetch<WeeklyReport>("/api/summary/weekly-report"),
    updateSummary: (data: { focus?: string; mood?: Mood; notes?: string; date?: string }) =>
        apiFetch<DailySummary>("/api/summary", { method: "PATCH", body: data }),
    getSummaryByRange: (startDate: string, endDate: string) =>
        apiFetch<DailySummary[]>(`/api/summary/range?start=${startDate}&end=${endDate}`),
    getSummaryDetails: (id: string) =>
        apiFetch<DailyTaskStatusSnapshot[]>(`/api/summary/${id}/details`),
};
