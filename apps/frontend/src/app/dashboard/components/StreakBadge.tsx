import React from "react";

interface StreakBadgeProps {
    streak: number;
    maxStreak: number;
    missedDays: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, maxStreak, missedDays }) => {
    return (
        <div className="inline-flex items-center gap-3 rounded-full border border-orange-400/40 bg-orange-500/10 px-4 py-2">
            <span className="text-lg">🔥</span>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Streak {streak} days</p>
                <p className="text-[10px] text-zinc-400">Best {maxStreak} | Missed this week {missedDays}</p>
            </div>
        </div>
    );
};
