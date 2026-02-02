"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { StatsCard } from "./components/StatsCard";
import { DailyStatus } from "./components/DailyStatus";
import { TaskList } from "./components/TaskList";

import { useDashboardData } from "./hooks/useDashboardData";

export default function DashboardPage() {
    const { user, loading, isLoggedIn } = useAuth();
    const router = useRouter();

    const {
        stats,
        tasks,
        dailyStatus,
        isLoading: dataLoading,
        addTask
    } = useDashboardData(!!isLoggedIn);

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.push("/login");
            toast.error("Please login to continue");
        }
    }, [loading, isLoggedIn, router]);

    if (loading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto space-y-8">

                <header>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Hello, {user?.name || "User"} 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Here's your progress for today. Keep the momentum going!
                    </p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Tasks Completed"
                        value={stats.completedToday}
                        trend="up"
                        description="Better than yesterday"
                    />
                    <StatsCard
                        title="Current Streak"
                        value={`${stats.streak} Days`}
                        trend="neutral"
                        icon={<span className="text-orange-500">🔥</span>}
                    />
                    <StatsCard
                        title="Pending Tasks"
                        value={stats.pendingTasks}
                        trend="down"
                        description="Clear them out!"
                    />
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                    <div className="lg:col-span-1 h-full">
                        <div className="h-full">
                            {dailyStatus ? (
                                <DailyStatus {...dailyStatus} />
                            ) : (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center text-center">
                                    <span className="text-4xl mb-4">📝</span>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Status Set</h3>
                                    <p className="text-gray-500 text-sm mt-2">Take a moment to define your focus for today.</p>
                                    <button className="mt-4 text-indigo-600 font-medium hover:underline">Set Status</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 h-full">
                        <TaskList tasks={tasks} onAddTask={addTask} />
                    </div>
                </section>

            </div>
        </div>
    );
}
