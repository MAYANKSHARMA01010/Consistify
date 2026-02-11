import React, { useState } from 'react';
import { DailySummary, Priority } from '../types/dashboard';

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
            case "HIGH": return "text-red-500 bg-red-50 dark:bg-red-900/20";
            case "MEDIUM": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
            case "LOW": return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
            default: return "text-gray-500 bg-gray-50 dark:bg-gray-800/50";
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent History (Last 7 Days)</h3>
                <span className="text-xs text-gray-400">Click a row to see audit details</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Focus</th>
                            <th className="px-6 py-3 font-medium text-center">Mood</th>
                            <th className="px-6 py-3 font-medium text-center">Tasks</th>
                            <th className="px-6 py-3 font-medium text-center">Max Streak</th>
                            <th className="px-6 py-3 font-medium text-center">Total XP</th>
                            <th className="px-6 py-3 font-medium text-center">Current Streak</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {localHistory.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No history available yet. Keep grinding! 🚀
                                </td>
                            </tr>
                        ) : (
                            localHistory.map((day) => (
                                <React.Fragment key={day.id}>
                                    <tr
                                        onClick={() => toggleExpand(day.id)}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${expandedDay === day.id ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}`}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] transition-transform ${expandedDay === day.id ? "rotate-90" : ""}`}>▶</span>
                                                {formatDate(day.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                            {day.focus || <span className="text-gray-300 italic">No focus set</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center text-lg">
                                            {getMoodEmoji(day.mood)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-gray-700 dark:text-gray-200">
                                                    {day.completedTasks}/{day.totalTasks}
                                                </span>
                                                <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 transition-all duration-500"
                                                        style={{ width: `${day.consistency}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                                            {day.maxStreak || 0}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                {day.cumulativePoints}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-orange-500">
                                            🔥 {day.currentStreak || 0}
                                        </td>
                                    </tr>
                                    {expandedDay === day.id && (
                                        <tr className="bg-gray-50/50 dark:bg-gray-900/20">
                                            <td colSpan={7} className="px-10 py-6">
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                                                        <div>
                                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Daily Focus</h4>
                                                            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{day.focus || "No focus defined"}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Daily Notes</h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                {day.notes || "No notes for this day."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Task Audit Log Snapshot</h4>
                                                            <span className="text-[10px] text-gray-400 italic">Sourced from permanent audit records</span>
                                                        </div>
                                                        {loadingDetails[day.id] ? (
                                                            <div className="flex items-center gap-3 py-4">
                                                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                                <span className="text-xs text-gray-400">Loading snapshots...</span>
                                                            </div>
                                                        ) : day.tasks && day.tasks.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                                                {day.tasks.map((task) => (
                                                                    <div key={task.id} className="flex items-center justify-between gap-4 group">
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${task.isCompleted
                                                                                ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                                                                                : "text-gray-400 bg-gray-100 dark:bg-gray-800"}`}>
                                                                                {task.isCompleted ? "✓" : "!"}
                                                                            </span>
                                                                            <span className={`text-sm truncate ${task.isCompleted ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"}`}>
                                                                                {task.title}
                                                                            </span>
                                                                        </div>
                                                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm ${getPriorityColor(task.priority)}`}>
                                                                            {task.priority}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-400 italic">No task snapshots recorded for this day.</p>
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
        </div>
    );
};
