import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { DashboardStats, Task, DailyStatusData, Mood, DailySummary, WeeklyReport } from "../types/dashboard";
import { summaryApi, tasksApi, dailyStatusApi } from "../../../utils/api";
import { Priority } from "../types/dashboard";
import { trackEvent } from "@/components/analytics/GoogleAnalytics";

const DASHBOARD_QUERY_KEY = ["dashboard-data"];
const EMPTY_HISTORY: DailySummary[] = [];

const EMPTY_STATS: DashboardStats = {
    completedToday: 0,
    streak: 0,
    maxStreak: 0,
    pendingTasks: 0,
    pointsToday: 0,
    pointsLastWeek: 0,
    consistency: 0,
    focus: null,
    mood: null,
};

const buildFilledHistory = (historyData: DailySummary[]) => {
    const filledHistory: DailySummary[] = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        const existing = historyData.find((h) => h.date.startsWith(dateStr));
        if (existing) {
            filledHistory.push(existing);
            continue;
        }

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

    return filledHistory;
};

export const useDashboardData = (isLoggedIn: boolean) => {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const lastTrackedStreakRef = useRef<number>(0);

    const dashboardQuery = useQuery({
        queryKey: DASHBOARD_QUERY_KEY,
        enabled: isLoggedIn,
        queryFn: async () => {
            const today = new Date().toISOString().split("T")[0];
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const startDate = sevenDaysAgo.toISOString().split("T")[0];

            const [statsData, tasksData, statusData, historyData, weeklyReportData] = await Promise.all([
                summaryApi.getTodaySummary(),
                tasksApi.getTasks(),
                dailyStatusApi.getDailyStatus().catch(() => null),
                summaryApi.getSummaryByRange(startDate, today).catch(() => []),
                summaryApi.getWeeklyReport().catch(() => null),
            ]);

            return {
                stats: statsData,
                tasks: tasksData,
                dailyStatus: statusData,
                history: buildFilledHistory(historyData),
                weeklyReport: weeklyReportData as WeeklyReport | null,
            };
        },
    });

    const stats = dashboardQuery.data?.stats || EMPTY_STATS;
    const tasks = dashboardQuery.data?.tasks || [];
    const dailyStatus = (dashboardQuery.data?.dailyStatus || null) as DailyStatusData | null;
    const history = dashboardQuery.data?.history || EMPTY_HISTORY;
    const weeklyReport = dashboardQuery.data?.weeklyReport || null;

    const isToday = (date: string) => {
        const today = new Date().toISOString().split("T")[0];
        return date === today;
    };

    const selectedFromHistory = useMemo(
        () => history.find((h) => h.date.split("T")[0] === selectedDate) || null,
        [history, selectedDate]
    );

    const selectedDateQuery = useQuery({
        queryKey: ["summary-selected-date", selectedDate],
        enabled: isLoggedIn && !isToday(selectedDate) && !selectedFromHistory,
        queryFn: async () => {
            const res = await summaryApi.getSummaryByRange(selectedDate, selectedDate);
            return res[0] || null;
        },
    });

    const selectedDaySummary = useMemo(() => {
        if (isToday(selectedDate)) {
            return {
                id: "today",
                date: selectedDate,
                completedTasks: stats.completedToday,
                totalTasks: stats.totalTasks || 0,
                points: stats.pointsToday,
                cumulativePoints: 0,
                consistency: stats.consistency,
                focus: stats.focus,
                mood: stats.mood,
                notes: stats.notes,
                tasks: [],
            } as DailySummary;
        }

        if (selectedFromHistory) {
            return selectedFromHistory;
        }

        if (selectedDateQuery.data) {
            return selectedDateQuery.data;
        }

        return {
            id: "temp",
            date: selectedDate,
            completedTasks: 0,
            totalTasks: 0,
            points: 0,
            cumulativePoints: 0,
            consistency: 0,
            focus: null,
            mood: null,
            notes: null,
        } as DailySummary;
    }, [selectedDate, stats, selectedFromHistory, selectedDateQuery.data]);

    useEffect(() => {
        if (stats.streak > 0 && stats.streak !== lastTrackedStreakRef.current) {
            trackEvent("daily_streak", {
                streak_count: stats.streak,
                max_streak: stats.maxStreak,
            });
            lastTrackedStreakRef.current = stats.streak;
        }
    }, [stats.streak, stats.maxStreak]);

    const refetchDashboard = async () => {
        await queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    };

    const addTaskMutation = useMutation({
        mutationFn: async ({ title, priority }: { title: string; priority: Priority }) => {
            const today = new Date().toISOString().split("T")[0];
            await tasksApi.createTask({ title, priority, startDate: today });
            trackEvent("task_created", { task_name: title, priority });
        },
        onSuccess: async () => {
            toast.success("Task created!");
            await refetchDashboard();
        },
        onError: () => {
            toast.error("Failed to create task");
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => tasksApi.updateTask(id, data),
        onSuccess: async () => {
            toast.success("Task updated!");
            await refetchDashboard();
        },
        onError: () => {
            toast.error("Failed to update task");
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => tasksApi.deleteTask(id),
        onSuccess: async () => {
            toast.success("Task deleted");
            await refetchDashboard();
        },
        onError: () => {
            toast.error("Failed to delete task");
        },
    });

    const toggleTaskMutation = useMutation({
        mutationFn: async ({ taskId, currentStatus }: { taskId: string; currentStatus: boolean }) => {
            const today = new Date().toISOString().split("T")[0];
            await dailyStatusApi.updateDailyStatus({
                taskId,
                date: today,
                isCompleted: !currentStatus,
            });
        },
        onSuccess: async (_, variables) => {
            if (!variables.currentStatus) {
                const task = tasks.find((item) => item.id === variables.taskId);
                trackEvent("task_completed", {
                    task_name: task?.taskTitle || task?.title || "Unknown Task",
                });
            }
            toast.success(variables.currentStatus ? "Task unmarked" : "Task completed! 🎉");
            await refetchDashboard();
        },
        onError: () => {
            toast.error("Failed to update task");
        },
    });

    const updateSummaryMutation = useMutation({
        mutationFn: (data: { focus?: string; mood?: Mood; notes?: string; date?: string }) => summaryApi.updateSummary(data),
        onSuccess: async () => {
            toast.success("Status updated!");
            await refetchDashboard();
        },
        onError: () => {
            toast.error("Failed to update status");
        },
    });

    const addTask = async (title: string, priority: Priority = "MEDIUM") => {
        await addTaskMutation.mutateAsync({ title, priority });
    };

    const updateTask = async (id: string, data: Partial<Task>) => {
        await updateTaskMutation.mutateAsync({ id, data });
    };

    const deleteTask = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }
        await deleteTaskMutation.mutateAsync(id);
    };

    const toggleTask = async (taskId: string, currentStatus: boolean) => {
        await toggleTaskMutation.mutateAsync({ taskId, currentStatus });
    };

    const updateDailyStatus = async (data: { focus?: string; mood?: Mood; notes?: string }) => {
        await updateSummaryMutation.mutateAsync({ ...data, date: selectedDate });
    };

    return {
        stats,
        dailyStatus,
        tasks,
        history,
        isLoading: dashboardQuery.isLoading,
        refetch: refetchDashboard,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        updateDailyStatus,
        selectedDate,
        setSelectedDate,
        selectedDaySummary,
        weeklyReport,
    };
};
