import React from "react";
import { WeeklyReport } from "../types/dashboard";
import { GlassCard } from "@/components/ui/GlassCard";

interface WeeklyProgressChartProps {
    report: WeeklyReport | null;
}

const formatDay = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
};

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ report }) => {
    if (!report) {
        return (
            <GlassCard className="p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Weekly Progress</h3>
                <p className="text-sm text-zinc-500">No report data available yet.</p>
            </GlassCard>
        );
    }

    const maxConsistency = Math.max(...report.chart.map((d) => d.consistency), 100);

    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Progress</h3>
                    <p className="text-xs text-zinc-500">{report.range.start} to {report.range.end}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Consistency</p>
                    <p className="text-lg font-black text-cyan-400">{report.summary.avgConsistency}%</p>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 items-end h-44">
                {report.chart.map((day) => {
                    const height = Math.max((day.consistency / maxConsistency) * 100, 6);

                    return (
                        <div key={day.date} className="flex flex-col items-center gap-2">
                            <div className="relative w-full h-32 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                <div
                                    className={`absolute bottom-0 left-0 right-0 rounded-b-lg transition-all ${day.missedDay ? "bg-linear-to-t from-red-500/80 to-red-400/50" : "bg-linear-to-t from-cyan-500/80 to-blue-400/60"}`}
                                    style={{ height: `${height}%` }}
                                    title={`${day.consistency.toFixed(1)}% consistency`}
                                />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{formatDay(day.date)}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p className="text-zinc-500">Total Points</p>
                    <p className="text-white font-bold">{report.summary.totalPoints}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p className="text-zinc-500">Missed Days</p>
                    <p className="text-red-300 font-bold">{report.summary.missedDays}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p className="text-zinc-500">Current Streak</p>
                    <p className="text-orange-300 font-bold">🔥 {report.summary.currentStreak}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p className="text-zinc-500">Best This Week</p>
                    <p className="text-cyan-300 font-bold">{report.summary.maxStreakInWeek}</p>
                </div>
            </div>
        </GlassCard>
    );
};
