import React, { useState } from 'react';
import { DailySummary, Priority } from '../types/dashboard';
import { GlassCard } from '@/components/ui/GlassCard';

interface DailyHistoryProps {
    history: DailySummary[];
}

export const DailyHistory: React.FC<DailyHistoryProps> = ({ history }) => {
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
    const [localHistory, setLocalHistory] = useState<DailySummary[]>(history);

    React.useEffect(() => {
        setLocalHistory(history);
    }, [history]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getMoodEmoji = (mood?: string | null) => {
        switch (mood) {
            case "HIGH": return "🌟";
            case "NORMAL": return "😊";
            case "LOW": return "😔";
            default: return "—";
        }
    };

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case "HIGH": return "text-red-400 bg-red-500/10 border-red-500/20";
            case "MEDIUM": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            case "LOW": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
        }
    };

    const toggleExpand = async (id: string) => {
        if (expandedDay === id) {
            setExpandedDay(null);
            return;
        }

        setExpandedDay(id);

        const day = localHistory.find(d => d.id === id);
        if (day && !day.id.startsWith("empty-") && (!day.tasks || day.tasks.length === 0)) {
            try {
                const { summaryApi } = await import('../../../utils/api');
                setLoadingDetails(prev => ({ ...prev, [id]: true }));
                const tasks = await summaryApi.getSummaryDetails(id);
                setLocalHistory(prev => prev.map(d => d.id === id ? { ...d, tasks } : d));
            } catch (error) {
                console.error("Failed to fetch audit log details:", error);
            } finally {
                setLoadingDetails(prev => ({ ...prev, [id]: false }));
            }
        }
    };

    return (
        <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Recent History (Last 7 Days)</h3>
                <span className="text-[10px] text-zinc-500 font-mono">Tap row for details</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="text-zinc-500 border-b border-white/5 text-[10px] uppercase font-bold tracking-widest">
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Focus</th>
                            <th className="px-6 py-4 text-center">Mood</th>
                            <th className="px-6 py-4 text-center">Tasks</th>
                            <th className="px-6 py-4 text-center">Max Streak</th>
                            <th className="px-6 py-4 text-center">Total XP</th>
                            <th className="px-6 py-4 text-center">Current Streak</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {localHistory.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                    No history available yet. Keep grinding! 🚀
                                </td>
                            </tr>
                        ) : (
                            localHistory.map((day) => (
                                <React.Fragment key={day.id}>
                                    <tr
                                        onClick={() => toggleExpand(day.id)}
                                        className={`hover:bg-white/5 transition-colors cursor-pointer ${expandedDay === day.id ? "bg-white/5" : ""}`}
                                    >
                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] text-cyan-500 transition-transform ${expandedDay === day.id ? "rotate-90" : ""}`}>▶</span>
                                                {formatDate(day.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate">
                                            {day.focus || <span className="text-zinc-600 italic">No focus set</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center text-lg">
                                            {getMoodEmoji(day.mood)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="font-bold text-zinc-300 text-xs">
                                                    {day.completedTasks}/{day.totalTasks}
                                                </span>
                                                <div className="w-20 h-1 bg-black/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                                        style={{ width: `${day.consistency}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap font-medium text-zinc-400">
                                            {day.maxStreak || 0}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
                                                {day.cumulativePoints}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]">
                                            🔥 {day.currentStreak || 0}
                                        </td>
                                    </tr>
                                    {expandedDay === day.id && (
                                        <tr className="bg-black/20">
                                            <td colSpan={7} className="px-8 py-6">
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/5 pb-6">
                                                        <div>
                                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 mb-2">Daily Focus</h4>
                                                            <p className="text-sm text-zinc-300 font-medium">{day.focus || "No focus defined"}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 mb-2">Daily Notes</h4>
                                                            <p className="text-sm text-zinc-500 italic">
                                                                {day.notes || "No notes for this day."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Task Audit Log Snapshot</h4>
                                                            <span className="text-[10px] text-zinc-600 italic">Sourced from permanent audit records</span>
                                                        </div>
                                                        {loadingDetails[day.id] ? (
                                                            <div className="flex items-center gap-3 py-4">
                                                                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                                                <span className="text-xs text-zinc-500">Loading snapshots...</span>
                                                            </div>
                                                        ) : day.tasks && day.tasks.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                                                {day.tasks.map((task) => (
                                                                    <div key={task.id} className="flex items-center justify-between gap-4 group">
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold border transition-colors ${task.isCompleted
                                                                                ? "text-black bg-cyan-500 border-cyan-500"
                                                                                : "text-zinc-500 bg-transparent border-zinc-700"}`}>
                                                                                {task.isCompleted ? "✓" : "!"}
                                                                            </span>
                                                                            <span className={`text-sm truncate ${task.isCompleted ? "text-zinc-500 line-through decoration-zinc-600" : "text-zinc-300"}`}>
                                                                                {task.title}
                                                                            </span>
                                                                        </div>
                                                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                                                            {task.priority}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-zinc-600 italic">No task snapshots recorded for this day.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};
