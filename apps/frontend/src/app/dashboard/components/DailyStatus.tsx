import React from 'react';
import { DailyStatusData } from '../types/dashboard';

export const DailyStatus: React.FC<DailyStatusData> = ({ date, focus, mood, note }) => {
    const getMoodEmoji = (mood: "low" | "normal" | "high" | undefined) => {
        switch (mood) {
            case "high": return "⚡️";
            case "normal": return "🙂";
            case "low": return "☕️";
            default: return "🤔";
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg uppercase tracking-wider">
                        Today's Status
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{date}</span>
                </div>
                {mood && (
                    <div className="text-2xl" title={`Energy Level: ${mood}`}>
                        {getMoodEmoji(mood)}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h4 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-medium mb-1">Primary Focus</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                    {focus}
                </p>
            </div>

            {note && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-medium mb-1">Daily Note</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                        "{note}"
                    </p>
                </div>
            )}
        </div>
    );
};
