export type Mood = "LOW" | "NORMAL" | "HIGH";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface DashboardStats {
    completedToday: number;
    streak: number;
    pendingTasks: number;
    pointsToday: number;
    pointsLastWeek: number;
    consistency: number;
    focus: string | null;
    mood: Mood | null;
    notes?: string | null;
    totalTasks?: number;
}

export interface Task {
    id: string;
    title: string;
    isActive: boolean;
    completed: boolean;
    priority: Priority;
    startDate: string;
    endDate?: string | null;
    taskTitle?: string | null;
    taskPriority?: Priority | null;
}

export interface DailyStatusData {
    date: string;
    focus: string;
    mood?: Mood;
    note?: string;
}

export interface ChartDataPoint {
    date: string;
    value: number;
}

export interface DailyTaskStatusSnapshot {
    id: string;
    taskId: string;
    title: string;
    priority: Priority;
    isCompleted: boolean;
}

export interface DailySummary {
    id: string;
    date: string;
    completedTasks: number;
    totalTasks: number;
    points: number;
    cumulativePoints: number;
    consistency: number;
    focus?: string | null;
    mood?: Mood | null;
    notes?: string | null;
    tasks?: DailyTaskStatusSnapshot[];
}

export interface WeeklySummaryData {
    bestDay: { date: string; completed: number };
    worstDay: { date: string; completed: number };
    avgCompletion: number;
    totalPoints: number;
}
