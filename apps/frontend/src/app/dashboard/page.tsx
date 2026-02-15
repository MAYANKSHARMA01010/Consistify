"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { StatsCard } from "./components/StatsCard";
import { DailyStatus } from "./components/DailyStatus";
import { TaskList } from "./components/TaskList";
import { HistoryRail } from "./components/HistoryRail";

import { useDashboardData } from "./hooks/useDashboardData";
import { GlassCard } from "@/components/ui/GlassCard";

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
        dailyStatus,
        isLoading: dataLoading,
        addTask,
        updateTask,
        deleteTask,
        updateDailyStatus,
        history,
        refetch,
        selectedDate,
        selectedDaySummary
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-zinc-500 text-sm animate-pulse">Loading consistency data...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen py-24 px-6">
            <main className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            Hello, {user?.name?.split(' ')[0] || "User"}
                        </h1>
                        <p className="text-zinc-400 mt-2 italic font-light">
                            "{quote}"
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Today's Date</p>
                        <p className="text-xl font-mono text-cyan-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard
                        title="Completed Today"
                        value={stats.completedToday}
                        trend="up"
                        icon={<span className="text-green-400 text-xl">✓</span>}
                    />
                    <StatsCard
                        title="Pending"
                        value={stats.pendingTasks}
                        trend={stats.pendingTasks > 5 ? "down" : "neutral"}
                        icon={<span className="text-yellow-400 text-xl">⏳</span>}
                    />
                    <StatsCard
                        title="Current Streak"
                        value={`${stats.streak}`}
                        description={`Overall Best: ${stats.maxStreak || 0} Days`}
                        icon={<span className="text-orange-400 text-xl">🔥</span>}
                    />
                    <StatsCard
                        title="Points (Last 7 Days)"
                        value={stats.pointsLastWeek}
                        trend="up"
                        icon={<span className="text-amber-400 text-xl">⭐</span>}
                    />
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div className="lg:col-span-1 flex flex-col h-full">
                        {selectedDaySummary || stats.focus || stats.mood ? (
                            <DailyStatus
                                date={selectedDaySummary?.date || selectedDate}
                                focus={selectedDaySummary?.focus || stats.focus || ""}
                                mood={selectedDaySummary?.mood || stats.mood || "NORMAL"}
                                note={selectedDaySummary?.notes || stats.notes || ""}
                                onUpdate={updateDailyStatus}
                            />
                        ) : (
                            <GlassCard className="p-8 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                                <span className="text-5xl mb-6 opacity-30 grayscale">📝</span>
                                <h3 className="text-xl font-bold text-white mb-2">No Focus Set</h3>
                                <p className="text-zinc-500 text-sm mb-6 max-w-[200px]">Define your main goal and energy level for today to start tracking.</p>
                                <button
                                    onClick={() => updateDailyStatus({ focus: "Today's Main Goal", mood: "NORMAL" })}
                                    className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest text-xs border-b border-cyan-500/30 hover:border-cyan-400 transition-all"
                                >
                                    Set Default Focus
                                </button>
                            </GlassCard>
                        )}
                    </div>

                    <div className="lg:col-span-2 flex flex-col h-full">
                        <TaskList
                            tasks={tasks}
                            onAddTask={addTask}
                            onUpdateTask={updateTask}
                            onDeleteTask={deleteTask}
                            onRefresh={refetch}
                        />
                    </div>
                </section>

                <section>
                    <HistoryRail history={history} />
                </section>

            </main>
        </div>
    );
}
