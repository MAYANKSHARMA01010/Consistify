"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";
import { summaryApi } from "../../utils/api";
import { DailySummary, DailyTaskStatusSnapshot } from "../dashboard/types/dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

function HistoryContent() {
    const { user, isLoggedIn, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Date state
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [monthData, setMonthData] = useState<DailySummary[]>([]);
    const [selectedDayDetails, setSelectedDayDetails] = useState<DailySummary | null>(null);
    const [dailyTasks, setDailyTasks] = useState<DailyTaskStatusSnapshot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    // Initialize from URL param if present
    useEffect(() => {
        const dateParam = searchParams.get("date");
        if (dateParam) {
            const date = new Date(dateParam);
            setSelectedDate(date);
            setCurrentMonth(date); // Jump to that month
        }
    }, [searchParams]);

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.push("/login");
        }
    }, [loading, isLoggedIn, router]);

    // Fetch data when month changes
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const start = startOfMonth(currentMonth).toISOString().split('T')[0];
                const end = endOfMonth(currentMonth).toISOString().split('T')[0];
                const data = await summaryApi.getSummaryByRange(start, end);
                setMonthData(data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoggedIn) {
            fetchData();
        }
    }, [currentMonth, isLoggedIn]);

    // Update details when selected date changes
    useEffect(() => {
        const fetchTasks = async (summaryId: string) => {
            setIsLoadingTasks(true);
            try {
                const tasks = await summaryApi.getSummaryDetails(summaryId);
                setDailyTasks(tasks);
            } catch (error) {
                console.error("Failed to fetch task details:", error);
                setDailyTasks([]);
            } finally {
                setIsLoadingTasks(false);
            }
        };

        if (selectedDate && monthData.length > 0) {
            const dayStr = format(selectedDate, 'yyyy-MM-dd');
            const data = monthData.find(d => d.date.startsWith(dayStr));
            setSelectedDayDetails(data || null);

            if (data?.id) {
                fetchTasks(data.id);
            } else {
                setDailyTasks([]);
            }
        } else {
            setSelectedDayDetails(null);
            setDailyTasks([]);
        }
    }, [selectedDate, monthData]);

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const MOODS_CONFIG: Record<string, string> = {
        "LOW": "☕️",
        "NORMAL": "🙂",
        "HIGH": "⚡️",
        "FOCUSED": "🧠",
        "STRESSED": "🤯",
        "RELAXED": "😎",
        "GRATEFUL": "🙏",
        "TIRED": "😴"
    };

    const getMoodEmoji = (mood?: string | null) => {
        if (!mood) return null;
        if (MOODS_CONFIG[mood]) return MOODS_CONFIG[mood];
        if (mood.includes('|')) return mood.split('|')[0];
        return "🤔";
    };

    const getConsistencyColor = (percentage: number) => {
        if (percentage >= 80) return "bg-green-500";
        if (percentage >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    if (loading) return null;

    return (
        <div className="min-h-screen py-24 px-6 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                    Your Journey
                </h1>
                <p className="text-zinc-400">Track your consistency over time.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Section */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => setCurrentMonth(new Date())}
                                    className="px-3 py-1 text-xs font-bold bg-white/5 rounded-lg hover:bg-white/10 text-cyan-400 uppercase tracking-wider"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-xs font-bold text-zinc-500 uppercase py-2">
                                        {day}
                                    </div>
                                ))}

                                {/* Empty cells for start of month */}
                                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                ))}

                                {days.map((day) => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const dayData = monthData.find(d => d.date.startsWith(dateStr));
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <motion.button
                                            key={dateStr}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all",
                                                isSelected
                                                    ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                                    : "border-white/5 bg-black/20 hover:bg-white/5",
                                                isToday && !isSelected && "border-white/20"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-bold",
                                                isSelected ? "text-cyan-400" : isToday ? "text-white" : "text-zinc-500"
                                            )}>
                                                {format(day, 'd')}
                                            </span>

                                            {dayData && (
                                                <div className="mt-1 flex flex-col items-center gap-1">
                                                    {dayData.mood && <span className="text-[10px]">{getMoodEmoji(dayData.mood)}</span>}
                                                    <div className="w-8 h-1 bg-black/50 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full", getConsistencyColor(dayData.consistency))}
                                                            style={{ width: `${dayData.consistency}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedDate ? (
                            <motion.div
                                key={selectedDate.toISOString()}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <GlassCard className="h-full p-6 flex flex-col">
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {format(selectedDate, 'EEEE')}
                                    </h3>
                                    <p className="text-zinc-500 mb-6 font-mono text-sm">
                                        {format(selectedDate, 'MMM d, yyyy')}
                                    </p>

                                    {selectedDayDetails ? (
                                        <div className="space-y-6 flex-1">
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Focus</span>
                                                <p className="text-white font-medium text-lg">
                                                    {selectedDayDetails.focus || "No focus set"}
                                                </p>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Mood</span>
                                                    <span className="text-3xl">{getMoodEmoji(selectedDayDetails.mood) || "—"}</span>
                                                </div>
                                                <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Score</span>
                                                    <span className="text-3xl font-bold text-cyan-400">
                                                        {selectedDayDetails.consistency !== undefined
                                                            ? Number(selectedDayDetails.consistency).toFixed(2)
                                                            : "0.00"}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Notes</span>
                                                <p className="text-sm text-zinc-300 whitespace-pre-wrap italic">
                                                    {selectedDayDetails.notes || "No notes for this day."}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                                            <span className="text-4xl mb-4">🌑</span>
                                            <p className="text-zinc-500">No data recorded for this day.</p>
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-8 text-center opacity-50 border border-white/5 rounded-3xl border-dashed">
                                <div>
                                    <span className="text-4xl mb-4 block">📅</span>
                                    <p className="text-zinc-500">Select a date to view details</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Task Details Section */}
            {selectedDate && selectedDayDetails && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-cyan-400">Tasks</span> on {format(selectedDate, 'MMMM do')}
                        </h3>

                        {isLoadingTasks ? (
                            <div className="py-12 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : dailyTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Completed Tasks */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-green-400 uppercase tracking-widest border-b border-green-500/20 pb-2 mb-4">
                                        Completed ({dailyTasks.filter(t => t.isCompleted).length})
                                    </h4>
                                    <div className="space-y-2">
                                        {dailyTasks.filter(t => t.isCompleted).map(task => (
                                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                                    <span className="text-green-400 text-xs">✓</span>
                                                </div>
                                                <span className="text-zinc-300 font-medium line-through decoration-zinc-500">{task.title}</span>
                                            </div>
                                        ))}
                                        {dailyTasks.filter(t => t.isCompleted).length === 0 && (
                                            <p className="text-zinc-600 italic text-sm">No tasks completed.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Incomplete Tasks */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest border-b border-red-500/20 pb-2 mb-4">
                                        Incomplete ({dailyTasks.filter(t => !t.isCompleted).length})
                                    </h4>
                                    <div className="space-y-2">
                                        {dailyTasks.filter(t => !t.isCompleted).map(task => (
                                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                                                    <span className="text-red-400 text-xs">✕</span>
                                                </div>
                                                <span className="text-zinc-300 font-medium">{task.title}</span>
                                            </div>
                                        ))}
                                        {dailyTasks.filter(t => !t.isCompleted).length === 0 && (
                                            <p className="text-zinc-600 italic text-sm">No incomplete tasks.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-zinc-500">
                                <p>No tasks found for this day.</p>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            )}
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-cyan-400">Loading History...</div>}>
            <HistoryContent />
        </Suspense>
    );
}
