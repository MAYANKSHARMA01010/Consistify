import { apiFetch } from "./client";
import { Task } from "@/types/dashboard";

export const tasksApi = {
    getTasks: () => apiFetch<Task[]>("/api/tasks"),
    createTask: (data: Partial<Task>) => apiFetch<Task>("/api/tasks", { method: "POST", body: data }),
    updateTask: (id: string, data: Partial<Task>) => apiFetch<Task>(`/api/tasks/${id}`, { method: "PUT", body: data }),
    deleteTask: (id: string) => apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};
