import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { DashboardStats, Task, DailyStatusData, Mood, DailySummary } from "../types/dashboard";
import { summaryApi, tasksApi, dailyStatusApi } from "../../../utils/api";
import { Priority } from "../types/dashboard";

export const useDashboardData = (isLoggedIn: boolean) => {
    const [stats, setStats] = useState<DashboardStats>({
        completedToday: 0,
        streak: 0,
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
            setHistory([...historyData].reverse());
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

    const updateDailyStatus = async (data: { focus?: string; mood?: Mood; notes?: string }) => {
        try {
            await summaryApi.updateTodaySummary(data);
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
        updateDailyStatus
    };
};
