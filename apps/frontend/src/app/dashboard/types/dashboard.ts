export type Mood = "LOW" | "NORMAL" | "HIGH";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface DashboardStats {
    completedToday: number;
    streak: number;
    pendingTasks: number;
    pointsToday: number;
    consistency: number;
    focus: string | null;
    mood: Mood | null;
}

export interface Task {
    id: string;
    title: string;
    isActive: boolean;
    completed: boolean;
    priority: Priority;
    startDate: string;
    endDate?: string | null;
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

export interface DailySummary {
    id: string;
    date: string;
    completedTasks: number;
    totalTasks: number;
    points: number;
    consistency: number;
    focus?: string | null;
    mood?: Mood | null;
}

export interface WeeklySummaryData {
    bestDay: { date: string; completed: number };
    worstDay: { date: string; completed: number };
    avgCompletion: number;
    totalPoints: number;
}
