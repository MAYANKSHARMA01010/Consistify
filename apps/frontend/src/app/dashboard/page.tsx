"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { StatsCard } from "./components/StatsCard";
import { DailyStatus } from "./components/DailyStatus";
import { TaskList } from "./components/TaskList";

import { useDashboardData } from "./hooks/useDashboardData";

const motivationalQuotes = [
    "Small steps every day lead to big results.",
    "Consistency beats intensity. Keep going!",
    "You're building something great, one task at a time.",
    "Progress, not perfection.",
    "Every completed task is a win.",
];

export default function DashboardPage() {
    const { user, loading, isLoggedIn, logout } = useAuth();
    const router = useRouter();

    const {
        stats,
        tasks,
        dailyStatus,
        isLoading: dataLoading,
        addTask,
        updateDailyStatus,
        refetch
    } = useDashboardData(!!isLoggedIn);

    const quote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.push("/login");
            toast.error("Please login to continue");
        }
    }, [loading, isLoggedIn, router]);

    if (loading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Consistify</h2>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="p-6">
                <div className="max-w-6xl mx-auto space-y-8">

                    <header>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Hello, {user?.name?.split(' ')[0] || "User"} 👋
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 italic">
                            "{quote}"
                        </p>
                    </header>

                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatsCard
                            title="Completed Today"
                            value={stats.completedToday}
                            trend="up"
                            icon={<span className="text-green-500">✓</span>}
                        />
                        <StatsCard
                            title="Pending"
                            value={stats.pendingTasks}
                            trend={stats.pendingTasks > 5 ? "down" : "neutral"}
                            icon={<span className="text-yellow-500">⏳</span>}
                        />
                        <StatsCard
                            title="Streak"
                            value={`${stats.streak} Days`}
                            trend="neutral"
                            icon={<span className="text-orange-500">🔥</span>}
                        />
                        <StatsCard
                            title="Points Today"
                            value={stats.pointsToday}
                            trend="up"
                            icon={<span className="text-amber-500">⭐</span>}
                        />
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            {stats.focus || stats.mood ? (
                                <DailyStatus
                                    date={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    focus={stats.focus || ""}
                                    mood={stats.mood || "NORMAL"}
                                    onUpdate={updateDailyStatus}
                                />
                            ) : (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center text-center min-h-[200px]">
                                    <span className="text-4xl mb-4">📝</span>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Focus Set</h3>
                                    <p className="text-gray-500 text-sm mt-2 mb-4">Define your focus for today</p>
                                    <button
                                        onClick={() => updateDailyStatus({ focus: "Today's Main Goal", mood: "NORMAL" })}
                                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-sm"
                                    >
                                        Set Default Focus & Energy
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2">
                            <TaskList tasks={tasks} onAddTask={addTask} onRefresh={refetch} />
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
