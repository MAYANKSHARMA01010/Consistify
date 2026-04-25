"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const StatsCard = dynamic(() => import("./components/StatsCard").then((module) => module.StatsCard));
const DailyStatus = dynamic(() => import("./components/DailyStatus").then((module) => module.DailyStatus));
const TaskList = dynamic(() => import("./components/TaskList").then((module) => module.TaskList));
const HistoryRail = dynamic(() => import("./components/HistoryRail").then((module) => module.HistoryRail));
const WeeklyProgressChart = dynamic(() => import("./components/WeeklyProgressChart").then((module) => module.WeeklyProgressChart));
const StreakBadge = dynamic(() => import("./components/StreakBadge").then((module) => module.StreakBadge));

import { SplashScreen } from "@/components/ui/SplashScreen";
import { useDashboardData } from "@/hooks/useDashboardData";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "boneyard-js/react";

const motivationalQuotes = [
    "Small steps every day lead to big results.",
    "Consistency beats intensity. Keep going!",
    "You're building something great, one task at a time.",
    "Progress, not perfection.",
    "Every completed task is a win.",
];

export default function DashboardPage() {
    const { user, loading, isLoggedIn } = useAuth();
    const router = useRouter();

    const {
        stats,
        tasks,
        isLoading,
        isTasksLoading,
        isWeeklyLoading,
        isHistoryLoading,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        updateDailyStatus,
        history,
        selectedDate,
        selectedDaySummary,
        weeklyReport,
    } = useDashboardData(!!isLoggedIn);

    const quote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.push("/login");
            toast.error("Please login to continue");
        }
    }, [loading, isLoggedIn, router]);

    if (loading) {
        return <SplashScreen message="Loading session..." />;
    }

    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen py-24 px-6">
            <main className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-cyan-100 to-purple-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            Hello, {user?.name?.split(' ')[0] || "User"}
                        </h1>
                        <p className="text-zinc-400 mt-2 italic font-light">
                            &quot;{quote}&quot;
                        </p>
                        <div className="mt-4">
                            <Skeleton 
                                name="streak-badge" 
                                loading={isLoading || isWeeklyLoading}
                                fixture={<div className="h-12 w-48 bg-zinc-800 rounded-lg animate-pulse" />}
                            >
                                <StreakBadge
                                    streak={stats.streak}
                                    maxStreak={stats.maxStreak}
                                    missedDays={weeklyReport?.summary.missedDays || 0}
                                />
                            </Skeleton>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Today&apos;s Date</p>
                        <p className="text-xl font-mono text-cyan-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton 
                        name="stats-completed" 
                        loading={isLoading}
                        fixture={<div className="h-24 w-full bg-zinc-800 rounded-xl animate-pulse" />}
                    >
                        <StatsCard
                            title="Completed Today"
                            value={stats.completedToday}
                            trend="up"
                            icon={<span className="text-green-400 text-xl">✓</span>}
                        />
                    </Skeleton>
                    <Skeleton 
                        name="stats-pending" 
                        loading={isLoading}
                        fixture={<div className="h-24 w-full bg-zinc-800 rounded-xl animate-pulse" />}
                    >
                        <StatsCard
                            title="Pending"
                            value={stats.pendingTasks}
                            trend={stats.pendingTasks > 5 ? "down" : "neutral"}
                            icon={<span className="text-yellow-400 text-xl">⏳</span>}
                        />
                    </Skeleton>
                    <Skeleton 
                        name="stats-streak" 
                        loading={isLoading}
                        fixture={<div className="h-24 w-full bg-zinc-800 rounded-xl animate-pulse" />}
                    >
                        <StatsCard
                            title="Current Streak"
                            value={`${stats.streak}`}
                            description={`Overall Best: ${stats.maxStreak || 0} Days`}
                            icon={<span className="text-orange-400 text-xl">🔥</span>}
                        />
                    </Skeleton>
                    <Skeleton 
                        name="stats-points" 
                        loading={isLoading}
                        fixture={<div className="h-24 w-full bg-zinc-800 rounded-xl animate-pulse" />}
                    >
                        <StatsCard
                            title="Points (Last 7 Days)"
                            value={stats.pointsLastWeek}
                            trend="up"
                            icon={<span className="text-amber-400 text-xl">⭐</span>}
                        />
                    </Skeleton>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div className="lg:col-span-1 flex flex-col h-full">
                        <Skeleton 
                            name="daily-status" 
                            loading={isLoading} 
                            className="h-full"
                            fixture={<div className="h-80 w-full bg-zinc-800 rounded-2xl animate-pulse" />}
                        >
                            {selectedDaySummary || stats.focus || stats.mood ? (
                                <DailyStatus
                                    date={selectedDaySummary?.date || selectedDate}
                                    focus={selectedDaySummary?.focus || stats.focus || ""}
                                    mood={selectedDaySummary?.mood || stats.mood || "NORMAL"}
                                    note={selectedDaySummary?.notes || stats.notes || ""}
                                    onUpdate={updateDailyStatus}
                                />
                            ) : (
                                <GlassCard className="p-8 h-full flex flex-col items-center justify-center text-center min-h-75">
                                    <span className="text-5xl mb-6 opacity-30 grayscale">📝</span>
                                    <h3 className="text-xl font-bold text-white mb-2">No Focus Set</h3>
                                    <p className="text-zinc-500 text-sm mb-6 max-w-50">Define your main goal and energy level for today to start tracking.</p>
                                    <button
                                        onClick={() => updateDailyStatus({ focus: "Today&apos;s Main Goal", mood: "NORMAL" })}
                                        className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest text-xs border-b border-cyan-500/30 hover:border-cyan-400 transition-all"
                                    >
                                        Set Default Focus
                                    </button>
                                </GlassCard>
                            )}
                        </Skeleton>
                    </div>

                    <div className="lg:col-span-2 flex flex-col h-full">
                        <Skeleton 
                            name="task-list" 
                            loading={isTasksLoading} 
                            className="h-full"
                            fixture={<div className="h-80 w-full bg-zinc-800 rounded-2xl animate-pulse" />}
                        >
                            <TaskList
                                tasks={tasks}
                                onAddTask={addTask}
                                onUpdateTask={updateTask}
                                onDeleteTask={deleteTask}
                                onToggleTask={toggleTask}
                            />
                        </Skeleton>
                    </div>
                </section>

                <section>
                    <Skeleton 
                        name="history-rail" 
                        loading={isHistoryLoading}
                        fixture={<div className="h-32 w-full bg-zinc-800 rounded-xl animate-pulse" />}
                    >
                        <HistoryRail history={history} />
                    </Skeleton>
                </section>

                <section>
                    <Skeleton 
                        name="weekly-chart" 
                        loading={isWeeklyLoading}
                        fixture={<div className="h-64 w-full bg-zinc-800 rounded-2xl animate-pulse" />}
                    >
                        <WeeklyProgressChart report={weeklyReport} />
                    </Skeleton>
                </section>

            </main>
        </div>
    );
}
