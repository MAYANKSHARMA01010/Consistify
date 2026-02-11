import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { DashboardStats, Task, DailyStatusData, Mood, DailySummary } from "../types/dashboard";
import { summaryApi, tasksApi, dailyStatusApi } from "../../../utils/api";
import { Priority } from "../types/dashboard";

export const useDashboardData = (isLoggedIn: boolean) => {
    const [stats, setStats] = useState<DashboardStats>({
        completedToday: 0,
        streak: 0,
        maxStreak: 0,
        pendingTasks: 0,
        pointsToday: 0,
        pointsLastWeek: 0,
        consistency: 0,
        focus: null,
        mood: null
    });

    const [dailyStatus, setDailyStatus] = useState<DailyStatusData | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [history, setHistory] = useState<DailySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedDaySummary, setSelectedDaySummary] = useState<DailySummary | null>(null);

    const fetchDashboardData = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            setIsLoading(true);

            const today = new Date().toISOString().split('T')[0];
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const startDate = sevenDaysAgo.toISOString().split('T')[0];

            const [statsData, tasksData, statusData, historyData] = await Promise.all([
                summaryApi.getTodaySummary(),
                tasksApi.getTasks(),
                dailyStatusApi.getDailyStatus().catch(() => null),
                summaryApi.getSummaryByRange(startDate, today).catch(() => [])
            ]);

            setStats(statsData);
            setTasks(tasksData);
            setDailyStatus(statusData);

            // Fill in missing dates for the last 7 days
            const filledHistory: DailySummary[] = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const existing = historyData.find((h: DailySummary) => h.date.startsWith(dateStr));
                if (existing) {
                    filledHistory.push(existing);
                } else {
                    filledHistory.push({
                        id: `empty-${dateStr}`,
                        date: dateStr,
                        completedTasks: 0,
                        totalTasks: 0,
                        points: 0,
                        cumulativePoints: 0,
                        consistency: 0,
                        focus: null,
                        mood: null,
                        notes: null,
                        currentStreak: 0,
                        maxStreak: 0,
                    } as DailySummary);
                }
            }
            setHistory(filledHistory);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const addTask = async (title: string, priority: Priority = "MEDIUM") => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await tasksApi.createTask({
                title,
                priority,
                startDate: today
            });
            toast.success("Task created!");

            const updatedTasks = await tasksApi.getTasks();
            setTasks(updatedTasks);

            summaryApi.getTodaySummary().then(setStats);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create task");
        }
    };

    const updateTask = async (id: string, data: Partial<Task>) => {
        try {
            await tasksApi.updateTask(id, data);
            toast.success("Task updated!");

            // Refresh tasks
            const updatedTasks = await tasksApi.getTasks();
            setTasks(updatedTasks);

            // Refresh stats because completing/uncompleting might affect them
            summaryApi.getTodaySummary().then(setStats);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update task");
        }
    };

    const deleteTask = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            await tasksApi.deleteTask(id);
            toast.success("Task deleted");

            // Refresh tasks
            const updatedTasks = await tasksApi.getTasks();
            setTasks(updatedTasks);

            // Refresh stats
            summaryApi.getTodaySummary().then(setStats);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete task");
        }
    };

    const isToday = (date: string) => {
        const today = new Date().toISOString().split('T')[0];
        return date === today;
    };

    useEffect(() => {
        if (isToday(selectedDate)) {
            // If today, use the stats/dailyStatus we already fetch
            const summary: DailySummary = {
                id: 'today',
                date: selectedDate,
                completedTasks: stats.completedToday,
                totalTasks: stats.totalTasks || 0,
                points: stats.pointsToday,
                cumulativePoints: 0,
                consistency: stats.consistency,
                focus: stats.focus,
                mood: stats.mood,
                notes: stats.notes,
                tasks: [], // Added tasks property matching DailySummary interface
            };
            setSelectedDaySummary(summary);
        } else {
            // Check history first
            const inHistory = history.find(h => h.date.split('T')[0] === selectedDate);
            if (inHistory) {
                setSelectedDaySummary(inHistory);
            } else {
                // Fetch if not in history (optional, or just show empty)
                // For now, let's try to fetch it specifically or just set empty
                summaryApi.getSummaryByRange(selectedDate, selectedDate)
                    .then(res => {
                        if (res && res.length > 0) {
                            setSelectedDaySummary(res[0]);
                        } else {
                            setSelectedDaySummary({
                                id: 'temp',
                                date: selectedDate,
                                completedTasks: 0,
                                totalTasks: 0,
                                points: 0,
                                cumulativePoints: 0,
                                consistency: 0,
                                focus: null,
                                mood: null,
                                notes: null,
                            });
                        }
                    })
                    .catch(() => setSelectedDaySummary(null));
            }
        }
    }, [selectedDate, stats, history]);


    const updateSummary = async (data: { focus?: string; mood?: Mood; notes?: string }) => {
        try {
            const updated = await summaryApi.updateSummary({ ...data, date: selectedDate });
            toast.success("Status updated!");

            // If we updated today, refresh dashboard
            if (isToday(selectedDate)) {
                await fetchDashboardData();
            } else {
                // If we updated a past date, update history locally or refetch
                // Refetching history is safer
                const today = new Date().toISOString().split('T')[0];
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const startDate = sevenDaysAgo.toISOString().split('T')[0];
                const historyData = await summaryApi.getSummaryByRange(startDate, today).catch(() => []);
                setHistory([...historyData].reverse());

                // Also update selectedDaySummary
                setSelectedDaySummary(updated);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const updateDailyStatus = async (data: { focus?: string; mood?: Mood; notes?: string }) => {
        try {
            await summaryApi.updateSummary(data);
            toast.success("Status updated!");
            await fetchDashboardData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    return {
        stats,
        dailyStatus,
        tasks,
        history,
        isLoading,
        refetch: fetchDashboardData,
        addTask,
        updateTask,
        deleteTask,
        updateDailyStatus: updateSummary,
        selectedDate,
        setSelectedDate,
        selectedDaySummary
    };
};
