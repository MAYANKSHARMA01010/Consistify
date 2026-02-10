import axios from "axios";
import { Task, DailyStatusData, DashboardStats, Mood, DailySummary, DailyTaskStatusSnapshot } from "../app/dashboard/types/dashboard";

const isProd = process.env.NODE_ENV === "production";

const API_BASE = isProd
    ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
    : process.env.NEXT_PUBLIC_BACKEND_LOCAL_URL;

if (!API_BASE) {
    throw new Error("API base URL is not defined");
}

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !error.config.url?.includes("/refresh") && !error.config.url?.includes("/login")) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = api
                    .post("/api/auth/refresh")
                    .then(() => { })
                    .finally(() => {
                        isRefreshing = false;
                        refreshPromise = null;
                    });
            }

            try {
                if (refreshPromise) {
                    await refreshPromise;
                }
                return api(originalRequest);
            } catch {
                return Promise.reject(new Error("Session expired"));
            }
        }

        return Promise.reject(error);
    }
);

interface ApiRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
}

export const apiFetch = async <T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
    const { method = "GET", headers = {}, body } = options;

    const response = await api.request<T>({
        url: endpoint,
        method,
        headers: headers,
        data: body,
    });

    return response.data;
};

export const authApi = {
    register: (data: any) => apiFetch<any>("/api/auth/register", { method: "POST", body: data }),
    login: (data: any) => apiFetch<any>("/api/auth/login", { method: "POST", body: data }),
    logout: () => apiFetch<void>("/api/auth/logout", { method: "POST" }),
    getMe: () => apiFetch<any>("/api/auth/me"),
    refreshToken: () => apiFetch<void>("/api/auth/refresh", { method: "POST" }),
};

export const tasksApi = {
    getTasks: () => apiFetch<Task[]>("/api/tasks"),
    createTask: (data: Partial<Task>) => apiFetch<Task>("/api/tasks", { method: "POST", body: data }),
    updateTask: (id: string, data: Partial<Task>) => apiFetch<Task>(`/api/tasks/${id}`, { method: "PUT", body: data }),
    deleteTask: (id: string) => apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};

export const dailyStatusApi = {
    getDailyStatus: () => apiFetch<DailyStatusData>("/api/daily-status"),
    updateDailyStatus: (data: { taskId: string; date: string; isCompleted: boolean }) =>
        apiFetch<{ id: string; isCompleted: boolean }>("/api/daily-status", { method: "POST", body: data }),
};

export const summaryApi = {
    getTodaySummary: () => apiFetch<DashboardStats>("/api/summary/today"),
    updateTodaySummary: (data: { focus?: string; mood?: Mood }) =>
        apiFetch<DailySummary>("/api/summary/today", { method: "PATCH", body: data }),
    getSummaryByRange: (startDate: string, endDate: string) =>
        apiFetch<DailySummary[]>(`/api/summary/range?startDate=${startDate}&endDate=${endDate}`),
    getSummaryDetails: (id: string) =>
        apiFetch<DailyTaskStatusSnapshot[]>(`/api/summary/${id}/details`),
};

export const getErrorMessage = (error: any): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.response?.data?.error || error.message;
    }
    return error instanceof Error ? error.message : "Something went wrong";
};
