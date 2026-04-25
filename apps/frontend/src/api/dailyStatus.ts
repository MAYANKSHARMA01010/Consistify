import { apiFetch } from "./client";
import { DailyStatusData } from "@/types/dashboard";

export const dailyStatusApi = {
    getDailyStatus: () => apiFetch<DailyStatusData>("/api/daily-status"),
    updateDailyStatus: (data: { taskId: string; date: string; isCompleted: boolean }) =>
        apiFetch<{ id: string; isCompleted: boolean }>("/api/daily-status", { method: "POST", body: data }),
};
