export interface DashboardStats {
    completedToday: number;
    streak: number;
    pendingTasks: number;
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
}

export interface DailyStatusData {
    date: string;
    focus: string;
    mood?: "low" | "normal" | "high";
    note?: string;
}
