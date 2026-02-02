import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { DashboardStats, Task, DailyStatusData } from "../types/dashboard";
import { summaryApi, tasksApi, dailyStatusApi } from "../../../utils/api";

export const useDashboardData = (isLoggedIn: boolean) => {
    const [stats, setStats] = useState<DashboardStats>({
        completedToday: 0,
        streak: 0,
        pendingTasks: 0
    });

    const [dailyStatus, setDailyStatus] = useState<DailyStatusData | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            setIsLoading(true);

            const [statsData, tasksData, statusData] = await Promise.all([
                summaryApi.getTodaySummary(),
                tasksApi.getTasks(),
                dailyStatusApi.getDailyStatus().catch(() => null)
            ]);

            setStats(statsData);
            setTasks(tasksData);
            setDailyStatus(statusData);
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

    const addTask = async (title: string) => {
        try {
            await tasksApi.createTask({ title, completed: false });
            toast.success("Task created!");

            const updatedTasks = await tasksApi.getTasks();
            setTasks(updatedTasks);

            summaryApi.getTodaySummary().then(setStats);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create task");
        }
    };

    return {
        stats,
        dailyStatus,
        tasks,
        isLoading,
        refetch: fetchDashboardData,
        addTask
    };
};
